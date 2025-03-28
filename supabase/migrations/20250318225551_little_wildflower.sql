/*
  # Fix admin policies and infinite recursion

  1. Modifications
    - Simplify policy structure
    - Remove circular dependencies
    - Fix admin access

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_operations" ON pairings;
DROP POLICY IF EXISTS "public_read" ON pairings;
DROP POLICY IF EXISTS "admin_write_access" ON pairings;
DROP POLICY IF EXISTS "public_read_access" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create a single policy for admin operations
CREATE POLICY "admin_operations"
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

-- Create a single policy for read access
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

-- Ensure created_by is set for existing records
UPDATE pairings 
SET created_by = (
  SELECT id 
  FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'admin' 
  LIMIT 1
)
WHERE created_by IS NULL;