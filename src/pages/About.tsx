import React from 'react';
import { Wine } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold text-stone-800 mb-4">À propos de WhatToDrink</h1>
        <div className="flex justify-center mb-8">
          <Wine className="h-16 w-16 text-stone-600" />
        </div>
      </div>

      <div className="prose prose-stone mx-auto">
        <p className="text-lg text-stone-600 leading-relaxed">
          WhatToDrink est né d'une passion pour la gastronomie et l'art des accords mets et boissons. 
          Notre mission est de rendre accessible à tous l'expertise des sommeliers et des professionnels 
          du monde des boissons.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-4">Notre Vision</h2>
        <p className="text-stone-600 leading-relaxed">
          Nous croyons que chaque repas mérite sa boisson parfaite. Notre plateforme utilise une 
          combinaison d'expertise humaine et de technologie pour vous proposer les meilleurs accords 
          possibles.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-4">Notre Équipe</h2>
        <p className="text-stone-600 leading-relaxed">
          Notre équipe est composée de passionnés : sommeliers, zythologues, mixologues et experts 
          en gastronomie. Ensemble, nous travaillons pour vous offrir les meilleures recommandations.
        </p>
      </div>
    </div>
  );
}