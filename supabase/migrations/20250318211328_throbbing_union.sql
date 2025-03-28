/*
  # Ajout du contenu premium

  1. Modifications
    - Ajout d'une colonne `premium_content` à la table `pairings`
    - Ajout d'une fonction pour vérifier si un utilisateur est abonné à la newsletter
    - Mise à jour des policies pour restreindre l'accès au contenu premium

  2. Sécurité
    - Seuls les utilisateurs inscrits à la newsletter peuvent voir le contenu premium
    - Les administrateurs peuvent toujours voir tout le contenu
*/

-- Ajout de la colonne premium_content
ALTER TABLE pairings
ADD COLUMN premium_content boolean DEFAULT false;

-- Fonction pour vérifier si un utilisateur est inscrit à la newsletter
CREATE OR REPLACE FUNCTION is_newsletter_subscriber(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM newsletter_subscribers
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mise à jour de la policy de lecture pour les pairings
DROP POLICY IF EXISTS "Pairings are viewable by everyone" ON pairings;

CREATE POLICY "Pairings access control"
  ON pairings
  FOR SELECT
  USING (
    CASE
      WHEN premium_content = false THEN true
      WHEN auth.uid() IS NULL THEN false
      WHEN is_admin(auth.uid()) THEN true
      ELSE is_newsletter_subscriber((SELECT email FROM auth.users WHERE id = auth.uid()))
    END
  );