import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wine, Beer, GlassWater, ChevronRight, Star, Crown, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getChatResponse } from '../lib/openai';

type FeaturedPairing = {
  id: string;
  title: string;
  image: string;
  rating: number;
  type: string;
};

export default function Home() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const featuredPairings: FeaturedPairing[] = [
    {
  id: 'mock-3',
  title: 'Plateau de fromages affinés',
  image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80',
  rating: 4.7,
  type: 'biere'

    },
    {
      id: 'mock-1',
      title: 'Entrecôte grillée',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80',
      rating: 4.8,
      type: 'vin'
    },
    {
      id: 'mock-2',
      title: 'Saumon grillé aux herbes',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80',
      rating: 4.6,
      type: 'vin'
    }
  ];

  React.useEffect(() => {
    if (user) {
      checkPremiumStatus();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setError(null);
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await getChatResponse(userMessage);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error: any) {
      console.error('Erreur lors de la génération de la réponse:', error);
      setError(error.message);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[600px] rounded-xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80"
          alt="Wine and food pairing"
          className="absolute inset-0 w-full h-full object-cover animate-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="font-serif text-5xl md:text-7xl mb-6 animate-fade-in-up">
            WhatToDrink
          </h1>
          <p className="text-xl mb-8 max-w-2xl animate-fade-in-up animation-delay-200 text-stone-200">
            Explorez une nouvelle façon de déguster vos plats préférés avec nos suggestions d'accords personnalisés
          </p>
          <Link
            to="/search"
            className="group bg-stone-100 hover:bg-white text-stone-900 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-400 flex items-center"
          >
            Commencer l'exploration
            <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Featured Pairings */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Accords en vedette</h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Découvrez nos meilleures suggestions d'accords, sélectionnées par nos experts
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {featuredPairings.map((pairing, index) => (
            <Link
              key={pairing.id}
              to={`/pairing/${pairing.id}`}
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img
                src={pairing.image}
                alt={pairing.title}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Star className="h-4 w-4 text-stone-600 fill-current" />
                <span className="text-sm font-semibold">{pairing.rating}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-serif text-xl font-bold mb-2">{pairing.title}</h3>
                <div className="flex items-center gap-2 text-sm">
                  {pairing.type === 'vin' ? (
                    <Wine className="h-4 w-4" />
                  ) : (
                    <Beer className="h-4 w-4" />
                  )}
                  <span>Accord {pairing.type === 'vin' ? 'vin' : 'bière'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <Link to="/search?type=vin" className="group animate-fade-in-up animation-delay-200">
          <div className="bg-white p-8 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-stone-200 transition-colors duration-300">
              <Wine className="h-8 w-8 text-stone-600 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-4 group-hover:text-stone-600 transition-colors duration-300">Vins</h3>
            <p className="text-stone-600 leading-relaxed">
              Des suggestions personnalisées pour sublimer vos plats avec le vin parfait
            </p>
          </div>
        </Link>

        <Link to="/search?type=biere" className="group animate-fade-in-up animation-delay-400">
          <div className="bg-white p-8 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-stone-200 transition-colors duration-300">
              <Beer className="h-8 w-8 text-stone-600 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-4 group-hover:text-stone-600 transition-colors duration-300">Bières</h3>
            <p className="text-stone-600 leading-relaxed">
              Explorez la richesse des accords entre mets et bières artisanales
            </p>
          </div>
        </Link>

        <Link to="/search?type=spiritueux" className="group animate-fade-in-up animation-delay-600">
          <div className="bg-white p-8 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-stone-200 transition-colors duration-300">
              <GlassWater className="h-8 w-8 text-stone-600 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-4 group-hover:text-stone-600 transition-colors duration-300">Spiritueux</h3>
            <p className="text-stone-600 leading-relaxed">
              Découvrez l'art des cocktails et leur harmonie avec la gastronomie
            </p>
          </div>
        </Link>
      </section>

      {/* Chat Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-200 to-stone-300 rounded-3xl opacity-20 blur-xl" />
        <div className="relative bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-xl border border-stone-200">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="h-6 w-6 text-stone-600" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold">
                Assistant Personnel
              </h2>
            </div>
            
            {!user ? (
              <div className="text-center space-y-4">
                <p className="text-stone-600">
                  Connectez-vous pour accéder à notre assistant personnel et obtenir des recommandations sur mesure.
                </p>
                <Link
                  to="/auth"
                  className="inline-flex items-center px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            ) : !isPremium ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                  <Crown className="h-8 w-8 text-amber-600" />
                </div>
                <p className="text-stone-600">
                  Devenez membre premium pour accéder à notre assistant personnel et obtenir des recommandations personnalisées en temps réel.
                </p>
                <Link
                  to="/premium"
                  className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  <span>Devenir Premium</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto bg-white rounded-lg p-4 space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                  {chatHistory.length === 0 ? (
                    <p className="text-stone-500 text-center py-4">
                      Comment puis-je vous aider à trouver l'accord parfait ?
                    </p>
                  ) : (
                    chatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.role === 'user'
                              ? 'bg-stone-800 text-white'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-stone-100 rounded-lg px-4 py-2 animate-pulse">
                        En train d'écrire...
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Posez votre question..."
                    className="flex-1 px-4 py-2 border-2 border-stone-100 rounded-lg focus:border-stone-400 focus:ring-0 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}