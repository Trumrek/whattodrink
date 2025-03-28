import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Wine, Beer, Utensils, Star, SlidersHorizontal, Crown, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type PairingType = {
  id: string;
  dish: string;
  beverage: string;
  type: string;
  category: string;
  rating: number;
  description: string;
  image_url: string;
  premium_content: boolean;
};

const BEVERAGE_OPTIONS = [
  { value: '', label: 'Type de boisson', emoji: '🥂' },
  { value: 'vin', label: 'Vin', emoji: '🍷' },
  { value: 'biere', label: 'Bière', emoji: '🍺' },
  { value: 'spiritueux', label: 'Spiritueux', emoji: '🥃' },
];

const DISH_OPTIONS = [
  { value: '', label: 'Type de plat', emoji: '🍽️' },
  { value: 'viande', label: 'Viande', emoji: '🥩' },
  { value: 'poisson', label: 'Poisson', emoji: '🐟' },
  { value: 'fruits-de-mer', label: 'Fruits de mer', emoji: '🦐' },
  { value: 'fromage', label: 'Fromage', emoji: '🧀' },
  { value: 'dessert', label: 'Dessert', emoji: '🍰' },
  { value: 'vegetarien', label: 'Végétarien', emoji: '🥗' }
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pairings, setPairings] = useState<PairingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const { user } = useAuth();
  
  const typeFilter = searchParams.get('type') || '';
  const categoryFilter = searchParams.get('category') || '';

  useEffect(() => {
    fetchPairings();
    if (user) {
      checkPremiumStatus();
      fetchFavorites();
    }
  }, [user]);

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

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('pairing_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      setFavorites(data.map(f => f.pairing_id));
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
    }
  };

  const toggleFavorite = async (pairingId: string) => {
    if (!user) return;
    
    setFavoriteLoading(pairingId);
    try {
      const isFavorite = favorites.includes(pairingId);
      
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('pairing_id', pairingId);

        if (error) throw error;
        setFavorites(favorites.filter(id => id !== pairingId));
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            pairing_id: pairingId
          });

        if (error) throw error;
        setFavorites([...favorites, pairingId]);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    } finally {
      setFavoriteLoading(null);
    }
  };

  const fetchPairings = async () => {
    try {
      const { data, error } = await supabase
        .from('pairings')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setPairings(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des accords:', error);
      setPairings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPairings = pairings.filter(pairing => {
    const matchesSearch = searchTerm === '' || 
      pairing.dish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pairing.beverage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pairing.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !typeFilter || pairing.type === typeFilter;
    const matchesCategory = !categoryFilter || pairing.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleFilterChange = (type: 'type' | 'category', value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(type, value);
    } else {
      newParams.delete(type);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-200 to-stone-300 rounded-3xl opacity-20 blur-xl" />
        <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-stone-200">
          <h1 className="font-serif text-4xl font-bold text-stone-800 mb-6">
            Trouvez l'accord parfait
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un plat ou une boisson..."
                  className="w-full pl-4 pr-12 py-4 bg-white rounded-xl border-2 border-stone-100 focus:border-stone-400 focus:ring-0 transition-colors shadow-sm"
                />
                <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              </div>
              <button 
                type="submit"
                className="bg-stone-800 hover:bg-stone-900 text-white px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-stone-300/25 flex items-center gap-2 font-medium"
              >
                <span>Rechercher</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span>Filtres</span>
              </button>
              
              {showFilters && (
                <div className="flex flex-wrap gap-4">
                  <select 
                    value={typeFilter}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="pl-2 pr-4 py-2 bg-white rounded-lg border-2 border-stone-100 hover:border-stone-400 focus:border-stone-400 focus:ring-0 transition-colors cursor-pointer shadow-sm appearance-none"
                  >
                    {BEVERAGE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.emoji} {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <select 
                    value={categoryFilter}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="pl-2 pr-4 py-2 bg-white rounded-lg border-2 border-stone-100 hover:border-stone-400 focus:border-stone-400 focus:ring-0 transition-colors cursor-pointer shadow-sm appearance-none"
                  >
                    {DISH_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.emoji} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPairings.length === 0 ? (
            <div className="col-span-full text-center py-8 text-stone-600">
              Aucun accord trouvé. Essayez de modifier vos critères de recherche.
            </div>
          ) : (
            filteredPairings.map((pairing) => (
              <div 
                key={pairing.id}
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  pairing.premium_content && !isPremium ? 'opacity-75' : ''
                }`}
              >
                <Link 
                  to={`/pairing/${pairing.id}`}
                  className="block"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative h-48">
                    <img 
                      src={pairing.image_url} 
                      alt={pairing.dish}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                        pairing.premium_content && !isPremium ? 'filter blur-[2px]' : ''
                      }`}
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {pairing.premium_content && (
                        <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <Crown className="h-4 w-4" />
                          <span>Premium</span>
                        </div>
                      )}
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Star className="h-4 w-4 text-stone-600 fill-current" />
                        <span className="text-sm font-semibold">{pairing.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-stone-600 transition-colors">
                          {pairing.dish}
                        </h3>
                        <div className="inline-flex items-center px-3 py-1 bg-stone-100 text-stone-600 rounded-full">
                          {pairing.type === 'vin' ? (
                            <Wine className="h-4 w-4 mr-2" />
                          ) : pairing.type === 'biere' ? (
                            <Beer className="h-4 w-4 mr-2" />
                          ) : (
                            <Utensils className="h-4 w-4 mr-2" />
                          )}
                          <span className="text-sm font-medium">{pairing.beverage}</span>
                        </div>
                      </div>
                      {user && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(pairing.id);
                          }}
                          disabled={favoriteLoading === pairing.id}
                          className={`p-2 rounded-full transition-colors ${
                            favorites.includes(pairing.id)
                              ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                              : 'hover:bg-stone-100 text-stone-600'
                          }`}
                          title={favorites.includes(pairing.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              favorites.includes(pairing.id) ? 'fill-current' : ''
                            } ${
                              favoriteLoading === pairing.id ? 'animate-pulse' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    
                    <p className="text-stone-600 text-sm leading-relaxed">{pairing.description}</p>
                  </div>
                </Link>

                {pairing.premium_content && !isPremium && (
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      <span>Contenu Premium</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}