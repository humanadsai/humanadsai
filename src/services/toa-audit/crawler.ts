// ============================================
// toA Audit — Website Crawler
// Uses fetch + HTMLRewriter (CF native) for analysis
// ============================================

import type {
  CrawlData,
  RobotsResult,
  RobotsBotResult,
  BotStatus,
  LlmsTxtResult,
  SitemapResult,
  SchemaResult,
  SemanticHtmlResult,
  HeadingInfo,
  OgpResult,
  MetaResult,
  ImageResult,
  ContentResult,
  HttpResult,
  PathDiscoveryResult,
} from './types';

const USER_AGENT = 'toA-Auditor/1.0 (+https://humanadsai.com/toa-audit)';
const FETCH_TIMEOUT = 10_000;
const MAX_BODY_SIZE = 1_048_576; // 1MB

// ============================================
// SSRF Protection
// ============================================

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^fc00:/i,
  /^fe80:/i,
  /^fd[0-9a-f]{2}:/i,
  /^::1$/,
  /^::ffff:(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/i,
  /^localhost$/i,
  /^\[::1\]$/,
  /^\[::ffff:/i,
];

// Cloud metadata hostnames to block
const BLOCKED_HOSTNAMES = [
  'metadata.google.internal',
  'metadata.goog',
  'kubernetes.default.svc',
];

const MAX_REDIRECTS = 5;

export function isPrivateUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.includes(host)) return true;
    // Block non-standard ports (only allow 80, 443, or default)
    if (u.port && u.port !== '80' && u.port !== '443') return true;
    return PRIVATE_IP_PATTERNS.some(p => p.test(host));
  } catch {
    return true;
  }
}

// ============================================
// URL Normalization
// ============================================

export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  const parsed = new URL(url);
  // Strip trailing slash from path (keep root /)
  if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }
  // Strip query and hash for base URL
  return parsed.origin + parsed.pathname;
}

export function getOrigin(url: string): string {
  return new URL(url).origin;
}

// ============================================
// Safe Fetch
// ============================================

export async function safeFetch(url: string, options?: RequestInit & { followRedirects?: boolean }): Promise<Response> {
  const { followRedirects = true, ...fetchOptions } = options || {};

  let currentUrl = url;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    if (isPrivateUrl(currentUrl)) {
      throw new Error('SSRF: private/internal URL blocked');
    }
    // Enforce protocol allowlist
    const parsed = new URL(currentUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('SSRF: non-HTTP protocol blocked');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    try {
      const resp = await fetch(currentUrl, {
        ...fetchOptions,
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          ...(fetchOptions?.headers || {}),
        },
      });

      // If not a redirect or we don't want to follow, return as-is
      if (!followRedirects || resp.status < 300 || resp.status >= 400) {
        return resp;
      }

      const location = resp.headers.get('location');
      if (!location) return resp;

      // Resolve relative redirect
      currentUrl = new URL(location, currentUrl).href;
      // Consume body to free resources
      await resp.text().catch(() => {});
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw new Error('Too many redirects');
}

export async function safeFetchText(url: string): Promise<{ text: string; status: number }> {
  try {
    const resp = await safeFetch(url);
    // Read body as stream, limit to MAX_BODY_SIZE
    const reader = resp.body?.getReader();
    if (!reader) return { text: '', status: resp.status };
    let chunks: Uint8Array[] = [];
    let totalSize = 0;
    while (totalSize < MAX_BODY_SIZE) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalSize += value.length;
    }
    reader.cancel().catch(() => {});
    const merged = new Uint8Array(Math.min(totalSize, MAX_BODY_SIZE));
    let offset = 0;
    for (const chunk of chunks) {
      const copyLen = Math.min(chunk.length, MAX_BODY_SIZE - offset);
      merged.set(chunk.subarray(0, copyLen), offset);
      offset += copyLen;
      if (offset >= MAX_BODY_SIZE) break;
    }
    return { text: new TextDecoder().decode(merged), status: resp.status };
  } catch {
    return { text: '', status: 0 };
  }
}

// ============================================
// robots.txt Parser
// ============================================

