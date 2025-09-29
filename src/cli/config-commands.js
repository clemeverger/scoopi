import chalk from 'chalk'
import { ConfigManager } from '../config/manager.js'

export async function configCommand(options) {
  const configManager = new ConfigManager()

  try {
    if (options.show) {
      await showConfig(configManager)
    } else if (options.reset) {
      await resetConfig(configManager)
    } else if (options.list) {
      await listConfig(configManager)
    } else if (options.get) {
      await getConfig(configManager, options.get)
    } else if (options.set && options.value !== undefined) {
      await setConfig(configManager, options.set, options.value)
    } else {
      console.log(chalk.red('Please specify a valid command'))
      console.log('')
      console.log('Usage:')
      console.log('  scoopi config --show           Show current configuration')
      console.log('  scoopi config --list           List all available configuration keys')
      console.log('  scoopi config --get <key>      Get value for a specific key')
      console.log('  scoopi config --set <key> --value <value>  Set value for a key')
      console.log('  scoopi config --reset          Reset configuration to defaults')
    }
  } catch (error) {
    console.error(chalk.red(`Configuration error: ${error.message}`))
    process.exit(1)
  }
}

async function showConfig(configManager) {
  const userConfig = await configManager.getUserConfig()
  const fullConfig = await configManager.getConfig()
  const configExists = await configManager.configExists()

  console.log(chalk.blue('📋 Scoopi Configuration'))
  console.log('')

  // Show config file location
  console.log(chalk.gray('Config file:'), configManager.getConfigPath())
  console.log(chalk.gray('Status:'), configExists ? chalk.green('exists') : chalk.yellow('not found (using defaults)'))
  console.log('')

  // Show current effective configuration
  console.log(chalk.blue('Current Configuration:'))
  console.log('')

  const configEntries = [
    ['Output Directory', fullConfig.outputDir],
    ['Max Depth', fullConfig.maxDepth],
    ['Delay (ms)', fullConfig.delay],
    ['Timeout (ms)', fullConfig.timeout],
    ['Headless Mode', fullConfig.headless],
    ['User Agent', fullConfig.userAgent],
  ]

  // Direct mapping from display names to config keys
  const displayToConfigKey = {
    'Output Directory': 'outputDir',
    'Max Depth': 'maxDepth',
    'Delay (ms)': 'delay',
    'Timeout (ms)': 'timeout',
    'Headless Mode': 'headless',
    'User Agent': 'userAgent'
  }

  for (const [key, value] of configEntries) {
    const actualKey = displayToConfigKey[key]
    const isCustomized = userConfig.hasOwnProperty(actualKey)
    const marker = isCustomized ? chalk.yellow('(custom)') : chalk.gray('(default)')
    console.log(`  ${chalk.cyan(key.padEnd(16))}: ${value} ${marker}`)
  }

  console.log('')

  // Show user customizations if any
  if (Object.keys(userConfig).length > 0) {
    console.log(chalk.blue('User Customizations:'))
    console.log(JSON.stringify(userConfig, null, 2))
  } else {
    console.log(chalk.gray('No user customizations found.'))
  }
}

async function resetConfig(configManager) {
  const configExists = await configManager.configExists()

  if (!configExists) {
    console.log(chalk.yellow('No configuration file found. Nothing to reset.'))
    return
  }

  await configManager.resetUserConfig()
  console.log(chalk.green('✅ Configuration reset to defaults'))
  console.log(chalk.gray(`Config file cleared: ${configManager.getConfigPath()}`))
}

async function listConfig(configManager) {
  const availableKeys = await configManager.getAvailableKeys()
  const fullConfig = await configManager.getConfig()

  console.log(chalk.blue('📋 Available Configuration Keys'))
  console.log('')

  for (const [category, keys] of Object.entries(availableKeys)) {
    console.log(chalk.cyan(`${category.toUpperCase()}:`))
    for (const key of keys) {
      const currentValue = fullConfig[key]
      const type = typeof currentValue
      console.log(`  ${chalk.yellow(key.padEnd(16))}: ${chalk.gray(type)} (current: ${currentValue})`)
    }
    console.log('')
  }
}

async function getConfig(configManager, key) {
  const fullConfig = await configManager.getConfig()
  const userConfig = await configManager.getUserConfig()

  if (!(key in fullConfig)) {
    console.log(chalk.red(`❌ Configuration key '${key}' not found`))
    console.log(chalk.gray('Use --list to see available keys'))
    return
  }

  const value = fullConfig[key]
  const isCustomized = userConfig.hasOwnProperty(key)
  const source = isCustomized ? chalk.yellow('(custom)') : chalk.gray('(default)')

  console.log(chalk.blue(`Configuration for '${key}':`))
  console.log(`  Value: ${chalk.cyan(value)} ${source}`)
  console.log(`  Type: ${chalk.gray(typeof value)}`)
}

async function setConfig(configManager, key, value) {
  const fullConfig = await configManager.getConfig()

  if (!(key in fullConfig)) {
    console.log(chalk.red(`❌ Configuration key '${key}' not found`))
    console.log(chalk.gray('Use --list to see available keys'))
    return
  }

  try {
    const parsedValue = await configManager.setConfigValue(key, value)
    console.log(chalk.green(`✅ Configuration updated:`))
    console.log(`  ${chalk.cyan(key)}: ${chalk.yellow(parsedValue)}`)
  } catch (error) {
    console.log(chalk.red(`❌ Failed to set configuration: ${error.message}`))
  }
}
