/*
  # Amélioration de la gestion des abonnements

  1. Modifications
    - Ajout de contraintes sur les dates
    - Ajout de fonctions pour la gestion des abonnements
    - Amélioration des policies RLS

  2. Sécurité
    - Validation des dates
    - Gestion des statuts
    - Contrôle des accès
*/

-- Ajout de contraintes sur les dates
ALTER TABLE subscriptions
ADD CONSTRAINT valid_period_dates 
CHECK (current_period_start < current_period_end);

ALTER TABLE subscriptions
ADD CONSTRAINT valid_canceled_date 
CHECK (canceled_at IS NULL OR canceled_at >= current_period_start);

-- Fonction pour mettre à jour le statut en fonction des dates
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS trigger AS $$
BEGIN
  -- Met à jour le statut en fonction des dates
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.current_period_end < NOW() THEN
      NEW.status := 'expired';
    ELSIF NEW.canceled_at IS NOT NULL THEN
      NEW.status := 'canceled';
    ELSE
      NEW.status := 'active';
    END IF;
  END IF;

  -- Vérifie que la période est valide
  IF NEW.current_period_start >= NEW.current_period_end THEN
    RAISE EXCEPTION 'La date de début doit être antérieure à la date de fin';
  END IF;

  -- Vérifie que la date d'annulation est valide si elle existe
  IF NEW.canceled_at IS NOT NULL AND NEW.canceled_at < NEW.current_period_start THEN
    RAISE EXCEPTION 'La date d''annulation doit être postérieure à la date de début';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la mise à jour automatique du statut
CREATE TRIGGER update_subscription_status_trigger
  BEFORE INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_status();

-- Fonction pour renouveler un abonnement
CREATE OR REPLACE FUNCTION renew_subscription(subscription_id uuid)
RETURNS void AS $$
DECLARE
  sub subscriptions;
BEGIN
  -- Récupère l'abonnement
  SELECT * INTO sub FROM subscriptions WHERE id = subscription_id;
  
  -- Vérifie que l'abonnement existe et est actif
  IF NOT FOUND OR sub.status != 'active' THEN
    RAISE EXCEPTION 'Abonnement non trouvé ou inactif';
  END IF;

  -- Calcule les nouvelles dates
  UPDATE subscriptions
  SET 
    current_period_start = current_period_end,
    current_period_end = current_period_end + INTERVAL '1 month',
    updated_at = NOW()
  WHERE id = subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les abonnements expirés
CREATE OR REPLACE FUNCTION cleanup_expired_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'expired'
  WHERE current_period_end < NOW()
  AND status != 'expired';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Amélioration des policies RLS
DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

CREATE POLICY "Users can read own subscription"
  ON subscriptions
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    is_admin(auth.uid())
  );

CREATE POLICY "Users can insert own subscription"
  ON subscriptions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM subscriptions
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own subscription"
  ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    status IN ('active', 'canceled')
  );