// ============================================
// toA Audit — Scoring Engine
// 32 auto checks + 16 manual checks + dual scoring
// ============================================

import type {
  CrawlData,
  AutoCheckResult,
  ManualCheckDef,
  Scores,
  CheckStatus,
  Severity,
  Layer,
  SiteType,
  BotCategory,
} from './types';

// ============================================
// Severity Weights
// ============================================

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  blocker: 10,
  important: 5,
  nice_to_have: 2,
  experimental: 1,
};

// ============================================
// Auto Check Definitions (32 items)
// ============================================

interface CheckDef {
  id: string;
  category: string;
  name: string;
  nameJa: string;
  layer: Layer;
  severity: Severity;
  botCategory?: BotCategory;
  applicableSiteTypes: SiteType[];
  evaluate: (data: CrawlData) => { status: CheckStatus; details: string; detailsJa: string; recommendation?: string; recommendationJa?: string };
}

const AUTO_CHECKS: CheckDef[] = [
  // ========== Category: Crawlability / Bot Access ==========
  {
    id: 'robots-search',
    category: 'Crawlability',
    name: 'Search bot access allowed',
    nameJa: '検索ボットのアクセス許可',
    layer: 'discovery',
    severity: 'blocker',
    botCategory: 'search',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      const searchBots = d.robots.bots.filter(b => b.category === 'search');
      const blocked = searchBots.filter(b => b.status === 'disallowed');
      if (blocked.length === 0) return { status: 'pass', details: `All search bots allowed: ${searchBots.map(b => b.name).join(', ')}`, detailsJa: `全検索ボットがアクセス許可: ${searchBots.map(b => b.name).join(', ')}` };
      return { status: 'fail', details: `Blocked: ${blocked.map(b => b.name).join(', ')}`, detailsJa: `ブロック中: ${blocked.map(b => b.name).join(', ')}`, recommendation: 'Remove Disallow rules for search bots in robots.txt', recommendationJa: 'robots.txtから検索ボットのDisallowルールを削除' };
    },
  },
  {
    id: 'robots-training',
    category: 'Crawlability',
    name: 'Training bot policy defined',
    nameJa: 'トレーニングボットのポリシー定義',
    layer: 'discovery',
    severity: 'important',
    botCategory: 'training',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      const trainingBots = d.robots.bots.filter(b => b.category === 'training');
      const withRule = trainingBots.filter(b => b.status !== 'no_rule');
      if (withRule.length >= 3) return { status: 'pass', details: `${withRule.length}/${trainingBots.length} training bots have explicit rules`, detailsJa: `${withRule.length}/${trainingBots.length}のトレーニングボットに明示的ルールあり` };
      if (withRule.length > 0) return { status: 'warn', details: `Only ${withRule.length}/${trainingBots.length} training bots have rules`, detailsJa: `${withRule.length}/${trainingBots.length}のみルールあり` };
      return { status: 'fail', details: 'No explicit training bot rules found', detailsJa: 'トレーニングボットの明示的ルールなし', recommendation: 'Add explicit User-agent rules for GPTBot, ClaudeBot, Google-Extended', recommendationJa: 'GPTBot, ClaudeBot, Google-Extendedの明示的ルールを追加' };
    },
  },
  {
    id: 'robots-user-triggered',
    category: 'Crawlability',
    name: 'User-triggered bot access allowed',
    nameJa: 'ユーザー起動ボットのアクセス許可',
    layer: 'discovery',
    severity: 'blocker',
    botCategory: 'user_triggered',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      const userBots = d.robots.bots.filter(b => b.category === 'user_triggered');
      const blocked = userBots.filter(b => b.status === 'disallowed');
      if (blocked.length === 0) return { status: 'pass', details: `User-triggered bots not blocked: ${userBots.map(b => `${b.name}: ${b.status}`).join(', ')}`, detailsJa: `ユーザー起動ボット未ブロック: ${userBots.map(b => `${b.name}: ${b.status}`).join(', ')}` };
      return { status: 'fail', details: `Blocked: ${blocked.map(b => b.name).join(', ')}`, detailsJa: `ブロック中: ${blocked.map(b => b.name).join(', ')}`, recommendation: 'Allow ChatGPT-User and Google-Agent in robots.txt — these act on behalf of real users', recommendationJa: 'ChatGPT-UserとGoogle-Agentを許可 — 実ユーザーの代理として動作' };
    },
  },
  {
    id: 'cf-bot-block',
    category: 'Crawlability',
    name: 'No aggressive bot blocking detected',
    nameJa: '積極的ボットブロック未検出',
    layer: 'discovery',
    severity: 'important',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.http.statusCode === 403) return { status: 'fail', details: '403 Forbidden — site may be blocking automated requests', detailsJa: '403 Forbidden — 自動リクエストがブロックされている可能性', recommendation: 'Check WAF/bot protection settings. Allow known AI agent user-agents', recommendationJa: 'WAF/ボット保護設定を確認。既知のAIエージェントUAを許可' };
      const cfHeaders = Object.keys(d.http.headers).filter(h => h.startsWith('cf-'));
      if (d.http.statusCode === 503) return { status: 'warn', details: '503 response — possible challenge page', detailsJa: '503レスポンス — チャレンジページの可能性' };
      return { status: 'pass', details: `HTTP ${d.http.statusCode} — no bot blocking detected`, detailsJa: `HTTP ${d.http.statusCode} — ボットブロック未検出` };
    },
  },

  // ========== Category: AI Discovery ==========
  {
    id: 'llms-txt',
    category: 'AI Discovery',
    name: 'llms.txt exists',
    nameJa: 'llms.txt の存在',
    layer: 'comprehension',
    severity: 'important',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.llmsTxt.exists) return { status: 'pass', details: `llms.txt found (${d.llmsTxt.contentLength} chars)${d.llmsTxt.hasTitle ? ', has title' : ''}`, detailsJa: `llms.txt検出 (${d.llmsTxt.contentLength}文字)${d.llmsTxt.hasTitle ? '、タイトルあり' : ''}` };
      return { status: 'fail', details: 'llms.txt not found', detailsJa: 'llms.txt未検出', recommendation: 'Create /llms.txt with a concise description of your site for LLMs. See llmstxt.org', recommendationJa: '/llms.txtを作成し、サイトの簡潔な説明を記載。llmstxt.org参照' };
    },
  },
  {
    id: 'sitemap-xml',
    category: 'AI Discovery',
    name: 'XML sitemap exists',
    nameJa: 'XMLサイトマップの存在',
    layer: 'discovery',
    severity: 'important',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.sitemap.exists) return { status: 'pass', details: `sitemap.xml found with ${d.sitemap.urlCount} URLs`, detailsJa: `sitemap.xml検出、${d.sitemap.urlCount}URL` };
      if (d.sitemap.statusCode === 200 && !d.sitemap.isValid) return { status: 'warn', details: 'sitemap.xml exists but is not valid XML', detailsJa: 'sitemap.xmlは存在するが有効なXMLでない' };
      return { status: 'fail', details: 'sitemap.xml not found', detailsJa: 'sitemap.xml未検出', recommendation: 'Create an XML sitemap and reference it in robots.txt', recommendationJa: 'XMLサイトマップを作成し、robots.txtで参照' };
    },
  },
  {
    id: 'meta-robots',
    category: 'AI Discovery',
    name: 'No noindex/nofollow blocking',
    nameJa: 'noindex/nofollowブロックなし',
    layer: 'discovery',
    severity: 'blocker',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      const combined = (d.meta.robotsMeta + ' ' + d.meta.xRobotsTag).toLowerCase();
      if (combined.includes('noindex')) return { status: 'fail', details: `noindex detected: meta="${d.meta.robotsMeta}" X-Robots="${d.meta.xRobotsTag}"`, detailsJa: `noindex検出: meta="${d.meta.robotsMeta}" X-Robots="${d.meta.xRobotsTag}"`, recommendation: 'Remove noindex to allow AI search indexing', recommendationJa: 'noindexを削除してAI検索のインデックスを許可' };
      if (combined.includes('nofollow')) return { status: 'warn', details: 'nofollow detected — links won\'t be followed by crawlers', detailsJa: 'nofollow検出 — リンクがクロールされない' };
      return { status: 'pass', details: 'No indexing restrictions', detailsJa: 'インデックス制限なし' };
    },
  },
  {
    id: 'canonical',
    category: 'AI Discovery',
    name: 'Canonical URL set correctly',
    nameJa: 'canonical URLの正しい設定',
    layer: 'discovery',
    severity: 'important',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (!d.meta.canonical) return { status: 'fail', details: 'No canonical URL set', detailsJa: 'canonical URL未設定', recommendation: 'Add <link rel="canonical"> to prevent duplicate content issues', recommendationJa: '<link rel="canonical">を追加して重複コンテンツを防止' };
      if (d.meta.canonicalMatch) return { status: 'pass', details: `Self-referencing canonical: ${d.meta.canonical}`, detailsJa: `自己参照canonical: ${d.meta.canonical}` };
      return { status: 'warn', details: `Canonical points to different URL: ${d.meta.canonical}`, detailsJa: `canonicalが別URLを指す: ${d.meta.canonical}` };
    },
  },
  {
    id: 'hreflang',
    category: 'AI Discovery',
    name: 'Hreflang tags (if multilingual)',
    nameJa: 'hreflangタグ（多言語の場合）',
    layer: 'discovery',
    severity: 'nice_to_have',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.meta.hreflangCount > 0) return { status: 'pass', details: `${d.meta.hreflangCount} hreflang tags found`, detailsJa: `${d.meta.hreflangCount}個のhreflangタグ検出` };
      return { status: 'info', details: 'No hreflang tags — OK if single language', detailsJa: 'hreflangタグなし — 単一言語なら問題なし' };
    },
  },

  // ========== Category: Structured Data ==========
  {
    id: 'schema-org',
    category: 'Structured Data',
    name: 'JSON-LD Organization schema',
    nameJa: 'JSON-LD Organizationスキーマ',
    layer: 'comprehension',
    severity: 'important',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.schema.hasOrganization) return { status: 'pass', details: `Organization schema found${d.schema.hasSameAs ? ` with sameAs: ${d.schema.sameAsUrls.slice(0, 3).join(', ')}` : ''}`, detailsJa: `Organizationスキーマ検出${d.schema.hasSameAs ? `、sameAs: ${d.schema.sameAsUrls.slice(0, 3).join(', ')}` : ''}` };
      if (d.schema.found) return { status: 'warn', details: `JSON-LD found (${d.schema.types.join(', ')}) but no Organization`, detailsJa: `JSON-LD検出 (${d.schema.types.join(', ')}) だがOrganizationなし` };
      return { status: 'fail', details: 'No JSON-LD structured data found', detailsJa: 'JSON-LD構造化データ未検出', recommendation: 'Add Organization schema with sameAs links to establish entity identity', recommendationJa: 'OrganizationスキーマをsameAsリンク付きで追加してエンティティIDを確立' };
    },
  },
  {
    id: 'schema-sameas',
    category: 'Structured Data',
    name: 'sameAs entity disambiguation',
    nameJa: 'sameAsによるエンティティ識別',
    layer: 'comprehension',
    severity: 'important',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.schema.hasSameAs && d.schema.sameAsUrls.length >= 2) return { status: 'pass', details: `${d.schema.sameAsUrls.length} sameAs links`, detailsJa: `${d.schema.sameAsUrls.length}個のsameAsリンク` };
      if (d.schema.hasSameAs) return { status: 'warn', details: 'Only 1 sameAs link — add more for stronger entity signals', detailsJa: 'sameAsリンクが1つのみ — より強いエンティティシグナルのため追加' };
      return { status: 'fail', details: 'No sameAs links in structured data', detailsJa: '構造化データにsameAsリンクなし', recommendation: 'Add sameAs URLs (Wikipedia, LinkedIn, Wikidata) to Organization schema', recommendationJa: 'OrganizationスキーマにsameAs URL(Wikipedia, LinkedIn, Wikidata)を追加' };
    },
  },
  {
    id: 'schema-faq-howto',
    category: 'Structured Data',
    name: 'FAQ or HowTo schema',
    nameJa: 'FAQ/HowToスキーマ',
    layer: 'comprehension',
    severity: 'nice_to_have',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.schema.hasFaq || d.schema.hasHowTo) return { status: 'pass', details: `Found: ${[d.schema.hasFaq && 'FAQPage', d.schema.hasHowTo && 'HowTo'].filter(Boolean).join(', ')}`, detailsJa: `検出: ${[d.schema.hasFaq && 'FAQPage', d.schema.hasHowTo && 'HowTo'].filter(Boolean).join(', ')}` };
      return { status: 'info', details: 'No FAQ/HowTo schema — consider adding if content is Q&A-style', detailsJa: 'FAQ/HowToスキーマなし — Q&A形式コンテンツがあれば追加を検討' };
    },
  },
  {
    id: 'schema-product',
    category: 'Structured Data',
    name: 'Product/Software schema',
    nameJa: 'Product/Softwareスキーマ',
    layer: 'economics',
    severity: 'important',
    applicableSiteTypes: ['saas', 'ec', 'marketplace', 'api_product'],
    evaluate: (d) => {
      if (d.schema.hasProduct || d.schema.hasSoftwareApp) return { status: 'pass', details: `Found: ${[d.schema.hasProduct && 'Product', d.schema.hasSoftwareApp && 'SoftwareApplication'].filter(Boolean).join(', ')}`, detailsJa: `検出: ${[d.schema.hasProduct && 'Product', d.schema.hasSoftwareApp && 'SoftwareApplication'].filter(Boolean).join(', ')}` };
      return { status: 'fail', details: 'No Product/SoftwareApplication schema for pricing/SKU', detailsJa: 'Product/SoftwareApplicationスキーマなし（価格/SKU用）', recommendation: 'Add Product or SoftwareApplication schema with offers for machine-readable pricing', recommendationJa: 'Product/SoftwareApplicationスキーマをoffers付きで追加し価格を機械可読に' };
    },
  },

  // ========== Category: Semantic HTML ==========
  {
    id: 'semantic-html',
    category: 'Content Structure',
    name: 'Semantic HTML elements used',
    nameJa: 'セマンティックHTML要素の使用',
    layer: 'comprehension',
    severity: 'important',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      const count = d.semantic.main + d.semantic.article + d.semantic.section;
      if (d.semantic.main >= 1 && count >= 3) return { status: 'pass', details: `main:${d.semantic.main} article:${d.semantic.article} section:${d.semantic.section} nav:${d.semantic.nav}`, detailsJa: `main:${d.semantic.main} article:${d.semantic.article} section:${d.semantic.section} nav:${d.semantic.nav}` };
      if (count >= 1) return { status: 'warn', details: `Limited semantic HTML: main:${d.semantic.main} article:${d.semantic.article} section:${d.semantic.section}`, detailsJa: `セマンティックHTML限定的: main:${d.semantic.main} article:${d.semantic.article} section:${d.semantic.section}` };
      return { status: 'fail', details: 'No semantic HTML elements (main, article, section) found', detailsJa: 'セマンティックHTML要素(main, article, section)未検出', recommendation: 'Wrap content in <main>, <article>, <section> for better AI comprehension', recommendationJa: 'コンテンツを<main>, <article>, <section>で囲みAI理解を向上' };
    },
  },
  {
    id: 'heading-hierarchy',
    category: 'Content Structure',
    name: 'Proper heading hierarchy',
    nameJa: '適切な見出し階層',
    layer: 'comprehension',
    severity: 'important',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      const h1Count = d.headings.filter(h => h.level === 1).length;
      if (h1Count === 0) return { status: 'fail', details: 'No H1 found', detailsJa: 'H1が見つからない', recommendation: 'Add a single H1 heading as the main page title', recommendationJa: 'メインページタイトルとして1つのH1を追加' };
      if (h1Count > 1) return { status: 'warn', details: `${h1Count} H1 elements found — should be exactly 1`, detailsJa: `${h1Count}個のH1要素 — 1つであるべき` };
      // Check for skipped levels
      const levels = d.headings.map(h => h.level);
      let hasSkip = false;
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i - 1] + 1) { hasSkip = true; break; }
      }
      if (hasSkip) return { status: 'warn', details: `H1 correct (1), but heading levels skip (${levels.join(',')})`, detailsJa: `H1正常(1個)だが見出しレベルにスキップあり (${levels.join(',')})` };
      return { status: 'pass', details: `H1: 1, total headings: ${d.headings.length}, hierarchy valid`, detailsJa: `H1: 1, 見出し合計: ${d.headings.length}, 階層正常` };
    },
  },
  {
    id: 'text-script-ratio',
    category: 'Content Structure',
    name: 'Text/script ratio > 50%',
    nameJa: 'テキスト/スクリプト比率 > 50%',
    layer: 'comprehension',
    severity: 'important',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.content.textRatio >= 50) return { status: 'pass', details: `Text ratio: ${d.content.textRatio}%`, detailsJa: `テキスト比率: ${d.content.textRatio}%` };
      if (d.content.textRatio >= 30) return { status: 'warn', details: `Text ratio: ${d.content.textRatio}% — heavy JavaScript`, detailsJa: `テキスト比率: ${d.content.textRatio}% — JavaScript過多` };
      return { status: 'fail', details: `Text ratio: ${d.content.textRatio}% — JS-heavy pages are hard for AI agents`, detailsJa: `テキスト比率: ${d.content.textRatio}% — JS重いページはAIエージェントに困難`, recommendation: 'Reduce client-side JavaScript or add server-side rendering', recommendationJa: 'クライアントJSを削減するかSSRを追加' };
    },
  },

  // ========== Category: Meta & OGP ==========
  {
    id: 'ogp',
    category: 'Meta & OGP',
    name: 'Open Graph Protocol tags',
    nameJa: 'OGPタグ',
    layer: 'comprehension',
    severity: 'important',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      const present = [d.ogp.title && 'title', d.ogp.description && 'desc', d.ogp.image && 'image'].filter(Boolean);
      if (present.length >= 3) return { status: 'pass', details: `OGP complete: ${present.join(', ')}${d.ogp.twitterCard ? ', Twitter Card' : ''}`, detailsJa: `OGP完備: ${present.join(', ')}${d.ogp.twitterCard ? ', Twitter Card' : ''}` };
      if (present.length >= 1) return { status: 'warn', details: `Partial OGP: ${present.join(', ')} (missing ${['title', 'desc', 'image'].filter(x => !present.includes(x)).join(', ')})`, detailsJa: `OGP部分的: ${present.join(', ')}` };
      return { status: 'fail', details: 'No OGP tags found', detailsJa: 'OGPタグ未検出', recommendation: 'Add og:title, og:description, og:image for rich previews in AI responses', recommendationJa: 'og:title, og:description, og:imageを追加してAI回答でのリッチプレビューを実現' };
    },
  },
  {
    id: 'alt-text',
    category: 'Meta & OGP',
    name: 'Image alt text coverage > 80%',
    nameJa: '画像alt属性カバレッジ > 80%',
    layer: 'comprehension',
    severity: 'nice_to_have',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.images.total === 0) return { status: 'pass', details: 'No images to check', detailsJa: 'チェック対象の画像なし' };
      if (d.images.altCoverage >= 80) return { status: 'pass', details: `${d.images.altCoverage}% coverage (${d.images.withAlt}/${d.images.total})`, detailsJa: `${d.images.altCoverage}%カバレッジ (${d.images.withAlt}/${d.images.total})` };
      if (d.images.altCoverage >= 50) return { status: 'warn', details: `${d.images.altCoverage}% alt coverage — ${d.images.withoutAlt} images missing alt`, detailsJa: `${d.images.altCoverage}%のaltカバレッジ — ${d.images.withoutAlt}画像がalt欠落` };
      return { status: 'fail', details: `Only ${d.images.altCoverage}% alt coverage`, detailsJa: `altカバレッジ${d.images.altCoverage}%のみ`, recommendation: 'Add descriptive alt text to images', recommendationJa: '画像に説明的なaltテキストを追加' };
    },
  },
  {
    id: 'meta-title',
    category: 'Meta & OGP',
    name: 'Title tag present and adequate',
    nameJa: 'titleタグの存在と適切さ',
    layer: 'discovery',
    severity: 'blocker',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (!d.meta.title) return { status: 'fail', details: 'No title tag', detailsJa: 'titleタグなし', recommendation: 'Add a descriptive <title> tag', recommendationJa: '説明的な<title>タグを追加' };
      if (d.meta.titleLength < 10) return { status: 'warn', details: `Title too short (${d.meta.titleLength} chars): "${d.meta.title}"`, detailsJa: `タイトルが短すぎる (${d.meta.titleLength}文字)` };
      if (d.meta.titleLength > 70) return { status: 'warn', details: `Title too long (${d.meta.titleLength} chars)`, detailsJa: `タイトルが長すぎる (${d.meta.titleLength}文字)` };
      return { status: 'pass', details: `"${d.meta.title.slice(0, 60)}" (${d.meta.titleLength} chars)`, detailsJa: `"${d.meta.title.slice(0, 60)}" (${d.meta.titleLength}文字)` };
    },
  },
  {
    id: 'meta-description',
    category: 'Meta & OGP',
    name: 'Meta description present',
    nameJa: 'メタディスクリプションの存在',
    layer: 'discovery',
    severity: 'important',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (!d.meta.description) return { status: 'fail', details: 'No meta description', detailsJa: 'メタディスクリプションなし', recommendation: 'Add a meta description (120-160 chars) summarizing the page', recommendationJa: 'ページ要約のメタディスクリプション(120-160文字)を追加' };
      if (d.meta.descriptionLength < 50) return { status: 'warn', details: `Description short (${d.meta.descriptionLength} chars)`, detailsJa: `ディスクリプションが短い (${d.meta.descriptionLength}文字)` };
      return { status: 'pass', details: `"${d.meta.description.slice(0, 80)}..." (${d.meta.descriptionLength} chars)`, detailsJa: `"${d.meta.description.slice(0, 80)}..." (${d.meta.descriptionLength}文字)` };
    },
  },

  // ========== Category: HTTP & Performance ==========
  {
    id: 'http-status',
    category: 'HTTP & Performance',
    name: 'HTTP 200 OK response',
    nameJa: 'HTTP 200 OK レスポンス',
    layer: 'discovery',
    severity: 'blocker',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.http.statusCode === 200) return { status: 'pass', details: 'HTTP 200 OK', detailsJa: 'HTTP 200 OK' };
      if (d.http.statusCode === 0) return { status: 'fail', details: 'Could not reach the site', detailsJa: 'サイトに到達できない' };
      return { status: 'fail', details: `HTTP ${d.http.statusCode}`, detailsJa: `HTTP ${d.http.statusCode}` };
    },
  },
  {
    id: 'redirect-chain',
    category: 'HTTP & Performance',
    name: 'Redirect chain ≤ 3 hops',
    nameJa: 'リダイレクトチェーン ≤ 3段',
    layer: 'discovery',
    severity: 'nice_to_have',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.http.redirectChain <= 1) return { status: 'pass', details: `${d.http.redirectChain} redirect(s)`, detailsJa: `${d.http.redirectChain}回のリダイレクト` };
      if (d.http.redirectChain <= 3) return { status: 'warn', details: `${d.http.redirectChain} redirects — AI agents may timeout`, detailsJa: `${d.http.redirectChain}回のリダイレクト — AIエージェントがタイムアウトする可能性` };
      return { status: 'fail', details: `${d.http.redirectChain} redirects — too many`, detailsJa: `${d.http.redirectChain}回のリダイレクト — 多すぎる` };
    },
  },
  {
    id: 'https',
    category: 'HTTP & Performance',
    name: 'HTTPS enabled',
    nameJa: 'HTTPS有効',
    layer: 'safety',
    severity: 'blocker',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.http.isHttps) return { status: 'pass', details: 'HTTPS', detailsJa: 'HTTPS有効' };
      return { status: 'fail', details: 'Not HTTPS — AI agents may refuse insecure connections', detailsJa: 'HTTPS無効 — AIエージェントが安全でない接続を拒否する可能性', recommendation: 'Enable HTTPS', recommendationJa: 'HTTPSを有効化' };
    },
  },
  {
    id: 'ttfb',
    category: 'HTTP & Performance',
    name: 'TTFB < 800ms',
    nameJa: 'TTFB < 800ms',
    layer: 'discovery',
    severity: 'nice_to_have',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.http.ttfbMs < 800) return { status: 'pass', details: `TTFB: ${d.http.ttfbMs}ms`, detailsJa: `TTFB: ${d.http.ttfbMs}ms` };
      if (d.http.ttfbMs < 2000) return { status: 'warn', details: `TTFB: ${d.http.ttfbMs}ms — slow for AI agents`, detailsJa: `TTFB: ${d.http.ttfbMs}ms — AIエージェントには遅い` };
      return { status: 'fail', details: `TTFB: ${d.http.ttfbMs}ms — very slow`, detailsJa: `TTFB: ${d.http.ttfbMs}ms — 非常に遅い` };
    },
  },

  // ========== Category: toA Infrastructure ==========
  {
    id: 'about-page',
    category: 'toA Infrastructure',
    name: 'About/Company page linked',
    nameJa: 'About/会社ページへのリンク',
    layer: 'identity',
    severity: 'nice_to_have',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.content.hasAboutLink) return { status: 'pass', details: 'About/company page link found', detailsJa: 'About/会社ページリンク検出' };
      return { status: 'warn', details: 'No about/company page link found', detailsJa: 'About/会社ページリンク未検出' };
    },
  },
  {
    id: 'pricing-page',
    category: 'toA Infrastructure',
    name: 'Pricing page linked',
    nameJa: '料金ページへのリンク',
    layer: 'economics',
    severity: 'important',
    applicableSiteTypes: ['saas', 'ec', 'marketplace', 'api_product'],
    evaluate: (d) => {
      if (d.content.hasPricingLink) return { status: 'pass', details: 'Pricing/plans page link found', detailsJa: '料金/プランページリンク検出' };
      return { status: 'fail', details: 'No pricing page link — agents need machine-readable pricing', detailsJa: '料金ページリンクなし — エージェントは機械可読な料金を必要とする', recommendation: 'Add a /pricing page with structured data', recommendationJa: '構造化データ付きの/pricingページを追加' };
    },
  },
  {
    id: 'api-docs',
    category: 'toA Infrastructure',
    name: 'API/docs endpoint discoverable',
    nameJa: 'API/docsエンドポイントの発見可能性',
    layer: 'actionability',
    severity: 'important',
    applicableSiteTypes: ['saas', 'api_product', 'marketplace'],
    evaluate: (d) => {
      const found = [
        d.paths.apiPath && '/api',
        d.paths.docsPath && '/docs',
        d.paths.swaggerPath && '/swagger',
        d.paths.developerPath && '/developer',
        d.paths.wellKnownAiPlugin && 'ai-plugin.json',
      ].filter(Boolean);
      if (found.length > 0) return { status: 'pass', details: `Found: ${found.join(', ')}`, detailsJa: `検出: ${found.join(', ')}` };
      return { status: 'fail', details: 'No API/docs endpoints found at standard paths', detailsJa: '標準パスにAPI/docsエンドポイント未検出', recommendation: 'Expose API documentation at /docs or /api', recommendationJa: '/docsまたは/apiにAPIドキュメントを公開' };
    },
  },

  // ========== Auto-detected (formerly manual) ==========
  {
    id: 'auto-no-captcha',
    category: 'Friction',
    name: 'No CAPTCHA on critical paths',
    nameJa: '主要導線にCAPTCHAなし',
    layer: 'actionability',
    severity: 'blocker',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.friction.captchaProviders.length === 0) {
        return { status: 'pass', details: 'No CAPTCHA scripts detected', detailsJa: 'CAPTCHAスクリプト未検出' };
      }
      return {
        status: 'fail',
        details: `CAPTCHA detected: ${d.friction.captchaProviders.join(', ')}`,
        detailsJa: `CAPTCHA検出: ${d.friction.captchaProviders.join(', ')}`,
        recommendation: 'Provide CAPTCHA-free paths for programmatic access (API key / token auth)',
        recommendationJa: 'プログラマティックアクセス用のCAPTCHA不要パスを提供（APIキー/トークン認証）',
      };
    },
  },
  {
    id: 'auto-no-cookie-wall',
    category: 'Friction',
    name: 'No cookie consent wall blocking content',
    nameJa: 'Cookie同意ウォールがコンテンツを遮断しない',
    layer: 'actionability',
    severity: 'important',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.friction.cookieWallProviders.length === 0) {
        return { status: 'pass', details: 'No cookie consent manager detected', detailsJa: 'Cookie同意マネージャー未検出' };
      }
      return {
        status: 'warn',
        details: `Cookie consent manager detected: ${d.friction.cookieWallProviders.join(', ')} — may block AI agents`,
        detailsJa: `Cookie同意マネージャー検出: ${d.friction.cookieWallProviders.join(', ')} — AIエージェントをブロックする可能性`,
        recommendation: 'Ensure cookie wall does not block content for bot user-agents',
        recommendationJa: 'ボットUser-Agentに対してCookieウォールがコンテンツを遮断しないようにする',
      };
    },
  },
  {
    id: 'auto-openapi',
    category: 'API Integration',
    name: 'OpenAPI/Swagger spec available',
    nameJa: 'OpenAPI/Swagger仕様が利用可能',
    layer: 'actionability',
    severity: 'important',
    applicableSiteTypes: ['saas', 'api_product'],
    evaluate: (d) => {
      const found = [
        d.paths.openapiPath && '/openapi.json',
        d.paths.swaggerPath && '/swagger',
      ].filter(Boolean);
      if (found.length > 0) {
        return { status: 'pass', details: `OpenAPI spec found: ${found.join(', ')}`, detailsJa: `OpenAPI仕様検出: ${found.join(', ')}` };
      }
      return {
        status: 'fail',
        details: 'No OpenAPI/Swagger spec found at standard paths',
        detailsJa: '標準パスにOpenAPI/Swagger仕様未検出',
        recommendation: 'Publish OpenAPI spec at /openapi.json or /swagger',
        recommendationJa: '/openapi.jsonまたは/swaggerにOpenAPI仕様を公開',
      };
    },
  },
  {
    id: 'auto-content-freshness',
    category: 'Provenance',
    name: 'Content freshness signals (dateModified)',
    nameJa: 'コンテンツ鮮度シグナル(dateModified)',
    layer: 'comprehension',
    severity: 'nice_to_have',
    applicableSiteTypes: ['all'],
    evaluate: (d) => {
      if (d.schema.hasDateModified) {
        return { status: 'pass', details: 'dateModified found in structured data', detailsJa: '構造化データにdateModified検出' };
      }
      return {
        status: 'fail',
        details: 'No dateModified in structured data',
        detailsJa: '構造化データにdateModifiedなし',
        recommendation: 'Add dateModified to your JSON-LD schema (Article, WebPage, etc.)',
        recommendationJa: 'JSON-LDスキーマにdateModifiedを追加（Article, WebPage等）',
      };
    },
  },
  {
    id: 'auto-author-byline',
    category: 'Provenance',
    name: 'Author byline with credentials',
    nameJa: '資格付きの著者情報',
    layer: 'comprehension',
    severity: 'nice_to_have',
    applicableSiteTypes: ['media', 'docs'],
    evaluate: (d) => {
      if (d.schema.hasAuthor) {
        return { status: 'pass', details: `Author found: ${d.schema.authorName || '(structured data)'}`, detailsJa: `著者情報検出: ${d.schema.authorName || '(構造化データ)'}` };
      }
      return {
        status: 'fail',
        details: 'No author information in structured data',
        detailsJa: '構造化データに著者情報なし',
        recommendation: 'Add author with name and credentials to your JSON-LD schema',
        recommendationJa: 'JSON-LDスキーマに著者名・資格情報を追加',
      };
    },
  },
  {
    id: 'auto-machine-readable-price',
    category: 'Economics',
    name: 'Pricing is machine-readable (structured data)',
    nameJa: '価格が機械可読(構造化データ)',
    layer: 'economics',
    severity: 'important',
    applicableSiteTypes: ['saas', 'ec', 'marketplace'],
    evaluate: (d) => {
      if (d.schema.hasPrice) {
        return { status: 'pass', details: 'Price found in Product/Offer structured data', detailsJa: 'Product/Offer構造化データに価格検出' };
      }
      if (d.schema.hasProduct) {
        return { status: 'warn', details: 'Product schema found but no price data', detailsJa: 'Productスキーマあり但し価格データなし', recommendation: 'Add price/offers to Product schema', recommendationJa: 'Productスキーマにprice/offersを追加' };
      }
      return {
        status: 'fail',
        details: 'No machine-readable pricing in structured data',
        detailsJa: '構造化データに機械可読な価格なし',
        recommendation: 'Add Product/Offer schema with price to your pages',
        recommendationJa: 'ページにProduct/Offerスキーマ（価格付き）を追加',
      };
    },
  },
  {
    id: 'auto-rate-limit-header',
    category: 'Reliability',
    name: 'Rate limit info in response headers',
    nameJa: 'レスポンスヘッダーにレート制限情報',
    layer: 'actionability',
    severity: 'nice_to_have',
    applicableSiteTypes: ['saas', 'api_product'],
    evaluate: (d) => {
      const rateLimitHeaders = Object.keys(d.http.headers).filter(k =>
        k.startsWith('x-ratelimit') || k.startsWith('ratelimit') || k === 'retry-after'
      );
      if (rateLimitHeaders.length > 0) {
        return { status: 'pass', details: `Rate limit headers: ${rateLimitHeaders.join(', ')}`, detailsJa: `レート制限ヘッダー検出: ${rateLimitHeaders.join(', ')}` };
      }
      return {
        status: 'fail',
        details: 'No rate limit headers in response',
        detailsJa: 'レスポンスにレート制限ヘッダーなし',
        recommendation: 'Add X-RateLimit-Limit/Remaining/Reset headers to API responses',
        recommendationJa: 'APIレスポンスにX-RateLimit-Limit/Remaining/Resetヘッダーを追加',
      };
    },
  },
];

