export class UrlUtils {
  static isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }

  static isSameDomain(url1, url2) {
    try {
      const parsed1 = new URL(url1);
      const parsed2 = new URL(url2);
      return parsed1.hostname === parsed2.hostname;
    } catch {
      return false;
    }
  }

  static normalizeUrl(url, baseUrl) {
    try {
      const parsed = new URL(url, baseUrl);

      // Remove fragment
      parsed.hash = '';

      // Remove tracking query parameters
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref', '_ga'];
      trackingParams.forEach(param => {
        parsed.searchParams.delete(param);
      });

      // Normalize hostname (lowercase)
      parsed.hostname = parsed.hostname.toLowerCase();

      // Remove default ports
      if ((parsed.protocol === 'https:' && parsed.port === '443') ||
          (parsed.protocol === 'http:' && parsed.port === '80')) {
        parsed.port = '';
      }

      // Normalize pathname (remove trailing slash except for root)
      if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }

      return parsed.href;
    } catch {
      return null;
    }
  }

  static getPathFromUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.pathname;
    } catch {
      return null;
    }
  }

  static matchesPatterns(url, patterns) {
    if (!patterns || patterns.length === 0) return false;

    return patterns.some(pattern => {
      // Simple pattern matching with wildcards
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(url);
    });
  }

  static shouldIncludeUrl(url, includePatterns, excludePatterns) {
    // If exclude patterns match, exclude the URL
    if (excludePatterns && this.matchesPatterns(url, excludePatterns)) {
      return false;
    }

    // If include patterns are specified, URL must match one of them
    if (includePatterns && includePatterns.length > 0) {
      return this.matchesPatterns(url, includePatterns);
    }

    // Default: include
    return true;
  }

  static generateFilename(url) {
    try {
      const parsed = new URL(url);
      let path = parsed.pathname;

      // Remove leading slash
      if (path.startsWith('/')) {
        path = path.slice(1);
      }

      // Default to index if empty path
      if (!path || path === '/') {
        path = 'index';
      }

      // Replace slashes with dashes and add .md extension
      return path.replace(/\//g, '-').replace(/\.html?$/, '') + '.md';
    } catch {
      return 'unknown.md';
    }
  }
}