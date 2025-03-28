-- Drop existing policies
DROP POLICY IF EXISTS "admin_access" ON pairings;
DROP POLICY IF EXISTS "read_access" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create simple admin policy
CREATE POLICY "admin_policy"
  ON pairings
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Create simple read policy
CREATE POLICY "read_policy"
  ON pairings
  FOR SELECT
  TO public
  USING (
    premium_content = false
    OR auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
    OR auth.uid() IN (
      SELECT user_id FROM subscriptions 
      WHERE status = 'active' AND current_period_end > now()
    )
  );

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;