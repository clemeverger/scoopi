import fs from 'fs/promises';
import path from 'path';

export class FileSystem {
  static async ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  static async writeFile(filePath, content) {
    await this.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf8');
  }

  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async readFile(filePath) {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch {
      return null;
    }
  }

  static sanitizeFilename(filename) {
    // Remove or replace invalid characters
    return filename
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  static getOutputPath(baseDir, url) {
    try {
      const parsed = new URL(url);
      const domain = parsed.hostname;
      let urlPath = parsed.pathname;

      // Clean up path
      if (urlPath.endsWith('/')) {
        urlPath += 'index';
      }
      if (urlPath.startsWith('/')) {
        urlPath = urlPath.slice(1);
      }

      // Create hierarchical structure
      const pathParts = urlPath.split('/').filter(Boolean);
      const filename = pathParts.pop() || 'index';
      const dirs = [domain, ...pathParts];

      const outputDir = path.join(baseDir, ...dirs.map(d => this.sanitizeFilename(d)));
      const outputFile = this.sanitizeFilename(filename.replace(/\.html?$/, '')) + '.md';

      return path.join(outputDir, outputFile);
    } catch {
      return path.join(baseDir, 'unknown.md');
    }
  }
}