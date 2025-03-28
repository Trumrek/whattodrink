/*
  # Add initial pairings data

  1. New Data
    - Add a variety of pairings with detailed descriptions
    - Mix of premium and non-premium content
    - Cover different categories and beverage types

  2. Security
    - Maintain existing RLS policies
    - Respect premium content restrictions
*/

-- Insert initial pairings data
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
  premium_content
) VALUES
  (
    'Côte de Bœuf Maturée',
    'Châteauneuf-du-Pape Rouge',
    'vin',
    'viande',
    4.9,
    'La puissance du Châteauneuf-du-Pape s''harmonise parfaitement avec les saveurs intenses de la viande maturée.',
    'Le Châteauneuf-du-Pape rouge, avec sa structure tannique imposante et ses arômes complexes de fruits noirs, d''épices et de garrigue, est le partenaire idéal pour une côte de bœuf maturée. Les tanins mûrs du vin s''associent aux protéines de la viande, créant une expérience gustative exceptionnelle. La maturation de la viande développe des saveurs umami intenses qui sont magnifiées par la richesse et la complexité du vin.',
    'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80',
    ARRAY['Côte de bœuf maturée 30 jours', 'Fleur de sel', 'Poivre noir concassé', 'Huile d''olive extra vierge'],
    ARRAY['Amarone della Valpolicella', 'Priorat', 'Côte-Rôtie', 'Barolo'],
    '16-18°C',
    'Grand verre à Bordeaux',
    ARRAY['Pommes de terre rôties au romarin', 'Champignons sauvages poêlés', 'Sauce béarnaise maison'],
    true
  ),
  (
    'Plateau de Fruits de Mer Royal',
    'Chablis Premier Cru',
    'vin',
    'fruits-de-mer',
    4.8,
    'La minéralité et la tension du Chablis Premier Cru subliment la fraîcheur et la délicatesse des fruits de mer.',
    'Le Chablis Premier Cru, avec sa minéralité caractéristique et ses notes citronnées, accompagne à merveille un plateau de fruits de mer. La vivacité du vin rehausse la fraîcheur des huîtres, tandis que sa texture soyeuse s''accorde parfaitement avec la chair délicate des crustacés. Les notes iodées du vin font écho à celles des fruits de mer, créant une harmonie parfaite.',
    'https://images.unsplash.com/photo-1565793979206-e66c82a457fc?auto=format&fit=crop&q=80',
    ARRAY['Huîtres Spéciales', 'Homard bleu', 'Langoustines', 'Bulots', 'Crevettes roses'],
    ARRAY['Muscadet Sèvre-et-Maine', 'Pouilly-Fuissé', 'Champagne Blanc de Blancs', 'Riesling sec'],
    '8-10°C',
    'Verre à Bourgogne blanc',
    ARRAY['Pain de seigle', 'Beurre demi-sel', 'Citron', 'Vinaigre à l''échalote'],
    false
  ),
  (
    'Tarte au Citron Meringuée',
    'Moscato d''Asti',
    'vin',
    'dessert',
    4.7,
    'Les notes florales et la douce effervescence du Moscato d''Asti s''accordent parfaitement avec l''acidité du citron et la douceur de la meringue.',
    'Le Moscato d''Asti, avec ses bulles délicates et ses arômes de pêche, de fleurs blanches et de miel, crée un accord parfait avec la tarte au citron meringuée. La légère effervescence du vin rafraîchit le palais, tandis que sa douceur naturelle équilibre l''acidité du citron. Les notes florales du vin se marient élégamment avec la délicatesse de la meringue.',
    'https://images.unsplash.com/photo-1528252941458-c0c754e09429?auto=format&fit=crop&q=80',
    ARRAY['Citrons bio', 'Œufs frais', 'Sucre', 'Beurre AOP', 'Farine T45'],
    ARRAY['Jurançon moelleux', 'Sauternes', 'Vouvray moelleux', 'Clairette de Die'],
    '6-8°C',
    'Verre à dessert',
    ARRAY['Crème anglaise à la vanille', 'Sorbet citron', 'Tuile aux amandes'],
    true
  ),
  (
    'Tomahawk de Porc Ibérique',
    'Ribera del Duero Reserva',
    'vin',
    'viande',
    4.8,
    'La richesse du Ribera del Duero Reserva sublime les saveurs intenses et la texture fondante du porc ibérique.',
    'Le Ribera del Duero Reserva, avec ses arômes de fruits noirs mûrs, ses notes de vanille et sa structure élégante, est le compagnon parfait du tomahawk de porc ibérique. Les tanins soyeux du vin s''harmonisent avec le gras persillé de la viande, tandis que ses notes épicées complètent la saveur unique du porc élevé aux glands. Un accord qui met en valeur le meilleur de la gastronomie espagnole.',
    'https://images.unsplash.com/photo-1432139509613-5c4255815697?auto=format&fit=crop&q=80',
    ARRAY['Tomahawk de porc ibérique', 'Thym frais', 'Romarin', 'Ail', 'Huile d''olive espagnole'],
    ARRAY['Priorat', 'Toro', 'Rioja Reserva', 'Alentejo Reserva'],
    '16-18°C',
    'Grand verre à vin rouge',
    ARRAY['Pommes de terre confites', 'Poivrons grillés', 'Sauce au Pedro Ximénez'],
    true
  ),
  (
    'Sashimi de Thon Rouge',
    'Junmai Daiginjo',
    'spiritueux',
    'poisson',
    4.9,
    'La pureté et l''élégance du Junmai Daiginjo mettent en valeur la fraîcheur et la finesse du thon rouge.',
    'Le Junmai Daiginjo, avec ses arômes délicats de fleurs, de fruits et sa texture soyeuse, crée un accord subtil et raffiné avec le sashimi de thon rouge. La pureté du saké permet d''apprécier pleinement la qualité exceptionnelle du poisson, tandis que ses notes umami naturelles intensifient l''expérience gustative. Un mariage qui respecte et sublime les traditions japonaises.',
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80',
    ARRAY['Thon rouge de ligne', 'Wasabi frais', 'Sauce soja artisanale', 'Gingembre mariné'],
    ARRAY['Junmai Ginjo', 'Champagne Extra Brut', 'Chablis Grand Cru', 'Riesling Grosses Gewächs'],
    '10-12°C',
    'Ochoko traditionnel',
    ARRAY['Algues wakame', 'Daikon râpé', 'Shiso vert'],
    false
  ),
  (
    'Carré d''Agneau en Croûte d''Herbes',
    'Hermitage Rouge',
    'vin',
    'viande',
    4.8,
    'La complexité de l''Hermitage rouge s''harmonise parfaitement avec les saveurs délicates de l''agneau et le parfum des herbes fraîches.',
    'L''Hermitage rouge, avec sa profondeur aromatique, ses notes de fruits noirs, d''épices et sa minéralité distinctive, crée un accord mémorable avec le carré d''agneau en croûte d''herbes. Les tanins raffinés du vin se marient élégamment avec la tendreté de la viande, tandis que ses notes poivrées complètent le bouquet d''herbes aromatiques. La longueur en bouche du vin prolonge le plaisir de chaque bouchée.',
    'https://images.unsplash.com/photo-1624726175512-19b9baf9fbd1?auto=format&fit=crop&q=80',
    ARRAY['Carré d''agneau français', 'Persil plat', 'Thym', 'Romarin', 'Ail', 'Chapelure fine'],
    ARRAY['Côte-Rôtie', 'Châteauneuf-du-Pape', 'Barolo', 'Brunello di Montalcino'],
    '16-18°C',
    'Verre à Syrah',
    ARRAY['Gratin dauphinois', 'Haricots verts à l''ail', 'Sauce au jus d''agneau'],
    true
  ),
  (
    'Soufflé au Chocolat Grand Cru',
    'Porto Vintage',
    'vin',
    'dessert',
    4.7,
    'L''intensité du Porto Vintage sublime la richesse du chocolat tout en apportant des notes de fruits confits complexes.',
    'Le Porto Vintage, avec sa richesse exceptionnelle et ses arômes de fruits noirs confits, de cacao et d''épices, crée un accord gourmand avec le soufflé au chocolat grand cru. La chaleur de l''alcool et la douceur du vin intensifient les saveurs du chocolat, tandis que ses tanins veloutés apportent une dimension supplémentaire à la dégustation. Un duo qui célèbre la complexité et la générosité.',
    'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&q=80',
    ARRAY['Chocolat grand cru 70%', 'Œufs bio', 'Beurre AOP', 'Sucre fin'],
    ARRAY['Banyuls', 'Maury', 'Pedro Ximénez', 'Recioto della Valpolicella'],
    '16-18°C',
    'Verre à Porto',
    ARRAY['Crème anglaise à la vanille', 'Fruits rouges frais', 'Glace à la vanille'],
    false
  ),
  (
    'Homard Bleu Rôti au Beurre',
    'Meursault Premier Cru',
    'vin',
    'fruits-de-mer',
    4.9,
    'La richesse beurrée du Meursault Premier Cru s''accorde à merveille avec la chair délicate du homard et le beurre noisette.',
    'Le Meursault Premier Cru, avec sa texture crémeuse, ses arômes de noisette grillée et sa minéralité subtile, crée un accord parfait avec le homard rôti au beurre. La richesse du vin complète naturellement celle du crustacé, tandis que sa fraîcheur équilibre le côté beurré du plat. Les notes toastées du vin font écho au beurre noisette, créant une harmonie gustative exceptionnelle.',
    'https://images.unsplash.com/photo-1533751241184-61c8b6d1fa05?auto=format&fit=crop&q=80',
    ARRAY['Homard bleu vivant', 'Beurre AOP', 'Échalotes', 'Estragon frais', 'Fleur de sel'],
    ARRAY['Puligny-Montrachet', 'Chassagne-Montrachet', 'Chablis Grand Cru', 'Condrieu'],
    '12-14°C',
    'Verre à Bourgogne blanc',
    ARRAY['Pommes de terre rattes', 'Asperges vertes', 'Sauce au corail'],
    true
  );

-- Update the created_by field for all inserted records
UPDATE pairings 
SET created_by = (
  SELECT id 
  FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'admin' 
  LIMIT 1
)
WHERE created_by IS NULL;