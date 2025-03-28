/*
  # Fix admin write permissions for pairings

  1. Modifications
    - Add explicit write permissions for admins
    - Separate read and write policies for clarity
    - Ensure proper permission checks

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admin_full_access_v5" ON pairings;
DROP POLICY IF EXISTS "public_read_access_v5" ON pairings;

-- Create separate policies for read and write operations
CREATE POLICY "admin_write_policy"
  ON pairings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role') = 'admin'
    )
  );

CREATE POLICY "admin_update_policy"
  ON pairings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role') = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role') = 'admin'
    )
  );

CREATE POLICY "admin_delete_policy"
  ON pairings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role') = 'admin'
    )
  );

CREATE POLICY "public_read_policy"
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