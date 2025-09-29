import chalk from 'chalk';
import ora from 'ora';
import { Crawler } from '../core/crawler.js';
import { Logger } from '../utils/logger.js';
import { ConfigManager } from '../config/manager.js';

export async function crawlCommand(url, options) {
  const logger = new Logger(options.verbose);
  const spinner = ora('Initializing scoopi...').start();

  try {
    // Validate URL
    new URL(url);

    // Load configuration
    const configManager = new ConfigManager();
    const config = await configManager.getConfig(options);

    const crawlerOptions = {
      maxDepth: config.maxDepth,
      outputDir: config.outputDir,
      includePatterns: options.include ? options.include.split(',') : [],
      excludePatterns: options.exclude ? options.exclude.split(',') : [],
      delay: config.delay,
      verbose: options.verbose
    };

    spinner.text = 'Starting scoopi...';

    const crawler = new Crawler(crawlerOptions, logger);
    await crawler.crawl(url);

    spinner.succeed(chalk.green(`Documentation successfully scooped to ${options.output}`));

  } catch (error) {
    spinner.fail(chalk.red(`Scooping failed: ${error.message}`));
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}