// ============================================
// Manual Check Definitions (16 items — 7 moved to auto)
// ============================================

export const MANUAL_CHECKS: ManualCheckDef[] = [
  // Agent Authentication
  { id: 'manual-oauth', category: 'Agent Authentication', name: 'OAuth 2.0 / API token auth available', nameJa: 'OAuth 2.0 / APIトークン認証が利用可能', layer: 'actionability', severity: 'blocker', applicableSiteTypes: ['saas', 'api_product', 'marketplace'] },
  { id: 'manual-api-key', category: 'Agent Authentication', name: 'API key self-service provisioning', nameJa: 'APIキーのセルフサービス発行', layer: 'actionability', severity: 'important', applicableSiteTypes: ['saas', 'api_product'] },
  { id: 'manual-machine-signup', category: 'Agent Authentication', name: 'Signup flow works without CAPTCHA', nameJa: 'CAPTCHA無しのサインアップ', layer: 'actionability', severity: 'blocker', applicableSiteTypes: ['saas', 'ec', 'marketplace'] },

  // CAPTCHA / Cookie Wall → moved to auto (auto-no-captcha, auto-no-cookie-wall)

  // API / MCP / WebMCP
  { id: 'manual-rest-api', category: 'API Integration', name: 'REST/GraphQL API available', nameJa: 'REST/GraphQL APIが利用可能', layer: 'actionability', severity: 'important', applicableSiteTypes: ['saas', 'api_product', 'marketplace'] },
  { id: 'manual-mcp-server', category: 'API Integration', name: 'MCP server published', nameJa: 'MCPサーバーを公開している', layer: 'actionability', severity: 'experimental', applicableSiteTypes: ['saas', 'api_product'] },
  { id: 'manual-webmcp', category: 'API Integration', name: 'WebMCP form annotations present', nameJa: 'WebMCPフォームアノテーションあり', layer: 'actionability', severity: 'experimental', applicableSiteTypes: ['all'] },
  // manual-openapi → moved to auto (auto-openapi)

  // State & Reliability
  { id: 'manual-idempotent', category: 'Reliability', name: 'API operations are idempotent', nameJa: 'API操作がべき等', layer: 'actionability', severity: 'important', applicableSiteTypes: ['saas', 'api_product', 'marketplace'] },
  { id: 'manual-retry', category: 'Reliability', name: 'Retry-safe with clear error codes', nameJa: '明確なエラーコードでリトライ安全', layer: 'actionability', severity: 'important', applicableSiteTypes: ['saas', 'api_product'] },
  // manual-rate-limit-header → moved to auto (auto-rate-limit-header)

  // Pricing / Economics
  // manual-machine-readable-price → moved to auto (auto-machine-readable-price)
  { id: 'manual-payment-api', category: 'Economics', name: 'Programmatic payment/checkout possible', nameJa: 'プログラマティックな決済/チェックアウトが可能', layer: 'economics', severity: 'important', applicableSiteTypes: ['ec', 'marketplace', 'saas'] },
  { id: 'manual-trial-no-cc', category: 'Economics', name: 'Free trial without credit card', nameJa: 'クレジットカード不要の無料トライアル', layer: 'economics', severity: 'nice_to_have', applicableSiteTypes: ['saas'] },

  // Guardrails / Safety
  { id: 'manual-human-handoff', category: 'Safety', name: 'Human handoff mechanism exists', nameJa: 'ヒューマンハンドオフ機能あり', layer: 'safety', severity: 'important', applicableSiteTypes: ['saas', 'marketplace'] },
  { id: 'manual-action-limit', category: 'Safety', name: 'Per-action spending/scope limits', nameJa: 'アクション単位の支出/スコープ制限', layer: 'safety', severity: 'important', applicableSiteTypes: ['saas', 'ec', 'marketplace'] },
  { id: 'manual-audit-log', category: 'Safety', name: 'Audit log for agent actions', nameJa: 'エージェントアクションの監査ログ', layer: 'safety', severity: 'nice_to_have', applicableSiteTypes: ['saas', 'marketplace'] },

  // Observability
  { id: 'manual-ai-traffic-tag', category: 'Observability', name: 'AI traffic tagged in analytics', nameJa: 'AI流入のアナリティクスタグ付け', layer: 'observability', severity: 'important', applicableSiteTypes: ['all'] },
  { id: 'manual-utm-ai', category: 'Observability', name: 'UTM params for AI referral tracking', nameJa: 'AI参照トラッキング用UTMパラメータ', layer: 'observability', severity: 'nice_to_have', applicableSiteTypes: ['all'] },

  // Provenance
  { id: 'manual-original-research', category: 'Provenance', name: 'Original research/data published', nameJa: 'オリジナルリサーチ/データの公開', layer: 'comprehension', severity: 'nice_to_have', applicableSiteTypes: ['all'] },
  // manual-author-byline, manual-content-freshness → moved to auto
];

