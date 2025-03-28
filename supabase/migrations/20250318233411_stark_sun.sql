/*
  # Fix favorites table schema

  1. Modifications
    - Change pairing_id type from text to uuid
    - Add foreign key constraint to pairings table
    - Recreate table and policies

  2. Security
    - Maintain RLS security
    - Keep user-specific access controls
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS favorites CASCADE;

-- Create favorites table with correct types
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  pairing_id uuid REFERENCES pairings(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pairing_id)
);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON favorites TO authenticated;
GRANT SELECT ON favorites TO anon;