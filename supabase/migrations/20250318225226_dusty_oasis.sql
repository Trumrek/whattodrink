-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "admin_write_access" ON pairings;
DROP POLICY IF EXISTS "public_read_access" ON pairings;
DROP POLICY IF EXISTS "enable_read_access" ON pairings;
DROP POLICY IF EXISTS "enable_admin_access" ON pairings;
DROP POLICY IF EXISTS "admin_policy" ON pairings;
DROP POLICY IF EXISTS "read_policy" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create a single, simple admin policy
CREATE POLICY "admin_write_access"
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

-- Create a single, simple read policy
CREATE POLICY "public_read_access"
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