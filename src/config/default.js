export const defaultConfig = {
  // Crawling options
  maxDepth: 3,
  delay: 1000,
  timeout: 30000,

  // Output options
  outputDir: './docs',

  // Browser options
  headless: true,
  userAgent: 'Mozilla/5.0 (compatible; scoopi/1.0; +https://github.com/user/scoopi)',

  // Content filtering
  excludeSelectors: [
    'nav', 'header', 'footer',
    '.nav', '.navigation', '.navbar',
    '.sidebar', '.breadcrumb',
    '.advertisement', '.ads',
    'script', 'style', 'noscript',
    '[class*="cookie"]', '[class*="consent"]',
    '.social-share', '.share-buttons'
  ],

  // URL patterns to exclude by default
  excludePatterns: [
    '.*\\.pdf$',
    '.*\\.zip$',
    '.*\\.exe$',
    '.*\\.(jpg|jpeg|png|gif|svg|ico)$',
    '.*\\.(css|js)$',
    '.*/api/.*',
    '.*/login.*',
    '.*/register.*',
    '.*/auth.*'
  ],

  // Markdown conversion options
  markdownOptions: {
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    strongDelimiter: '**',
    emDelimiter: '_'
  }
};