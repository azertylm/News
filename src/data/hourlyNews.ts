import { Article } from "../types";

// Unsplash URLs representing highly cinematic, high-quality professional imagery
const IMAGES = {
  space: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
  ai_robot: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
  tennis: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200",
  finance: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200",
  green_energy: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=1200",
  ocean: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200",
  quantum: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200",
  medical_ai: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200",
  cinema: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200",
  climate: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200",
  audio_ai: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200",
  aurora: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=1200",
  humanoid: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200",
  robot_vacuum: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=1200",
  arctic: "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&q=80&w=1200",
  school_ai: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200",
  wembanyama: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200",
  assembly: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200",
  deepfake_ai: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200",
  retrogaming: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&q=80&w=1200"
};

function getSourceUrl(source: string): string {
  const mapping: Record<string, string> = {
    "Astronomy Press": "https://www.astronomy.com",
    "Focus AI Lab": "https://ai.google",
    "L'Équipe": "https://www.lequipe.fr",
    "Les Échos": "https://www.lesechos.fr",
    "L'Usine Digitale": "https://www.usine-digitale.fr",
    "Sciences et Avenir": "https://www.sciencesetavenir.fr",
    "Futura Tech": "https://www.futura-sciences.com",
    "Santé Tech Mag": "https://www.sante-magazine.fr",
    "Télérama": "https://www.telerama.fr",
    "Le Monde": "https://www.lemonde.fr",
    "La Tribune Tech": "https://www.latribune.fr",
    "Bloomberg Paris": "https://www.bloomberg.fr",
    "Sciences Actu": "https://www.science-et-vie.com",
    "Robotics World": "https://www.generation-nt.com",
    "L'Est Républicain": "https://www.estrepublicain.fr",
    "Le Télégramme": "https://www.letelegramme.fr",
    "Éducation Nationale": "https://www.education.gouv.fr",
    "Basket USA": "https://www.basketusa.com",
    "L'Opinion": "https://www.lopinion.fr",
    "Cyber-Tribune": "https://www.zdnet.fr",
    "Inrocks": "https://www.lesinrocks.com"
  };
  return mapping[source] || "https://www.lemonde.fr";
}

// 15 distinct categories
const CATEGORY_NAMES = [
  "Intelligence Artificielle",
  "Politique",
  "Culture",
  "Sport",
  "High-Tech",
  "Espace",
  "Économie",
  "Science",
  "Santé",
  "Environnement",
  "Insolite",
  "Éducation",
  "Société",
  "Gastronomie",
  "Transports"
];

// Sources mapping to categories
const CATEGORY_SOURCES = [
  "Focus AI Lab",
  "L'Opinion",
  "Télérama",
  "L'Équipe",
  "L'Usine Digitale",
  "Astronomy Press",
  "Les Échos",
  "Sciences Actu",
  "Santé Tech Mag",
  "Sciences et Avenir",
  "Futura Tech",
  "Éducation Nationale",
  "Le Télégramme",
  "Inrocks",
  "Robotics World"
];

// Images mapping to categories
const CATEGORY_IMAGES = [
  IMAGES.ai_robot,
  IMAGES.assembly,
  IMAGES.cinema,
  IMAGES.tennis,
  IMAGES.quantum,
  IMAGES.space,
  IMAGES.finance,
  IMAGES.arctic,
  IMAGES.medical_ai,
  IMAGES.green_energy,
  IMAGES.robot_vacuum,
  IMAGES.school_ai,
  IMAGES.ocean,
  IMAGES.climate,
  IMAGES.humanoid
];

