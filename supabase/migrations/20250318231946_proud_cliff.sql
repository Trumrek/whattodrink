/*
  # Disable RLS on pairings table

  1. Modifications
    - Drop all existing policies
    - Disable RLS on pairings table
    - Keep necessary permissions

  2. Security
    - Note: This removes row-level security
    - Maintain basic table permissions
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_access" ON pairings;
DROP POLICY IF EXISTS "read_access" ON pairings;
DROP POLICY IF EXISTS "Enable read access" ON pairings;
DROP POLICY IF EXISTS "Enable admin access" ON pairings;

-- Disable RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;