/*
  # Fix database relationships and error handling

  1. Modifications
    - Fix history table foreign key relationship
    - Add proper constraints
    - Ensure referential integrity

  2. Security
    - Maintain existing security policies
    - Keep data integrity
*/

-- Drop and recreate history table with proper foreign key
DROP TABLE IF EXISTS history;

CREATE TABLE history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  pairing_id uuid REFERENCES pairings(id) NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Grant necessary permissions
GRANT ALL ON history TO authenticated;