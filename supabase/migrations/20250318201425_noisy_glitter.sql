/*
  # Ajout du système d'abonnement premium

  1. Nouvelles Tables
    - `subscriptions`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence à auth.users)
      - `status` (text, statut de l'abonnement)
      - `current_period_start` (timestamptz)
      - `current_period_end` (timestamptz)
      - `created_at` (timestamptz)
      - `canceled_at` (timestamptz, nullable)

  2. Security
    - Enable RLS
    - Policies pour lecture/écriture par l'utilisateur concerné
*/

-- Création de la table des abonnements
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'expired')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  canceled_at timestamptz,
  UNIQUE (user_id)
);

-- Activation de RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy pour la lecture par l'utilisateur
CREATE POLICY "Users can read own subscription"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy pour la création/mise à jour par l'utilisateur
CREATE POLICY "Users can insert own subscription"
  ON subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Fonction pour vérifier si un utilisateur est premium
CREATE OR REPLACE FUNCTION is_premium(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM subscriptions
    WHERE subscriptions.user_id = $1
    AND status = 'active'
    AND current_period_end > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;