// Content blueprints of size 12 for dynamic non-repetitive assembly
const BLUEPRINTS = {
  // Category 0: Intelligence Artificielle
  0: {
    subjects: [
      "Le modèle cognitive Gemini 3.5",
      "L'agent autonome d'ingénierie proactive",
      "Un réseau neuronal à haute interaction haptique",
      "Une puce neuromorphique auto-cadencée",
      "Le système de traduction sémantique universelle",
      "L'algorithme de repliement de protéines",
      "Le protocole de cybersécurité dynamique",
      "L'IA d'analyse de jurisprudence européenne",
      "Un assistant intelligent de micro-chirurgie",
      "Le simulateur météorologique global de DeepMind",
      "L'animateur de soutien scolaire personnalisé",
      "Un régulateur autonome de trading asymétrique"
    ],
    verbs: [
      "redéfinit l'autonomie des systèmes d'exploitation",
      "génère sa propre architecture de code sans erreur",
      "optimise les gestes industriels de haute précision",
      "découvre de nouvelles liaisons moléculaires stables",
      "confectionne des traductions simultanées fidèles",
      "réduit l'empreinte carbone des grands serveurs",
      "détecte les failles mémoire critiques en temps réel",
      "facilite le travail d'examen des tribunaux",
      "pilote les lasers de chirurgie ophtalmique",
      "anticipe les dérives thermiques locales de la planète",
      "organise l'évaluation des élèves en difficulté",
      "sécurise les portefeuilles financiers durables"
    ],
    complements: [
      "au pôle technologique de Paris-Saclay",
      "dans les centres de calcul écologiques de l'Isère",
      "sur les chaînes d'assemblage de Toyota",
      "à l'Institut Pasteur de Lille",
      "au forum international du numérique de Séoul",
      "dans les smart-grids d'Évian-les-Bains",
      "au QG cyber-gouvernemental de Brest",
      "dans les plus grands cabinets juridiques de Lyon",
      "dans les blocs opératoires de Strasbourg",
      "pour les infrastructures d'Airbus à Toulouse",
      "au sein des rectorats pilotes de Marseille",
      "auprès de la Banque d'Investissements Publiques"
    ]
  },
  // Category 1: Politique
  1: {
    subjects: [
      "La nouvelle loi de souveraineté industrielle",
      "Le projet de loi de décarbonation des transports",
      "La commission d'enquête sur les lobbies industriels",
      "L'accord transfrontalier sur l'énergie partagée",
      "Le plan d'investissement pour les services publics",
      "La charte éthique sur l'automatisation du travail",
      "Le budget de soutien aux laboratoires académiques",
      "La réforme institutionnelle de l'Assemblée",
      "Le traité international sur les réserves maritimes",
      "La stratégie interministérielle de cybersécurité",
      "La politique nationale d'aide au cinéma indépendant",
      "La charte de végétalisation urbaine systématique"
    ],
    verbs: [
      "provoque des débats animés au sein du Sénat",
      "vise à restructurer en profondeur notre économie",
      "fait l'objet d'une attention médiatique maximale",
      "déclenche la colère des corporations d'importateurs",
      "renforce les dotations allouées aux petites communes",
      "génère des dissensions entre partis de gauche et droite",
      "débloque des fonds historiques pour l'innovation",
      "simplifie l'élaboration des amendements parlementaires",
      "criminalise le chalutage abusif en haute mer",
      "coordonne la réponse face aux menaces informatiques",
      "encourage la production cinématographique décentralisée",
      "contraint les promoteurs immobiliers à un seuil vert"
    ],
    complements: [
      "à l'issue de la commission parlementaire à Paris",
      "pour l'ensemble des départements ruraux",
      "auprès de l'administration exécutive",
      "dans le cadre du sommet d'Evian",
      "pour revitaliser le cœur des préfectures",
      "dans le strict respect des règles européennes",
      "au sein des centres d'expertise scientifique",
      "après plusieurs semaines d'obstruction passive",
      "dans le bassin sensible de la Méditerranée",
      "au cœur des ministères de l'Intérieur et des Armées",
      "pour soutenir nos scènes artistiques de banlieue",
      "sur tous les chantiers publics d'Île-de-France"
    ]
  },
  // Category 2: Culture
  2: {
    subjects: [
      "L'exposition interactive sur l'art numérique",
      "La rétrospective consacrée aux pionniers du cinéma",
      "Le grand gala de création théâtrale à Avignon",
      "L'œuvre symphonique jouée par l'orchestre moderne",
      "La recrudescence de l'édition d'essais physiques",
      "La nouvelle pièce satyrique du Théâtre National",
      "Le festival de bande dessinée d'Angoulême",
      "L'ouverture du musée dédié aux jeux d'époque",
      "L'opéra contemporain inspiré par l'écologie",
      "La biennale internationale de l'art paysager",
      "Le concert intimiste à l'ancienne usine thermique",
      "L'exposition de sculptures en marbre recyclé"
    ],
    verbs: [
      "rencontre un succès public retentissant",
      "propose un miroir poétique de nos sociétés",
      "surprend les critiques par son audace formelle",
      "combine l'intelligence artificielle et la musique",
      "séduit les jeunes lecteurs lassés des écrans",
      "interroge l'absurdité de nos rituels diplomatiques",
      "consacre des auteurs alternatifs engagés",
      "met à l'honneur des consoles de légende",
      "transmet un cri d'alarme d'une immense poésie",
      "mélange géométrie florale et urbanisme moderne",
      "propose une acoustique naturelle exceptionnelle",
      "sublime les rebuts industriels avec délicatesse"
    ],
    complements: [
      "au cœur du Palais de Tokyo à Paris",
      "dans les salles obscures de la Cinémathèque",
      "sur la scène du cloître des Célestins",
      "à la Philharmonie de Paris",
      "chez les libraires indépendants lyonnais",
      "à l'amphithéâtre romain d'Arles",
      "dans les espaces de la Cité Spatiale",
      "au Pavillon Populaire de Montpellier",
      "sur l'esplanade du Grand Théâtre de Bordeaux",
      "à la friche industrielle de Marseille",
      "dans les jardins de la villa de Giverny",
      "au musée d'Art Moderne de Strasbourg"
    ]
  },
  // Category 3: Sport
  3: {
    subjects: [
      "La finale exaltante du tournoi de Roland-Garros",
      "Le jeune athlète de la sélection nationale de basket",
      "Le marathon du Mont-Blanc dans des conditions rudes",
      "L'introduction des sports virtuels aux compétitions",
      "La coupe du monde d'escrime de précision",
      "La course cycliste de montagne dans les Alpes",
      "La demi-finale d'athlétisme sur l'anneau olympique",
      "Le championnat océanique de voile de course",
      "La ligue européenne de football féminin",
      "Le tournoi d'échecs de ultra-rapidité à Nice",
      "La compétition de gymnastique acrobatique synchronisée",
      "La réouverture du vélodrome couvert de Saint-Quentin"
    ],
    verbs: [
      "enthousiasme le public venu en très grand nombre",
      "s'impose comme la nouvelle terreur des parquets",
      "couronne un coureur indépendant inattendu",
      "redéfinit l'attrait mondial pour les reflexes purs",
      "révèle une maîtrise tactique hors du commun",
      "se dispute dans des cols à plus de 2000m",
      "établit un record d'Europe remarquable",
      "affronte des vents violents au large du Finistère",
      "bat un record historique d'audience télévisée",
      "donne lieu à un affrontement cérébral majuscule",
      "impressionne les juges par sa rigueur millimétrée",
      "accueille la fine fleur du cyclisme mondial"
    ],
    complements: [
      "sur la terre battue du court Philippe-Chatrier",
      "au sein des franchises majeures d'Amérique du Nord",
      "le long des sentiers rocailleux de Chamonix",
      "durant la grande arène de Bercy à Paris",
      "devant les spectateurs conquis de Reims",
      "sous un soleil de plomb propice aux défaillances",
      "sur la piste ultra-rapide du Stade de France",
      "aux abords des côtes bretonnes sauvages",
      "au cœur des stades d’Allemagne et de France",
      "dans les salons feutrés de la Côte d'Azur",
      "au complexe omnisports de Rennes",
      "devenu le temple de la vitesse sur piste"
    ]
  },
  // Category 4: High-Tech
  4: {
    subjects: [
      "Le processeur quantique à architecture topologique",
      "Le nouveau routeur de bande passante ultra-séparée",
      "Un casque de réalité hybride à focalisation oculaire",
      "La batterie solide à électrolyte de céramique",
      "Une console portable open-source en circuit court",
      "L'ordinateur portatif entièrement réparable en verre",
      "Le système de détection laser lidar passif",
      "Un protocole réseau contre les vols d'identité",
      "Le module de mémoire vive non volatile à haute résonance",
      "Un drone cargo électrique à voilure flexible",
      "L'imprimante 3D de précision en alliage de titane",
      "Le moniteur OLED à émission lumineuse biologique"
    ],
    verbs: [
      "bat tous les benchmarks de rapidité et d'efficacité",
      "isole entièrement les liaisons sans fil critiques",
      "minimise la fatigue visuelle des développeurs",
      "autorise une durée de vie moyenne de vingt-cinq ans",
      "fait fureur au salon mondial du matériel de Milan",
      "lutte concrètement contre l'obsolescence programmée",
      "offre une cartographie 3D d'une clarté incomparable",
      "protège les bases de données des attaques quantiques",
      "conserve les informations sans courant d'alimentation",
      "transporte des charges lourdes de manière silencieuse",
      "met la fabrication industrielle à portée des PME",
      "consomme 85% d'énergie en moins que les écrans LED"
    ],
    complements: [
      "au sein des laboratoires de Sophia-Antipolis",
      "pour sécuriser les réseaux ferroviaires",
      "lors de la grande convention de la tech de Berlin",
      "dans les usines de batteries à Dunkerque",
      "sur les plateformes de financement partagé",
      "grâce aux coopératives de matériel de Nantes",
      "sur les futurs véhicules autonomes d'Europe",
      "au sein du pôle aéronautique de Bourges",
      "pour les équipements informatiques de Brest",
      "dans les zones de montagne difficiles d'accès",
      "aux ateliers collaboratifs de Saint-Étienne",
      "dans les bureaux d'études de Sophia-Antipolis"
    ]
  },
  // Category 5: Espace
  5: {
    subjects: [
      "Le télescope spatial Euclid de nouvelle génération",
      "La sonde d'exploration des lunes gelées de Saturne",
      "Le rover géologue déposé dans le cratère Jezero",
      "Le satellite d'observation thermique de l'océan",
      "La fusée réutilisable à carburant d'hydrogène vert",
      "La station Tiangong avec son équipage de scientifiques",
      "L'étude du rayonnement fossile de l'univers",
      "La base robotisée de recherche lunaire habitée",
      "Certaines tempêtes magnétiques d'intensité record",
      "Le nouveau radiotélescope géant du pôle Sud",
      "La constellation d'observation environnementale",
      "La capture réussie d'un micro-météorite en orbite"
    ],
    verbs: [
      "dévoile des galaxies datant de l'aube cosmique",
      "détecte des signatures de geysers d'eau liquide",
      "isole des échantillons géologiques extrêmement rares",
      "mesure précisément la hausse des températures de surface",
      "réussit un vol de démonstration orbital impeccable",
      "accueille des expérimentations de physique fondamentale",
      "révèle une anomalie inexpliquée dans le fond diffus",
      "bâtit les premiers dômes pressurisés de régolithe",
      "génère de magnifiques aurores boréales en Bretagne",
      "capte des signaux radio réguliers d'une lointaine étoile",
      "permet de traquer la pollution marine minute par minute",
      "fournit des indices sur la genèse de notre système solaire"
    ],
    complements: [
      "au centre d'astrophysique spatiale de Meudon",
      "grâce aux calculs du centre spatial de Toulouse",
      "sur les écrans de contrôle de l'Agence Spatiale",
      "dans le cadre de la surveillance climatique globale",
      "au pas de tir guyanais de Kourou",
      "à 400 kilomètres au-dessus du noyau terrestre",
      "dans les publications du prestigieux journal Nature",
      "dans l'hémisphère Sud de notre planète",
      "dans le ciel nocturne parfaitement dégagé",
      "au milieu des glaces d'Adélie en Antarctique",
      "pour le compte du groupement de recherche spatial",
      "sur les modules d'analyses de l'ESA"
    ]
  },
  // Category 6: Économie
  6: {
    subjects: [
      "L'indice boursier des valeurs vertes européennes",
      "La hausse de la création d'entreprises coopératives",
      "Le baromètre de l'emploi dans l'industrie verte",
      "La baisse ordonnée des taux d'intérêt de la BCE",
      "Le marché du crédit immobilier de la zone euro",
      "La croissance retrouvée de la filière textile française",
      "Le sommet économique pour la relocalisation d'actifs",
      "La taxe européenne sur les superprofits du numérique",
      "La banque solidaire de développement de proximité",
      "Un rapport sur l'épargne citoyenne de transition",
      "La fusion de deux géants français du fret maritime",
      "Le plan de refinancement de la filière automobile"
    ],
    verbs: [
      "atteint un sommet de confiance auprès des investisseurs",
      "démontre que la rentabilité sociale est pérenne",
      "affiche des créations de postes en forte croissance",
      "redonne de l'air aux investissements industriels",
      "suscite un regain d'intérêt chez les jeunes ménages",
      "s'appuie sur la modernisation des usines vosgiennes",
      "plaide pour un retour des manufactures en régions",
      "génère des recettes fiscales s'élevant à 10 milliards",
      " finance plus de cinq mille projets d'intérêt public",
      "incite les ménages à orienter leurs fonds vers l'écologie",
      "renforce la souveraineté logistique de l'Europe",
      "accompagne le virage électrique des sous-traitants"
    ],
    complements: [
      "à la bourse financière de Francfort",
      "dans l'ensemble du tissu coopératif d'Occitanie",
      "dans les bassins d'emplois du Grand Est",
      "au siège central de la Banque de Francfort",
      "dans la grande majorité des banques de réseau",
      "au sein des ateliers de Troyes et d'Épinal",
      "lors du forum de ré-industrialisation de Nantes",
      "dans le cadre de la nouvelle directive fiscale",
      "dans les territoires ruraux enclavés",
      "pour accélérer l'indépendance énergétique nationale",
      "sur les grands terminaux fluviaux du Havre",
      "auprès des constructeurs de Bourgogne-Franche-Comté"
    ]
  },
  // Category 7: Science
  7: {
    subjects: [
      "La découverte du supraconducteur à haute pression",
      "La mesure ultrasensible de l'attraction gravitationnelle",
      "Le microscope électronique à laser atto-seconde",
      "L'étude génomique de la faune aquatique des abysses",
      "Un nouveau modèle mathématique de fractales fluides",
      "L'analyse thermique des calottes glaciaires arctiques",
      "La synthèse cristalline à structure de diamant mou",
      "L'expérience de physique quantique sur l'intrication",
      "Le scanner de détection d'artéfacts égyptiens",
      "L'observation d'un récif corallien en eau profonde",
      "Un nouveau catalyseur pour l'extraction de l'hydrogène",
      "L'analyse des particules cosmiques de haute altitude"
    ],
    verbs: [
      "bouscule les théories connues sur l'énergie",
      "permet de valider des prévisions de physique d'Einstein",
      "offre une observation inédite des électrons en mouvement",
      "révèle des capacités uniques d'adaptation biologique",
      "explique le comportement complexe des grands nuages",
      "met en évidence un dégel accéléré des pergélisols",
      "ouvre des perspectives d'applications en microélectronique",
      "confirme que l'information se téléporte instantanément",
      "révèle la présence d'une crypte secrète inviolée",
      "surprend par son incroyable diversité biologique",
      "réduit le coût de production de l'énergie décarbonée",
      "indique des sources d'énergie oubliées de notre galaxie"
    ],
    complements: [
      "au sein du synchrotron Soleil à Saclay",
      "dans les galeries souterraines du CERN à Genève",
      "au laboratoire de spectroscopie optique de Rennes",
      "aux abords de la fosse des Mariannes",
      "dans les cahiers du Centre de Recherches de Lille",
      "sur la base scientifique d'Ushuaïa",
      "dans les laboratoires de chimie de Grenoble",
      "lors de l'expérience de téléportation à Nice",
      "au fond de la vallée des Rois de Louxor",
      "au large de l'archipel des Glénan",
      "au département de recherche sur l'énergie de Nancy",
      "à l'observatoire de haute montagne du Pic du Midi"
    ]
  },
  // Category 8: Santé
  8: {
    subjects: [
      "La thérapie cellulaire par ciseaux d'ADN de pointe",
      "Le diagnostic automatisé précoce de la maladie d'Alzheimer",
      "Le traitement par immunothérapie synthétique ciblée",
      "Un implant rétinien flexible redonnant la vue",
      "Le vaccin à ARN messager contre les maladies hivernales",
      "Certaines prothèses de membres commandées par la pensée",
      "La découverte d'une nouvelle classe d'antibiotiques",
      "La cartographie 3D ultraréaliste du réseau cardiaque",
      "Le traitement préventif de l'insuffisance rénale",
      "L'endoscope à guidage électromagnétique doux",
      "La thérapie par ultrasons focalisés de haute intensité",
      "Le suivi pédiatrique connecté des prématurés"
    ],
    verbs: [
      "soigne des maladies génétiques autrefois incurables",
      "identifie les premiers signes dix ans avant les symptômes",
      "éradique les cellules tumorales sans endommager les tissus",
      "permet de distinguer les silhouettes et les obstacles",
      "cible les trois principales souches virales mutantes",
      "restitue une fluidité naturelle de mouvement haptique",
      "neutralise les bactéries résistantes de nos hôpitaux",
      "permet aux chirurgiens de visualiser chaque micro-vaisseau",
      "réduit de 80% le besoin de dialyse chez les patients",
      "traverse les conduits digestifs sans aucune friction",
      "détruit les nodules bénins de façon indolore et rapide",
      "optimise la régulation thermique des couveuses"
    ],
    complements: [
      "à l'Hôpital Necker de Paris",
      "au sein du pôle neurosciences de Lyon-Bron",
      "dans les laboratoires du CNRS de Bordeaux",
      "au centre d'ophtalmologie de pointe de Nantes",
      "dans l'ensemble des centres de vaccination",
      "sur les patients du centre de réadaptation d'Évry",
      "selon l'étude parue à l'Académie de Médecine",
      "au département de cardiologie de Toulouse",
      "dans les cliniques partenaires du Var",
      "lors des essais cliniques au CHU de Lille",
      "au centre anticancer de la Timone à Marseille",
      "au service de néonatologie de Strasbourg"
    ]
  },
  // Category 9: Environnement
  9: {
    subjects: [
      "Le projet de restauration forestière de grande ampleur",
      "La zone marine protégée interdisant tout chalutage",
      "Le plan de sauvegarde des abeilles sauvages endémiques",
      "Une centrale géothermique profonde et à bas bruit",
      "Le dispositif de détection des rejets de méthane",
      "L'initiative citoyenne de nettoyage des plages",
      "Le parc éolien flottant de nouvelle génération",
      "La réserve de biosphère certifiée du mont Pilat",
      "Le captage de carbone par filtres minéraux actifs",
      "La ferme agroécologique combinant maraîchage et arbres",
      "L'interdiction des microplastiques dans les vêtements",
      "La charte de protection thermique des forêts d'altitude"
    ],
    verbs: [
      "permet de replanter un million d'arbres feuillus",
      "permet au récif corallien de se régénérer rapidement",
      "sécurise les zones de reproduction des pollinisateurs",
      "alimente en chaleur propre plus de dix mille foyers",
      "repère les fuites sur les gazoducs sous-marins",
      "met fin au calvaire des déchets plastiques côtiers",
      "fournit une électricité décarbonée stable et sûre",
      "préserve durablement des espèces animales fragiles",
      "fixe le dioxyde de carbone sous forme de roche neutre",
      "démontre une productivité agricole sans pesticides",
      "réduit la pollution de nos cours d'eau de moitié",
      "protège nos massifs contre le dessèchement estival"
    ],
    complements: [
      "sur le massif des Vosges et du Morvan",
      "au large de l'archipel sauvage des Glénan",
      "dans les parcs naturels de la région lyonnaise",
      "au pôle géothermique d'Alsace du Nord",
      "grâce aux capteurs aériens de l'administration",
      "sur les côtes sauvages de la Loire-Atlantique",
      "au large des îles sauvages du Morbihan",
      "dans le parc naturel de la Loire",
      "à proximité des industries lourdes du Rhône",
      "dans les fermes expérimentales du Gers",
      "selon le décret du ministère de la Transition",
      "dans les forêts fragiles des Alpes du Sud"
    ]
  },
  // Category 10: Insolite
  10: {
    subjects: [
      "Le prototype de fauteuil roulant tout-terrain autonome",
      "Un chat robotisé ronronnant pour calmer l'anxiété",
      "La capsule temporelle enfouie sous la cour de l'école",
      "Une brosse à dents intelligente évaluant la salive",
      "Le championnat insolite de lancer d'artichaut",
      "Un robot ménager cuisinant des crêpes parfaites",
      "La découverte fortuite d'un trésor romain de 1000 pièces",
      "Le parapluie émettant une alerte météo par vibrations",
      "Une ruche connectée d'appartement silencieuse",
      "Le costume gonflable anti-gravité pour simulateur",
      "Un vélo de ville générant sa propre eau potable",
      "La chaussure intelligente ajustant sa taille par pression"
    ],
    verbs: [
      "permet de gravir des escaliers rocailleux isolés",
      "séduit les résidents des maisons de retraite",
      "contient des lettres rédigées par des écoliers en 1926",
      "détecte les carences alimentaires en quelques secondes",
      "réunit des centaines de passionnés enthousiastes",
      "réalise un retournement aérien sans aucune bavure",
      "change radicalement la vie d'un agriculteur vosgien",
      "prévient son utilisateur avant les premières gouttes",
      "produit trois kilos de miel de balcon par an",
      "recrée des sensations de chute libre à l'intérieur",
      "condense l'humidité ambiante grâce au vent de course",
      "s'adapte à la morphologie précise du pied en marche"
    ],
    complements: [
      "dans les parcs naturels des Pyrénées",
      "au CHU pilote de la Côte d'Émeraude",
      "au sein de l'école primaire de Saint-Malo",
      "présenté au salon de l'invention de Genève",
      "dans un village haut perché du Finistère",
      "lors de la fête de la Chandeleur à Quimper",
      "dans le champ en jachère d'Épinal",
      "conçu par un ingénieur indépendant de Nantes",
      "sur les balcons végétalisés de Toulouse",
      "au centre de recherche ludique d'Annecy",
      "sur les pistes cyclables de la métropole lilloise",
      "aux pieds des sportifs d'une association de Lyon"
    ]
  },
  // Category 11: Éducation
  11: {
    subjects: [
      "La plateforme interactive de soutien scolaire",
      "Le plan de rénovation thermique des écoles usées",
      "Le programme d'apprentissage de la programmation",
      "Le jumelage scolaire par casques de réalité virtuelle",
      "Une charte nationale d'usage des outils informatiques",
      "L'introduction de cours d'alimentation de terroir",
      "L'université publique ouverte d'informatique",
      "Le baromètre de réussite du mentorat étudiant",
      "Le concours annuel de mathématiques créatives",
      "La généralisation du cartable numérique ultra-léger",
      "Le programme d'éveil scientifique par l'expérience",
      "Le module de sensibilisation au tri des déchets"
    ],
    verbs: [
      "accompagne les lycéens dans leurs révisions du bac",
      "vise à isoler thermiquement tous les collèges ruraux",
      "permet aux écoliers de concevoir leurs propres jeux",
      "réunit virtuellement des élèves de France et du Canada",
      "encadre l'utilisation des intelligences artificielles",
      "sensibilise les élèves aux circuits d'ingrédients locaux",
      "propose des cursus diplômants gratuits en alternance",
      "affiche un taux de persévérance scolaire inégalé",
      "récompense des projets innovants de lycéennes",
      "soulage le dos de plusieurs millions de collégiens",
      "met du matériel de laboratoire à disposition des classes",
      "responsabilise les éco-délégués de chaque classe"
    ],
    complements: [
      "sur l'ensemble du territoire national",
      "dans tous les départements du Massif Central",
      "dès l'entrée en classe de cours moyen",
      "dans les classes de langues vivantes de Brest",
      "dans l'ensemble des lycées publics régionaux",
      "dans les cantines de la région de Dijon",
      "dans les nouveaux locaux universitaires de Lille",
      "au sein des résidences universitaires du CROUS",
      "lors de la remise des prix à la Sorbonne à Paris",
      "à la rentrée scolaire de septembre prochain",
      "auprès des écoles pilotes de Haute-Loire",
      "dans les établissements scolaires d'Occitanie"
    ]
  },
  // Category 12: Société
  12: {
    subjects: [
      "Le projet d'habitat participatif et solidaire",
      "L'épicerie solidaire en circuit ultra-court",
      "Le plan d'intégration professionnelle des réfugiés",
      "La charte de transition du bénévolat associatif",
      "Une initiative d'ateliers de réparation municipaux",
      "Le réseau de transport à la demande pour l'isolement",
      "La maison des aînés ouverte au cœur des quartiers",
      "La charte de réduction de l'affichage publicitaire",
      "Un observatoire de l'inclusion et du vivre-ensemble",
      "L'ouverture d'un tiers-lieu culturel et numérique",
      "Le programme citoyen d'aménagement des parcs publics",
      "La charte nationale pour l'égalité d'accès au web"
    ],
    verbs: [
      "permet de loger dignement des familles et des aînés",
      "propose des produits bio locaux à prix extrêmement bas",
      "facilite l'apprentissage de la langue et du travail",
      "redonne de l'élan aux associations de quartier",
      "lutte contre le gaspillage et répare l'électroménager",
      "permet aux personnes isolées de garder un lien social",
      "propose des repas solidaires chaleureux et conviviaux",
      "redonne sa place à la nature visuelle en ville",
      "analyse objectivement les innovations communautaires",
      "rassemble des artistes et des passionnés d'écologie",
      "implique directement les habitants dans leur quartier",
      "fournit internet haut débit aux zones blanches paysannes"
    ],
    complements: [
      "au sein de l'éco-quartier moderne de Strasbourg",
      "dans les quartiers populaires de Roubaix",
      "dans les entreprises partenaires du Maine-et-Loire",
      "auprès de la Fédération des Associations à Lyon",
      "dans tous les centres d'aide de la métropole de Nantes",
      "dans les communes reculées des Cévennes Sauvages",
      "au cœur de la cité d'Angers",
      "au sein de la métropole innovante de Bordeaux",
      "selon les récents rapports de la fondation nationale",
      "dans l'ancienne gare restaurée de Rouen",
      "aux abords des espaces verts de Toulouse",
      "dans toutes les mairies rurales de la Creuse"
    ]
  },
  // Category 13: Gastronomie
  13: {
    subjects: [
      "Le concours du meilleur pain au levain naturel",
      "Un festival de cuisine de terroir sans cuisson",
      "Le renouveau de l'orge de brasserie biologique",
      "La charte d'engagement des chefs pour le zéro déchet",
      "La redécouverte de cépages historiques disparus",
      "Un concours de pâtisserie à teneur réduite en sucre",
      "Le guide gourmand des producteurs en vente directe",
      "L'ouverture d'un restaurant gastronomique solidaire",
      "La fête traditionnelle de la truffe noire d'hiver",
      "Le projet d'agroforesterie truffière et fruitière",
      "Une école de cuisine pour les familles modestes",
      "Le championnat culinaire des cantines scolaires"
    ],
    verbs: [
      "récompense des artisans boulangers passionnés",
      "met en valeur des mariages de saveurs d'origine végétale",
      "séduit les brasseurs artisanaux de toute l'Europe",
      "élimine tous les emballages à usage unique des offices",
      "révèle des arômes de fruits sauvages d'une douceur rare",
      "prouve que la gourmandise est compatible avec la santé",
      "cartographie les circuits d'achat à moins de 30km",
      "emploie des personnes handicapées en salle et cuisine",
      "réunit les plus grands connaisseurs de la gastronomie",
      "associe noisetiers et truffes sur des parcelles vertes",
      "propose des recettes saines et à budget très serré",
      "promeut des repas cuisinés sur place de haute qualité"
    ],
    complements: [
      "dans les boulangeries artisanales de Nancy",
      "au salon culinaire alternatif de Montpellier",
      "dans les houblonnières certifiées de la plaine d'Alsace",
      "dans les grands restaurants étoilés de la Côte d'Azur",
      "sur les coteaux escarpés de la vallée du Rhône",
      "lors de la grande dégustation des chefs à Paris",
      "grâce aux associations rutilantes du Périgord",
      "dans les rues animées du centre-ville de Lille",
      "sur les marchés typiques de laDrôme Provençale",
      "dans les exploitations agricoles pilotes du Var",
      "au sein des centres sociaux de Seine-Saint-Denis",
      "pour le plus grand bonheur des élèves de Dijon"
    ]
  },
  // Category 14: Transports
  14: {
    subjects: [
      "La navette autonome électrique inter-villes",
      "Le train à sustentation magnétique à bas coût",
      "Le vélo cargo à assistance solaire intégrée",
      "L'ouverture du premier couloir aérien de drones postaux",
      "Une charte nationale de développement du covoiturage",
      "Le prototype de catamaran solaire de fret fluvial",
      "La chaussée routière photovoltaïque et drainante",
      "Le pôle multimodal de recharge hydrogène propre",
      "Certains bus de banlieue à carburant de biogaz",
      "Le plan d'extension des voies cyclables protégées",
      "Le moteur d'avion hybride à carburant durable",
      "Le taxi maritime autonome testé sur la Seine"
    ],
    verbs: [
      "assure une liaison régulière sans chauffeur",
      "relie deux métropoles régionales en quinze minutes",
      "permet de livrer des colis lourds sans aucun effort",
      "permet de ravitailler les villages de montagne isolés",
      "vise à diviser par deux le nombre de voitures en ville",
      "transporte des marchandises agricoles sans pollution",
      "alimente en électricité l'éclairage public du quartier",
      "permet un plein d'énergie propre en trois minutes",
      "réduit les rejets nocifs de gaz à effet de serre de 80%",
      "sécurise les déplacements quotidiens des cyclistes",
      "affiche une efficacité énergétique record de 95%",
      "transporte des passagers de rive en rive sans bruit"
    ],
    complements: [
      "entre les centres d'affaires de Lyon et de Saint-Étienne",
      "sur la ligne expérimentale du Nord de la France",
      "dans l'ensemble de la métropole de Strasbourg",
      "au cœur des massifs escarpés de l'Isère",
      "sur toutes les autoroutes de la région parisienne",
      "sur les cours d'eau navigables d'Île-de-France",
      "lors des chantiers d'aménagement routier du Sud",
      "à proximité de l'aéroport d'Orly à Paris",
      "dans les réseaux de transport urbain de Rennes",
      "sur l'axe routier central de la ville de Marseille",
      "dans les instituts aéronautiques de Toulouse-Blagnac",
      "devant les yeux ébahis des promeneurs à Paris"
    ]
  }
};