const KNOWN_BOTS: { name: string; category: 'search' | 'training' | 'user_triggered' }[] = [
  // Search bots
  { name: 'Googlebot', category: 'search' },
  { name: 'OAI-SearchBot', category: 'search' },
  { name: 'PerplexityBot', category: 'search' },
  { name: 'Bingbot', category: 'search' },
  // Training bots
  { name: 'GPTBot', category: 'training' },
  { name: 'ClaudeBot', category: 'training' },
  { name: 'Google-Extended', category: 'training' },
  { name: 'CCBot', category: 'training' },
  { name: 'Amazonbot', category: 'training' },
  { name: 'Applebot-Extended', category: 'training' },
  { name: 'Bytespider', category: 'training' },
  { name: 'meta-externalagent', category: 'training' },
  // User-triggered bots
  { name: 'ChatGPT-User', category: 'user_triggered' },
  { name: 'Google-Agent', category: 'user_triggered' },
];

function parseRobotsTxt(content: string, statusCode: number): RobotsResult {
  if (statusCode !== 200 || !content.trim()) {
    return {
      exists: false,
      statusCode,
      bots: KNOWN_BOTS.map(b => ({ name: b.name, category: b.category, status: 'no_rule' as BotStatus })),
      hasSitemap: false,
    };
  }

  const lines = content.split('\n').map(l => l.trim());
  const hasSitemap = lines.some(l => /^sitemap:/i.test(l));

  // Parse user-agent blocks
  const blocks: { agent: string; rules: string[] }[] = [];
  let currentAgent = '';
  let currentRules: string[] = [];

  for (const line of lines) {
    if (/^user-agent:\s*/i.test(line)) {
      if (currentAgent) {
        blocks.push({ agent: currentAgent, rules: [...currentRules] });
      }
      currentAgent = line.replace(/^user-agent:\s*/i, '').trim();
      currentRules = [];
    } else if (/^(allow|disallow):\s*/i.test(line)) {
      currentRules.push(line);
    }
  }
  if (currentAgent) {
    blocks.push({ agent: currentAgent, rules: [...currentRules] });
  }

  // Determine status for each known bot
  const bots: RobotsBotResult[] = KNOWN_BOTS.map(bot => {
    // Find specific block for this bot
    const specificBlock = blocks.find(b => b.agent.toLowerCase() === bot.name.toLowerCase());
    // Find wildcard block
    const wildcardBlock = blocks.find(b => b.agent === '*');

    const block = specificBlock || wildcardBlock;
    if (!block) {
      return { name: bot.name, category: bot.category, status: 'no_rule' as BotStatus };
    }

    // Check if there's a Disallow: / (blocks everything)
    const hasDisallowAll = block.rules.some(r => /^disallow:\s*\/\s*$/i.test(r));
    const hasAllowAll = block.rules.some(r => /^allow:\s*\/\s*$/i.test(r));

    if (specificBlock) {
      if (hasDisallowAll && !hasAllowAll) {
        return { name: bot.name, category: bot.category, status: 'disallowed' as BotStatus, rule: `User-agent: ${specificBlock.agent} / Disallow: /` };
      }
      if (hasAllowAll || specificBlock.rules.length === 0) {
        return { name: bot.name, category: bot.category, status: 'allowed' as BotStatus, rule: `User-agent: ${specificBlock.agent}` };
      }
      // Has partial rules — consider allowed with restrictions
      return { name: bot.name, category: bot.category, status: 'allowed' as BotStatus, rule: `User-agent: ${specificBlock.agent} (partial rules)` };
    }

    // Only wildcard applies
    if (hasDisallowAll && !hasAllowAll) {
      return { name: bot.name, category: bot.category, status: 'disallowed' as BotStatus, rule: 'Wildcard: Disallow: /' };
    }

    return { name: bot.name, category: bot.category, status: 'no_rule' as BotStatus };
  });

  return { exists: true, statusCode, bots, hasSitemap };
}

// ============================================
// HTML Analysis via HTMLRewriter
// ============================================

export interface HtmlAnalysis {
  schema: SchemaResult;
  semantic: SemanticHtmlResult;
  headings: HeadingInfo[];
  ogp: OgpResult;
  meta: MetaResult;
  images: ImageResult;
  content: ContentResult;
  links: { href: string; text: string }[];
}

