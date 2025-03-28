import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, Settings, LogOut, Crown, Star, Wine, Beer, Utensils } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Subscription = {
  status: 'active' | 'canceled' | 'expired';
  current_period_end: string;
};

type FavoritePairing = {
  id: string;
  dish: string;
  beverage: string;
  type: string;
  rating: number;
  description: string;
  image_url: string;
  premium_content: boolean;
};

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoritePairing[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchFavorites();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data || null);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setFavoritesLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          pairing_id,
          pairings (
            id,
            dish,
            beverage,
            type,
            rating,
            description,
            image_url,
            premium_content
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const favoritePairings = data
        .map(f => f.pairings as FavoritePairing)
        .filter(p => p !== null);

      setFavorites(favoritePairings);
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
      setFavorites([]);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const removeFavorite = async (pairingId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('pairing_id', pairingId);

      if (error) throw error;
      setFavorites(favorites.filter(f => f.id !== pairingId));
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="h-8 w-8 text-stone-600" />
        </div>
        <h1 className="font-serif text-2xl font-bold mb-4">Connectez-vous</h1>
        <p className="text-stone-600 mb-8">
          Connectez-vous pour accéder à votre profil et vos accords favoris
        </p>
        <Link
          to="/auth"
          className="inline-flex items-center px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-stone-600" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">{user.email}</h1>
              <p className="text-stone-600">Membre depuis {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/profile/settings')}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              title="Paramètres"
            >
              <Settings className="h-6 w-6 text-stone-600" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-6 w-6 text-stone-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Section Premium */}
      <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-8 rounded-xl shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="h-6 w-6 text-amber-600" />
              <h2 className="font-serif text-2xl font-bold">Premium</h2>
            </div>
            {subscription?.status === 'active' ? (
              <>
                <p className="text-stone-600 mb-2">
                  Votre abonnement est actif jusqu'au {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
                <p className="text-sm text-stone-500">
                  Profitez de tous les accords premium et des fonctionnalités exclusives !
                </p>
              </>
            ) : (
              <>
                <p className="text-stone-600 mb-2">
                  Découvrez tous nos accords premium et fonctionnalités exclusives
                </p>
                <p className="text-sm text-stone-500 mb-4">
                  Seulement 4.99€ par mois
                </p>
                <Link
                  to="/premium"
                  className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  S'abonner
                </Link>
              </>
            )}
          </div>
          {subscription?.status === 'active' && (
            <div className="bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Premium
            </div>
          )}
        </div>
      </div>

      {/* Section Favoris */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-stone-600" />
            <h2 className="font-serif text-xl font-bold">Mes Favoris</h2>
          </div>
        </div>

        {favoritesLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="p-8 text-center text-stone-600">
            <p>Vous n'avez pas encore de favoris</p>
            <Link to="/search" className="text-stone-800 hover:underline mt-2 inline-block">
              Découvrir les accords
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {favorites.map((pairing) => (
              <div key={pairing.id} className="p-6 hover:bg-stone-50 transition-colors">
                <div className="flex items-start gap-4">
                  <Link to={`/pairing/${pairing.id}`} className="block flex-shrink-0">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <img
                        src={pairing.image_url}
                        alt={pairing.dish}
                        className="w-full h-full object-cover"
                      />
                      {pairing.premium_content && (
                        <div className="absolute top-1 right-1 bg-amber-600 text-white p-1 rounded-full">
                          <Crown className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link to={`/pairing/${pairing.id}`}>
                          <h3 className="font-serif font-bold hover:text-stone-600 transition-colors">
                            {pairing.dish}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-stone-600">
                            {pairing.type === 'vin' ? (
                              <Wine className="h-4 w-4" />
                            ) : pairing.type === 'biere' ? (
                              <Beer className="h-4 w-4" />
                            ) : (
                              <Utensils className="h-4 w-4" />
                            )}
                            <span>{pairing.beverage}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-stone-600">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{pairing.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-stone-600 mt-2 line-clamp-2">
                          {pairing.description}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFavorite(pairing.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-full transition-colors flex-shrink-0"
                        title="Retirer des favoris"
                      >
                        <Heart className="h-5 w-5 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}