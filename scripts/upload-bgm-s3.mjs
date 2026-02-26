#!/usr/bin/env node
/**
 * Upload BGM WAV files to S3 for Remotion Lambda.
 *
 * Usage: AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy node scripts/upload-bgm-s3.mjs
 *
 * Or set env vars in your shell before running.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BUCKET = 'remotionlambda-apnortheast1-aam4p56xhk';
const REGION = 'ap-northeast-1';
const S3_PREFIX = 'bgm';

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  console.error('Error: Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables');
  process.exit(1);
}

// ── Minimal SigV4 implementation (Node.js crypto) ──

const encoder = new TextEncoder();

async function sha256Hex(data) {
  const { createHash } = await import('crypto');
  const hash = createHash('sha256');
  if (typeof data === 'string') {
    hash.update(data);
  } else {
    hash.update(Buffer.from(data));
  }
  return hash.digest('hex');
}

async function hmac(key, message) {
  const { createHmac } = await import('crypto');
  const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(key);
  return createHmac('sha256', keyBuf).update(message).digest();
}

async function getSigningKey(secretAccessKey, dateStamp, region, service) {
  const kDate = await hmac(Buffer.from(`AWS4${secretAccessKey}`), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

async function signAndUpload(key, body, contentType) {
  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  const method = 'PUT';

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  const payloadHash = await sha256Hex(body);

  const headers = {
    'content-type': contentType,
    'content-length': String(body.byteLength),
    'x-amz-content-sha256': payloadHash,
  };

  const parsedUrl = new URL(url);

  const headersToSign = {};
  for (const [k, v] of Object.entries(headers)) {
    headersToSign[k.toLowerCase()] = v.trim();
  }
  headersToSign['host'] = parsedUrl.host;
  headersToSign['x-amz-date'] = amzDate;

  const sortedKeys = Object.keys(headersToSign).sort();
  const canonicalHeaders = sortedKeys.map(k => `${k}:${headersToSign[k]}`).join('\n') + '\n';
  const signedHeadersList = sortedKeys.join(';');

  const canonicalRequest = [
    method,
    parsedUrl.pathname,
    '', // no query string
    canonicalHeaders,
    signedHeadersList,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${REGION}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = await getSigningKey(secretAccessKey, dateStamp, REGION, 's3');
  const signature = (await hmac(signingKey, stringToSign)).toString('hex');

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeadersList}, Signature=${signature}`;

  const fetchHeaders = {
    ...headers,
    host: parsedUrl.host,
    'x-amz-date': amzDate,
    Authorization: authorization,
  };

  const res = await fetch(url, { method, headers: fetchHeaders, body });

  if (res.ok) {
    console.log(`  ✓ Uploaded: ${url}`);
    return true;
  } else {
    const err = await res.text();
    console.error(`  ✗ Failed (${res.status}): ${err}`);
    return false;
  }
}

// ── Main ──

const audioDir = join(__dirname, '..', 'remotion', 'public', 'audio');
const files = readdirSync(audioDir).filter(f => f.endsWith('.wav'));

console.log(`Uploading ${files.length} BGM files to s3://${BUCKET}/${S3_PREFIX}/\n`);

for (const file of files) {
  const filePath = join(audioDir, file);
  const data = readFileSync(filePath);
  const body = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const s3Key = `${S3_PREFIX}/${file}`;

  console.log(`Uploading ${file} (${(data.length / 1024).toFixed(0)} KB)...`);
  await signAndUpload(s3Key, body, 'audio/wav');
}

console.log('\nDone! BGM files available at:');
for (const file of files) {
  console.log(`  https://${BUCKET}.s3.${REGION}.amazonaws.com/${S3_PREFIX}/${file}`);
}
