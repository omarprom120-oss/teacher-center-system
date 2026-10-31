-- Read-only administrator dashboard. The client-side check is not relied upon.
CREATE OR REPLACE FUNCTION public.admin_read_dashboard()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF auth.uid() IS DISTINCT FROM '570c23fa-e6d0-46fb-b77a-656eacd639bb'::uuid THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  RETURN COALESCE((SELECT jsonb_object_agg(k.key, k.value) FROM public.kv_store AS k WHERE k.key IN ('mm-students', 'mm-sessions', 'mm-schedule', 'mm-announcements')), '{}'::jsonb);
END;
$function$;
REVOKE ALL ON FUNCTION public.admin_read_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_read_dashboard() TO authenticated;
