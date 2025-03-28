/*
  # Restore working policies from previous state

  1. Modifications
    - Reset to original working policies
    - Restore basic admin and public access
    - Remove complex policy chains

  2. Security
    - Maintain basic security requirements
    - Keep essential admin privileges
*/

-- Drop all existing policies
DO $$ 
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Enable read access" ON pairings;
    DROP POLICY IF EXISTS "Enable admin access" ON pairings;
    DROP POLICY IF EXISTS "admin_access" ON pairings;
    DROP POLICY IF EXISTS "read_access" ON pairings;
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
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Create basic policies that worked initially
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'pairings' 
        AND policyname = 'Enable read access'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'pairings' 
        AND policyname = 'Enable admin access'
    ) THEN
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
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;