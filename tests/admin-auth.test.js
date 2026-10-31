import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ADMIN_EMAIL, ADMIN_ID, verifiedAdmin, signInAdmin } from '../src/adminAuth.js'

test('server-verified ID and confirmation are required', async () => {
  const auth = user => ({ getUser: async () => ({ data: { user }, error: null }) })
  assert.equal(await verifiedAdmin(auth({ id: ADMIN_ID, email_confirmed_at: '2026-01-01' })), true)
  assert.equal(await verifiedAdmin(auth({ id: 'other', email_confirmed_at: '2026-01-01' })), false)
  assert.equal(await verifiedAdmin(auth({ id: ADMIN_ID })), false)
  assert.equal(await verifiedAdmin({ getUser: async () => { throw Error('offline') } }), false)
})

test('login uses the fixed admin account and rejects a different identity', async () => {
  let signedOut = false
  const auth = {
    signInWithPassword: async data => { assert.deepEqual(data, { email: ADMIN_EMAIL, password: 'test' }); return { error: null } },
    getUser: async () => ({ data: { user: { id: 'other', email_confirmed_at: 'yes' } } }),
    signOut: async () => { signedOut = true },
  }
  assert.equal(await signInAdmin(auth, 'test'), false)
  assert.equal(signedOut, true)
})
