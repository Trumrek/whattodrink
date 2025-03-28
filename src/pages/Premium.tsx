import React from 'react';
import { Crown, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Premium() {
  const { user } = useAuth();

  const handleSubscribe = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (error) {
      console.error('Erreur lors de la création de la session de paiement:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
          <Crown className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="font-serif text-4xl font-bold mb-4">Passez à Premium</h1>
        <p className="text-stone-600 max-w-2xl mx-auto">
          Accédez à tous nos accords exclusifs et profitez d'une expérience personnalisée
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 bg-gradient-to-r from-amber-100 to-amber-50">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold">4.99€</span>
            <span className="text-stone-600">/mois</span>
          </div>
        </div>

        <div className="p-8">
          <h3 className="font-serif text-xl font-bold mb-6">Ce qui est inclus :</h3>
          <ul className="space-y-4">
            {[
              'Accès à tous les accords premium',
              'Suggestions personnalisées',
              'Assistant personnel pour obtenir des recommandations personnalisées en temps réel',
              'Frais de port offert pour vos commandes sur www.cavedelinsa.fr',
              'Support prioritaire'
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <button
              onClick={handleSubscribe}
              className="w-full bg-amber-600 text-white py-4 px-8 rounded-xl hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Crown className="h-5 w-5" />
              <span>S'abonner maintenant</span>
            </button>
            <p className="text-sm text-stone-500 text-center mt-4">
              Annulez à tout moment. Pas d'engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}