-- Allow users to read their own profile
-- This is needed for the auth system to check is_admin status

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- This ensures that even if admin policies fail, users can still read their own profile
-- which is necessary for the is_admin() function to work correctly