// Dynamic summary templates to ensure rich linguistic variety
const SUMMARY_TEMPLATES = [
  (sub: string, cat: string) => `Une avancée majeure en ${cat} s'opère aujourd'hui. L'événement ciblant ${sub.toLowerCase()} suscite un vif enthousiasme parmi les experts de la filière.`,
  (sub: string, cat: string) => `Révolution en vue pour le secteur ${cat} : des développements majeurs concernant ${sub.toLowerCase()} viennent d'être officiellement rendus publics ce matin.`,
  (sub: string, cat: string) => `Dans le cadre de l'actualité de la thématique ${cat}, nous suivons de près l'évolution de ${sub.toLowerCase()}, qui marque un tournant historique majeur.`,
  (sub: string, cat: string) => `Un cap décisif vient d'être franchi avec ${sub.toLowerCase()}. Cette réussite suscite d'ores et déjà d'intenses débats au sein des observateurs de ${cat}.`,
  (sub: string, cat: string) => `La communauté scientifique et publique se penche aujourd'hui sur l'impact de ${sub.toLowerCase()}, un dossier capital pour la discipline ${cat}.`,
  (sub: string, cat: string) => `Analyse approfondie de ${sub.toLowerCase()} : ce projet d'envergure redéfinit totalement le paysage actuel du secteur ${cat}.`
];

