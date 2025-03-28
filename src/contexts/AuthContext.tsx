import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement Supabase sont manquantes.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAdmin(session?.user?.user_metadata?.role === 'admin' ?? false);
      setLoading(false);
    });

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(session?.user?.user_metadata?.role === 'admin' ?? false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new Error('Email ou mot de passe incorrect');
      } else if (error.message === 'Email not confirmed') {
        throw new Error('Veuillez confirmer votre email avant de vous connecter');
      } else {
        throw error;
      }
    }

    setIsAdmin(data.user?.user_metadata?.role === 'admin' ?? false);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (!existingUserError) {
      throw new Error('Un compte existe déjà avec cet email');
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('Un compte existe déjà avec cet email');
      } else if (error.message.includes('password')) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      } else {
        throw error;
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}