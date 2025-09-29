import puppeteer from 'puppeteer';
import { PageParser } from './parser.js';
import { HtmlToMarkdownConverter } from './converter.js';
import { FileSystem } from '../utils/filesystem.js';
import { UrlUtils } from '../utils/url-utils.js';

export class Crawler {
  constructor(options, logger) {
    this.options = {
      maxDepth: 3,
      outputDir: './docs',
      includePatterns: [],
      excludePatterns: [],
      delay: 1000,
      verbose: false,
      ...options
    };

    this.logger = logger;
    this.parser = new PageParser(logger);
    this.converter = new HtmlToMarkdownConverter();
    this.visitedUrls = new Set();
    this.urlQueue = [];
    this.browser = null;
    this.page = null;
    this.interrupted = false;
  }

  async crawl(startUrl) {
    try {
      this.logger.info(`Starting crawl of ${startUrl}`);
      this.logger.debug(`Options: ${JSON.stringify(this.options, null, 2)}`);

      // Initialize browser
      await this.initBrowser();

      // Add start URL to queue
      this.urlQueue.push({ url: startUrl, depth: 0 });

      // Process queue
      while (this.urlQueue.length > 0 && !this.interrupted) {
        const { url, depth } = this.urlQueue.shift();

        // Skip if already visited
        if (this.visitedUrls.has(url)) {
          continue;
        }

        // Skip if max depth reached
        if (depth > this.options.maxDepth) {
          this.logger.debug(`Skipping ${url} - max depth reached`);
          continue;
        }

        try {
          await this.crawlPage(url, depth);
          this.visitedUrls.add(url);

          // Add delay between requests
          if (this.options.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.options.delay));
          }

        } catch (error) {
          this.logger.error(`Failed to crawl ${url}: ${error.message}`);
          if (this.options.verbose) {
            console.error(error.stack);
          }
        }
      }

      if (this.interrupted) {
        this.logger.info(`Crawl interrupted. Visited ${this.visitedUrls.size} pages.`);
      } else {
        this.logger.success(`Crawl completed. Visited ${this.visitedUrls.size} pages.`);
      }

    } finally {
      await this.cleanup();
    }
  }

  async initBrowser() {
    this.logger.debug('Launching browser...');

    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      this.page = await this.browser.newPage();

      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (compatible; scoopi/1.0; +https://github.com/user/scoopi)');

      // Set viewport
      await this.page.setViewport({ width: 1200, height: 800 });

      this.logger.debug('Browser initialized');
    } catch (error) {
      if (error.message.includes('Could not find Chrome')) {
        throw new Error(
          'Chrome browser not found. Please run: npm run setup\n' +
          'Or manually install Chrome: npx puppeteer browsers install chrome'
        );
      }
      throw error;
    }
  }

  async crawlPage(url, depth) {
    this.logger.info(`Crawling ${url} (depth: ${depth})`);

    try {
      // Navigate to page
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Extract content and links
      const pageData = await this.parser.extractContent(this.page, url);

      // Convert HTML to Markdown
      const markdown = this.converter.convert(pageData.content, url);

      // Save to file
      const outputPath = FileSystem.getOutputPath(this.options.outputDir, url);
      await FileSystem.writeFile(outputPath, markdown);

      this.logger.success(`Saved: ${outputPath}`);

      // Process links for next depth level
      if (depth < this.options.maxDepth) {
        const filteredLinks = this.parser.filterLinks(
          pageData.links,
          url,
          this.options.includePatterns,
          this.options.excludePatterns
        );

        // Add links to queue
        filteredLinks.forEach(link => {
          if (!this.visitedUrls.has(link.href) &&
              !this.urlQueue.some(item => item.url === link.href)) {
            this.urlQueue.push({ url: link.href, depth: depth + 1 });
            this.logger.debug(`Queued: ${link.href}`);
          }
        });

        this.logger.debug(`Added ${filteredLinks.length} new URLs to queue`);
      }

    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new Error(`Page load timeout: ${url}`);
      }
      throw error;
    }
  }

  async cleanup() {
    if (this.browser) {
      this.logger.debug('Closing browser...');
      await this.browser.close();
    }
  }

  /**
   * Interrupt the crawling process
   */
  interrupt() {
    this.interrupted = true;
    this.logger.debug('Crawl interruption requested');
  }
}