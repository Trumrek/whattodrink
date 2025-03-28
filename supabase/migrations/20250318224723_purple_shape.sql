/*
  # Fix admin permissions and policies

  1. Modifications
    - Simplify admin access policies
    - Fix permissions for creating and viewing pairings
    - Ensure proper access to existing records

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

-- Create admin policy with full access
CREATE POLICY "admin_write_access"
  ON pairings
  AS PERMISSIVE
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

-- Create read policy for everyone
CREATE POLICY "public_read_access"
  ON pairings
  AS PERMISSIVE
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

-- Set created_by for existing records if null
UPDATE pairings 
SET created_by = (
  SELECT id 
  FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'admin' 
  LIMIT 1
)
WHERE created_by IS NULL;

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;