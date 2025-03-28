import React from 'react';
import { BookOpen, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const articles = [
  {
    id: 'art-degustation',
    title: "L'Art de la Dégustation",
    excerpt: "Découvrez les secrets d'une dégustation réussie et apprenez à apprécier les subtilités des vins.",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80",
    author: "Sophie Martin",
    date: "15 Mars 2024",
    readTime: "8 min"
  },
  {
    id: 'accords-fromages',
    title: "Guide Complet des Accords Fromages et Vins",
    excerpt: "Un guide détaillé pour créer des associations parfaites entre vos fromages préférés et les meilleurs vins.",
    image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80",
    author: "Jean Dupont",
    date: "12 Mars 2024",
    readTime: "12 min"
  },
  {
    id: 'bieres-artisanales',
    title: "Le Monde des Bières Artisanales",
    excerpt: "Explorez l'univers fascinant des bières artisanales et découvrez comment les associer avec vos plats.",
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80",
    author: "Pierre Lambert",
    date: "8 Mars 2024",
    readTime: "10 min"
  },
  {
    id: 'cocktails-food',
    title: "Cocktails et Gastronomie",
    excerpt: "Comment intégrer les cocktails dans vos repas et créer des expériences gustatives uniques.",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80",
    author: "Marie Dubois",
    date: "5 Mars 2024",
    readTime: "9 min"
  },
  {
    id: 'sake-cuisine-japonaise',
    title: "Le Saké et la Cuisine Japonaise",
    excerpt: "Un voyage au cœur des traditions japonaises : découvrez les secrets des accords saké et sushi.",
    image: "https://images.unsplash.com/photo-1571762450239-f0f047321444?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FrJUMzJUE5fGVufDB8fDB8fHww",
    author: "Yuki Tanaka",
    date: "1 Mars 2024",
    readTime: "11 min"
  },
  {
    id: 'vins-naturels',
    title: "Les Vins Naturels : Guide du Débutant",
    excerpt: "Tout ce que vous devez savoir sur les vins naturels et comment les apprécier avec vos plats.",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80",
    author: "Lucas Martin",
    date: "28 Février 2024",
    readTime: "7 min"
  }
];

export default function Blog() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-4xl font-bold text-stone-800">Blog & Guide</h1>
        <p className="text-stone-600 max-w-2xl mx-auto">
          Explorez nos articles et guides pour approfondir vos connaissances sur les accords mets et boissons.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link key={article.id} to={`/blog/${article.id}`} className="group">
            <article className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              <div className="p-6 space-y-4">
                <h2 className="font-serif text-xl font-bold mb-2 group-hover:text-stone-600 transition-colors">
                  {article.title}
                </h2>
                
                <p className="text-stone-600 text-sm line-clamp-2">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between pt-4 text-sm text-stone-500">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{article.author}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime}</span>
                    </div>
                    <span className="text-stone-400">{article.date}</span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}