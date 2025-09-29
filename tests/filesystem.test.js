import { test } from 'node:test';
import assert from 'node:assert';
import { FileSystem } from '../src/utils/filesystem.js';

test('FileSystem.sanitizeFilename', () => {
  assert.strictEqual(
    FileSystem.sanitizeFilename('invalid<>chars'),
    'invalid-chars'
  );
  assert.strictEqual(
    FileSystem.sanitizeFilename('spaces in name'),
    'spaces-in-name'
  );
  assert.strictEqual(
    FileSystem.sanitizeFilename('--multiple--dashes--'),
    'multiple-dashes'
  );
});

test('FileSystem.getOutputPath', () => {
  const result = FileSystem.getOutputPath('./docs', 'https://example.com/docs/api');
  assert.ok(result.includes('example.com'));
  assert.ok(result.includes('docs'));
  assert.ok(result.endsWith('.md'));
});