-- Public data only. No student details, grades, attendance or arbitrary JSON fields.
CREATE OR REPLACE FUNCTION public.get_public_portal()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
  SELECT jsonb_build_object(
    'schedule', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', item->>'id', 'day', item->>'day', 'center', item->>'center', 'grade', item->>'grade', 'subject', item->>'subject', 'time', item->>'time')) FROM public.kv_store k CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(k.value) = 'array' THEN k.value ELSE '[]'::jsonb END) AS item WHERE k.key = 'mm-schedule'), '[]'::jsonb),
    'announcements', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', item->>'id', 'title', item->>'title', 'body', item->>'body', 'type', item->>'type')) FROM public.kv_store k CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(k.value) = 'array' THEN k.value ELSE '[]'::jsonb END) AS item WHERE k.key = 'mm-announcements'), '[]'::jsonb)
  );
$function$;
REVOKE ALL ON FUNCTION public.get_public_portal() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_portal() TO anon, authenticated;