export async function analyzeHtml(response: Response, pageUrl: string): Promise<HtmlAnalysis> {
  const schema: SchemaResult = {
    found: false, types: [], hasOrganization: false, hasSameAs: false,
    sameAsUrls: [], hasFaq: false, hasProduct: false, hasHowTo: false,
    hasSoftwareApp: false, hasArticle: false, rawBlocks: [],
  };
  const semantic: SemanticHtmlResult = { main: 0, article: 0, section: 0, nav: 0, header: 0, footer: 0, aside: 0 };
  const headings: HeadingInfo[] = [];
  const ogp: OgpResult = { title: false, description: false, image: false, url: false, type: false, twitterCard: false };
  const meta: MetaResult = {
    title: '', titleLength: 0, description: '', descriptionLength: 0,
    canonical: '', canonicalMatch: false, viewport: false, lang: '',
    hreflangCount: 0, robotsMeta: '', xRobotsTag: '',
  };
  const images: ImageResult = { total: 0, withAlt: 0, withoutAlt: 0, altCoverage: 0 };
  const links: { href: string; text: string }[] = [];
  let scriptSize = 0;
  let jsonLdBuffer = '';
  let insideJsonLd = false;
  let currentHeadingText = '';
  let currentHeadingTag = '';
  let currentLinkHref = '';
  let currentLinkText = '';

  // X-Robots-Tag from response headers
  meta.xRobotsTag = response.headers.get('X-Robots-Tag') || '';

  const rewriter = new HTMLRewriter()
    // HTML lang
    .on('html', {
      element(el) {
        meta.lang = el.getAttribute('lang') || '';
      },
    })
    // Title
    .on('title', {
      text(text) {
        meta.title += text.text;
      },
      element() {
        meta.title = '';
      },
    })
    // Meta tags
    .on('meta', {
      element(el) {
        const name = (el.getAttribute('name') || '').toLowerCase();
        const property = (el.getAttribute('property') || '').toLowerCase();
        const content = el.getAttribute('content') || '';

        if (name === 'description') { meta.description = content; meta.descriptionLength = content.length; }
        if (name === 'viewport') meta.viewport = true;
        if (name === 'robots') meta.robotsMeta = content;

        if (property === 'og:title') ogp.title = true;
        if (property === 'og:description') ogp.description = true;
        if (property === 'og:image') ogp.image = true;
        if (property === 'og:url') ogp.url = true;
        if (property === 'og:type') ogp.type = true;
        if (name === 'twitter:card') ogp.twitterCard = true;
      },
    })
    // Canonical & hreflang
    .on('link', {
      element(el) {
        const rel = (el.getAttribute('rel') || '').toLowerCase();
        if (rel === 'canonical') {
          meta.canonical = el.getAttribute('href') || '';
          try {
            const canonicalUrl = new URL(meta.canonical, pageUrl).href;
            meta.canonicalMatch = canonicalUrl === pageUrl || canonicalUrl === pageUrl + '/';
          } catch {
            meta.canonicalMatch = false;
          }
        }
        if (rel === 'alternate' && el.getAttribute('hreflang')) {
          meta.hreflangCount++;
        }
      },
    })
    // JSON-LD
    .on('script[type="application/ld+json"]', {
      element() {
        insideJsonLd = true;
        jsonLdBuffer = '';
      },
      text(text) {
        if (insideJsonLd) jsonLdBuffer += text.text;
        if (text.lastInTextNode) {
          insideJsonLd = false;
          try {
            const data = JSON.parse(jsonLdBuffer);
            schema.found = true;
            const items = Array.isArray(data) ? data : [data];
            for (const item of items) {
              processSchemaItem(item, schema);
              // Handle @graph
              if (item['@graph'] && Array.isArray(item['@graph'])) {
                for (const gi of item['@graph']) {
                  processSchemaItem(gi, schema);
                }
              }
            }
          } catch { /* invalid JSON-LD */ }
        }
      },
    })
    // Script size
    .on('script:not([type="application/ld+json"])', {
      text(text) {
        scriptSize += text.text.length;
      },
    })
    // Semantic HTML
    .on('main', { element() { semantic.main++; } })
    .on('article', { element() { semantic.article++; } })
    .on('section', { element() { semantic.section++; } })
    .on('nav', { element() { semantic.nav++; } })
    .on('header', { element() { semantic.header++; } })
    .on('footer', { element() { semantic.footer++; } })
    .on('aside', { element() { semantic.aside++; } })
    // Headings
    .on('h1,h2,h3,h4,h5,h6', {
      element(el) {
        currentHeadingTag = el.tagName;
        currentHeadingText = '';
      },
      text(text) {
        currentHeadingText += text.text;
        if (text.lastInTextNode) {
          headings.push({
            tag: currentHeadingTag,
            level: parseInt(currentHeadingTag.charAt(1)),
            text: currentHeadingText.trim().slice(0, 100),
          });
        }
      },
    })
    // Images
    .on('img', {
      element(el) {
        images.total++;
        const alt = el.getAttribute('alt');
        if (alt && alt.trim().length > 0) {
          images.withAlt++;
        } else {
          images.withoutAlt++;
        }
      },
    })
    // Links (for about/pricing detection)
    .on('a[href]', {
      element(el) {
        currentLinkHref = el.getAttribute('href') || '';
        currentLinkText = '';
      },
      text(text) {
        currentLinkText += text.text;
        if (text.lastInTextNode) {
          links.push({ href: currentLinkHref, text: currentLinkText.trim().slice(0, 100) });
        }
      },
    });

  // Process the response through HTMLRewriter
  const transformed = rewriter.transform(response);
  const htmlBody = await transformed.text();
  const htmlSize = htmlBody.length;

  // Finalize title
  meta.titleLength = meta.title.length;

  // Calculate image alt coverage
  images.altCoverage = images.total > 0 ? Math.round((images.withAlt / images.total) * 100) : 100;

  // Estimate word count (strip tags roughly)
  const textOnly = htmlBody.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = textOnly.split(/\s+/).filter(w => w.length > 0).length;

  // Text/script ratio
  const textRatio = htmlSize > 0 ? Math.round(((htmlSize - scriptSize) / htmlSize) * 100) : 0;

  // Check for about/pricing links
  const hasAboutLink = links.some(l =>
    /\/(about|company|team|who-we-are)/i.test(l.href) ||
    /about|会社概要|私たちについて/i.test(l.text)
  );
  const hasPricingLink = links.some(l =>
    /\/(pricing|price|plans)/i.test(l.href) ||
    /pricing|price|料金|プラン/i.test(l.text)
  );

  const contentResult: ContentResult = {
    htmlSize,
    scriptSize,
    textRatio,
    wordCount,
    hasAboutLink,
    hasPricingLink,
  };

  return { schema, semantic, headings, ogp, meta, images, content: contentResult, links };
}