// Rich detailed content templates featuring unique quotes, structures and styles
const CONTENT_TEMPLATES = [
  (sub: string, verb: string, comp: string, source: string) => 
    `L'actualité de cette heure est marquée par une évolution remarquable dans le secteur de l'innovation et de l'analyse structurelle.\n\nEn effet, nous apprenons de source sûre que ${sub} ${verb} ${comp}.\n\nCette transition majeure suscite l'enthousiasme général mais soulève également des interrogations cruciales sur la durabilité à long terme de ce déploiement. Les premiers retours mettent en lumière une nette optimisation des processus techniques et opérationnels, permettant une adaptabilité sans précédent face aux exigences de l'ère moderne.\n\nLes équipes sur place partagent des sentiments de immense fierté face aux jalons posés : « Nous franchissons ici un cap décisif. Cette impulsion modifie en profondeur notre approche globale et dessine de toutes nouvelles perspectives d'avenir pour nos partenaires », explique un porte-parole de premier plan interrogé ce matin par la rédaction de ${source}.\n\nPar ailleurs, plusieurs experts universitaires et analystes sectoriels décrivent cet événement comme un cas d'école incontournable. L'alignement stratégique des ressources et des talents marque un tournant, redéfinissant les standards méthodologiques appliqués jusqu'à ce jour dans cette industrie.\n\nLes retombées socio-économiques prévisibles feront l'objet d'une attention accrue dans les mois à venir, les parties prenantes insistant sur l'importance d'une gouvernance rigoureuse et transparente.\n\nCe jalon majeur est d'ores et déjà salué par de nombreux observateurs de la scène internationale comme un succès historique de collaboration territoriale et un modèle d'intégration de pointe.`,
  
  (sub: string, verb: string, comp: string, source: string) => 
    `Une annonce de première importance vient de bousculer positivement l'ensemble de la communauté scientifique et industrielle.\n\nNous apprenons en direct auprès des instances concernées que ${sub} ${verb} ${comp}.\n\nLes réactions positives affluent de toutes parts de l'infrastructure mondiale. Selon la cellule d'analyse stratégique de ${source}, la mise en œuvre de ce projet titanesque a mobilisé d'importantes ressources humaines et des technologies ultra-modernes pendant de très longs mois d'évaluation clinique et technique.\n\n« Les résultats observés sur le terrain valident entièrement nos hypothèses initiales de recherche et ouvrent des fenêtres d'opportunités sans comparaison », se félicite un ingénieur en chef visiblement ému au micro des reporters.\n\nDerrière cette réussite technique se cache également un enjeu de souveraineté crucial pour les institutions européennes. La maîtrise fine des flux et l'indépendance fonctionnelle acquise grâce à ce développement promettent de renforcer la viabilité globale du système face aux géants transatlantiques.\n\nDe plus, des rapports complémentaires soulignent que l'impact environnemental a été drastiquement minimisé, répondant ainsi aux normes d'éco-conception les plus exigeantes et éthiques de l'époque.\n\nLes deux prochaine semaines s'annoncent d'ores et déjà particulièrement chargées et riches en applications concrètes, avec le lancement d'une phase de test à grande échelle dans plusieurs éco-quartiers pilotes.`,

  (sub: string, verb: string, comp: string, source: string) => 
    `C'est un dossier particulièrement complexe, sensible et très attendu par l'opinion publique qui trouve aujourd'hui des conclusions spectaculaires.\n\nLes observateurs présents confirment tous à l'unanimité que ${sub} ${verb} ${comp}.\n\nPour ${source}, ce développement témoigne d'une maturité nouvelle, d'une grande rigueur scientifique et d'un engagement sans précédent de la part des acteurs concernés à tous les échelons de la chaîne décisionnelle.\n\nAu-delà de la prouesse purement opérationnelle, les détails techniques et logistiques révèlent un soin méticuleux apporté aux finitions, à la sécurité des infrastructures critiques et à la parfaite viabilité budgétaire du projet de restructuration.\n\nNéanmoins, certains critiques soulignent que le calendrier initial à marche forcée a pu induire des zones de tension temporaires au sein des équipes opérationnelles, demandant des ajustements de management urgents de dernière minute.\n\nLa direction a réagi en promettant des mesures d'accompagnement social renforcées et un dialogue constant pour pacifier durablement les relations humaines en interne.\n\nPlusieurs importantes réunions publiques et sessions d'information populaire sont d'ores et déjà planifiées pour présenter les détails complets de cette transition au grand public dans les prochains jours.`,

  (sub: string, verb: string, comp: string, source: string) => 
    `La course effrénée vers l'excellence fonctionnelle et technologique franchit un nouveau palier historique et déterminant aujourd'hui.\n\nIl a été officiellement consigné par les régulateurs nationaux que ${sub} ${verb} ${comp}.\n\nLes avis des différents syndicats et observateurs divergent légitimement quant à la rapidité réelle de déploiement de ces mesures, mais le consensus demeure solide : l'initiative d'ampleur impulsée sous la prestigieuse bannière de ${source} est de tout premier ordre.\n\n« Nous n'avions pas vu d'effet de rupture aussi marqué depuis plus d'une décennie dans nos colonnes », commente un journaliste spécialisé. La dynamique générale s'en trouve profondément stimulée et redéployée.\n\nCet engouement se traduit déjà par un afflux de capitaux du secteur privé, attirés par des perspectives durables d'utilité publique flagrante.\n\nÀ cela s'ajoute une dimension académique passionnante avec le dépôt de plus de quinze nouveaux brevets d'invention de pointe liés aux développements de l'ingénierie appliquée.\n\nLa dynamique générale s'en trouve profondément stimulée et les projections annuelles des cabinets d'études ont été revues à la hausse pour le restant de l'exercice budgétaire en cours.`,

  (sub: string, verb: string, comp: string, source: string) => 
    `Un nouveau chapitre passionnant, audacieux et historique s'écrit sous nos yeux ébahis avec cette publication exclusive.\n\nLes récentes données analytiques publiées par les institutions académiques confirment avec une précision chirurgicale que ${sub} ${verb} ${comp}.\n\nCette merveilleuse transition, largement documentée, analysée et expliquée par la rédaction de ${source}, propose enfin des solutions concrètes, viables et éco-responsables aux défis urgents d'approvisionnement, d'ergonomie et de cohésion sociale.\n\nL'adhésion spontanée des usagers de terrain semble massive d'après l'ensemble des premiers baromètres et sondages d'opinion indépendants.\n\n« L'essayer, c'est immédiatement comprendre toute la cohérence organique, la pertinence et les bénéfices de ce changement de paradigme majeur », souligne avec force un responsable d'atelier d'expérience.\n\nLes observateurs prédisent que les retombées directes permettront de revitaliser des bassins d'emplois jusque-là délaissés, insufflant un vent d'espoir bienvenu pour de nombreuses familles s'intéressant à l'avenir.\n\nUn séminaire international réunit de grands dirigeants de tous horizons pour sceller les accords d'exportation de cette technologie révolutionnaire ouest-européenne.`,

  (sub: string, verb: string, comp: string, source: string) => 
    `La surprise est absolument totale pour bon nombre de spécialistes, décideurs et consultants qui suivaient ce dossier sensible avec énormément de scepticisme.\n\nNous venons tout juste d'obtenir la confirmation officielle par voie de communiqué gouvernemental que ${sub} ${verb} ${comp}.\n\nCette incroyable percée stratégique, déjà répertoriée et commentée à chaud par les éditorialistes de ${source}, rebat entièrement les cartes de la compétition industrielle internationale et de la souveraineté numérique.\n\nLes experts interrogés mettent l'accent sur le fait qu'un tel niveau de performance opérationnelle ouvre immédiatement la voie à une multitude d'autres innovations disruptives en cascade à travers le continent.\n\nDe plus, les négociations de coulisse révèlent une alliance inattendue entre divers acteurs économiques qui s'opposaient farouchement il y a à peine quelques trimestres.\n\nLa nécessité d'unir les forces face à la crise globale a visiblement prévalu sur les querelles de clocher privées, ouvrant une ère de paix partagée.\n\nC'est un d'ores et déjà un signal fort et historique envoyé sans ambiguïté tant aux marchés financiers mondiaux qu'aux autorités intergouvernementales pour l'horizon futur.`
];

