/*
  # Consolidate all RLS policies into a single migration

  1. Modifications
    - Drop all existing policies
    - Create simplified admin and read policies
    - Remove all redundant migrations

  2. Security
    - Maintain security requirements
    - Keep admin privileges
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_operations" ON pairings;
DROP POLICY IF EXISTS "public_read" ON pairings;
DROP POLICY IF EXISTS "admin_insert" ON pairings;
DROP POLICY IF EXISTS "admin_update" ON pairings;
DROP POLICY IF EXISTS "admin_delete" ON pairings;
DROP POLICY IF EXISTS "read_access" ON pairings;
DROP POLICY IF EXISTS "admin_access" ON pairings;
DROP POLICY IF EXISTS "admin_write_operations" ON pairings;
DROP POLICY IF EXISTS "admin_full_access_v4" ON pairings;
DROP POLICY IF EXISTS "public_read_access_v4" ON pairings;
DROP POLICY IF EXISTS "admin_read_users_v3" ON auth.users;

-- Create a single admin policy for all operations
CREATE POLICY "admin_operations"
  ON pairings
  FOR ALL
  TO authenticated
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Create a simplified read policy
CREATE POLICY "public_read"
  ON pairings
  FOR SELECT
  TO public
  USING (
    premium_content = false
    OR (
      auth.uid() IS NOT NULL
      AND (
        (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
        OR EXISTS (
          SELECT 1
          FROM subscriptions s
          WHERE s.user_id = auth.uid()
          AND s.status = 'active'
          AND s.current_period_end > now()
        )
      )
    )
  );

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;