/*
  # Add history table with proper policy handling

  1. Modifications
    - Add IF NOT EXISTS checks for policies
    - Ensure idempotent creation of table and policies
    - Handle existing policies gracefully

  2. Security
    - Maintain RLS security
    - Keep user-specific access controls
*/

-- Create history table
CREATE TABLE IF NOT EXISTS history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  pairing_id uuid REFERENCES pairings(id) NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read own history" ON history;
    DROP POLICY IF EXISTS "Users can insert own history" ON history;
    DROP POLICY IF EXISTS "Users can delete own history" ON history;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Create policies with IF NOT EXISTS checks
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'history' 
        AND policyname = 'Users can read own history'
    ) THEN
        CREATE POLICY "Users can read own history"
          ON history
          FOR SELECT
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'history' 
        AND policyname = 'Users can insert own history'
    ) THEN
        CREATE POLICY "Users can insert own history"
          ON history
          FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'history' 
        AND policyname = 'Users can delete own history'
    ) THEN
        CREATE POLICY "Users can delete own history"
          ON history
          FOR DELETE
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON history TO authenticated;