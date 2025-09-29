import chalk from 'chalk';
import ora from 'ora';
import { Crawler } from '../core/crawler.js';
import { Logger } from '../utils/logger.js';
import { ConfigManager } from '../config/manager.js';

export async function crawlCommand(url, options) {
  const logger = new Logger(options.verbose);
  const spinner = ora('Initializing scoopi...').start();
  let crawler = null;

  // Handle graceful shutdown
  const handleInterrupt = () => {
    if (crawler) {
      spinner.text = 'Interrupting crawl...';
      crawler.interrupt();
    }
  };

  process.on('SIGINT', handleInterrupt);

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

    crawler = new Crawler(crawlerOptions, logger);
    await crawler.crawl(url);

    if (crawler.interrupted) {
      spinner.warn(chalk.yellow('Crawl interrupted by user'));
    } else {
      spinner.succeed(chalk.green(`Documentation successfully scooped to ${config.outputDir}`));
    }

  } catch (error) {
    spinner.fail(chalk.red(`Scooping failed: ${error.message}`));
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // Clean up the SIGINT listener
    process.removeListener('SIGINT', handleInterrupt);
  }
}