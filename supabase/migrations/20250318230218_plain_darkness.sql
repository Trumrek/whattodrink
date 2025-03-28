/*
  # Fix admin policies and infinite recursion

  1. Modifications
    - Completely remove circular dependencies
    - Simplify policy checks to bare minimum
    - Fix permission issues

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_access" ON pairings;
DROP POLICY IF EXISTS "read_access" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create a single, simple admin policy without subqueries
CREATE POLICY "admin_access"
  ON pairings
  AS PERMISSIVE
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

-- Create a single, simple read policy without nested checks
CREATE POLICY "read_access"
  ON pairings
  AS PERMISSIVE
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