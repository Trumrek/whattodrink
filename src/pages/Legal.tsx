import React from 'react';

export default function Legal() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="font-serif text-4xl font-bold text-stone-800 text-center mb-8">Mentions Légales</h1>

      <div className="prose prose-stone mx-auto">
        <section>
          <h2 className="font-serif text-2xl font-bold mb-4">Éditeur du site</h2>
          <p className="text-stone-600">
            WhatToDrink<br />
            Société par Actions Simplifiée<br />
            Capital social : 10 000€<br />
            RCS Paris B 123 456 789<br />
            Siège social : Paris, France
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold mb-4">Hébergement</h2>
          <p className="text-stone-600">
            Le site WhatToDrink est hébergé par :<br />
            Netlify, Inc.<br />
            2325 3rd Street, Suite 215<br />
            San Francisco, California 94107<br />
            United States
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold mb-4">Protection des données personnelles</h2>
          <p className="text-stone-600">
            Conformément à la loi Informatique et Libertés du 6 janvier 1978, vous disposez d'un droit 
            d'accès, de rectification et de suppression des données vous concernant. Vous pouvez exercer 
            ce droit en nous contactant via notre formulaire de contact ou par email.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold mb-4">Propriété intellectuelle</h2>
          <p className="text-stone-600">
            L'ensemble du contenu de ce site (textes, images, vidéos) est protégé par le droit d'auteur. 
            Toute reproduction ou représentation totale ou partielle de ce site par quelque procédé que 
            ce soit, sans autorisation expresse, est interdite et constituerait une contrefaçon.
          </p>
        </section>
      </div>
    </div>
  );
}