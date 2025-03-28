/*
  # Fix infinite recursion in RLS policies

  1. Modifications
    - Completely restructure policies to avoid recursion
    - Simplify policy checks
    - Use direct role checks without function calls

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_write_policy" ON pairings;
DROP POLICY IF EXISTS "admin_update_policy" ON pairings;
DROP POLICY IF EXISTS "admin_delete_policy" ON pairings;
DROP POLICY IF EXISTS "public_read_policy" ON pairings;

-- Create a single admin policy for all operations
CREATE POLICY "admin_write_operations"
  ON pairings
  FOR ALL
  TO authenticated
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Create a separate read policy for all users
CREATE POLICY "read_access"
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
        (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
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