function processSchemaItem(item: any, schema: SchemaResult): void {
  if (!item || typeof item !== 'object') return;
  const type = item['@type'];
  if (!type) return;
  const types = Array.isArray(type) ? type : [type];
  for (const t of types) {
    if (!schema.types.includes(t)) schema.types.push(t);
    if (t === 'Organization' || t === 'LocalBusiness') schema.hasOrganization = true;
    if (t === 'FAQPage') schema.hasFaq = true;
    if (t === 'Product') schema.hasProduct = true;
    if (t === 'HowTo') schema.hasHowTo = true;
    if (t === 'SoftwareApplication' || t === 'WebApplication') schema.hasSoftwareApp = true;
    if (t === 'Article' || t === 'NewsArticle' || t === 'BlogPosting') schema.hasArticle = true;
  }
  if (item.sameAs) {
    schema.hasSameAs = true;
    const sameAs = Array.isArray(item.sameAs) ? item.sameAs : [item.sameAs];
    for (const s of sameAs) {
      if (typeof s === 'string' && !schema.sameAsUrls.includes(s)) {
        schema.sameAsUrls.push(s);
      }
    }
  }
  // Limit rawBlocks to prevent oversized responses
  if (schema.rawBlocks.length < 5) {
    schema.rawBlocks.push(item);
  }
}

// ============================================
// Path Discovery
// ============================================

async function discoverPaths(origin: string): Promise<PathDiscoveryResult> {
  const paths = [
    { path: '/api', key: 'apiPath' as const },
    { path: '/docs', key: 'docsPath' as const },
    { path: '/swagger', key: 'swaggerPath' as const },
    { path: '/developer', key: 'developerPath' as const },
    { path: '/.well-known/ai-plugin.json', key: 'wellKnownAiPlugin' as const },
  ];

  const result: PathDiscoveryResult = {
    apiPath: false,
    docsPath: false,
    swaggerPath: false,
    developerPath: false,
    wellKnownAiPlugin: false,
  };

  const results = await Promise.allSettled(
    paths.map(async ({ path, key }) => {
      try {
        const resp = await safeFetch(origin + path, { method: 'HEAD' });
        if (resp.status >= 200 && resp.status < 400) {
          result[key] = true;
        }
      } catch { /* ignore */ }
    })
  );

  return result;
}

// ============================================
// Retry helper for 5xx errors (handles Cloudflare 522/523/524)
// ============================================

