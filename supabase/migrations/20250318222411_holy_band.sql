/*
  # Fix infinite recursion in security policies

  1. Modifications
    - Simplify policies to avoid any recursion
    - Use direct metadata checks
    - Remove complex policy chains

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admin_full_access_v2" ON pairings;
DROP POLICY IF EXISTS "public_read_access_v2" ON pairings;
DROP POLICY IF EXISTS "admin_read_users_v2" ON auth.users;

-- Create simplified policies that avoid recursion
CREATE POLICY "admin_full_access_v5"
  ON pairings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role') = 'admin'
    )
  );

CREATE POLICY "public_read_access_v5"
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
          AND (raw_user_meta_data->>'role') = 'admin'
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

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;