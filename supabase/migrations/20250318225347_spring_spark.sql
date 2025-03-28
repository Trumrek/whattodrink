/*
  # Fix admin access and permissions

  1. Modifications
    - Simplify admin policies
    - Fix permission issues
    - Ensure proper access control

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admin_write_access" ON pairings;
DROP POLICY IF EXISTS "public_read_access" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create separate policies for admin operations
CREATE POLICY "admin_delete"
  ON pairings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "admin_insert"
  ON pairings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "admin_update"
  ON pairings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create read policy for everyone
CREATE POLICY "public_read"
  ON pairings
  FOR SELECT
  TO public
  USING (
    premium_content = false
    OR (
      auth.uid() IS NOT NULL
      AND (
        EXISTS (
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
      )
    )
  );

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;