// ============================================
// Scoring Engine
// ============================================

// Checks that depend on main page HTML content (fail unreliably on self-origin)
const HTML_DEPENDENT_CHECKS = new Set([
  'llms-txt', 'sitemap-xml',
  'schema-org', 'schema-sameas', 'schema-faq-howto', 'schema-product',
  'semantic-html', 'heading-hierarchy', 'text-script-ratio',
  'ogp', 'alt-text', 'meta-title', 'meta-description',
  'canonical', 'hreflang', 'http-status',
  'about-page', 'pricing-page',
  'auto-no-captcha', 'auto-no-cookie-wall',
  'auto-content-freshness', 'auto-author-byline', 'auto-machine-readable-price',
]);

export function evaluateChecks(data: CrawlData, siteType: SiteType = 'all'): AutoCheckResult[] {
  // Detect if HTML fetch failed on self-origin (Worker can't fetch itself)
  const htmlUnavailable = data.isSelfOrigin && data.http.statusCode >= 400;
  console.log(`[toA] selfOrigin=${data.isSelfOrigin} httpCode=${data.http.statusCode} htmlUnavail=${htmlUnavailable}`);

  return AUTO_CHECKS.map(check => {
    // Check site type applicability
    const applicable = check.applicableSiteTypes.includes('all') || check.applicableSiteTypes.includes(siteType);
    if (!applicable) {
      return {
        ...check,
        status: 'info' as CheckStatus,
        details: 'Not applicable for this site type',
        detailsJa: 'このサイト種別には該当しない',
        weight: 0,
      };
    }

    // Self-origin: HTML-dependent checks can't be evaluated
    if (htmlUnavailable && HTML_DEPENDENT_CHECKS.has(check.id)) {
      return {
        ...check,
        status: 'info' as CheckStatus,
        details: 'Skipped: self-origin HTML analysis not available (use external browser test)',
        detailsJa: '自サイト診断のためHTMLの解析をスキップしました（外部ブラウザで確認してください）',
        weight: 0,
      };
    }

    const result = check.evaluate(data);
    return {
      id: check.id,
      category: check.category,
      name: check.name,
      nameJa: check.nameJa,
      layer: check.layer,
      severity: check.severity,
      botCategory: check.botCategory,
      status: result.status,
      details: result.details,
      detailsJa: result.detailsJa,
      recommendation: result.recommendation,
      recommendationJa: result.recommendationJa,
      weight: SEVERITY_WEIGHTS[check.severity],
      applicableSiteTypes: check.applicableSiteTypes,
    };
  });
}

