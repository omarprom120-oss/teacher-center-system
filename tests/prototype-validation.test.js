import { test } from 'node:test'
import assert from 'node:assert/strict'
import { safeResourceUrl, validScore } from '../src/legacy/validation.js'

test('resource links allow only absolute HTTPS URLs without embedded credentials', () => {
  assert.equal(safeResourceUrl(' https://example.org/a.pdf '), 'https://example.org/a.pdf')
  for (const input of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,hello', '//example.org/a', '/admin', 'http://example.org', 'https://user:pass@example.org', '', null]) {
    assert.equal(safeResourceUrl(input), null, String(input))
  }
})

test('scores reject invalid, negative and out of range inputs', () => {
  assert.equal(validScore('0', 20), 0)
  assert.equal(validScore('19.5', 20), 19.5)
  assert.equal(validScore('20', 20), 20)
  for (const input of ['', ' ', '-1', '21', 'Infinity', 'NaN', 'hello']) {
    assert.equal(validScore(input, 20), null, input)
  }
  assert.equal(validScore('1', -1), null)
})
