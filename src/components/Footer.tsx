import React from 'react';
import { Wine } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Wine className="h-8 w-8" />
            <span className="font-serif text-2xl">WhatToDrink</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-8 items-center">
            <Link to="/about" className="hover:text-stone-300">À propos</Link>
            <Link to="/contact" className="hover:text-stone-300">Contact</Link>
            <Link to="/legal" className="hover:text-stone-300">Mentions légales</Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-stone-200">
          <p>&copy; {new Date().getFullYear()} WhatToDrink. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}