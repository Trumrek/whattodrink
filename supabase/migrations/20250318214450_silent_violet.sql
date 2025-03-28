/*
  # Mise à jour de la policy pour les suggestions des administrateurs

  1. Modifications
    - Modification de la policy de lecture des pairings
    - Les suggestions créées par les administrateurs sont visibles par tous
    - Le contenu premium reste protégé sauf pour les suggestions des administrateurs

  2. Sécurité
    - Maintien de la protection du contenu premium
    - Accès public aux suggestions des administrateurs
*/

-- Mise à jour de la policy de lecture pour les pairings
DROP POLICY IF EXISTS "Pairings access control" ON pairings;

CREATE POLICY "Pairings access control"
  ON pairings
  FOR SELECT
  USING (
    CASE
      WHEN premium_content = false THEN true
      WHEN created_by IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin') THEN true
      WHEN auth.uid() IS NULL THEN false
      WHEN is_admin(auth.uid()) THEN true
      ELSE is_premium(auth.uid())
    END
  );