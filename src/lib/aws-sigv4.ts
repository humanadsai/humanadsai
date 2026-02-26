/**
 * AWS Signature Version 4 signing for Cloudflare Workers
 * Uses Web Crypto API — no Node.js dependencies.
 */

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(data: string | ArrayBuffer): Promise<string> {
  const input = typeof data === 'string' ? encoder.encode(data) : data;
  const hash = await crypto.subtle.digest('SHA-256', input);
  return toHex(hash);
}

async function hmac(
  key: ArrayBuffer | Uint8Array,
  message: string,
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
}

async function getSigningKey(
  secretAccessKey: string,
  dateStamp: string,
  region: string,
  service: string,
): Promise<ArrayBuffer> {
  const kDate = await hmac(encoder.encode(`AWS4${secretAccessKey}`), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

/**
 * Sign an HTTP request with AWS SigV4.
 * Returns a complete set of headers (original + signing headers) to pass to fetch().
 */
export async function signRequest(params: {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | ArrayBuffer;
  region: string;
  service: string;
  accessKeyId: string;
  secretAccessKey: string;
}): Promise<Record<string, string>> {
  const { method, url, headers, body, region, service, accessKeyId, secretAccessKey } = params;
  const parsedUrl = new URL(url);

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = await sha256Hex(body);

  // Build canonical headers (lowercase keys, sorted)
  const headersToSign: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    headersToSign[k.toLowerCase()] = v.trim();
  }
  headersToSign['host'] = parsedUrl.host;
  headersToSign['x-amz-date'] = amzDate;

  const sortedKeys = Object.keys(headersToSign).sort();
  const canonicalHeaders = sortedKeys.map(k => `${k}:${headersToSign[k]}`).join('\n') + '\n';
  const signedHeadersList = sortedKeys.join(';');

  // Canonical query string (sorted)
  const canonicalQueryString = [...parsedUrl.searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  // Canonical request
  const canonicalRequest = [
    method,
    parsedUrl.pathname,
    canonicalQueryString,
    canonicalHeaders,
    signedHeadersList,
    payloadHash,
  ].join('\n');

  // String to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');

  // Signature
  const signingKey = await getSigningKey(secretAccessKey, dateStamp, region, service);
  const signature = toHex(await hmac(signingKey, stringToSign));

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeadersList}, Signature=${signature}`;

  return {
    ...headers,
    host: parsedUrl.host,
    'x-amz-date': amzDate,
    Authorization: authorization,
  };
}

/**
 * Invoke an AWS Lambda function.
 *
 * @param invocationType - 'Event' for async (202, no body), 'RequestResponse' for sync.
 */
export async function invokeLambda(params: {
  functionName: string;
  region: string;
  payload: unknown;
  invocationType: 'Event' | 'RequestResponse';
  accessKeyId: string;
  secretAccessKey: string;
}): Promise<{ statusCode: number; body?: string }> {
  const { functionName, region, payload, invocationType, accessKeyId, secretAccessKey } = params;

  const url = `https://lambda.${region}.amazonaws.com/2015-03-31/functions/${encodeURIComponent(functionName)}/invocations`;
  const body = JSON.stringify(payload);

  const signedHeaders = await signRequest({
    method: 'POST',
    url,
    headers: {
      'content-type': 'application/json',
      'x-amz-invocation-type': invocationType,
    },
    body,
    region,
    service: 'lambda',
    accessKeyId,
    secretAccessKey,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: signedHeaders,
    body,
  });

  // Event invocation returns 202 with empty body
  const responseBody =
    invocationType === 'Event' && response.status === 202
      ? undefined
      : await response.text();

  return { statusCode: response.status, body: responseBody };
}

/**
 * Upload a binary object to S3 using SigV4 signed PUT.
 */
export async function uploadToS3(params: {
  bucket: string;
  key: string;
  body: ArrayBuffer;
  contentType: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  acl?: string;
}): Promise<{ success: boolean; url: string; error?: string }> {
  const { bucket, key, body, contentType, region, accessKeyId, secretAccessKey, acl } = params;

  // Use virtual-hosted-style URL (same origin as Remotion site for CORS)
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  // S3 requires x-amz-content-sha256 header with payload hash
  const payloadHash = await sha256Hex(body);

  const headers: Record<string, string> = {
    'content-type': contentType,
    'content-length': String(body.byteLength),
    'x-amz-content-sha256': payloadHash,
  };
  if (acl) {
    headers['x-amz-acl'] = acl;
  }

  const signedHeaders = await signRequest({
    method: 'PUT',
    url,
    headers,
    body,
    region,
    service: 's3',
    accessKeyId,
    secretAccessKey,
  });

  const response = await fetch(url, {
    method: 'PUT',
    headers: signedHeaders,
    body,
  });

  if (response.ok) {
    return { success: true, url };
  }

  const errBody = await response.text();
  return { success: false, url, error: `S3 PUT failed (${response.status}): ${errBody}` };
}
