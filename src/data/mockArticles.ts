import { Article } from "../types";

export const ALL_CATEGORIES = [
  "IA",
  "Tech",
  "Politique",
  "Humour",
  "Espace",
  "Sport",
  "Science",
  "Économie",
  "Culture"
];
export const MOCK_ARTICLES: Article[] = [
  {
    id: "mock-1",
    category: "Humour",
    source: "Le Figaro",
    title: "Éric Carrière : « On est sorti de ce déjeuner à 19 heures après avoir bu... »",
    time: "13h",
    img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=600",
    summary: "Dans un entretien exclusif et savoureux, l'ancien international français raconte l'ambiance des grandes agapes footballistiques, de la camaraderie d'après-match et des souvenirs inoubliables où le temps s'arrête.",
    content: "Éric Carrière livre une anecdote croustillante sur les coulisses de la vie de footballeur professionnel et l'importance sacrée des moments passés ensemble hors du terrain.\n\n« On s'est assis à midi, on pensait juste manger une salade légère et rentrer faire la sieste, mais l'ambiance était telle qu'on est finalement sorti de ce déjeuner à 19 heures après avoir refait le monde de fond en comble », s'amuse-t-il avec beaucoup de nostalgie.\n\nCette époque, selon l'ancien milieu de terrain, valorisait des espaces de liberté indispensables pour souder un groupe. Loin des plannings hyper-calibrés d'aujourd'hui, les joueurs s'accordaient de véritables moments d'échanges informels.\n\n« Les téléphones portables n'existaient pas ou peu, on se regardait dans les yeux, on discutait de tactique, de politique et de récits personnels. C'est lors de ces déjeuners prolongés que naissait véritablement l'esprit combatif qui nous permettait d'arracher des victoires capitales à la 90ème minute », poursuit-il.\n\nIl aborde également l'évolution des régimes diététiques modernes des athlètes de haut niveau, qui ont drastiquement réduit la place accordée à ces plaisirs coupables d'après-match.\n\n« Aujourd'hui, tout est quantifié, de la moindre calorie au temps de sommeil. C'est scientifiquement parfait mais humainement plus aride. La spontanéité s'est un peu perdue en cours de route. »\n\nCe témoignage montre à quel point l'humour, le rire et la convivialité restent cimentés dans l'histoire de ce sport, par-delà les enjeux financiers colossaux et la professionnalisation à outrance."
  },
  {
    id: "mock-2",
    category: "IA",
    source: "L'Usine Digitale",
    title: "« Nous avons été le premier client de Mistral AI à déployer Mistral Vibe »",
    time: "14h",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600",
    summary: "Une entreprise française pionnière témoigne de son intégration express de la nouvelle technologie d'agent conversationnel de Mistral AI, soulignant des gains d'efficacité exceptionnels en service client.",
    content: "Mistral AI continue d'affirmer son leadership technologique européen. L'intégration de la solution révolutionnaire 'Mistral Vibe' dans les infrastructures opérationnelles de ses clients a démarré à un rythme extrêmement rapide.\n\nLe responsable de l'innovation d'une grande licorne française partage son retour d'expérience : « Les taux de satisfaction client ont bondi de 35% en seulement quelques jours de test grâce à une réactivité sans précédent de l'IA et une fluidité dans le ton qui s'adapte en temps réel aux émotions des usagers. Le déploiement complet s'est fait en un temps record d'une semaine seulement grâce à des APIs ultra-robustes. »\n\nCette technologie repose sur des modèles de langage compacts mais suprêmement optimisés, capables de s'exécuter localement ou via des serveurs sécurisés en Europe. Cette spécificité géographique est centrale pour les entreprises soucieuses de la confidentialité de leurs données sensibles.\n\n« Nous n'avions jamais observé une telle capacité de nuances linguistiques chez un agent conversationnel. L'IA comprend le second degré, l'ironie légère et sait désamorcer les situations conflictuelles avec un tact d'une rare élégance », note le directeur technique.\n\nEn interne, les retombées opérationnelles se font déjà ressentir avec une baisse notable du taux d'abandon lors des requêtes d'assistance complexes.\n\nLes équipes de support humain, autrefois surchargées de sollicitations répétitives, peuvent désormais se consacrer pleinement aux dossiers à forte valeur ajoutée, instaurant de fait une atmosphère de travail beaucoup plus sereine.\n\nCe succès marque un tournant majeur pour la commercialisation des solutions d'intelligence artificielle Made in France face à la domination historique des géants technologiques de la Silicon Valley."
  },
  {
    id: "mock-3",
    category: "Politique",
    source: "Libération",
    title: "Au G7 d’Evian, la souveraineté numérique face à Trump",
    time: "14h",
    img: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=600",
    summary: "Réunis au sommet du G7 à Évian, les dirigeants de l'Union européenne tentent d'organiser un front commun pour imposer une doctrine de protection des infrastructures web faces aux pressions de Washington.",
    content: "Le cadre idyllique du lac Léman sert de décor à des tensions géopolitiques palpables sur l'avenir du numérique.\n\nAlors que l'administration américaine menace de taxer lourdement les services clouds non américains, l'Europe tente péniblement de se mobiliser : « Notre liberté souveraine de stocker et de traiter les données de nos citoyens sur notre propre sol est rigoureusement non négociable », a déclaré solennellement la présidence française de l'UE.\n\nCette confrontation traduit un clivage croissant autour du contrôle des infrastructures physiques d'internet, des câbles sous-marins de fibre optique aux méga-centres de stockage de données situés en périphérie des grandes agglomérations.\n\nL'Europe, longtemps dépendante des monopoles transatlantiques, cherche à accélérer le déploiement de ses propres infrastructures mutualisées souveraines.\n\n« Il ne s'agit pas de protectionnisme agressif, mais d'une saine mesure d'indépendance démocratique et de résilience face aux crises géopolitiques imprévisibles », détaille un conseiller aux affaires étrangères.\n\nLes négociations s'annoncent particulièrement ardues, les États-Unis considérant toute tentative de régulation accrue comme une attaque directe contre leurs fleurons commerciaux.\n\nLes débats au sommet s'annoncent houleux sur la régulation de l'intelligence artificielle et l'impôt mondial sur les superprofits des GAFAM qui peinent à trouver un compromis fiscal équitable."
  },
  {
    id: "mock-4",
    category: "Tech",
    source: "Korben",
    title: "GeoFS - Le simulateur de vol gratuit qui tourne dans le navigateur",
    time: "1j",
    img: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=600",
    summary: "Découvrez comment un projet de simulateur de vol entièrement gratuit utilise l'imagerie卫星 de Google Earth pour proposer une expérience de pilotage fluide et immersive sans aucun téléchargement requis.",
    content: "C'est l'un des secrets les mieux gardés des amateurs d'aviation de loisir et d'informatique ludique. GeoFS propose une flotte impressionnante de dizaines d'appareils réalistes, du simple parapente au colossal Boeing 747, pilotables au clavier, à la souris ou au joystick de jeu directement à l'intérieur de Google Chrome.\n\nGrâce aux optimisations de pointe de la norme WebGL et à l'exploitation fine du moteur CesiumJS, la fluidité d'affichage est remarquable même sur des configurations matérielles modestes ou des ordinateurs portables de bureau classique.\n\nLa particularité absolue du projet réside dans son intégration géographique globale. Les conditions atmosphériques mondiales et le cycle jour-nuit s'avèrent synchronisés en temps réel avec la météo réelle locale !\n\n« Les pilotes virtuels peuvent ainsi s'entraîner à l'approche de pistes montagneuses aux antipodes en affrontant exactement le même vent de travers que les vrais équipages de ligne au même instant », s'enthousiasme le créateur autodidacte du site.\n\nL'expérience dispose d'une communauté active de passionnés qui organisent régulièrement des vols groupés de nuit ou des séances d'apprentissage de la voltige aérienne.\n\nLe réalisme de la physique des fluides est constamment ajusté en fonction des retours d'ingénieurs aéronautiques passionnés de simulation.\n\nUne superbe réussite technique indépendante, accessible à tous en un clic et à tester de toute urgence pour prendre un grand bol d'altitude."
  },
  {
    id: "mock-5",
    category: "Espace",
    source: "Futurism",
    title: "SpaceX Stock Has Now Started to Fall after successful launch",
    time: "21h",
    img: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&q=80&w=600",
    summary: "Malgré la réussite insolente du dernier vol d'essai de son lanceur géant Starship, l'action SpaceX fait l'objet de prises de bénéfices de la part des investisseurs face à l'attente de la rentabilité commerciale.",
    content: "L'espace est un business de très long terme et hautement risqué financièrement, et même SpaceX n'y échappe pas. Après avoir atteint des sommets de surévaluation sur les marchés financiers secondaires, le titre subit une correction globale attendue par la majorité des analystes.\n\nLes financiers estiment que la complexité inhérente à l'atterrissage habité sur le sol lunaire pour la future mission habitée Artemis, ainsi que la cadence faramineuse exigée pour le déploiement des constellations Starlink, engendrent d'immenses charges de trésorerie.\n\nCes coûts d'infrastructure refroidissent certains investisseurs à court terme qui préfèrent sécuriser leurs gains initiaux.\n\n« SpaceX brûle de la trésorerie à un rythme phénoménal pour maintenir son leadership mondial sur le spatial. Chaque tir de Starship représente un investissement colossal de développement à perte », affirme un spécialiste de Wall Street.\n\nLa concurrence s'organise également, avec de nouveaux acteurs étatiques et privés en Asie et en Europe qui développent des lanceurs réutilisables d'entrée de gamme concurrentiels.\n\nCependant, les fondements techniques de l'entreprise californienne demeurent sans rival, l'outil industriel mis en place offrant des économies d'échelle inaccessibles pour ses opposants directs.\n\nNéanmoins, la vision d'expansion multiplanétaire portée par Elon Musk reste parfaitement intacte et la ferveur technologique ne faiblit pas d'un iota au sein des centres de recherche de Boca Chica."
  },
  {
    id: "mock-6",
    category: "Sport",
    source: "L'Équipe",
    title: "Roland-Garros : Un jeune prodige français bouscule les favoris en finale de qualifications",
    time: "3h",
    img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=600",
    summary: "À seulement 18 ans, le jeune tricolore a subjugué le court Suzanne-Lenglen en éliminant coup sur coup deux têtes de série mondiales. Son jeu offensif enthousiasme le public parisien.",
    content: "C'est la sensation créative de la semaine sur la terre battue de la Porte d'Auteuil. Issu d'un parcours sinueux d'invitations sauvages et de tournois mineurs, le jeune prodige impressionne par son sang-froid légendaire et ses amorties millimétrées.\n\n« Jouer devant mon public à Paris est un rêve d'enfance absolu. Je me laisse porter par l'énergie extraordinaire des tribunes sans réfléchir une seconde à la pression médiatique extérieure », confiait-il chaleureusement à la sortie du court, les larmes aux yeux sous les ovations.\n\nSon profil de jeu atypique réveille un certain lyrisme : de grands revers à une main, des montées audacieuses au filet à contre-temps, et une capacité innée à faire déjouer les punchers de fond de court habitués à des échanges mécaniques et prévisibles.\n\nLes entraîneurs nationaux saluent une maturité tactique rare pour son âge, acquise lors d'un exil de formation formateur sur les circuits sud-américains.\n\n« Il possède une intelligence géométrique du jeu incroyable, il sait ouvrir des angles inattendus et varie ses trajectoires constamment », analyse avec passion une ancienne championne française.\n\nL'épreuve du tableau final s'annonce ardue, mais la confiance acquise au cours de ces trois tours éliminatoires homériques le place en position de parfait trouble-fête pour les têtes d'affiche.\n\nLe tennis français tient peut-être enfin là son nouveau porte-drapeau charismatique pour les dix années à venir, capable de réconcilier le beau jeu artistique et les victoires majeures."
  },
  {
    id: "mock-7",
    category: "Science",
    source: "Sciences et Avenir",
    title: "Fusion Nucléaire : L'Europe annonce une avancée majeure de confinement magnétique",
    time: "18h",
    img: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=600",
    summary: "Une équipe internationale de chercheurs est parvenue à maintenir un plasma de fusion stable pendant plus de six minutes consécutives, doublant ainsi le précédent record d'énergie produite.",
    content: "L'ambitieux objectif d'une source d'énergie industrielle propre, entièrement sûre et virtuellement illimitée s'est rapproché d'un très grand pas hier.\n\nEn optimisant de manière drastique la géométrie interne des aimants supraconducteurs du réacteur expérimental de test, les physiciens sont parvenus à éliminer presque toutes les turbulences magnétiques qui perturbaient habituellement le plasma à plus de 150 millions de degrés Celsius.\n\nCe confinement stable est un véritable triomphe d'ingénierie des fluides et de physique quantique appliquée. Les modélisations sur supercalculateur ont permis de concevoir des boucliers thermiques d'une résistance thermique record.\n\n« Les résultats actuels confortent notre vision scientifique à long terme de confinement magnétique stable et d'autosuffisante du réacteur », d'après le communiqué officiel du consortium de recherche européen.\n\nLa prochaine étape majeure consistera à tester des matériaux auto-régénérants pour la paroi interne exposée directement aux flux extrêmes de neutrons énergétiques issus de la réaction nucléaire.\n\nDe nombreux pays partenaires de ce projet mondial ont salué une avancée historique qui justifie de fait les milliards d'euros investis de longue date dans la recherche fondamentale.\n\nBien qu'un raccordement concret au réseau de distribution électrique classique ne soit toujours pas envisageable avant plusieurs décennies d'industrialisation lourde, cette preuve de concept confirme incontestablement la viabilité scientifique et technique de la filière de fusion de type tokamak."
  },
  {
    id: "mock-8",
    category: "Économie",
    source: "Les Échos",
    title: "Taux d'intérêt : La Banque Centrale Européenne entame une baisse progressive",
    time: "5h",
    img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600",
    summary: "Face au ralentissement marqué de l'inflation sous la barre cible des 2% en Europe, la BCE décide de redonner de l'air aux investissements des entreprises et aux crédits des ménages.",
    content: "C'est un signal d'assouplissement monétaire grandement attendu par le secteur sinistré de l'immobilier, les ménages aspirant à l'accession à la propriété et l'ensemble des marchés boursiers mondiaux.\n\nLa BCE a voté à l'unanimité des gouverneurs une baisse symbolique mais significative de son principal taux directeur de 25 points de base, instaurant ainsi un climat d'optimisme mesuré au sein des institutions financières continentales.\n\n« L'économie se stabilise enfin sur un sentier d'inflation modérée, mais la plus grande prudence reste de mise. Nous piloterons les taux d'intérêt étape par étape en fonction permanente des statistiques mensuelles d'emploi et de consommation », a rappelé avec fermeté sa présidente lors de la conférence de presse.\n\nLes analystes bancaires estiment que cette baisse devrait relancer la dynamique de demande de crédits immobiliers, à l'arrêt quasi complet depuis plus de dix-huit mois d'enchérissement d'accès au capital.\n\nCependant, les établissements de prêt traditionnels préviennent que l'assainissement des critères de sélection des emprunteurs restera d'actualité pour éviter toute crise de défaut systémique.\n\nDu côté des PME d'industrie, la mesure apporte un soulagement bienvenu pour l'autofinancement des indispensables transitions écologiques de l'outil de production nationale.\n\nLes principales banques commerciales devraient ainsi emboîter le pas progressivement dans les prochains jours, augurant de bien meilleures conditions globales de prêt dès le début de la rentrée d'automne."
  },
  {
    id: "mock-9",
    category: "Culture",
    source: "Télérama",
    title: "Exposition immersive au Palais de Tokyo : L'art cybernétique à l'honneur",
    time: "7h",
    img: "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&q=80&w=600",
    summary: "Le célèbre centre d'art contemporain parisien s'ouvre aux créations interactives d'artistes utilisant des algorithmes génératifs pour bousculer la frontière entre spectateur et œuvre.",
    content: "Le Palais de Tokyo invite le public parisien à une véritable et profonde communion sensorielle et philosophique de haut vol. En déambulant dans de majestueuses salles sombres équipées de dispositifs de projection réactifs à 360 degrés, chaque visiteur modifie imperceptiblement par sa simple présence et ses mouvements la course et la couleur des sculptures de lumière projetées.\n\nLe commissaire général de l'exposition explique le geste créatif : « Nous voulons interroger notre rapport fusionnel, presque charnel, avec les lignes de code informatique et les algorithmes prédictifs invisibles qui guident nos existences quotidiennes. L'intelligence artificielle n'est pas uniquement un outil de calcul froid et dénué d'âme, c'est aussi un miroir poétique et troublant de notre propre humanité. »\n\nLes dispositifs d'interactivité font appel à des caméras thermiques avancées et à des capteurs de captation de l'activité cardiaque, traduisant les réactions d'anxiété ou de sérénité des foules en arrangements sonores harmoniques ou dissonants.\n\nCette démarche explore la notion d'auteur à l'ère numérique : l'œuvre n'est plus un objet statique figé pour l'éternité, mais une création évolutive, générée en temps réel de manière unique et éphémère par l'action collective des passants.\n\nCertaines installations incitent les spectateurs à s'asseoir ensemble pour synchroniser leur respiration afin de stabiliser une structure visuelle complexe.\n\nL'expérience bouscule, déstabilise positivement et marque durablement les esprits des petits comme des grands par son intelligence de scénographie.\n\nUne expérience visuelle, physique, philosophique et sonore d'une profondeur rare, à découvrir d'urgence jusqu'à la fin de la saison culturelle."
  }
];