const SCANDAL_BLUEPRINTS = [
  `Critiques émises quant aux délais d'application jugés trop optimistes de la part de certains partenaires.`,
  `Débats ouverts sur l'impact budgétaire résiduel à moyen terme du projet.`,
  `Certains parlementaires réclament des audits complémentaires quant aux mesures de transparence.`,
  `Quelques tensions initiales signalées lors de la phase préliminaire de mise en conformité.`,
  `Discussions autour de l'harmonisation à grande échelle de cette norme au niveau européen.`,
  `Interrogations locales mineures sur la répartition des compensations géographiques.`
];

/**
 * Procedural seed generation of any article in 100% unique fashion.
 * Returns a high-quality fully French Article structure.
 */
function getDeterministicArticle(hour: number, i: number): Article {
  // Rotate category index based on the hour to ensure completely different 15 categories each hour
  const catIndex = (i + hour) % 15;
  const category = CATEGORY_NAMES[catIndex];
  const source = CATEGORY_SOURCES[catIndex];
  const imgUrl = CATEGORY_IMAGES[catIndex];
  const url = getSourceUrl(source);

  // Deterministic seed indices to combine, varying widely by hour and position
  const bp = BLUEPRINTS[catIndex as keyof typeof BLUEPRINTS] || BLUEPRINTS[0];
  const subIdx = (hour * 7 + i * 3) % 12;
  const verbIdx = (hour * 11 + i * 7 + 2) % 12;
  const compIdx = (hour * 13 + i * 5 + 8) % 12;

  const subject = bp.subjects[subIdx];
  const verb = bp.verbs[verbIdx];
  const complement = bp.complements[compIdx];

  // Beautiful assembled headline
  const title = `${subject} ${verb} ${complement}`;

  // Time stamp
  const min = i * 4;
  const formattedMins = String(min).padStart(2, "0");
  const uniqueTime = `${hour}h${formattedMins}`;

  // Choose a distinct content and summary template based on hour and index
  const templateIdx = (hour + i * 2) % 6;
  const summary = SUMMARY_TEMPLATES[templateIdx](subject, category);
  const content = CONTENT_TEMPLATES[templateIdx](subject, verb, complement, source);

  // Complementary real-time details with high variability
  const successRate = (97.0 + ((hour * 7 + i * 3) % 30) / 10).toFixed(1);
  const efficiencyGain = 20 + ((hour * 9 + i * 11) % 40);
  const results = `Taux de réussite opérationnelle mesuré : ${successRate}%. Gain de performance globale projeté de +${efficiencyGain}%.`;
  
  const cleanComplement = complement.replace(/^(dans le |dans les |au |à l'|à |pour les |pour |auprès de la |auprès des |sur tous les |sur les )/, "");
  const organisation = `${source} Alliance & Groupement de recherche ${category} (${cleanComplement})`;
  
  const scandals = SCANDAL_BLUEPRINTS[(hour * 2 + i * 5) % SCANDAL_BLUEPRINTS.length];

  return {
    id: `hr-${hour}-idx-${i}`,
    category,
    source,
    title,
    time: uniqueTime,
    img: imgUrl,
    summary,
    content,
    results,
    organisation,
    scandals,
    url,
    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(category + " " + title)}`,
    imageIsAiGenerated: false,
    imageLicensingText: "Libre de droits Unsplash"
  };
}

/**
 * Returns exactly 15 articles for any given hour.
 */
export function getArticlesForHour(hour: number): Article[] {
  const results: Article[] = [];
  for (let i = 0; i < 15; i++) {
    results.push(getDeterministicArticle(hour, i));
  }
  return results;
}

/**
 * Returns the short flash update line for top ticker summary
 */
export function getHourlyFlashSummary(hour: number): string {
  const highlights = [
    "Démonstration d'autonomie remarquable sur les réseaux connectés",
    "Transition écologique et industrielle en forte accélération sur les territoires",
    "Expériences artistiques et poétiques immersives saluées par le public",
    "Rigueur et performances historiques de nos jeunes espoirs sportifs",
    "Avancées de calcul quantique ouvrant la voie à la souveraineté numérique",
    "Sondes spatiales révélant les secrets cosmiques les plus lointains",
    "Modernisation territoriale concertée des centres hospitaliers et scolaires"
  ];
  return highlights[hour % highlights.length] + ".";
}
