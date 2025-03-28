/*
  # Correction des policies RLS pour les abonnements

  1. Modifications
    - Simplification de la policy d'insertion
    - Ajout de la vérification d'unicité dans le trigger
    - Amélioration de la gestion des erreurs

  2. Sécurité
    - Maintien de la restriction par utilisateur
    - Vérification de l'unicité de l'abonnement
*/

-- Supprime les anciennes policies
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

-- Nouvelle policy pour l'insertion
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

-- Modification de la fonction de mise à jour du statut pour inclure la vérification d'unicité
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS trigger AS $$
BEGIN
  -- Vérifie qu'il n'existe pas déjà un abonnement actif pour cet utilisateur
  IF TG_OP = 'INSERT' THEN
    IF EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = NEW.user_id 
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Un abonnement existe déjà pour cet utilisateur';
    END IF;
  END IF;

  -- Met à jour le statut en fonction des dates
  IF NEW.current_period_end < NOW() THEN
    NEW.status := 'expired';
  ELSIF NEW.canceled_at IS NOT NULL THEN
    NEW.status := 'canceled';
  ELSE
    NEW.status := 'active';
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