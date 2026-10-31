# Security review and release blocker

**Status: not production ready.** The deployed entry point is deliberately a maintenance notice. Student registration, attendance, grades and the student portal are unavailable. The former UI is retained in `src/legacy/UnsafePrototype.jsx` for reference only; `App.jsx` at the repository root is another unused prototype. Neither provides authentication or authorization, and neither must be deployed or re-enabled as-is.

## Findings

- Critical: `#/admin` selected the admin UI without authentication. Student identity was accepted based on a student ID or phone number. A URL, UI condition or predictable identifier is not an authorization boundary.
- Critical: the client used a publishable Supabase key to read and write whole collections through `kv_store`. A publishable key is intended to be public, not a secret; protection depends on database grants and RLS. No database schema, policies, migrations or server-side authorization are in this repository, so the deployed database cannot be verified or repaired here. Even removing the key from the build does not stop direct access using a previously published key.
- High: the former student portal downloaded full student and session collections, exposing other users' records if the database permitted access. The former prototype accepted user-provided video URLs without a protocol allowlist.
- The tracked old `dist` contained the previously published application and endpoint; it is removed from the current tree, but remains in Git history and any already-deployed copies.
- The old Vite dependency had known advisories. It has been updated; development host validation is restricted to the preview domain rather than all hosts.

## Immediate operator action

1. Disable or remove all old deployments and cached assets. In Supabase, immediately inspect `kv_store` and all other exposed tables, disable anonymous access, and review grants, RLS policies and existing access logs. Verify with the actual anon key that reads and writes are rejected. Removing a key from source is not a substitute for database authorization. Investigate potential exposure of student data and follow applicable incident response obligations.
2. Review database contents and backups before modifying or migrating data. Restrict access using server-verified identities and narrowly scoped row-level policies; test with anonymous, student, other-student and admin identities. Never put service-role credentials in client code. Keep secrets out of Git and rotate any actual exposed privileged credentials.
3. Implement real authentication and server-side authorization for every operation, including object ownership, admin privileges, and safe per-user projections. Use validation and safe URL protocols, rate limiting, audited access, and secure session management. Build and test the migration and policies against an isolated Supabase project before restoring functionality.
4. Add end-to-end tests for registration, attendance and grades, authorization bypass attempts against the real backend, XSS/URL payloads, and real browser tests at mobile and desktop sizes. Review deployment headers, monitoring and backups. The included tests only verify the maintenance page and build, not the security of the remote service.

## Local checks

Run `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm test`, and `pnpm audit`. Tests require a fresh build. No remote database, real penetration test, or browser responsiveness test is performed by this suite.

## Prototype-only preparation

The archived prototype now rejects non-HTTPS resource links and out-of-range scores in its UI and uses random UUIDs for new student identifiers. These changes have unit tests but do not implement authentication, RLS, database validation, persistence or cross-device synchronization. They do not make the prototype safe to deploy. Database-side checks remain mandatory; client-side checks can be bypassed.

## Live database containment (2026-10-31)

A read-only inspection of the connected project found RLS enabled on `public.kv_store`, but its single permissive policy allowed `PUBLIC` every operation (`USING (true)`, `WITH CHECK (true)`). Both `anon` and `authenticated` had all table privileges, including `TRUNCATE`, which is not controlled by row policies. The table contained three rows; no user accounts existed in Supabase Auth.

The `lock_down_public_kv_store` migration was applied to the connected project: the permissive policy was dropped, and all table privileges were revoked from `PUBLIC`, `anon`, and `authenticated`. A verification query found no remaining policies and reported that anon cannot select, insert, update, delete or truncate, and authenticated cannot select or truncate. These are database metadata checks, not an end-to-end REST penetration test. The migration does not delete data; the legacy application will no longer work. Existing privileged roles remain outside this restriction. The SQL is recorded in `supabase/migrations/20261031210149_lock_down_public_kv_store.sql`.

Next steps require provisioning an actual administrator account, designing a student identity and per-student authorization model, and implementing/test-driving the secured application. Regranting anonymous access to the existing collection-wide JSON rows would reintroduce the original exposure.

## Follow-up (2026-10-31)

The requested administrator email did not match an existing `auth.users` row in the connected project. No administrator role or client grant was added. `kv_store` still has no policies and privilege checks for SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES and TRIGGER returned false for both `anon` and `authenticated`. The local migration filename now matches the version recorded in Supabase. A student code or phone number alone is not an authenticator: a caller can supply another student's identifier. A second factor or a securely provisioned secret is required before exposing private records.

## Administrator sign-in preparation

The requested administrator's confirmed Supabase Auth account was located. The `/#/admin` login now uses Supabase Auth with the fixed administrator email and verifies the resulting user with `auth.getUser()` against the confirmed account's immutable UUID. It does not expose or enable the dashboard or data, and is not an authorization boundary; database grants remain revoked. No live sign-in with the administrator's credentials was performed. The project publishable key identifies the project and is intentionally public; a different publishable key can be provided at build time through `VITE_SUPABASE_PUBLISHABLE_KEY`. Never use a secret or service-role key in the browser.

Student PIN access, safe issuance and reset, rate limiting, student-scoped data access, public schedule and announcements, full admin restoration, and end-to-end tests remain unimplemented. A four-digit PIN has only 10,000 possibilities and requires durable, server-side rate limiting and protection against distributed guessing. Do not expose the previous JSON collections to anonymous callers. The platform remains not production-ready.

## Public portal projection (2026-10-31)

A narrow `get_public_portal()` function was applied to the connected database, exposing only explicitly selected schedule and announcement fields to `anon` and `authenticated`. It does not return student or attendance collections, or arbitrary extra JSON fields. Treat every value placed in these schedule/announcement fields as public. Database metadata checks confirmed that anon can execute the projection but still cannot SELECT or UPDATE `kv_store` directly; the function returned six schedule entries and zero announcements at verification time. A live end-to-end browser/REST authorization test was not performed. The local frontend now reads that function for the public portal; it has not been deployed. The administrator dashboard and private student portal are still not implemented. Do not present login with a student code or phone as a security control.

## Read-only administrator dashboard

`admin_read_dashboard()` is deployed in the connected database and checks the administrator UUID using `auth.uid()` on every call. It is executable by authenticated users, but rejects any other identity; direct client table privileges remain revoked. Metadata checks verified anonymous execution is denied, a SQL call without an identity and one with a different simulated identity returned authorization errors, and a simulated administrator claim returned the expected collection keys. These are not end-to-end JWT or browser tests. The frontend now mounts a read-only dashboard after verified sign-in; editing, registrations and student-private access remain unavailable. The existing production deployment is not updated until the changes are merged and deployed.
