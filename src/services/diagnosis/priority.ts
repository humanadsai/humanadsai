import type { PageType, SourceType } from './types';

// ============================================
// URL Priority Scoring
// ============================================

const PATH_SCORES: Record<string, number> = {
  // High value for toA readiness
  '/pricing': 25, '/plans': 25, '/price': 25,
  '/api': 20, '/docs': 20, '/developer': 20, '/developers': 20, '/documentation': 20,
  '/about': 15, '/company': 15, '/about-us': 15,
  '/faq': 10, '/help': 10, '/support': 10,
  '/contact': 10, '/contact-us': 10,
  '/login': 8, '/signin': 8, '/signup': 8, '/register': 8,
  '/blog': 5,
  '/products': 8, '/services': 8,
  '/features': 8,
  '/checkout': 8, '/cart': 8,
};

const PATH_PREFIX_SCORES: Record<string, number> = {
  '/api/': 18,
  '/docs/': 16,
  '/developer/': 16,
  '/product/': 10,
  '/products/': 10,
  '/blog/': 3,
  '/help/': 8,
  '/support/': 8,
};

const SOURCE_SCORES: Record<SourceType, number> = {
  seed: 30,
  sitemap: 15,
  nav: 18,
  footer: 12,
  breadcrumb: 10,
  cta: 14,
  internal_link: 8,
  robots_sitemap: 12,
};

// Low priority patterns (reduce score)
const LOW_PRIORITY_PATTERNS = [
  /\/page\/\d+/,           // pagination
  /\/tag\//,               // tag listings
  /\/category\//,          // category listings
  /[?&](page|p)=\d+/,     // query pagination
  /[?&](sort|filter|q)=/,  // filter/search URLs
  /\/search/,              // search results
  /\/(wp-admin|wp-content|wp-includes)\//,
  /\/feed\/?$/,            // RSS feeds
  /\/attachment\//,
  /\/preview\//,
  /\/amp\/?$/,
  /\/print\/?$/,
];

const SKIP_PATTERNS = [
  /^mailto:/i,
  /^tel:/i,
  /^javascript:/i,
  /^data:/i,
  /^ftp:/i,
  /^file:/i,
  /^#/,
  /\.(pdf|jpg|jpeg|png|gif|svg|webp|ico|mp4|mp3|wav|zip|gz|tar|exe|dmg|apk|css|js|woff|woff2|ttf|eot)$/i,
  /\/logout/i,
  /\/callback/i,
  /\/oauth\//i,
];

/**
 * Score a URL's priority for diagnosis (0-100)
 */
export function scorePriority(
  url: string,
  sourceType: SourceType,
  depth: number,
): number {
  let score = 0;
  const path = extractPath(url);

  // Source type bonus
  score += SOURCE_SCORES[sourceType] || 5;

  // Exact path match
  const exactMatch = PATH_SCORES[path] || PATH_SCORES[path.replace(/\/$/, '')];
  if (exactMatch) {
    score += exactMatch;
  } else {
    // Prefix match
    for (const [prefix, bonus] of Object.entries(PATH_PREFIX_SCORES)) {
      if (path.startsWith(prefix)) {
        score += bonus;
        break;
      }
    }
  }

  // Homepage gets max score
  if (path === '/' || path === '') {
    score += 30;
  }

  // Depth penalty
  score -= depth * 8;

  // Low priority pattern penalty
  for (const pattern of LOW_PRIORITY_PATTERNS) {
    if (pattern.test(url)) {
      score -= 20;
      break;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Detect page type from URL pattern
 */
export function detectPageType(url: string): PageType {
  const path = extractPath(url).toLowerCase();

  if (path === '/' || path === '') return 'homepage';
  if (/^\/(pricing|plans|price)/.test(path)) return 'pricing';
  if (/^\/(api|docs|developer|documentation|swagger)/.test(path)) return 'docs';
  if (/^\/(about|company|about-us|team)/.test(path)) return 'about';
  if (/^\/(faq|help|support)/.test(path)) return 'faq';
  if (/^\/(blog|news|articles|posts)/.test(path)) return 'blog';
  if (/^\/(product|products|services|features)/.test(path)) return 'product';
  if (/^\/(login|signin|signup|register|auth)/.test(path)) return 'login';
  if (/^\/(contact|contact-us|inquiry)/.test(path)) return 'contact';
  return 'other';
}

/**
 * Check if URL should be skipped entirely
 */
export function shouldSkipUrl(url: string): string | null {
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(url)) return 'excluded_pattern';
  }
  return null;
}

/**
 * Check if URL belongs to the same registrable domain
 */
export function isSameDomain(url: string, baseDomain: string): boolean {
  try {
    const urlHost = new URL(url).hostname.toLowerCase();
    const baseHost = baseDomain.toLowerCase();
    // Exact match or subdomain of base
    return urlHost === baseHost || urlHost.endsWith('.' + baseHost);
  } catch {
    return false;
  }
}

/**
 * Extract registrable domain from URL (e.g., "www.example.com" → "example.com")
 */
export function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    // Simple: strip www. prefix
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function extractPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
