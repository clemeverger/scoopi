#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { crawlCommand } from './commands.js';

const program = new Command();

program
  .name('scoopi')
  .description('CLI tool to scoop documentation websites and convert them to local Markdown files for LLM consumption')
  .version('1.0.0');

program
  .command('crawl')
  .description('Scoop a documentation website and convert it to Markdown')
  .argument('<url>', 'URL of the documentation to scoop')
  .option('-d, --depth <number>', 'Maximum scooping depth', '3')
  .option('-o, --output <path>', 'Output directory', './docs')
  .option('--include <patterns>', 'URL patterns to include (comma-separated)')
  .option('--exclude <patterns>', 'URL patterns to exclude (comma-separated)')
  .option('--delay <ms>', 'Delay between requests in milliseconds', '1000')
  .option('--verbose', 'Enable verbose logging')
  .action(crawlCommand);

program
  .command('config')
  .description('Manage scoopi configuration')
  .option('--show', 'Show current configuration')
  .option('--reset', 'Reset configuration to defaults')
  .action((options) => {
    if (options.show) {
      console.log(chalk.blue('Configuration management coming soon...'));
    } else if (options.reset) {
      console.log(chalk.yellow('Reset functionality coming soon...'));
    } else {
      console.log(chalk.red('Please specify --show or --reset'));
    }
  });

program.parse();