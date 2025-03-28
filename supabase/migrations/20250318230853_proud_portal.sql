/*
  # Restore working admin policies

  1. Modifications
    - Drop all existing policies
    - Create simple, direct policies that worked before
    - Avoid any circular dependencies

  2. Security
    - Maintain basic security requirements
    - Keep admin privileges intact
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access" ON pairings;
DROP POLICY IF EXISTS "Enable admin access" ON pairings;
DROP POLICY IF EXISTS "admin_access" ON pairings;
DROP POLICY IF EXISTS "read_access" ON pairings;
DROP POLICY IF EXISTS "admin_operations" ON pairings;
DROP POLICY IF EXISTS "public_read" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create simple admin policy
CREATE POLICY "admin_access"
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

-- Create simple read policy
CREATE POLICY "read_access"
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