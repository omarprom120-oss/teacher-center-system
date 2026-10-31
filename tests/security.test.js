import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFile, readdir } from 'node:fs/promises'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
after(() => server.close())
const { default: App } = await server.ssrLoadModule('/src/App.jsx')

test('routes do not expose private data before session verification', () => {
  // The notice is route-independent and exposes no interactive application.
  for (const hash of ['', '#/admin', '#/student', '#/<script>alert(1)</script>']) {
    globalThis.window = { location: { hash } }
    const html = renderToStaticMarkup(React.createElement(App))
    assert.match(html, hash === '#/admin' ? /دخول المدير/ : /بوابة الطلاب/)
    assert.doesNotMatch(html, /<form|<input|<script|MM-1001/)
  }
  delete globalThis.window
})

test('production bundle excludes the prototype and secret key values', async () => {
  const files = await readdir('dist/assets')
  const bundle = (await Promise.all(files.map(file => readFile(`dist/assets/${file}`, 'utf8')))).join('\n')
  assert.equal(/sb_secret_[A-Za-z0-9_-]{20,}|kv_store|MM-1001/.test(bundle), false)
})

test('notice layout has a viewport and flexible width', async () => {
  const html = await readFile('index.html', 'utf8')
  const css = await readFile('src/security-notice.css', 'utf8')
  assert.match(html, /name="viewport"/)
  assert.match(css, /width:\s*min\(100%,\s*40rem\)/)
})
