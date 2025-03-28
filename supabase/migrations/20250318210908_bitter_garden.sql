/*
  # Création de la table newsletter

  1. Nouvelle Table
    - `newsletter_subscribers`
      - `id` (uuid, clé primaire)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `confirmed` (boolean)
      - `confirmation_token` (text)

  2. Security
    - Enable RLS
    - Policy pour lecture par les administrateurs
    - Policy pour insertion publique
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  confirmed boolean DEFAULT false,
  confirmation_token text
);

-- Activation de RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy pour la lecture par les administrateurs
CREATE POLICY "Admins can read newsletter subscribers"
  ON newsletter_subscribers
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Policy pour l'inscription publique
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);