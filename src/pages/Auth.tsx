import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Wine, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type AuthMode = 'login' | 'register' | 'forgot-password';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
        await signUp(email, password, name);
        navigate('/');
      } else if (mode === 'login') {
        await signIn(email, password);
        navigate('/');
      } else if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        
        setSuccess('Un email de réinitialisation vous a été envoyé. Veuillez vérifier votre boîte de réception.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de l\'authentification');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        {/* Logo et Titre */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center group">
              <Wine className="h-8 w-8 text-stone-600 transition-transform duration-300 group-hover:rotate-12" />
            </div>
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-800">
            {mode === 'login' ? 'Connexion' : mode === 'register' ? 'Créer un compte' : 'Mot de passe oublié'}
          </h2>
          <p className="mt-2 text-stone-600">
            {mode === 'login'
              ? 'Connectez-vous pour accéder à votre profil'
              : mode === 'register'
              ? 'Inscrivez-vous pour personnaliser vos accords'
              : 'Entrez votre email pour réinitialiser votre mot de passe'}
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div className="transform transition-all duration-300">
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
                Nom
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white shadow-sm transition-all duration-300 hover:border-stone-400"
                  placeholder="Votre nom"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white shadow-sm transition-all duration-300 hover:border-stone-400"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          {mode !== 'forgot-password' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white shadow-sm transition-all duration-300 hover:border-stone-400"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              {mode === 'register' && (
                <p className="mt-1 text-sm text-stone-500">
                  Le mot de passe doit contenir au moins 6 caractères
                </p>
              )}
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="mt-1 text-sm text-stone-600 hover:text-stone-800"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-stone-600 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' 
                    ? 'Se connecter' 
                    : mode === 'register' 
                    ? 'S\'inscrire'
                    : 'Réinitialiser le mot de passe'}
                </span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Liens pour changer de mode */}
        <div className="text-center space-y-2">
          {mode === 'forgot-password' ? (
            <button
              onClick={() => setMode('login')}
              className="flex items-center justify-center gap-2 text-stone-600 hover:text-stone-800 text-sm transition-all duration-300 hover:scale-105 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à la connexion</span>
            </button>
          ) : (
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-stone-600 hover:text-stone-800 text-sm transition-all duration-300 hover:scale-105"
            >
              {mode === 'login'
                ? 'Pas encore de compte ? Inscrivez-vous'
                : 'Déjà un compte ? Connectez-vous'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}