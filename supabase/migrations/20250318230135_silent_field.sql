/*
  # Fix admin policies and infinite recursion

  1. Modifications
    - Remove recursive policy checks
    - Simplify admin access
    - Fix permission issues

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_operations" ON pairings;
DROP POLICY IF EXISTS "public_read" ON pairings;
DROP POLICY IF EXISTS "admin_write_access" ON pairings;
DROP POLICY IF EXISTS "public_read_access" ON pairings;
DROP POLICY IF EXISTS "enable_read_access" ON pairings;
DROP POLICY IF EXISTS "enable_admin_access" ON pairings;
DROP POLICY IF EXISTS "admin_policy" ON pairings;
DROP POLICY IF EXISTS "read_policy" ON pairings;
DROP POLICY IF EXISTS "admin_delete" ON pairings;
DROP POLICY IF EXISTS "admin_insert" ON pairings;
DROP POLICY IF EXISTS "admin_update" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create a single, simple admin policy
CREATE POLICY "admin_access"
  ON pairings
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Create a single, simple read policy
CREATE POLICY "read_access"
  ON pairings
  AS PERMISSIVE
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

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;