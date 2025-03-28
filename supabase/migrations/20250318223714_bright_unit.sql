-- Drop existing policies
DROP POLICY IF EXISTS "admin_access" ON pairings;
DROP POLICY IF EXISTS "read_access" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create a single policy for admin access
CREATE POLICY "admin_access_policy"
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

-- Create a policy for public read access
CREATE POLICY "public_read_policy"
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
      FROM subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.status = 'active'
      AND s.current_period_end > now()
    )
  );

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;