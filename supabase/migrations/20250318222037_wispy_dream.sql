/*
  # Fix admin policies and permissions

  1. Modifications
    - Drop and recreate all policies with unique names
    - Simplify admin access control
    - Fix permission issues

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Admin write access" ON pairings;
DROP POLICY IF EXISTS "Admin write operations" ON pairings;
DROP POLICY IF EXISTS "Read access" ON pairings;
DROP POLICY IF EXISTS "Public read access" ON pairings;
DROP POLICY IF EXISTS "Enable read access" ON pairings;
DROP POLICY IF EXISTS "Enable admin access" ON pairings;
DROP POLICY IF EXISTS "Pairings access control" ON pairings;
DROP POLICY IF EXISTS "Pairings can be created by admins" ON pairings;
DROP POLICY IF EXISTS "Pairings can be updated by admins" ON pairings;
DROP POLICY IF EXISTS "Pairings can be deleted by admins" ON pairings;
DROP POLICY IF EXISTS "Pairings are viewable by everyone" ON pairings;

-- Create new policies with unique names
CREATE POLICY "admin_full_access_policy"
  ON pairings
  FOR ALL
  TO authenticated
  USING (
    (SELECT raw_user_meta_data->>'role' = 'admin'
     FROM auth.users
     WHERE id = auth.uid())
  );

CREATE POLICY "public_read_access_policy"
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
        (SELECT raw_user_meta_data->>'role' = 'admin'
         FROM auth.users
         WHERE id = auth.uid())
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