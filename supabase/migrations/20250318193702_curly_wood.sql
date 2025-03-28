/*
  # Création des tables pour les accords mets et boissons

  1. Nouvelles Tables
    - `pairings`
      - `id` (uuid, clé primaire)
      - `dish` (text, nom du plat)
      - `beverage` (text, nom de la boisson)
      - `type` (text, type de boisson)
      - `category` (text, catégorie du plat)
      - `rating` (numeric, note)
      - `description` (text, description courte)
      - `long_description` (text, description détaillée)
      - `image_url` (text, URL de l'image)
      - `ingredients` (text[], liste des ingrédients)
      - `alternatives` (text[], alternatives suggérées)
      - `temperature` (text, température de service)
      - `glassware` (text, verre recommandé)
      - `food_pairing` (text[], accompagnements suggérés)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, référence à auth.users)

  2. Security
    - Enable RLS
    - Policies pour lecture publique
    - Policies pour modification par les administrateurs
*/

-- Création de la table des accords
CREATE TABLE IF NOT EXISTS pairings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish text NOT NULL,
  beverage text NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  rating numeric NOT NULL CHECK (rating >= 0 AND rating <= 5),
  description text NOT NULL,
  long_description text,
  image_url text NOT NULL,
  ingredients text[],
  alternatives text[],
  temperature text,
  glassware text,
  food_pairing text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Activation de RLS
ALTER TABLE pairings ENABLE ROW LEVEL SECURITY;

-- Création d'une fonction pour vérifier si un utilisateur est administrateur
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy pour la lecture publique
CREATE POLICY "Pairings are viewable by everyone"
  ON pairings
  FOR SELECT
  USING (true);

-- Policy pour la création par les administrateurs
CREATE POLICY "Pairings can be created by admins"
  ON pairings
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Policy pour la modification par les administrateurs
CREATE POLICY "Pairings can be updated by admins"
  ON pairings
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- Policy pour la suppression par les administrateurs
CREATE POLICY "Pairings can be deleted by admins"
  ON pairings
  FOR DELETE
  USING (is_admin(auth.uid()));

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pairings_updated_at
  BEFORE UPDATE ON pairings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();