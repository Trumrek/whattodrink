import React from 'react';
import { Mail, MessageSquare, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="font-serif text-4xl font-bold text-stone-800 text-center mb-8">Contactez-nous</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold">Nous contacter</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-stone-600" />
              <span>contact@whattodrink.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-stone-600" />
              <span>+33 1 23 45 67 89</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-stone-600" />
              <span>Paris, France</span>
            </div>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-600 mb-1">
              Nom
            </label>
            <input
              type="text"
              id="name"
              className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-600 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-stone-600 mb-1">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-stone-800 text-white py-3 px-6 rounded-lg hover:bg-stone-900 transition-colors"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}