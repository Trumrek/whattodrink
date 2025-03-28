/*
  # Add lifetime premium subscription for admins

  1. Modifications
    - Disable and re-enable trigger temporarily to avoid conflicts
    - Create functions for handling admin premium subscriptions
    - Update existing admins with lifetime premium subscription

  2. Security
    - Maintain existing security checks
    - Keep functions as SECURITY DEFINER
*/

-- Temporarily disable the manage_subscription trigger
ALTER TABLE subscriptions DISABLE TRIGGER manage_subscription_trigger;

-- Function to add lifetime premium subscription
CREATE OR REPLACE FUNCTION add_lifetime_premium(p_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO subscriptions (
    user_id,
    status,
    current_period_start,
    current_period_end
  )
  VALUES (
    p_user_id,
    'active',
    now(),
    '2100-01-01'::timestamptz
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    status = 'active',
    current_period_start = now(),
    current_period_end = '2100-01-01'::timestamptz,
    canceled_at = NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle admin role changes
CREATE OR REPLACE FUNCTION handle_admin_role_change()
RETURNS trigger AS $$
BEGIN
  -- Check if user is being made admin
  IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    -- Add lifetime premium subscription
    PERFORM add_lifetime_premium(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for admin role changes
DROP TRIGGER IF EXISTS admin_role_change_trigger ON auth.users;
CREATE TRIGGER admin_role_change_trigger
  AFTER UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_admin_role_change();

-- Add lifetime premium for existing admins
DO $$
DECLARE
  admin_user auth.users%ROWTYPE;
BEGIN
  FOR admin_user IN
    SELECT * FROM auth.users
    WHERE raw_user_meta_data->>'role' = 'admin'
  LOOP
    PERFORM add_lifetime_premium(admin_user.id);
  END LOOP;
END;
$$;

-- Re-enable the manage_subscription trigger
ALTER TABLE subscriptions ENABLE TRIGGER manage_subscription_trigger;