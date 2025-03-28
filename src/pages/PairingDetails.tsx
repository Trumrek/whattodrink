import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Wine, Beer, Utensils, Share2, Crown, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type PairingType = {
  id: string;
  dish: string;
  beverage: string;
  type: string;
  rating: number;
  description: string;
  image_url: string;
  long_description?: string;
  ingredients?: string[];
  alternatives?: string[];
  temperature?: string;
  glassware?: string;
  food_pairing?: string[];
  premium_content: boolean;
};

// Données mockées
const MOCK_PAIRINGS: Record<string, PairingType> = {
  'mock-1': {
    id: 'mock-1',
    dish: 'Entrecôte grillée',
    beverage: 'Bordeaux Saint-Émilion',
    type: 'vin',
    rating: 4.8,
    description: 'Les tanins puissants du Saint-Émilion s\'accordent parfaitement avec les protéines de la viande rouge, créant une harmonie gustative exceptionnelle.',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80',
    long_description: 'Le Bordeaux Saint-Émilion, avec ses notes de fruits noirs et ses tanins structurés, est le compagnon idéal de l\'entrecôte grillée. Les tanins du vin s\'associent aux protéines de la viande, adoucissant à la fois le vin et rehaussant les saveurs de la viande. Les arômes de fruits mûrs et les notes boisées du vin complètent parfaitement le caractère grillé et fumé de la viande.',
    ingredients: ['Entrecôte de bœuf', 'Sel de mer', 'Poivre noir concassé', 'Huile d\'olive'],
    alternatives: ['Côtes-du-Rhône', 'Rioja Reserva', 'Barolo', 'Châteauneuf-du-Pape'],
    temperature: '18°C',
    glassware: 'Verre à Bordeaux large',
    food_pairing: ['Pommes de terre rôties', 'Champignons sautés', 'Sauce béarnaise'],
    premium_content: false
  },
  'mock-2': {
    id: 'mock-2',
    dish: 'Saumon grillé aux herbes',
    beverage: 'Chablis',
    type: 'vin',
    rating: 4.6,
    description: 'La minéralité du Chablis complète la richesse du saumon tout en apportant une fraîcheur citronnée qui sublime le poisson.',
    image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80',
    long_description: 'Le Chablis, avec sa minéralité caractéristique et ses notes d\'agrumes, est un accord parfait pour le saumon grillé. La fraîcheur du vin équilibre la richesse du poisson gras, tandis que ses arômes citronnés rehaussent la saveur des herbes. La texture crémeuse du vin s\'harmonise avec la chair tendre du saumon.',
    ingredients: ['Pavé de saumon frais', 'Aneth', 'Thym', 'Citron', 'Huile d\'olive'],
    alternatives: ['Pouilly-Fuissé', 'Meursault', 'Riesling sec', 'Sancerre blanc'],
    temperature: '10-12°C',
    glassware: 'Verre à Bourgogne blanc',
    food_pairing: ['Riz basmati', 'Asperges grillées', 'Sauce hollandaise'],
    premium_content: false
  },
'mock-3': {
  id: 'mock-3',
  dish: 'Plateau de fromages affinés',
  beverage: 'Triple belge',
  type: 'biere',
  rating: 4.7,
  description: 'Les notes fruitées et épicées de la triple belge créent un contraste harmonieux avec la richesse des fromages affinés.',
  image_url: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80',
  long_description: 'La triple belge, avec son corps généreux et ses arômes complexes de fruits mûrs, d’épices et de levures, offre un accord audacieux avec un plateau de fromages affinés. Sa richesse en bouche permet de rivaliser avec la puissance des fromages à pâte persillée, tandis que ses bulles nettoient le palais entre chaque bouchée. L’amertume modérée de la bière complète l’onctuosité des fromages, offrant une expérience gustative équilibrée et surprenante.',
  ingredients: ['Bleu d’Auvergne', 'Comté affiné', 'Brie de Meaux', 'Chèvre cendré', 'Noix', 'Raisin frais'],
  alternatives: ['Bière ambrée belge', 'Vin jaune du Jura', 'Cidre brut artisanal', 'Porter au miel'],
  temperature: '10-12°C',
  glassware: 'Verre tulipe',
  food_pairing: ['Pain de campagne', 'Fruits secs', 'Confiture de figue'],
  premium_content: false
}

};

