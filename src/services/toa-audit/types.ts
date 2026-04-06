// ============================================
// toA Audit — Type Definitions
// ============================================

/** Bot classification for robots.txt analysis */
export type BotCategory = 'search' | 'training' | 'user_triggered';

export type BotStatus = 'allowed' | 'disallowed' | 'no_rule';

export interface RobotsBotResult {
  name: string;
  category: BotCategory;
  status: BotStatus;
  rule?: string;
}

export interface RobotsResult {
  exists: boolean;
  statusCode: number;
  bots: RobotsBotResult[];
  hasSitemap: boolean;
  rawContent?: string;
}

export interface LlmsTxtResult {
  exists: boolean;
  statusCode: number;
  contentLength: number;
  hasTitle: boolean;
  hasDescription: boolean;
}

export interface SitemapResult {
  exists: boolean;
  statusCode: number;
  urlCount: number;
  isValid: boolean;
}

export interface SchemaResult {
  found: boolean;
  types: string[];
  hasOrganization: boolean;
  hasSameAs: boolean;
  sameAsUrls: string[];
  hasFaq: boolean;
  hasProduct: boolean;
  hasHowTo: boolean;
  hasSoftwareApp: boolean;
  hasArticle: boolean;
  rawBlocks: unknown[];
}

export interface HeadingInfo {
  tag: string;
  level: number;
  text: string;
}

export interface SemanticHtmlResult {
  main: number;
  article: number;
  section: number;
  nav: number;
  header: number;
  footer: number;
  aside: number;
}

export interface OgpResult {
  title: boolean;
  description: boolean;
  image: boolean;
  url: boolean;
  type: boolean;
  twitterCard: boolean;
}

export interface MetaResult {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  canonicalMatch: boolean;
  viewport: boolean;
  lang: string;
  hreflangCount: number;
  robotsMeta: string;
  xRobotsTag: string;
}

export interface ImageResult {
  total: number;
  withAlt: number;
  withoutAlt: number;
  altCoverage: number;
}

export interface ContentResult {
  htmlSize: number;
  scriptSize: number;
  textRatio: number;
  wordCount: number;
  hasAboutLink: boolean;
  hasPricingLink: boolean;
}

export interface HttpResult {
  statusCode: number;
  redirectChain: number;
  isHttps: boolean;
  ttfbMs: number;
  headers: Record<string, string>;
}

export interface PathDiscoveryResult {
  apiPath: boolean;
  docsPath: boolean;
  swaggerPath: boolean;
  developerPath: boolean;
  wellKnownAiPlugin: boolean;
}

/** Raw crawl data from all fetches */
export interface CrawlData {
  url: string;
  normalizedUrl: string;
  robots: RobotsResult;
  llmsTxt: LlmsTxtResult;
  sitemap: SitemapResult;
  schema: SchemaResult;
  semantic: SemanticHtmlResult;
  headings: HeadingInfo[];
  ogp: OgpResult;
  meta: MetaResult;
  images: ImageResult;
  content: ContentResult;
  http: HttpResult;
  paths: PathDiscoveryResult;
  links?: { href: string; text: string }[];
  errors: string[];
  crawledAt: string;
}

/** Check result severity */
export type Severity = 'blocker' | 'important' | 'nice_to_have' | 'experimental';

/** Check result status */
export type CheckStatus = 'pass' | 'fail' | 'warn' | 'info';

/** Layer classification */
export type Layer = 'discovery' | 'comprehension' | 'actionability' | 'identity' | 'economics' | 'observability' | 'safety';

/** Site type filter */
export type SiteType = 'all' | 'media' | 'saas' | 'ec' | 'marketplace' | 'api_product' | 'docs';

/** Auto check result */
export interface AutoCheckResult {
  id: string;
  category: string;
  name: string;
  nameJa: string;
  layer: Layer;
  severity: Severity;
  botCategory?: BotCategory;
  status: CheckStatus;
  details: string;
  detailsJa: string;
  recommendation?: string;
  recommendationJa?: string;
  weight: number;
  applicableSiteTypes: SiteType[];
}

/** Manual check item definition */
export interface ManualCheckDef {
  id: string;
  category: string;
  name: string;
  nameJa: string;
  layer: Layer;
  severity: Severity;
  botCategory?: BotCategory;
  weight: number;
  applicableSiteTypes: SiteType[];
}

/** Score breakdown */
export interface Scores {
  ai_discovery: number;
  ai_comprehension: number;
  agent_transaction: number;
  toa_infra: number;
  searchScore: number;
  toaScore: number;
  overall: number;
  grade: string;
  hasBlockerUnchecked: boolean;
}

/** Full audit result */
export interface AuditResult {
  id: string;
  url: string;
  siteType: SiteType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scores: Scores;
  autoResults: AutoCheckResult[];
  manualChecks: ManualCheckDef[];
  summary: string;
  topActions: AutoCheckResult[];
  createdAt: string;
  completedAt: string;
  durationMs: number;
}
