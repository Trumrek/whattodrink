/*
  # Fix premium content access control

  1. Modifications
    - Drop existing policies
    - Create new policies with strict premium content checks
    - Fix access control for premium content

  2. Security
    - Ensure premium content is only accessible to premium users
    - Maintain admin access to all content
    - Keep public access to non-premium content
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admin_write_access" ON pairings;
DROP POLICY IF EXISTS "public_read_access" ON pairings;
DROP POLICY IF EXISTS "read_access" ON pairings;
DROP POLICY IF EXISTS "admin_access" ON pairings;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create admin policy with full access
CREATE POLICY "admin_access"
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

-- Create read policy with strict premium content check
CREATE POLICY "read_access"
  ON pairings
  FOR SELECT
  TO public
  USING (
    -- Non-premium content is accessible to everyone
    (premium_content = false)
    OR
    -- Premium content requires authentication and premium status
    (
      premium_content = true
      AND auth.uid() IS NOT NULL
      AND (
        -- Admin can access everything
        EXISTS (
          SELECT 1
          FROM auth.users
          WHERE id = auth.uid()
          AND raw_user_meta_data->>'role' = 'admin'
        )
        OR
        -- Active premium subscribers can access premium content
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

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;