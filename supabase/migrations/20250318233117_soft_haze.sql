/*
  # Add favorites table and policies

  1. New Tables
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `pairing_id` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Users can only access their own favorites
*/

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  pairing_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pairing_id)
);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read own favorites" ON favorites;
    DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
    DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
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
        WHERE tablename = 'favorites' 
        AND policyname = 'Users can read own favorites'
    ) THEN
        CREATE POLICY "Users can read own favorites"
          ON favorites
          FOR SELECT
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'favorites' 
        AND policyname = 'Users can insert own favorites'
    ) THEN
        CREATE POLICY "Users can insert own favorites"
          ON favorites
          FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'favorites' 
        AND policyname = 'Users can delete own favorites'
    ) THEN
        CREATE POLICY "Users can delete own favorites"
          ON favorites
          FOR DELETE
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;
END $$;