/*
  # Ajout du contenu premium

  1. Modifications
    - Ajout de la colonne `premium_content` à la table `pairings`
    - Mise à jour des policies pour contrôler l'accès au contenu premium

  2. Sécurité
    - Le contenu premium n'est accessible qu'aux utilisateurs avec un abonnement actif
    - Le contenu non-premium reste accessible à tous
    - Les administrateurs ont accès à tout le contenu
*/

-- Ajout de la colonne premium_content si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pairings' AND column_name = 'premium_content'
  ) THEN
    ALTER TABLE pairings ADD COLUMN premium_content boolean DEFAULT false;
  END IF;
END $$;

-- Mise à jour de la policy de lecture pour les pairings
DROP POLICY IF EXISTS "Pairings access control" ON pairings;

CREATE POLICY "Pairings access control"
  ON pairings
  FOR SELECT
  USING (
    CASE
      WHEN premium_content = false THEN true
      WHEN auth.uid() IS NULL THEN false
      WHEN is_admin(auth.uid()) THEN true
      ELSE is_premium(auth.uid())
    END
  );