async function safeFetchWithRetry(url: string, options?: RequestInit & { followRedirects?: boolean }, maxRetries = 2): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await safeFetch(url, options);
      if (resp.status < 500 || attempt === maxRetries) return resp;
      // 5xx → retry after short delay
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    } catch (e: any) {
      lastError = e;
      if (attempt === maxRetries) throw e;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastError || new Error('Retry exhausted');
}

async function safeFetchTextWithRetry(url: string): Promise<{ text: string; status: number }> {
  try {
    const resp = await safeFetchWithRetry(url);
    const reader = resp.body?.getReader();
    if (!reader) return { text: '', status: resp.status };
    let chunks: Uint8Array[] = [];
    let totalSize = 0;
    while (totalSize < MAX_BODY_SIZE) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalSize += value.length;
    }
    reader.cancel().catch(() => {});
    const merged = new Uint8Array(Math.min(totalSize, MAX_BODY_SIZE));
    let offset = 0;
    for (const chunk of chunks) {
      const copyLen = Math.min(chunk.length, MAX_BODY_SIZE - offset);
      merged.set(chunk.subarray(0, copyLen), offset);
      offset += copyLen;
      if (offset >= MAX_BODY_SIZE) break;
    }
    return { text: new TextDecoder().decode(merged), status: resp.status };
  } catch {
    return { text: '', status: 0 };
  }
}

// ============================================
// Self-origin detection & fallback
// Workers fetching their own custom domain often get 522.
// Fallback to workers.dev subdomain which avoids the loop.
// ============================================

const SELF_ORIGINS = ['https://humanadsai.com', 'https://www.humanadsai.com'];
const WORKERS_DEV_ORIGIN = 'https://humanadsai.humanadsai.workers.dev';

function resolveOrigin(origin: string): string {
  if (SELF_ORIGINS.includes(origin)) return WORKERS_DEV_ORIGIN;
  return origin;
}

function resolveUrl(url: string, originalOrigin: string): string {
  if (SELF_ORIGINS.includes(originalOrigin)) {
    return url.replace(originalOrigin, WORKERS_DEV_ORIGIN);
  }
  return url;
}

// ============================================
// Main Crawler
// ============================================

