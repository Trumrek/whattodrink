import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type PairingFormData = {
  dish: string;
  beverage: string;
  type: string;
  category: string;
  rating: number;
  description: string;
  long_description: string | null;
  image_url: string;
  ingredients: string[];
  alternatives: string[];
  temperature: string | null;
  glassware: string | null;
  food_pairing: string[];
  premium_content: boolean;
};

const initialFormData: PairingFormData = {
  dish: '',
  beverage: '',
  type: 'vin',
  category: 'viande',
  rating: 4.5,
  description: '',
  long_description: null,
  image_url: '',
  ingredients: [''],
  alternatives: [''],
  temperature: null,
  glassware: null,
  food_pairing: [''],
  premium_content: false
};

export default function AdminPairingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [formData, setFormData] = useState<PairingFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/auth');
      return;
    }

    if (id) {
      fetchPairing();
    }
  }, [id, user, isAdmin, navigate]);

  const fetchPairing = async () => {
    try {
      const { data, error } = await supabase
        .from('pairings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          ...initialFormData,
          ...data,
          ingredients: data.ingredients || [''],
          alternatives: data.alternatives || [''],
          food_pairing: data.food_pairing || ['']
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'accord:', error);
      setError('Erreur lors de la récupération de l\'accord');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up empty array items and prepare data
      const cleanedFormData = {
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim() !== ''),
        alternatives: formData.alternatives.filter(a => a.trim() !== ''),
        food_pairing: formData.food_pairing.filter(p => p.trim() !== ''),
        long_description: formData.long_description || null,
        temperature: formData.temperature || null,
        glassware: formData.glassware || null
      };

      // Ensure required fields are present
      if (!cleanedFormData.dish || !cleanedFormData.beverage || !cleanedFormData.description || !cleanedFormData.image_url) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      const { error: saveError } = id
        ? await supabase
            .from('pairings')
            .update(cleanedFormData)
            .eq('id', id)
        : await supabase
            .from('pairings')
            .insert([{ ...cleanedFormData, created_by: user?.id }]);

      if (saveError) throw saveError;
      
      navigate('/admin');
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError(error.message || 'Erreur lors de la sauvegarde de l\'accord');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayChange = (
    field: keyof PairingFormData,
    index: number,
    value: string
  ) => {
    const newArray = [...(formData[field] as string[])];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: keyof PairingFormData) => {
    setFormData({
      ...formData,
      [field]: [...(formData[field] as string[]), ''],
    });
  };

  const removeArrayItem = (field: keyof PairingFormData, index: number) => {
    const newArray = (formData[field] as string[]).filter((_, i) => i !== index);
    if (newArray.length === 0) {
      newArray.push('');
    }
    setFormData({ ...formData, [field]: newArray });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-stone-600" />
          </button>
          <h1 className="font-serif text-3xl font-bold">
            {id ? 'Modifier un accord' : 'Nouvel accord'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Plat *
              </label>
              <input
                type="text"
                value={formData.dish}
                onChange={(e) => setFormData({ ...formData, dish: e.target.value })}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Boisson *
              </label>
              <input
                type="text"
                value={formData.beverage}
                onChange={(e) => setFormData({ ...formData, beverage: e.target.value })}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Type de boisson *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                required
              >
                <option value="vin">Vin</option>
                <option value="biere">Bière</option>
                <option value="spiritueux">Spiritueux</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Catégorie *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                required
              >
                <option value="viande">Viande</option>
                <option value="poisson">Poisson</option>
                <option value="fruits-de-mer">Fruits de mer</option>
                <option value="fromage">Fromage</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Note *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                URL de l'image *
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.premium_content}
                onChange={(e) => setFormData({ ...formData, premium_content: e.target.checked })}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-stone-700">
                Contenu Premium
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Description courte *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Description longue
            </label>
            <textarea
              value={formData.long_description || ''}
              onChange={(e) => setFormData({ ...formData, long_description: e.target.value || null })}
              className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Ingrédients
            </label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                  className="flex-1 p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('ingredients', index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('ingredients')}
              className="text-stone-600 hover:text-stone-800 text-sm"
            >
              + Ajouter un ingrédient
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Alternatives
            </label>
            {formData.alternatives.map((alternative, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={alternative}
                  onChange={(e) => handleArrayChange('alternatives', index, e.target.value)}
                  className="flex-1 p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('alternatives', index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('alternatives')}
              className="text-stone-600 hover:text-stone-800 text-sm"
            >
              + Ajouter une alternative
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Température de service
              </label>
              <input
                type="text"
                value={formData.temperature || ''}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value || null })}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Verre conseillé
              </label>
              <input
                type="text"
                value={formData.glassware || ''}
                onChange={(e) => setFormData({ ...formData, glassware: e.target.value || null })}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Accompagnements
            </label>
            {formData.food_pairing.map((pairing, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={pairing}
                  onChange={(e) => handleArrayChange('food_pairing', index, e.target.value)}
                  className="flex-1 p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('food_pairing', index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('food_pairing')}
              className="text-stone-600 hover:text-stone-800 text-sm"
            >
              + Ajouter un accompagnement
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-stone-800 text-white px-6 py-3 rounded-lg hover:bg-stone-900 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}