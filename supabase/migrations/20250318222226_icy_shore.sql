/*
  # Fix pairing creation and saving

  1. Modifications
    - Add trigger to automatically set created_by
    - Fix admin write permissions
    - Ensure proper error handling

  2. Security
    - Maintain RLS security
    - Keep admin privileges intact
*/

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS set_created_by_trigger ON pairings;
DROP FUNCTION IF EXISTS set_created_by();

-- Create function to set created_by
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Set created_by to current user if not already set
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  
  -- For debugging
  RAISE NOTICE 'Setting created_by to %', NEW.created_by;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER set_created_by_trigger
  BEFORE INSERT ON pairings
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

-- Drop existing policies
DROP POLICY IF EXISTS "admin_full_access_v2" ON pairings;
DROP POLICY IF EXISTS "public_read_access_v2" ON pairings;

-- Create policy for admin write access
CREATE POLICY "admin_full_access_v3"
  ON pairings
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create policy for read access
CREATE POLICY "public_read_access_v3"
  ON pairings
  FOR SELECT
  TO public
  USING (
    premium_content = false
    OR
    (
      auth.uid() IS NOT NULL
      AND
      (
        is_admin(auth.uid())
        OR
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

-- Reset RLS
ALTER TABLE pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON pairings TO authenticated;
GRANT SELECT ON pairings TO anon;