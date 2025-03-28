import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Le mot de passe actuel est incorrect');
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors du changement de mot de passe');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mb-8">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center text-stone-600 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Retour au profil</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="font-serif text-2xl font-bold mb-6">Paramètres</h1>

        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-xl font-bold mb-4">Changer le mot de passe</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-stone-700 mb-1">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white shadow-sm transition-all duration-300 hover:border-stone-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-stone-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white shadow-sm transition-all duration-300 hover:border-stone-400"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-1">
                  Confirmer le nouveau mot de passe
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
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    <span>Changer le mot de passe</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}