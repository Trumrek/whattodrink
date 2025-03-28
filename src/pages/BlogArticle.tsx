import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react';

const BLOG_ARTICLES = {
  'art-degustation': {
    title: "L'Art de la Dégustation",
    content: `
      <h2>Introduction à la dégustation</h2>
      <p>La dégustation est un art qui fait appel à tous nos sens. Pour apprécier pleinement un vin, une bière ou un spiritueux, il est essentiel de comprendre les bases de la dégustation et de développer son palais.</p>
      
      <h2>Les étapes de la dégustation</h2>
      <h3>1. L'examen visuel</h3>
      <p>Observez la robe, sa couleur, son intensité et sa limpidité. Ces éléments vous donnent déjà des indices sur l'âge et la qualité du vin.</p>
      
      <h3>2. L'examen olfactif</h3>
      <p>Le nez est un élément crucial de la dégustation. Prenez le temps de découvrir les arômes primaires, secondaires et tertiaires.</p>
      
      <h3>3. L'examen gustatif</h3>
      <p>En bouche, analysez l'attaque, le milieu de bouche et la finale. Notez l'équilibre entre les différentes saveurs.</p>
    `,
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80",
    author: "Sophie Martin",
    date: "15 Mars 2024",
    readTime: "8 min",
    relatedArticles: ['accords-fromages', 'vins-naturels']
  },
  'accords-fromages': {
    title: "Guide Complet des Accords Fromages et Vins",
    content: `
      <h2>Les principes de base</h2>
      <p>L'accord fromage et vin est un art subtil qui repose sur l'équilibre des saveurs et des textures.</p>
      
      <h2>Les accords classiques</h2>
      <h3>Fromages à pâte dure</h3>
      <p>Les fromages à pâte dure comme le Comté ou le Beaufort s'accordent parfaitement avec les vins blancs puissants ou les rouges structurés.</p>
      
      <h3>Fromages à pâte molle</h3>
      <p>Les fromages à pâte molle comme le Camembert trouvent leur bonheur avec des vins blancs légers ou des rouges fruités.</p>
      
      <h3>Fromages bleus</h3>
      <p>Les fromages bleus s'accordent magnifiquement avec les vins liquoreux ou les portos.</p>
    `,
    image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80",
    author: "Jean Dupont",
    date: "12 Mars 2024",
    readTime: "12 min",
    relatedArticles: ['art-degustation', 'vins-naturels']
    },
    'bieres-artisanales': {
  title: "Le Monde des Bières Artisanales",
  content: `
    <h2>Introduction à la bière artisanale</h2>
    <p>Les bières artisanales offrent une diversité de styles, de saveurs et d'arômes qu'on ne retrouve pas toujours dans les bières industrielles. Elles reflètent souvent la créativité et la passion des brasseurs.</p>

    <h2>Les principaux styles</h2>
    <h3>IPA, Stout, Lager...</h3>
    <p>Chaque style de bière a ses particularités. Les IPA sont houblonnées et amères, les Stouts sont riches et torréfiées, tandis que les Lagers sont plus légères et rafraîchissantes.</p>

    <h2>Accords mets et bières</h2>
    <p>Associer la bière aux plats est un vrai plaisir. Une bière ambrée se marie bien avec des viandes grillées, tandis qu'une bière fruitée accompagne à merveille un dessert.</p>
  `,
  image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80",
  author: "Pierre Lambert",
  date: "8 Mars 2024",
  readTime: "10 min",
  relatedArticles: ['cocktails-food', 'sake-cuisine-japonaise']
},

'cocktails-food': {
  title: "Cocktails et Gastronomie",
  content: `
    <h2>Une nouvelle dimension culinaire</h2>
    <p>Intégrer des cocktails dans vos repas ouvre la voie à des expériences gastronomiques innovantes. Les cocktails ne sont plus réservés à l'apéritif ou à la soirée.</p>

    <h2>Accords cocktails et plats</h2>
    <h3>Plats salés</h3>
    <p>Un cocktail à base de gin et d’agrumes s’accorde bien avec des fruits de mer ou des ceviches.</p>

    <h3>Desserts</h3>
    <p>Un Espresso Martini sublimera un dessert chocolaté, tandis qu’un cocktail à base de rhum et de vanille ira parfaitement avec un dessert exotique.</p>

    <h2>Conseils de création</h2>
    <p>Jouez avec les ingrédients : herbes, fruits, épices... L’équilibre entre l’alcool, le sucre, l’acidité et l’amertume est essentiel pour réussir vos accords.</p>
  `,
  image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80",
  author: "Marie Dubois",
  date: "5 Mars 2024",
  readTime: "9 min",
  relatedArticles: ['bieres-artisanales', 'art-degustation']
},

'sake-cuisine-japonaise': {
  title: "Le Saké et la Cuisine Japonaise",
  content: `
    <h2>Le saké, boisson traditionnelle</h2>
    <p>Le saké est un alcool de riz japonais dont la richesse aromatique varie selon sa méthode de fabrication. Il accompagne traditionnellement les plats japonais.</p>

    <h2>Les types de saké</h2>
    <p>Junmai, Ginjo, Daiginjo... chaque type possède un profil gustatif unique. Certains sont secs, d'autres fruités ou floraux.</p>

    <h2>Accords avec la cuisine japonaise</h2>
    <p>Un saké léger se marie parfaitement avec des sushis, tandis qu’un saké plus corsé accompagne des plats chauds comme les ramens ou les tempuras.</p>
  `,
  image: "https://images.unsplash.com/photo-1571762450239-f0f047321444?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FrJUMzJUE5fGVufDB8fDB8fHww",
  author: "Yuki Tanaka",
  date: "1 Mars 2024",
  readTime: "11 min",
  relatedArticles: ['vins-naturels', 'bieres-artisanales']
},

'vins-naturels': {
  title: "Les Vins Naturels : Guide du Débutant",
  content: `
    <h2>Qu’est-ce qu’un vin naturel ?</h2>
    <p>Les vins naturels sont élaborés avec un minimum d'interventions, sans additifs, levures artificielles ou filtration excessive. Ils reflètent fidèlement leur terroir.</p>

    <h2>Les particularités</h2>
    <p>Ils peuvent surprendre par leurs arômes, parfois "bruts", et leur aspect parfois trouble. Mais leur authenticité séduit de plus en plus d'amateurs.</p>

    <h2>Accords mets et vins naturels</h2>
    <p>Leur diversité permet des accords originaux : un rouge nature léger avec des plats végétariens, un blanc oxydatif avec des fromages affinés...</p>
  `,
  image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80",
  author: "Lucas Martin",
  date: "28 Février 2024",
  readTime: "7 min",
  relatedArticles: ['accords-fromages', 'sake-cuisine-japonaise']
  }
};

