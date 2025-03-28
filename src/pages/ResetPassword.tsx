import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Wine } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la réinitialisation du mot de passe');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center group">
              <Wine className="h-8 w-8 text-stone-600 transition-transform duration-300 group-hover:rotate-12" />
            </div>
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-800">
            Réinitialiser le mot de passe
          </h2>
          <p className="mt-2 text-stone-600">
            Entrez votre nouveau mot de passe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
              Nouveau mot de passe
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
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white shadow-sm transition-all duration-300 hover:border-stone-400"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
              Mot de passe mis à jour avec succès ! Redirection...
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-stone-600 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}