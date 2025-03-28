/*
  # Fix infinite recursion in database policies

  1. Modifications
    - Simplify policy checks to avoid recursion
    - Use direct metadata checks
    - Remove nested policy dependencies

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_delete" ON pairings;
DROP POLICY IF EXISTS "admin_insert" ON pairings;
DROP POLICY IF EXISTS "admin_update" ON pairings;
DROP POLICY IF EXISTS "public_read" ON pairings;
DROP POLICY IF EXISTS "admin_write_access" ON pairings;
DROP POLICY IF EXISTS "public_read_access" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create a single admin policy for all operations
CREATE POLICY "admin_operations"
  ON pairings
  FOR ALL
  TO authenticated
  USING (
    coalesce(
      (SELECT raw_user_meta_data->>'role' = 'admin'
       FROM auth.users
       WHERE id = auth.uid()),
      false
    )
  );

-- Create a single read policy for public access
CREATE POLICY "public_read"
  ON pairings
  FOR SELECT
  TO public
  USING (
    premium_content = false
    OR (
      auth.uid() IS NOT NULL
      AND (
        coalesce(
          (SELECT raw_user_meta_data->>'role' = 'admin'
           FROM auth.users
           WHERE id = auth.uid()),
          false
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