/*
  # Make administrators automatically premium

  1. Modifications
    - Update is_premium function to return true for admins
    - Add comments and documentation
    - Maintain existing premium user checks

  2. Security
    - Preserve existing security checks
    - Keep function as SECURITY DEFINER
*/

-- Update the is_premium function to include admins
CREATE OR REPLACE FUNCTION is_premium(user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if user is admin first
  IF is_admin(user_id) THEN
    RETURN true;
  END IF;

  -- If not admin, check subscription status
  RETURN EXISTS (
    SELECT 1
    FROM subscriptions
    WHERE subscriptions.user_id = $1
    AND status = 'active'
    AND current_period_end > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;