export function calculateScores(autoResults: AutoCheckResult[], manualCompleted: string[] = []): Scores {
  // Layer → axis mapping
  const layerToAxis: Record<Layer, ('ai_discovery' | 'ai_comprehension' | 'agent_transaction' | 'toa_infra')[]> = {
    discovery: ['ai_discovery'],
    comprehension: ['ai_comprehension'],
    actionability: ['agent_transaction', 'toa_infra'],
    identity: ['toa_infra'],
    economics: ['agent_transaction'],
    observability: ['ai_discovery'],
    safety: ['toa_infra'],
  };

  const axisScores: Record<string, { earned: number; total: number }> = {
    ai_discovery: { earned: 0, total: 0 },
    ai_comprehension: { earned: 0, total: 0 },
    agent_transaction: { earned: 0, total: 0 },
    toa_infra: { earned: 0, total: 0 },
  };

  let hasBlockerUnchecked = false;

  // Score auto results
  for (const check of autoResults) {
    if (check.weight === 0) continue; // Not applicable
    const axes = layerToAxis[check.layer] || ['ai_discovery'];
    const score = check.status === 'pass' ? check.weight : check.status === 'warn' ? check.weight * 0.5 : 0;

    for (const axis of axes) {
      axisScores[axis].total += check.weight;
      axisScores[axis].earned += score;
    }

    if (check.severity === 'blocker' && check.status === 'fail') {
      hasBlockerUnchecked = true;
    }
  }

  // Score manual completed checks
  for (const manualCheck of MANUAL_CHECKS) {
    const axes = layerToAxis[manualCheck.layer] || ['toa_infra'];
    const completed = manualCompleted.includes(manualCheck.id);
    const weight = SEVERITY_WEIGHTS[manualCheck.severity];

    for (const axis of axes) {
      axisScores[axis].total += weight;
      axisScores[axis].earned += completed ? weight : 0;
    }

    if (manualCheck.severity === 'blocker' && !completed) {
      hasBlockerUnchecked = true;
    }
  }

  // Calculate percentages
  const pct = (axis: string) => {
    const a = axisScores[axis];
    return a.total > 0 ? Math.round((a.earned / a.total) * 100) : 0;
  };

  const ai_discovery = pct('ai_discovery');
  const ai_comprehension = pct('ai_comprehension');
  const agent_transaction = pct('agent_transaction');
  const toa_infra = pct('toa_infra');

  const searchScore = Math.round((ai_discovery + ai_comprehension) / 2);
  const toaScore = Math.round((agent_transaction + toa_infra) / 2);
  const overall = Math.round((ai_discovery + ai_comprehension + agent_transaction + toa_infra) / 4);

  // Grade
  let grade: string;
  if (overall >= 95) grade = 'A+';
  else if (overall >= 85) grade = 'A';
  else if (overall >= 75) grade = 'B+';
  else if (overall >= 60) grade = 'B';
  else if (overall >= 40) grade = 'C';
  else if (overall >= 20) grade = 'D';
  else grade = 'F';

  // Blocker constraint: cap at B+
  if (hasBlockerUnchecked && ['A+', 'A'].includes(grade)) {
    grade = 'B+';
  }

  return {
    ai_discovery,
    ai_comprehension,
    agent_transaction,
    toa_infra,
    searchScore,
    toaScore,
    overall,
    grade,
    hasBlockerUnchecked,
  };
}

