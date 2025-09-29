# scoopi

CLI tool to scoop documentation websites and convert them to local Markdown files for LLM consumption.

## Installation

```bash
# Install dependencies (Chrome will be installed automatically)
npm install

# If Chrome installation failed, run manually:
npm run setup

# Make the CLI globally available (optional)
npm install -g .
```

### Requirements

- Node.js 18+
- Chrome browser (automatically installed via Puppeteer)

## Usage

### Basic snipping

```bash
scoopi https://docs.example.com
```

### Advanced options

```bash
# Specify maximum depth and output directory
scoopi https://docs.example.com --depth 2 --output ./my-docs

# Include/exclude URL patterns
scoopi https://docs.example.com --include "**/api/**,**/guide/**" --exclude "**/legacy/**"

# Add delay between requests (in milliseconds)
scoopi https://docs.example.com --delay 2000

# Enable verbose logging
scoopi https://docs.example.com --verbose
```

### Configuration

```bash
# Show current configuration
scoopi config --show

# Reset configuration to defaults
scoopi config --reset
```

## Options

- `--depth, -d <number>`: Maximum scooping depth (default: 3)
- `--output, -o <path>`: Output directory (default: ./docs)
- `--include <patterns>`: URL patterns to include (comma-separated)
- `--exclude <patterns>`: URL patterns to exclude (comma-separated)
- `--delay <ms>`: Delay between requests in milliseconds (default: 1000)
- `--verbose`: Enable verbose logging

## Features

- 🥄 **Smart scooping**: Automatically detects and follows documentation links

- 📝 **Clean conversion**: Converts HTML to clean, readable Markdown
- 🗂️ **Organized output**: Creates hierarchical directory structure based on URLs
- 🎯 **Pattern matching**: Include/exclude URLs using glob patterns
- ⚡ **Performance**: Configurable delays and depth limits
- 🔍 **Content filtering**: Removes navigation, ads, and other non-content elements
- 📊 **Progress tracking**: Real-time progress indicators and detailed logging

## Development

```bash
# Run tests
npm test

# Start in development mode
npm run dev

# Lint code
npm run lint
```

## License

MIT
