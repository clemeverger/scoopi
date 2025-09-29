import fs from 'fs/promises';
import path from 'path';
import { homedir } from 'os';
import { defaultConfig } from './default.js';

export class ConfigManager {
  constructor() {
    this.configDir = path.join(homedir(), '.scoopi');
    this.configFile = path.join(this.configDir, 'config.json');
  }

  /**
   * Ensure config directory exists
   */
  async ensureConfigDir() {
    try {
      await fs.mkdir(this.configDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
  }

  /**
   * Load user configuration from file
   */
  async loadUserConfig() {
    try {
      const configData = await fs.readFile(this.configFile, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      // Config file doesn't exist or is invalid, return empty object
      return {};
    }
  }

  /**
   * Save user configuration to file
   */
  async saveUserConfig(config) {
    await this.ensureConfigDir();
    await fs.writeFile(this.configFile, JSON.stringify(config, null, 2), 'utf8');
  }

  /**
   * Get merged configuration (CLI options > user config > default config)
   */
  async getConfig(cliOptions = {}) {
    const userConfig = await this.loadUserConfig();

    // Merge configs with priority: CLI > user > default
    const merged = {
      ...defaultConfig,
      ...userConfig,
      ...this.filterCliOptions(cliOptions)
    };

    return merged;
  }

  /**
   * Filter CLI options to only include config-related options
   */
  filterCliOptions(cliOptions) {
    const configKeys = ['maxDepth', 'delay', 'timeout', 'outputDir', 'headless'];
    const filtered = {};

    // Map CLI option names to config keys
    if (cliOptions.depth !== undefined) filtered.maxDepth = parseInt(cliOptions.depth);
    if (cliOptions.delay !== undefined) filtered.delay = parseInt(cliOptions.delay);
    if (cliOptions.output !== undefined) filtered.outputDir = cliOptions.output;

    return filtered;
  }

  /**
   * Get current user configuration
   */
  async getUserConfig() {
    return await this.loadUserConfig();
  }

  /**
   * Update user configuration
   */
  async updateUserConfig(updates) {
    const currentConfig = await this.loadUserConfig();
    const newConfig = { ...currentConfig, ...updates };
    await this.saveUserConfig(newConfig);
    return newConfig;
  }

  /**
   * Reset user configuration to defaults
   */
  async resetUserConfig() {
    await this.ensureConfigDir();
    await fs.writeFile(this.configFile, JSON.stringify({}, null, 2), 'utf8');
    return {};
  }

  /**
   * Check if config file exists
   */
  async configExists() {
    try {
      await fs.access(this.configFile);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get config file path for display
   */
  getConfigPath() {
    return this.configFile;
  }

  /**
   * Get available configuration keys organized by category
   */
  async getAvailableKeys() {
    return {
      crawling: ['maxDepth', 'delay', 'timeout'],
      output: ['outputDir'],
      browser: ['headless', 'userAgent'],
      filtering: ['excludeSelectors', 'excludePatterns'],
      markdown: ['markdownOptions']
    };
  }

  /**
   * Validate and set a configuration value
   */
  async setConfigValue(key, value) {
    const fullConfig = await this.getConfig();

    if (!(key in fullConfig)) {
      throw new Error(`Unknown configuration key: ${key}`);
    }

    const currentType = typeof fullConfig[key];
    let parsedValue;

    // Type validation and parsing
    try {
      switch (currentType) {
        case 'number':
          parsedValue = parseInt(value);
          if (isNaN(parsedValue)) {
            throw new Error(`Value must be a number`);
          }
          break;
        case 'boolean':
          if (value.toLowerCase() === 'true') {
            parsedValue = true;
          } else if (value.toLowerCase() === 'false') {
            parsedValue = false;
          } else {
            throw new Error(`Value must be 'true' or 'false'`);
          }
          break;
        case 'string':
          parsedValue = value;
          break;
        case 'object':
          if (Array.isArray(fullConfig[key])) {
            // Handle arrays - expect comma-separated values
            parsedValue = value.split(',').map(item => item.trim());
          } else {
            // Handle objects - expect JSON
            parsedValue = JSON.parse(value);
          }
          break;
        default:
          throw new Error(`Unsupported configuration type: ${currentType}`);
      }
    } catch (error) {
      throw new Error(`Invalid value for ${key} (expected ${currentType}): ${error.message}`);
    }

    // Additional validation for specific keys
    await this.validateSpecificKey(key, parsedValue);

    // Update configuration
    await this.updateUserConfig({ [key]: parsedValue });

    return parsedValue;
  }

  /**
   * Validate specific configuration keys
   */
  async validateSpecificKey(key, value) {
    switch (key) {
      case 'maxDepth':
        if (value < 1 || value > 10) {
          throw new Error('maxDepth must be between 1 and 10');
        }
        break;
      case 'delay':
        if (value < 0 || value > 10000) {
          throw new Error('delay must be between 0 and 10000 ms');
        }
        break;
      case 'timeout':
        if (value < 1000 || value > 120000) {
          throw new Error('timeout must be between 1000 and 120000 ms');
        }
        break;
      case 'outputDir':
        if (!value || value.trim() === '') {
          throw new Error('outputDir cannot be empty');
        }
        break;
    }
  }
}