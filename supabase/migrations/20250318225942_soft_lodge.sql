-- Drop all existing policies
DROP POLICY IF EXISTS "admin_operations" ON pairings;
DROP POLICY IF EXISTS "public_read" ON pairings;
DROP POLICY IF EXISTS "admin_write_access" ON pairings;
DROP POLICY IF EXISTS "public_read_access" ON pairings;
DROP POLICY IF EXISTS "enable_read_access" ON pairings;
DROP POLICY IF EXISTS "enable_admin_access" ON pairings;
DROP POLICY IF EXISTS "admin_policy" ON pairings;
DROP POLICY IF EXISTS "read_policy" ON pairings;
DROP POLICY IF EXISTS "admin_delete" ON pairings;
DROP POLICY IF EXISTS "admin_insert" ON pairings;
DROP POLICY IF EXISTS "admin_update" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create basic policies that worked initially
CREATE POLICY "Enable read access"
  ON pairings
  FOR SELECT
  TO public
  USING (
    premium_content = false OR
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ) OR
    auth.uid() IN (
      SELECT user_id 
      FROM subscriptions 
      WHERE status = 'active' 
      AND current_period_end > now()
    )
  );

CREATE POLICY "Enable admin access"
  ON pairings
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;