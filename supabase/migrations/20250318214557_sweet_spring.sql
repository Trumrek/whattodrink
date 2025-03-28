/*
  # Correction de la policy pour les suggestions des administrateurs

  1. Modifications
    - Correction de la policy de lecture des pairings
    - Utilisation de la fonction is_admin pour vérifier le créateur
    - Amélioration de la lisibilité de la policy

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
      -- Contenu non premium toujours visible
      WHEN premium_content = false THEN true
      -- Contenu créé par un admin toujours visible
      WHEN EXISTS (
        SELECT 1 
        FROM auth.users u 
        WHERE u.id = pairings.created_by 
        AND (u.raw_user_meta_data->>'role')::text = 'admin'
      ) THEN true
      -- Utilisateur non connecté ne voit pas le contenu premium
      WHEN auth.uid() IS NULL THEN false
      -- Admin voit tout
      WHEN is_admin(auth.uid()) THEN true
      -- Utilisateur premium voit le contenu premium
      ELSE is_premium(auth.uid())
    END
  );