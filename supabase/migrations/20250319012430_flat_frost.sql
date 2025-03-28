/*
  # Update premium status and add new pairings

  1. Modifications
    - Set saumon grillé aux herbes as non-premium
    - Add new premium pairings to maintain variety
    - Update existing pairings

  2. Security
    - Maintain existing RLS policies
    - Keep admin privileges intact
*/

-- Update saumon grillé aux herbes to non-premium
UPDATE pairings
SET premium_content = false
WHERE dish = 'Saumon grillé aux herbes';

-- Add new premium pairings to maintain variety
INSERT INTO pairings (
  dish,
  beverage,
  type,
  category,
  rating,
  description,
  long_description,
  image_url,
  ingredients,
  alternatives,
  temperature,
  glassware,
  food_pairing,
  premium_content,
  created_by
) VALUES
  (
    'Risotto aux Truffes Noires',
    'Barolo Riserva',
    'vin',
    'vegetarien',
    4.9,
    'L''intensité aromatique du Barolo Riserva sublime la richesse de la truffe noire et la texture crémeuse du risotto.',
    'Le Barolo Riserva, avec ses arômes complexes de rose, de goudron et sa structure tannique raffinée, crée un accord mémorable avec le risotto aux truffes noires. Les notes terreuses et boisées du vin font écho à celles de la truffe, tandis que sa texture soyeuse complète la onctuosité du risotto. Un mariage qui célèbre deux joyaux de la gastronomie piémontaise.',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80',
    ARRAY['Riz Carnaroli', 'Truffe noire du Périgord', 'Parmesan 36 mois', 'Bouillon de légumes maison', 'Vin blanc sec'],
    ARRAY['Barbaresco', 'Brunello di Montalcino', 'Amarone della Valpolicella', 'Hermitage Rouge'],
    '18°C',
    'Grand verre à Bordeaux',
    ARRAY['Copeaux de parmesan affiné', 'Champignons sauvages poêlés', 'Huile de truffe blanche'],
    false,
    (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin' LIMIT 1)
  ),
  (
    'Saint-Jacques Poêlées au Beurre de Yuzu',
    'Chablis Grand Cru',
    'vin',
    'fruits-de-mer',
    4.8,
    'La minéralité intense du Chablis Grand Cru s''harmonise parfaitement avec la douceur des Saint-Jacques et les notes d''agrumes du yuzu.',
    'Le Chablis Grand Cru, avec sa minéralité exceptionnelle et ses arômes d''agrumes, crée un accord subtil avec les Saint-Jacques poêlées. La fraîcheur du vin sublime la chair délicate des coquillages, tandis que ses notes citronnées se marient parfaitement avec le yuzu. La texture crémeuse du vin équilibre l''ensemble, créant une expérience gustative raffinée.',
    'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80',
    ARRAY['Saint-Jacques fraîches', 'Beurre demi-sel', 'Yuzu frais', 'Fleur de sel', 'Ciboulette'],
    ARRAY['Meursault', 'Puligny-Montrachet', 'Champagne Blanc de Blancs', 'Riesling Grand Cru'],
    '10-12°C',
    'Verre à Bourgogne blanc',
    ARRAY['Purée de céleri-rave', 'Légumes de saison glacés', 'Émulsion au yuzu'],
    false,
    (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin' LIMIT 1)
  );

-- Update created_by for any null values
UPDATE pairings 
SET created_by = (
  SELECT id 
  FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'admin' 
  LIMIT 1
)
WHERE created_by IS NULL;