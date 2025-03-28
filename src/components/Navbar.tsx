import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wine, Search, BookOpen, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Wine className="h-8 w-8 text-stone-600 transition-transform duration-300 group-hover:rotate-12" />
            <span className="font-serif text-2xl font-bold text-stone-600">WhatToDrink</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/search" 
              className="flex items-center space-x-1 text-gray-600 hover:text-stone-600 transition-all duration-300 hover:scale-105"
            >
              <Search className="h-5 w-5" />
              <span>Rechercher</span>
            </Link>
            <Link 
              to="/blog" 
              className="flex items-center space-x-1 text-gray-600 hover:text-stone-600 transition-all duration-300 hover:scale-105"
            >
              <BookOpen className="h-5 w-5" />
              <span>Blog</span>
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-1 text-gray-600 hover:text-stone-600 transition-all duration-300 hover:scale-105"
                >
                  <User className="h-5 w-5" />
                  <span>Profil</span>
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-1 text-gray-600 hover:text-stone-600 transition-all duration-300 hover:scale-105"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-105"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="flex items-center space-x-1 text-gray-600 hover:text-stone-600 transition-all duration-300 hover:scale-105"
              >
                <User className="h-5 w-5" />
                <span>Connexion</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}