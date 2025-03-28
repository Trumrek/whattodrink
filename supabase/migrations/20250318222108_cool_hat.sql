/*
  # Fix infinite recursion in policies

  1. Modifications
    - Remove recursive policy checks
    - Simplify admin role verification
    - Fix policy dependencies

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_full_access_policy" ON pairings;
DROP POLICY IF EXISTS "public_read_access_policy" ON pairings;
DROP POLICY IF EXISTS "Admins can read users" ON auth.users;

-- Create non-recursive admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Direct metadata check without policy evaluation
  RETURN coalesce(
    (SELECT raw_user_meta_data->>'role' = 'admin'
     FROM auth.users
     WHERE id = user_id
     AND raw_user_meta_data ? 'role'),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simplified policy for admin access
CREATE POLICY "admin_full_access_v2"
  ON pairings
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create simplified policy for read access
CREATE POLICY "public_read_access_v2"
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
        is_admin(auth.uid())
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
CREATE POLICY "admin_read_users_v2"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;