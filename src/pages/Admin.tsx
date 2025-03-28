import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Pairing = {
  id: string;
  dish: string;
  beverage: string;
  type: string;
  category: string;
  rating: number;
  created_at: string;
  premium_content: boolean;
};

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/auth');
      return;
    }

    fetchPairings();
  }, [user, isAdmin, navigate]);

  const fetchPairings = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('pairings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPairings(data || []);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des accords:', error);
      setError(error.message || 'Erreur lors de la récupération des accords');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet accord ?')) {
      return;
    }

    try {
      setError(null);
      const { error } = await supabase
        .from('pairings')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPairings(pairings.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      setError(error.message || 'Erreur lors de la suppression');
    }
  };

  const filteredPairings = pairings.filter(pairing =>
    pairing.dish.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pairing.beverage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-3xl font-bold">Administration des Accords</h1>
        <button
          onClick={() => navigate('/admin/pairing/new')}
          className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-900 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvel Accord</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un accord..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-600">Plat</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-600">Boisson</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-600">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-600">Note</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-600">Premium</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPairings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-stone-500">
                    Aucun accord trouvé. Commencez par en créer un nouveau !
                  </td>
                </tr>
              ) : (
                filteredPairings.map((pairing) => (
                  <tr key={pairing.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 text-sm text-stone-900">{pairing.dish}</td>
                    <td className="px-6 py-4 text-sm text-stone-900">{pairing.beverage}</td>
                    <td className="px-6 py-4 text-sm text-stone-900">{pairing.type}</td>
                    <td className="px-6 py-4 text-sm text-stone-900">{pairing.rating}</td>
                    <td className="px-6 py-4 text-sm text-stone-900">
                      {pairing.premium_content ? 'Oui' : 'Non'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/admin/pairing/${pairing.id}`)}
                          className="p-1 hover:bg-stone-100 rounded-full transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4 text-stone-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(pairing.id)}
                          className="p-1 hover:bg-stone-100 rounded-full transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}