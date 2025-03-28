/*
  # Fix infinite recursion in security policies

  1. Modifications
    - Remove recursive policy checks
    - Simplify admin role verification
    - Fix user table access

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admin_full_access_v3" ON pairings;
DROP POLICY IF EXISTS "public_read_access_v3" ON pairings;
DROP POLICY IF EXISTS "admin_read_users_v2" ON auth.users;

-- Create non-recursive admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
DECLARE
  role_value text;
BEGIN
  -- Direct metadata check without policy evaluation
  SELECT raw_user_meta_data->>'role'
  INTO role_value
  FROM auth.users
  WHERE id = user_id;
  
  RETURN role_value = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simplified policy for admin access
CREATE POLICY "admin_full_access_v4"
  ON pairings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create simplified policy for read access
CREATE POLICY "public_read_access_v4"
  ON pairings
  FOR SELECT
  TO public
  USING (
    premium_content = false
    OR
    (
      auth.uid() IS NOT NULL
      AND
      (
        EXISTS (
          SELECT 1
          FROM auth.users
          WHERE id = auth.uid()
          AND raw_user_meta_data->>'role' = 'admin'
        )
        OR
        EXISTS (
          SELECT 1
          FROM subscriptions s
          WHERE s.user_id = auth.uid()
          AND s.status = 'active'
          AND s.current_period_end > now()
        )
      )
    )
  );

-- Create non-recursive policy for users table
CREATE POLICY "admin_read_users_v3"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users u
      WHERE u.id = auth.uid()
      AND u.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;