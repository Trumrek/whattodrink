/*
  # Correction de la gestion des abonnements

  1. Modifications
    - Ajout d'un trigger BEFORE INSERT pour vérifier les doublons
    - Amélioration de la gestion des erreurs
    - Simplification des policies

  2. Sécurité
    - Maintien de la vérification d'unicité par utilisateur
    - Validation des dates et du statut
*/

-- Supprime l'ancien trigger et la fonction
DROP TRIGGER IF EXISTS update_subscription_status_trigger ON subscriptions;
DROP FUNCTION IF EXISTS update_subscription_status();

-- Nouvelle fonction pour la gestion des abonnements
CREATE OR REPLACE FUNCTION manage_subscription()
RETURNS trigger AS $$
BEGIN
  -- Vérifie qu'il n'existe pas déjà un abonnement pour cet utilisateur
  IF TG_OP = 'INSERT' THEN
    IF EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'Un abonnement existe déjà pour cet utilisateur';
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

  -- Met à jour le statut
  IF NEW.current_period_end < NOW() THEN
    NEW.status := 'expired';
  ELSIF NEW.canceled_at IS NOT NULL THEN
    NEW.status := 'canceled';
  ELSE
    NEW.status := 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crée le nouveau trigger
CREATE TRIGGER manage_subscription_trigger
  BEFORE INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION manage_subscription();

-- Supprime et recrée les policies pour plus de clarté
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

-- Policy pour l'insertion
CREATE POLICY "Users can insert own subscription"
  ON subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy pour la mise à jour
CREATE POLICY "Users can update own subscription"
  ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    status IN ('active', 'canceled')
  );