export default function PairingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pairing, setPairing] = useState<PairingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    if (id.startsWith('mock-')) {
      const mockPairing = MOCK_PAIRINGS[id];
      if (mockPairing) {
        setPairing(mockPairing);
      }
      setLoading(false);
    } else {
      fetchPairing(id);
    }

    if (user) {
      checkPremiumStatus();
      checkFavoriteStatus(id);
    }
  }, [id, user]);

  const fetchPairing = async (pairingId: string) => {
    try {
      const { data, error } = await supabase
        .from('pairings')
        .select('*')
        .eq('id', pairingId)
        .single();

      if (error) throw error;
      setPairing(data);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'accord:', error);
      setPairing(null);
    } finally {
      setLoading(false);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setIsPremium(data?.status === 'active');
    } catch (error) {
      console.error('Erreur lors de la vérification du statut premium:', error);
      setIsPremium(false);
    }
  };

  const checkFavoriteStatus = async (pairingId: string | undefined) => {
    if (!pairingId || !user || pairingId.startsWith('mock-')) {
      setIsFavorite(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('pairing_id', pairingId);

      if (error) throw error;
      setIsFavorite(data.length > 0);
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !pairing || pairing.id.startsWith('mock-')) return;
    
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('pairing_id', pairing.id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            pairing_id: pairing.id
          });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!pairing) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-stone-800">Accord non trouvé</h2>
        <p className="text-stone-600 mt-2">Désolé, nous n'avons pas trouvé les détails de cet accord.</p>
      </div>
    );
  }

  if (pairing.premium_content && !isPremium && !pairing.id.startsWith('mock-')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
            <Crown className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-4">Contenu Premium</h2>
          <p className="text-stone-600 mb-6">
            Cet accord est réservé aux membres premium. Abonnez-vous pour y accéder et découvrir tous nos accords exclusifs.
          </p>
          <Link
            to="/premium"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Crown className="h-5 w-5 mr-2" />
            <span>Devenir Premium</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative h-[400px] rounded-2xl overflow-hidden">
        <img
          src={pairing.image_url}
          alt={pairing.dish}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-center gap-2 mb-4">
            {pairing.premium_content && (
              <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Crown className="h-4 w-4" />
                <span>Premium</span>
              </div>
            )}
          </div>
          <h1 className="font-serif text-4xl font-bold mb-2">{pairing.dish}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-semibold">{pairing.rating}</span>
            </div>
            <div className="flex items-center space-x-2">
              {pairing.type === 'vin' ? (
                <Wine className="h-5 w-5" />
              ) : pairing.type === 'biere' ? (
                <Beer className="h-5 w-5" />
              ) : (
                <Utensils className="h-5 w-5" />
              )}
              <span>{pairing.beverage}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl font-bold">Description</h2>
          <div className="flex space-x-4">
            {user && !pairing.id.startsWith('mock-') && (
              <button
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite 
                    ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
                    : 'hover:bg-stone-100 text-stone-600'
                }`}
                title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            <button 
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              onClick={() => {
                navigator.share({
                  title: pairing.dish,
                  text: pairing.description,
                  url: window.location.href,
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.href);
                });
              }}
            >
              <Share2 className="h-6 w-6 text-stone-600" />
            </button>
          </div>
        </div>

        <p className="text-stone-600 leading-relaxed mb-8">
          {pairing.long_description || pairing.description}
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {(pairing.ingredients || pairing.temperature || pairing.glassware) && (
            <div className="space-y-6">
              {pairing.ingredients && (
                <div>
                  <h3 className="font-serif text-xl font-bold mb-4">Ingrédients suggérés</h3>
                  <ul className="list-disc list-inside space-y-2 text-stone-600">
                    {pairing.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(pairing.temperature || pairing.glassware) && (
                <div>
                  <h3 className="font-serif text-xl font-bold mb-4">Service</h3>
                  {pairing.temperature && (
                    <p className="text-stone-600 mb-2">
                      <span className="font-semibold">Température :</span> {pairing.temperature}
                    </p>
                  )}
                  {pairing.glassware && (
                    <p className="text-stone-600">
                      <span className="font-semibold">Verre conseillé :</span> {pairing.glassware}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            {pairing.alternatives && (
              <div>
                <h3 className="font-serif text-xl font-bold mb-4">Alternatives</h3>
                <div className="flex flex-wrap gap-2">
                  {pairing.alternatives.map((alternative, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-sm"
                    >
                      {alternative}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {pairing.food_pairing && (
              <div>
                <h3 className="font-serif text-xl font-bold mb-4">Accompagnements</h3>
                <ul className="list-disc list-inside space-y-2 text-stone-600">
                  {pairing.food_pairing.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}