export default function BlogArticle() {
  const { id } = useParams();
  const article = id ? BLOG_ARTICLES[id as keyof typeof BLOG_ARTICLES] : null;

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Article non trouvé</h1>
          <Link 
            to="/blog"
            className="inline-flex items-center text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour aux articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <Link 
        to="/blog"
        className="inline-flex items-center text-stone-600 hover:text-stone-800 transition-colors mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour aux articles
      </Link>

      <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="font-serif text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{article.readTime} de lecture</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="prose prose-stone max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>

      {article.relatedArticles && (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-bold">Articles connexes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {article.relatedArticles.map((relatedId) => {
              const related = BLOG_ARTICLES[relatedId as keyof typeof BLOG_ARTICLES];
              if (!related) return null;
              
              return (
                <Link 
                  key={relatedId}
                  to={`/blog/${relatedId}`}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-48">
                    <img
                      src={related.image}
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-stone-600 transition-colors">
                      {related.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-stone-500">
                      <span>{related.author}</span>
                      <span>{related.readTime}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="fixed bottom-8 right-8">
        <button 
          className="bg-stone-800 text-white p-4 rounded-full shadow-lg hover:bg-stone-900 transition-colors"
          onClick={() => {
            navigator.share({
              title: article.title,
              text: article.title,
              url: window.location.href,
            }).catch(() => {
              // Fallback : copier le lien dans le presse-papier
              navigator.clipboard.writeText(window.location.href);
            });
          }}
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}