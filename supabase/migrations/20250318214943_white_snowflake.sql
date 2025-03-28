/*
  # Correction de la policy pour les pairings

  1. Modifications
    - Simplification de la policy de lecture
    - Suppression de la dépendance directe à la table users
    - Utilisation des fonctions existantes pour les vérifications

  2. Sécurité
    - Maintien des restrictions d'accès
    - Utilisation des fonctions sécurisées
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
      -- Utilisateur non connecté ne voit pas le contenu premium
      WHEN auth.uid() IS NULL THEN false
      -- Admin voit tout
      WHEN is_admin(auth.uid()) THEN true
      -- Utilisateur premium voit le contenu premium
      ELSE is_premium(auth.uid())
    END
  );