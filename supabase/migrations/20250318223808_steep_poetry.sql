/*
  # Fix infinite recursion in database policies

  1. Modifications
    - Simplify policies to avoid recursion
    - Use direct role checks
    - Remove nested policy dependencies

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admin_access_policy" ON pairings;
DROP POLICY IF EXISTS "public_read_policy" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create a simplified admin policy
CREATE POLICY "admin_access"
  ON pairings
  FOR ALL
  TO authenticated
  USING (
    coalesce(
      (SELECT raw_user_meta_data->>'role' = 'admin'
       FROM auth.users
       WHERE id = auth.uid()),
      false
    )
  );

-- Create a simplified read policy
CREATE POLICY "read_access"
  ON pairings
  FOR SELECT
  TO public
  USING (
    premium_content = false
    OR
    coalesce(
      (SELECT raw_user_meta_data->>'role' = 'admin'
       FROM auth.users
       WHERE id = auth.uid()),
      false
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