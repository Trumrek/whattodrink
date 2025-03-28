/*
  # Fix history system

  1. Modifications
    - Drop and recreate history table with proper constraints
    - Add index on viewed_at for better performance
    - Fix RLS policies
    - Add cascade delete when pairing is deleted

  2. Security
    - Maintain RLS security
    - Keep user-specific access controls
*/

-- Drop existing table
DROP TABLE IF EXISTS history;

-- Create history table with proper constraints
CREATE TABLE history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pairing_id uuid NOT NULL REFERENCES pairings(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, pairing_id, viewed_at)
);

-- Create index for better performance
CREATE INDEX history_viewed_at_idx ON history(viewed_at DESC);
CREATE INDEX history_user_pairing_idx ON history(user_id, pairing_id);

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