/*
  # Fix admin access and pairing management

  1. Modifications
    - Simplify policies to their most basic form
    - Fix admin write access
    - Ensure proper read access

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_operations" ON pairings;
DROP POLICY IF EXISTS "public_read" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create a single policy for admin operations
CREATE POLICY "admin_operations"
  ON pairings
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create a single policy for read access
CREATE POLICY "public_read"
  ON pairings
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (
    premium_content = false
    OR auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
    OR auth.uid() IN (
      SELECT user_id FROM subscriptions 
      WHERE status = 'active' 
      AND current_period_end > now()
    )
  );

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;

-- Ensure created_by is set for existing records
UPDATE pairings 
SET created_by = (
  SELECT id 
  FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'admin' 
  LIMIT 1
)
WHERE created_by IS NULL;