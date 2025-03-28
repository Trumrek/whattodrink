/*
  # Fix infinite recursion in database policies

  1. Modifications
    - Remove circular references in policies
    - Simplify role checks
    - Fix admin access permissions

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admin_policy" ON pairings;
DROP POLICY IF EXISTS "read_policy" ON pairings;
DROP POLICY IF EXISTS "admin_full_access_v4" ON pairings;
DROP POLICY IF EXISTS "public_read_access_v4" ON pairings;
DROP POLICY IF EXISTS "admin_read_users_v3" ON auth.users;
DROP POLICY IF EXISTS "enable_read_access" ON pairings;
DROP POLICY IF EXISTS "enable_admin_access" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create simplified admin policy
CREATE POLICY "admin_write_access"
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
  );

-- Create simplified read policy
CREATE POLICY "public_read_access"
  ON pairings
  FOR SELECT
  TO public
  USING (
    premium_content = false
    OR EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
    OR EXISTS (
      SELECT 1
      FROM subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.status = 'active'
      AND s.current_period_end > now()
    )
  );

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;