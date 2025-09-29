export class PageParser {
  constructor(logger) {
    this.logger = logger;
  }

  async extractContent(page, url) {
    try {
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Extract main content and links
      const result = await page.evaluate(() => {
        // Function to remove unwanted elements
        const removeElements = (selectors) => {
          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
          });
        };

        // Remove common non-content elements
        removeElements([
          'nav', 'header', 'footer',
          '.nav', '.navigation', '.navbar',
          '.sidebar', '.breadcrumb',
          '.advertisement', '.ads',
          'script', 'style', 'noscript',
          '[class*="cookie"]', '[class*="consent"]',
          '.social-share', '.share-buttons'
        ]);

        // Try to find main content area
        let contentElement =
          document.querySelector('main') ||
          document.querySelector('[role="main"]') ||
          document.querySelector('.content') ||
          document.querySelector('.main-content') ||
          document.querySelector('#content') ||
          document.querySelector('#main') ||
          document.querySelector('article') ||
          document.body;

        // Get content HTML
        const content = contentElement ? contentElement.innerHTML : document.body.innerHTML;

        // Extract all links
        const links = Array.from(document.querySelectorAll('a[href]'))
          .map(link => ({
            href: link.href,
            text: link.textContent.trim()
          }))
          .filter(link => link.href && !link.href.startsWith('#') && !link.href.startsWith('mailto:'));

        // Get page title
        const title = document.title || document.querySelector('h1')?.textContent || '';

        return {
          content,
          links,
          title: title.trim()
        };
      });

      this.logger.debug(`Extracted ${result.links.length} links from ${url}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to extract content from ${url}: ${error.message}`);
      throw error;
    }
  }

  filterLinks(links, baseUrl, includePatterns, excludePatterns) {
    const filtered = links
      .map(link => {
        try {
          // Resolve relative URLs
          const absoluteUrl = new URL(link.href, baseUrl).href;
          return { ...link, href: absoluteUrl };
        } catch {
          return null;
        }
      })
      .filter(link => link !== null)
      .filter(link => {
        // Same domain check
        try {
          const baseDomain = new URL(baseUrl).hostname;
          const linkDomain = new URL(link.href).hostname;

          if (baseDomain !== linkDomain) {
            return false;
          }
        } catch {
          return false;
        }

        // Pattern matching
        const url = link.href;

        // Exclude patterns
        if (excludePatterns && excludePatterns.length > 0) {
          for (const pattern of excludePatterns) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            if (regex.test(url)) {
              return false;
            }
          }
        }

        // Include patterns
        if (includePatterns && includePatterns.length > 0) {
          for (const pattern of includePatterns) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            if (regex.test(url)) {
              return true;
            }
          }
          return false;
        }

        return true;
      })
      // Remove duplicates
      .filter((link, index, array) =>
        array.findIndex(l => l.href === link.href) === index
      );

    this.logger.debug(`Filtered to ${filtered.length} valid links`);
    return filtered;
  }
}