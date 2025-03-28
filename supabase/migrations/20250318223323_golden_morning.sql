/*
  # Fix infinite recursion in database policies

  1. Modifications
    - Simplify policies to avoid recursion
    - Use direct role checks
    - Remove nested subqueries

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access" ON pairings;
DROP POLICY IF EXISTS "Enable admin access" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create simplified read policy
CREATE POLICY "enable_read_access"
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
      FROM subscriptions
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND current_period_end > now()
    )
  );

-- Create simplified admin policy
CREATE POLICY "enable_admin_access"
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

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;