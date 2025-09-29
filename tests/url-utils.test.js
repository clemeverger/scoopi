import { test } from 'node:test';
import assert from 'node:assert';
import { UrlUtils } from '../src/utils/url-utils.js';

test('UrlUtils.isValidUrl', () => {
  assert.strictEqual(UrlUtils.isValidUrl('https://example.com'), true);
  assert.strictEqual(UrlUtils.isValidUrl('http://example.com'), true);
  assert.strictEqual(UrlUtils.isValidUrl('not-a-url'), false);
  assert.strictEqual(UrlUtils.isValidUrl(''), false);
});

test('UrlUtils.isSameDomain', () => {
  assert.strictEqual(
    UrlUtils.isSameDomain('https://example.com/page1', 'https://example.com/page2'),
    true
  );
  assert.strictEqual(
    UrlUtils.isSameDomain('https://example.com', 'https://other.com'),
    false
  );
});

test('UrlUtils.normalizeUrl', () => {
  assert.strictEqual(
    UrlUtils.normalizeUrl('/page', 'https://example.com'),
    'https://example.com/page'
  );
  assert.strictEqual(
    UrlUtils.normalizeUrl('https://example.com/page', 'https://base.com'),
    'https://example.com/page'
  );
});

test('UrlUtils.matchesPatterns', () => {
  assert.strictEqual(
    UrlUtils.matchesPatterns('https://example.com/docs/api', ['**/docs/**']),
    true
  );
  assert.strictEqual(
    UrlUtils.matchesPatterns('https://example.com/about', ['**/docs/**']),
    false
  );
});

test('UrlUtils.generateFilename', () => {
  assert.strictEqual(
    UrlUtils.generateFilename('https://example.com/docs/api'),
    'docs-api.md'
  );
  assert.strictEqual(
    UrlUtils.generateFilename('https://example.com/'),
    'index.md'
  );
  assert.strictEqual(
    UrlUtils.generateFilename('https://example.com/page.html'),
    'page.md'
  );
});