// Map a category or search term to a beautiful Unsplash cover image fallback
export function getCategoryFallbackImage(category: string): string {
  const normalized = category.toLowerCase().trim();
  if (normalized.includes("ia") || normalized.includes("intelligence") || normalized.includes("artificial")) {
    return "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("tech") || normalized.includes("ordinateur") || normalized.includes("code") || normalized.includes("development")) {
    return "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("politique") || normalized.includes("gouvernement") || normalized.includes("loi")) {
    return "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("humour") || normalized.includes("rire") || normalized.includes("joke") || normalized.includes("drôle")) {
    return "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("espace") || normalized.includes("spacex") || normalized.includes("astronomie") || normalized.includes("lune") || normalized.includes("star")) {
    return "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("sport") || normalized.includes("football") || normalized.includes("tennis") || normalized.includes("course")) {
    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("science") || normalized.includes("physique") || normalized.includes("chimie") || normalized.includes("recherche")) {
    return "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("éco") || normalized.includes("argent") || normalized.includes("finance") || normalized.includes("bourse")) {
    return "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("cult") || normalized.includes("art") || normalized.includes("musée") || normalized.includes("ciné")) {
    return "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("cuisine") || normalized.includes("gastronomie") || normalized.includes("plat")) {
    return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("jeu") || normalized.includes("game") || normalized.includes("video")) {
    return "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("climat") || normalized.includes("écologie") || normalized.includes("nature")) {
    return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600";
  }
  return "https://images.unsplash.com/photo-1495020689067-958852a6565d?auto=format&fit=crop&q=80&w=600"; // General news fallback
}
