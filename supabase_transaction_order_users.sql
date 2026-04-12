-- Run in Supabase SQL Editor (or migrations) so Order Management can resolve
-- names/emails from auth.users. PostgREST cannot embed auth.users from the client.
--
-- Caller must be an admin (checked via public.profiles, same as admin login).

CREATE OR REPLACE FUNCTION public.transaction_order_users(p_user_ids uuid[])
RETURNS TABLE (
  id uuid,
  email text,
  display_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND COALESCE(p.is_admin, false) = true
  ) THEN
    RAISE EXCEPTION 'forbidden' USING errcode = '42501';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      u.raw_user_meta_data->>'display_name',
      split_part(u.email::text, '@', 1)
    )::text AS display_name
  FROM auth.users u
  WHERE u.id = ANY(p_user_ids);
END;
$$;

REVOKE ALL ON FUNCTION public.transaction_order_users(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transaction_order_users(uuid[]) TO authenticated;
