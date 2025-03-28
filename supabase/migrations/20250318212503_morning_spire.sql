/*
  # Fonction pour définir un utilisateur premium

  1. Nouvelles Fonctions
    - `set_user_premium`: Fonction pour définir un utilisateur comme premium
      - Paramètres:
        - user_email: email de l'utilisateur
        - months: nombre de mois d'abonnement (défaut: 1)
      - Crée ou met à jour l'abonnement de l'utilisateur
      - Définit le statut comme actif
      - Calcule les dates de début et de fin de période

  2. Sécurité
    - Fonction sécurisée avec SECURITY DEFINER
    - Validation des paramètres d'entrée
    - Gestion des erreurs
*/

CREATE OR REPLACE FUNCTION set_user_premium(user_email text, months int DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  start_date timestamptz;
  end_date timestamptz;
BEGIN
  -- Récupère l'ID de l'utilisateur
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  -- Vérifie si l'utilisateur existe
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur avec email % non trouvé', user_email;
  END IF;

  -- Définit les dates de période
  start_date := now();
  end_date := start_date + (months || ' months')::interval;

  -- Insère ou met à jour l'abonnement
  INSERT INTO subscriptions (
    user_id,
    status,
    current_period_start,
    current_period_end
  )
  VALUES (
    target_user_id,
    'active',
    start_date,
    end_date
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    status = 'active',
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    canceled_at = NULL;
END;
$$;