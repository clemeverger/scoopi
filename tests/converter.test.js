import { test } from 'node:test';
import assert from 'node:assert';
import { HtmlToMarkdownConverter } from '../src/core/converter.js';

test('HtmlToMarkdownConverter basic conversion', () => {
  const converter = new HtmlToMarkdownConverter();
  const html = '<h1>Title</h1><p>Paragraph text</p>';
  const markdown = converter.convert(html, 'https://example.com');

  assert.ok(markdown.includes('# Title'));
  assert.ok(markdown.includes('Paragraph text'));
  assert.ok(markdown.includes('source: https://example.com'));
});

test('HtmlToMarkdownConverter removes scripts', () => {
  const converter = new HtmlToMarkdownConverter();
  const html = '<p>Content</p><script>alert("test")</script>';
  const markdown = converter.convert(html, 'https://example.com');

  assert.ok(markdown.includes('Content'));
  assert.ok(!markdown.includes('alert'));
});

test('HtmlToMarkdownConverter handles code blocks', () => {
  const converter = new HtmlToMarkdownConverter();
  const html = '<pre><code class="language-js">console.log("test")</code></pre>';
  const markdown = converter.convert(html, 'https://example.com');

  assert.ok(markdown.includes('```js'));
  assert.ok(markdown.includes('console.log'));
});