export async function crawlUrl(inputUrl: string): Promise<CrawlData> {
  const normalizedUrl = normalizeUrl(inputUrl);
  const origin = getOrigin(normalizedUrl);
  const fetchOrigin = resolveOrigin(origin);
  const fetchUrl = resolveUrl(normalizedUrl, origin);
  const errors: string[] = [];

  // Parallel fetches (use fetchOrigin/fetchUrl for self-origin fallback)
  const [robotsRaw, llmsRaw, sitemapRaw, mainPageResp, httpResult, pathsResult] = await Promise.allSettled([
    safeFetchTextWithRetry(fetchOrigin + '/robots.txt'),
    safeFetchTextWithRetry(fetchOrigin + '/llms.txt'),
    safeFetchTextWithRetry(fetchOrigin + '/sitemap.xml'),
    (async () => {
      const start = Date.now();
      const resp = await safeFetchWithRetry(fetchUrl);
      const ttfb = Date.now() - start;
      // Check Content-Length before consuming body (DoS prevention)
      const contentLength = parseInt(resp.headers.get('content-length') || '0', 10);
      if (contentLength > MAX_BODY_SIZE * 5) {
        throw new Error('Response too large');
      }
      return { resp, ttfb };
    })(),
    // HTTP check — count redirects using manual mode
    (async () => {
      let redirectCount = 0;
      let currentUrl = fetchUrl;
      const start = Date.now();
      for (let i = 0; i < MAX_REDIRECTS; i++) {
        const resp = await safeFetchWithRetry(currentUrl, { followRedirects: false }, 1);
        if (resp.status >= 300 && resp.status < 400) {
          redirectCount++;
          const loc = resp.headers.get('location');
          if (!loc) break;
          currentUrl = new URL(loc, currentUrl).href;
          // SSRF check on redirect target
          if (isPrivateUrl(currentUrl)) break;
        } else {
          // Only expose security-relevant headers (not full header dump)
          const safeHeaders: Record<string, string> = {};
          for (const key of ['x-robots-tag', 'content-type', 'strict-transport-security', 'content-security-policy', 'x-frame-options', 'x-content-type-options']) {
            const val = resp.headers.get(key);
            if (val) safeHeaders[key] = val;
          }
          return {
            statusCode: resp.status,
            redirectChain: redirectCount,
            isHttps: new URL(normalizedUrl).protocol === 'https:',
            ttfbMs: Date.now() - start,
            headers: safeHeaders,
          } as HttpResult;
        }
      }
      return {
        statusCode: 0,
        redirectChain: redirectCount,
        isHttps: new URL(normalizedUrl).protocol === 'https:',
        ttfbMs: Date.now() - start,
        headers: {},
      } as HttpResult;
    })(),
    discoverPaths(fetchOrigin),
  ]);

  // Parse robots.txt
  const robotsFetched = robotsRaw.status === 'fulfilled' ? robotsRaw.value : { text: '', status: 0 };
  const robots = parseRobotsTxt(robotsFetched.text, robotsFetched.status);

  // Parse llms.txt
  const llmsFetched = llmsRaw.status === 'fulfilled' ? llmsRaw.value : { text: '', status: 0 };
  const llmsTxt: LlmsTxtResult = {
    exists: llmsFetched.status === 200 && llmsFetched.text.trim().length > 0,
    statusCode: llmsFetched.status,
    contentLength: llmsFetched.text.length,
    hasTitle: /^#\s+.+/m.test(llmsFetched.text),
    hasDescription: /^>\s+.+/m.test(llmsFetched.text) || llmsFetched.text.length > 50,
  };

  // Parse sitemap
  const sitemapFetched = sitemapRaw.status === 'fulfilled' ? sitemapRaw.value : { text: '', status: 0 };
  const sitemapIsXml = /<urlset|<sitemapindex/i.test(sitemapFetched.text);
  const urlMatches = sitemapFetched.text.match(/<loc>/g);
  const sitemap: SitemapResult = {
    exists: sitemapFetched.status === 200 && sitemapIsXml,
    statusCode: sitemapFetched.status,
    urlCount: urlMatches ? urlMatches.length : 0,
    isValid: sitemapIsXml,
  };

  // Analyze main page HTML
  let htmlAnalysis: HtmlAnalysis;
  let http: HttpResult;
  if (mainPageResp.status === 'fulfilled') {
    const { resp, ttfb } = mainPageResp.value;
    htmlAnalysis = await analyzeHtml(resp, normalizedUrl);
    http = httpResult.status === 'fulfilled' ? httpResult.value : {
      statusCode: resp.status,
      redirectChain: 0,
      isHttps: new URL(normalizedUrl).protocol === 'https:',
      ttfbMs: ttfb,
      headers: Object.fromEntries([...resp.headers]),
    };
  } else {
    errors.push('Failed to fetch main page: ' + (mainPageResp.reason?.message || 'unknown'));
    htmlAnalysis = {
      schema: { found: false, types: [], hasOrganization: false, hasSameAs: false, sameAsUrls: [], hasFaq: false, hasProduct: false, hasHowTo: false, hasSoftwareApp: false, hasArticle: false, rawBlocks: [] },
      semantic: { main: 0, article: 0, section: 0, nav: 0, header: 0, footer: 0, aside: 0 },
      headings: [],
      ogp: { title: false, description: false, image: false, url: false, type: false, twitterCard: false },
      meta: { title: '', titleLength: 0, description: '', descriptionLength: 0, canonical: '', canonicalMatch: false, viewport: false, lang: '', hreflangCount: 0, robotsMeta: '', xRobotsTag: '' },
      images: { total: 0, withAlt: 0, withoutAlt: 0, altCoverage: 0 },
      content: { htmlSize: 0, scriptSize: 0, textRatio: 0, wordCount: 0, hasAboutLink: false, hasPricingLink: false },
      links: [],
    };
    http = httpResult.status === 'fulfilled' ? httpResult.value : {
      statusCode: 0, redirectChain: 0, isHttps: true, ttfbMs: 0, headers: {},
    };
  }

  const paths = pathsResult.status === 'fulfilled' ? pathsResult.value : {
    apiPath: false, docsPath: false, swaggerPath: false, developerPath: false, wellKnownAiPlugin: false,
  };

  return {
    url: inputUrl,
    normalizedUrl,
    robots,
    llmsTxt,
    sitemap,
    schema: htmlAnalysis.schema,
    semantic: htmlAnalysis.semantic,
    headings: htmlAnalysis.headings,
    ogp: htmlAnalysis.ogp,
    meta: htmlAnalysis.meta,
    images: htmlAnalysis.images,
    content: htmlAnalysis.content,
    http,
    paths,
    links: htmlAnalysis.links,
    errors,
    crawledAt: new Date().toISOString(),
  };
}
