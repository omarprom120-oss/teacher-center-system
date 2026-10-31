-- Incident containment: preserve rows while denying direct client access.
-- This breaks the legacy anonymous application. Do not regrant access until
-- authentication, per-user authorization, and policies have been tested.
ALTER TABLE public.kv_store ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all public access" ON public.kv_store;
REVOKE ALL PRIVILEGES ON TABLE public.kv_store FROM PUBLIC, anon, authenticated;
