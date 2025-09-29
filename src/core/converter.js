import TurndownService from 'turndown';

export class HtmlToMarkdownConverter {
  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-'
    });

    // Custom rules for better conversion
    this.setupCustomRules();
  }

  setupCustomRules() {
    // Remove navigation elements
    this.turndownService.addRule('removeNav', {
      filter: ['nav', 'header', 'footer', '.navigation', '.nav', '.sidebar', '.breadcrumb'],
      replacement: () => ''
    });

    // Clean up script and style tags
    this.turndownService.addRule('removeScripts', {
      filter: ['script', 'style', 'noscript'],
      replacement: () => ''
    });

    // Handle code blocks better
    this.turndownService.addRule('codeBlocks', {
      filter: ['pre'],
      replacement: (content, node) => {
        const code = node.textContent;
        const language = this.detectLanguage(node);
        return `\n\`\`\`${language}\n${code}\n\`\`\`\n`;
      }
    });

    // Handle tables
    this.turndownService.addRule('tables', {
      filter: 'table',
      replacement: (content, node) => {
        return this.convertTable(node);
      }
    });
  }

  detectLanguage(node) {
    // Try to detect language from class names
    const classNames = node.className || '';
    const codeElement = node.querySelector('code');

    if (codeElement) {
      const codeClasses = codeElement.className || '';
      const langMatch = codeClasses.match(/language-(\w+)|lang-(\w+)/);
      if (langMatch) {
        return langMatch[1] || langMatch[2];
      }
    }

    const langMatch = classNames.match(/language-(\w+)|lang-(\w+)/);
    if (langMatch) {
      return langMatch[1] || langMatch[2];
    }

    return '';
  }

  convertTable(tableNode) {
    const rows = Array.from(tableNode.querySelectorAll('tr'));
    if (rows.length === 0) return '';

    let markdown = '\n';
    let isFirstRow = true;

    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('td, th'));
      const cellContents = cells.map(cell => cell.textContent.trim().replace(/\|/g, '\\|'));

      markdown += '| ' + cellContents.join(' | ') + ' |\n';

      if (isFirstRow) {
        // Add header separator
        markdown += '| ' + cells.map(() => '---').join(' | ') + ' |\n';
        isFirstRow = false;
      }
    }

    return markdown + '\n';
  }

  convert(html, url) {
    try {
      // Clean HTML first
      const cleanHtml = this.cleanHtml(html);

      // Convert to markdown
      let markdown = this.turndownService.turndown(cleanHtml);

      // Post-process markdown
      markdown = this.postProcessMarkdown(markdown, url);

      return markdown;
    } catch (error) {
      throw new Error(`Failed to convert HTML to Markdown: ${error.message}`);
    }
  }

  cleanHtml(html) {
    // Remove common unwanted elements using regex
    let cleaned = html
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove script tags and content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove style tags and content
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove common tracking/analytics elements
      .replace(/<[^>]*\b(?:data-|gtm-|analytics|tracking)[^>]*>/gi, '');

    return cleaned;
  }

  postProcessMarkdown(markdown, url) {
    // Fix multiple newlines
    markdown = markdown.replace(/\n{3,}/g, '\n\n');

    // Add frontmatter with source URL
    const frontmatter = `---\nsource: ${url}\ncrawled_at: ${new Date().toISOString()}\n---\n\n`;

    return frontmatter + markdown.trim();
  }
}