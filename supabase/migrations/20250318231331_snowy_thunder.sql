/*
  # Fix infinite recursion in policies

  1. Modifications
    - Remove all existing policies
    - Create simplified policies without recursion
    - Use direct role checks without complex joins

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_access" ON pairings;
DROP POLICY IF EXISTS "read_access" ON pairings;
DROP POLICY IF EXISTS "Enable read access" ON pairings;
DROP POLICY IF EXISTS "Enable admin access" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create simplified admin policy without recursion
CREATE POLICY "admin_access"
  ON pairings
  FOR ALL
  TO authenticated
  USING (
    coalesce(
      (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()),
      ''
    ) = 'admin'
  );

-- Create simplified read policy without recursion
CREATE POLICY "read_access"
  ON pairings
  FOR SELECT
  TO public
  USING (
    premium_content = false
    OR coalesce(
      (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()),
      ''
    ) = 'admin'
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