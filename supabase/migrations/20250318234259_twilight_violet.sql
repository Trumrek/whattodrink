/*
  # Add history table with proper policy handling

  1. Modifications
    - Drop existing policies first
    - Create table if not exists
    - Add proper RLS policies

  2. Security
    - Maintain RLS security
    - Keep user-specific access controls
*/

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

-- Create history table
CREATE TABLE IF NOT EXISTS history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  pairing_id uuid REFERENCES pairings(id) NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
    CREATE POLICY "Users can read own history"
      ON history
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own history"
      ON history
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own history"
      ON history
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

-- Grant necessary permissions
GRANT ALL ON history TO authenticated;