// ============================================
// Auto-Assessment Comment
// ============================================

export function generateSummary(scores: Scores): string {
  const { searchScore, toaScore, hasBlockerUnchecked } = scores;

  let comment = '';

  if (searchScore >= 70 && toaScore >= 70) {
    comment = 'AI検索最適化・toA基盤ともに高水準です。細部の改善でさらにスコアアップが可能です。';
  } else if (searchScore >= 70 && toaScore < 40) {
    comment = 'AI検索最適化は進んでいますが、toA基盤が手薄です。AIエージェントが「見つける」ことはできますが「使う」ことが難しい状態です。API/認証/決済の整備を優先してください。';
  } else if (searchScore < 40 && toaScore >= 70) {
    comment = 'toA基盤は整っていますが、AI検索からの発見性が低い状態です。構造化データ・メタ情報・セマンティックHTMLの整備を優先してください。';
  } else if (searchScore < 40 && toaScore < 40) {
    comment = 'AI検索・toA基盤ともに改善が必要です。まずはrobots.txt・メタ情報・構造化データなどの基盤（Layer 1-2）から着手してください。';
  } else {
    comment = `AI Search Score: ${searchScore}%, toA Readiness: ${toaScore}%。両スコアのバランスを見ながら、Severity: Blockerの項目から優先的に改善してください。`;
  }

  if (hasBlockerUnchecked) {
    comment += '\n\n⚠ Blocker項目が未解消のため、グレードにキャップがかかっています。Blockerの解消を最優先してください。';
  }

  return comment;
}

// ============================================
// Top Priority Actions
// ============================================

export function getTopActions(autoResults: AutoCheckResult[], count = 3): AutoCheckResult[] {
  return autoResults
    .filter(r => r.status === 'fail' || r.status === 'warn')
    .sort((a, b) => {
      // Blocker first, then by weight
      if (a.severity === 'blocker' && b.severity !== 'blocker') return -1;
      if (b.severity === 'blocker' && a.severity !== 'blocker') return 1;
      return b.weight - a.weight;
    })
    .slice(0, count);
}

/** Get manual checks filtered by site type */
export function getManualChecks(siteType: SiteType = 'all'): ManualCheckDef[] {
  return MANUAL_CHECKS.filter(c =>
    c.applicableSiteTypes.includes('all') || c.applicableSiteTypes.includes(siteType)
  );
}
