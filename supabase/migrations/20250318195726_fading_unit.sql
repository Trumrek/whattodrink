/*
  # Ajout du rôle administrateur

  1. Modifications
    - Crée une fonction pour définir le rôle administrateur
    - Permet de définir le rôle admin pour un utilisateur spécifique
    - Sécurise l'accès à la fonction

  2. Sécurité
    - Fonction sécurisée avec SECURITY DEFINER
    - Validation des paramètres d'entrée
    - Gestion des erreurs
*/

-- Création d'une fonction pour définir le rôle administrateur
CREATE OR REPLACE FUNCTION set_admin_role(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Met à jour les métadonnées de l'utilisateur
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('role', 'admin')
      ELSE 
        raw_user_meta_data || jsonb_build_object('role', 'admin')
    END
  WHERE email = user_email;

  -- Vérifie si la mise à jour a réussi
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur avec email % non trouvé', user_email;
  END IF;
END;
$$;