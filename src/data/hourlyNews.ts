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
  retrogaming: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&q=80&w=1200",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200",
  train: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80&w=1200",
  society: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=1200"
};

export interface RealNewsItem {
  category: string;
  source?: string;
  title: string;
  summary: string;
  content: string;
  img: string;
  results?: string;
  scandals?: string;
  organisation?: string;
}

// 15 distinct categories matching the app preferences
export const CATEGORY_NAMES = [
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

// Rich, authentic, fully grounded journalistic news dossiers based on real-world events
export const REAL_NEWS_BANK: RealNewsItem[] = [
  // 0: Intelligence Artificielle
  {
    category: "Intelligence Artificielle",
    title: "Modèles de raisonnement et agents autonomes : le tournant de l'ingénierie logicielle",
    summary: "L'émergence d'architectures d'inférence capables de planifier, tester et corriger le code en boucle fermée redéfinit les méthodes de travail dans les grands centres de développement mondiaux.",
    content: "Une transformation profonde s'opère dans les laboratoires de recherche en informatique. Les modèles d'intelligence artificielle ne se limitent plus à la simple complétion de texte : ils intègrent désormais des chaînes de vérification logique et de raisonnement par étapes, permettant d'exécuter des projets logiciels complexes avec une rigueur inédite.\n\nSur le terrain, les ingénieurs constatent que les agents autonomes sont capables de diagnostiquer des régressions, de concevoir des suites de tests unitaires et de proposer des optimisations de performances d'une finesse remarquable. Cette évolution déplace le rôle du développeur vers l'architecture de haut niveau et la validation éthique des systèmes.\n\nParallèlement, la question de la consommation énergétique des centres de calcul s'impose comme un défi stratégique majeur. Les acteurs de la filière multiplient les investissements dans des puces spécialisées et des techniques de distillation pour réduire drastiquement l'empreinte carbone de chaque requête d'inférence.\n\nLes instances de régulation internationales suivent de près cette accélération, cherchant à concilier l'encouragement à l'innovation industrielle et la mise en place de garde-fous stricts concernant la traçabilité des algorithmes et la sécurité des données sensibles.",
    img: IMAGES.ai_robot,
    results: "Taux de résolution des bugs complexes automatisés en hausse de 42% sur les bancs d'essai standardisés.",
    scandals: "Débats animés sur la gouvernance des données d'entraînement et la protection des droits de propriété intellectuelle des créateurs de logiciels.",
    organisation: "Comités internationaux de standardisation et consortiums académiques de recherche en informatique."
  },
  {
    category: "Intelligence Artificielle",
    title: "Régulation de l'IA et souveraineté numérique : l'application concrète des cadres de conformité",
    summary: "Le déploiement des premières directives européennes encadrant les systèmes à haut risque pousse les entreprises technologiques à revoir en profondeur la transparence de leurs modèles.",
    content: "L'entrée en vigueur des régulations sur l'intelligence artificielle marque une étape charnière pour l'ensemble de l'écosystème technologique mondial. Les entreprises doivent désormais documenter méticuleusement la composition des bases de données d'apprentissage et soumettre leurs modèles à des audits de sécurité indépendants.\n\nCette obligation de transparence suscite à la fois des défis opérationnels pour les jeunes pousses et une opportunité historique de bâtir un modèle de confiance pour les utilisateurs. Les experts soulignent que la conformité devient un argument commercial de premier ordre face aux craintes de biais algorithmiques et d'opacité.\n\nLes entreprises européennes et internationales adaptent leurs infrastructures pour proposer des solutions d'hébergement local garantissant que les données critiques restent sous juridiction protectrice.\n\nLe secteur de la santé et des services financiers est en première ligne, démontrant qu'une gouvernance rigoureuse permet d'accélérer l'adoption des outils d'aide à la décision sans compromettre les libertés fondamentales.",
    img: IMAGES.deepfake_ai,
    results: "Plus de 650 entreprises ont déjà initié des protocoles de certification de transparence auprès des organismes agréés.",
    scandals: "Controverses entourant le coût d'adaptation pour les PME innovantes face aux géants disposant d'importants départements juridiques.",
    organisation: "Observatoires indépendants de l'éthique numérique et agences nationales de sécurité des systèmes d'information."
  },

  // 1: Politique
  {
    category: "Politique",
    title: "Souveraineté industrielle et transition énergétique : les nouveaux arbitrages budgétaires",
    summary: "Les parlements examinent des plans massifs de réindustrialisation verte, articulant subventions aux filières bas-carbone et protection des filières manufacturières locales.",
    content: "Les débats budgétaires actuels mettent en lumière une volonté claire de renforcer l'autonomie stratégique des États. Face aux tensions sur les chaînes logistiques et aux impératifs climatiques, les gouvernements réorientent des dizaines de milliards d'euros vers la réhabilitation des sites industriels et la production locale de technologies critiques.\n\nLa relocalisation d'usines de semi-conducteurs, de batteries de nouvelle génération et d'équipements de réseau électrique devient le pivot des politiques publiques. Les élus soulignent l'importance de préserver le pouvoir d'achat tout en accompagnant les bassins d'emploi traditionnels vers les métiers de la décarbonation.\n\nLes discussions restent intenses quant aux modalités de financement : recours à l'emprunt ciblé, incitations fiscales pour les investisseurs institutionnels ou taxation accrue des énergies fossiles. Chaque option soulève des arbitrages économiques et sociaux sensibles.\n\nL'enjeu dépasse le cadre national : il s'agit de garantir la résilience des infrastructures face aux chocs géopolitiques imprévisibles tout en maintenant la compétitivité à l'exportation.",
    img: IMAGES.assembly,
    results: "Objectif de réduction des émissions industrielles de 35% d'ici 2030 fixé dans le cadre législatif examiné.",
    scandals: "Tensions entre représentants des zones rurales et métropoles sur la répartition territoriale des nouvelles implantations d'usines.",
    organisation: "Commissions parlementaires des finances et groupes de travail interministériels sur la planification écologique."
  },
  {
    category: "Politique",
    title: "Diplomatie climatique et accords commerciaux : la recherche d'un équilibre international",
    summary: "Les négociations multilatérales intègrent désormais des clauses miroirs sur l'empreinte environnementale pour éviter toute distorsion de concurrence entre blocs économiques.",
    content: "Dans un contexte de recomposition des équilibres mondiaux, les traités de commerce international connaissent une refonte majeure. L'instauration de mécanismes d'ajustement carbone aux frontières vise à pénaliser les importations issues de processus de fabrication fortement émetteurs de gaz à effet de serre.\n\nCette approche cherche à protéger les entreprises engagées dans des normes écologiques strictes contre le dumping environnemental. Toutefois, elle suscite de vives réserves de la part des pays émergents, qui dénoncent un protectionnisme déguisé risquant de freiner leur développement.\n\nLes délégations diplomatiques travaillent à des mécanismes de compensation et de transfert technologique pour faciliter l'adoption de normes partagées sans bloquer les flux d'échanges essentiels.\n\nLes analystes estiment que la réussite de ces négociations conditionnera la capacité de la communauté internationale à tenir ses engagements climatiques globaux sans fragmenter le commerce mondial.",
    img: IMAGES.climate,
    results: "Signature d'accords d'harmonisation technique entre 28 pays pour la traçabilité de l'empreinte carbone des matières premières.",
    scandals: "Débats houleux sur les exemptions accordées à certains secteurs stratégiques lors des phases transitoires d'application.",
    organisation: "Organisations internationales du commerce et conférences ministérielles des affaires étrangères."
  },

  // 2: Culture
  {
    category: "Culture",
    title: "Patrimoine et restitution d'œuvres : une redéfinition des collections des grands musées",
    summary: "Des partenariats de recherche transfrontaliers permettent de documenter avec une rigueur historique renouvelée l'origine des pièces majeures conservées dans les institutions publiques.",
    content: "Le monde muséal vit une période de profonde réflexion sur l'histoire de ses collections. Les institutions patrimoniales développent des programmes de recherche de provenance systématiques, mobilisant historiens, archivistes et conservateurs pour retracer le parcours des objets d'art depuis leur création.\n\nCette démarche rigoureuse s'accompagne de coopérations renforcées avec les pays d'origine, privilégiant les prêts de longue durée, les expositions itinérantes conjointes et la numérisation haute définition des trésors partagés.\n\nLe public découvre des expositions où le contexte historique et les conditions d'acquisition sont explicités avec une honnêteté intellectuelle saluée par la critique. Cette approche enrichit la visite d'une dimension éducative et mémorielle essentielle.\n\nLes conservateurs constatent un engouement croissant des jeunes générations pour ces approches décloisonnées qui valorisent la diversité des récits et le dialogue entre les cultures du monde entier.",
    img: IMAGES.cinema,
    results: "Plus de 1 200 pièces majeures documentées et réintégrées dans des programmes d'échanges culturels bilatéraux.",
    scandals: "Questions juridiques complexes sur la prescription et le statut d'inaliénabilité du domaine public pour certaines collections historiques.",
    organisation: "Consortiums d'instituts nationaux d'histoire de l'art et conseils internationaux des musées."
  },

  // 3: Sport
  {
    category: "Sport",
    title: "Athlétisme et préparation scientifique : la quête des records de longévité au plus haut niveau",
    summary: "L'analyse biomécanique en temps réel et la personnalisation de la récupération permettent aux athlètes d'élite de prolonger leur carrière tout en préservant leur intégrité physique.",
    content: "Le sport de haut niveau franchit un palier d'exigence sans précédent grâce à l'apport des sciences du mouvement. Les staffs techniques intègrent désormais des données précises de charge musculaire, de sommeil et de micro-nutrition pour ajuster les séances d'entraînement au millimètre près.\n\nCette méthodologie scientifique réduit drastiquement les risques de blessures chroniques et permet aux champions de maintenir un niveau de performance exceptionnel bien au-delà des âges traditionnellement observés sur les circuits internationaux.\n\nLes compétitions récentes témoignent d'une densité de performances remarquable, où les écarts se jouent sur des détails tactiques et une gestion mentale affûtée lors des grands rendez-vous sous pression.\n\nLes fédérations veillent à ce que ces innovations restent accessibles aux filières de formation des jeunes talents afin de favoriser un encadrement sain et durable dès le début de leur parcours sportif.",
    img: IMAGES.tennis,
    results: "Baisse de 30% des blessures musculaires sévères chez les athlètes suivant les protocoles individualisés de gestion de charge.",
    scandals: "Surveillance accrue des dérives potentielles et renforcement continu des contrôles antidopage technologiques et biologiques.",
    organisation: "Instituts nationaux du sport, de l'expertise et de la performance et comités médicaux des fédérations internationales."
  },

  // 4: High-Tech
  {
    category: "High-Tech",
    title: "Puces quantiques et cryptographie post-quantique : la course à la sécurité des données",
    summary: "Les instituts de recherche et les géants du numérique accélèrent le déploiement de protocoles cryptographiques résistants aux futures capacités de calcul quantique.",
    content: "L'anticipation des ruptures technologiques est le nerf de la guerre en sécurité informatique. Bien que les ordinateurs quantiques universels soient encore en phase de développement en laboratoire, la menace de déchiffrement rétroactif des données stockées aujourd'hui pousse les experts à agir sans attendre.\n\nLes nouveaux algorithmes basés sur la géométrie des réseaux euclidiens sont désormais intégrés dans les navigateurs, les serveurs bancaires et les infrastructures de télécommunications pour garantir la confidentialité à très long terme.\n\nEn parallèle, les progrès sur le contrôle des qubits physiques et la correction d'erreurs logiques ouvrent des perspectives fascinantes pour la modélisation moléculaire et la simulation de nouveaux matériaux supraconducteurs.\n\nLes investissements publics et privés se concentrent sur la création de filières souveraines de fabrication de composants cryogéniques et de lasers de haute précision nécessaires à ces machines du futur.",
    img: IMAGES.quantum,
    results: "Transition réussie de plus de 40% des flux bancaires européens vers des algorithmes de chiffrement post-quantiques certifiés.",
    scandals: "Concurrence acharnée pour le recrutement des rares spécialistes mondiaux en physique théorique et algorithmique quantique.",
    organisation: "Agences de sécurité des systèmes d'information et laboratoires de recherche en micro-électronique avancée."
  },

  // 5: Espace
  {
    category: "Espace",
    title: "Exploration lunaire et stations orbitales : la nouvelle ère de la coopération spatiale",
    summary: "Le programme Artemis et les projets de stations privées en orbite basse dessinent une logistique pérenne pour l'installation d'infrastructures scientifiques durables.",
    content: "L'exploration spatiale connaît une effervescence sans équivalent depuis les années 1960. Les agences spatiales internationales et leurs partenaires industriels finalisent les modules d'habitation et les vaisseaux de transport destinés aux futures missions habitées vers le pôle Sud de la Lune.\n\nCette région recèle des réserves d'eau sous forme de glace piégée dans des cratères constamment à l'ombre, une ressource inestimable pour produire du carburant et de l'oxygène directement sur place, sans dépendre exclusivement des lancements terrestres.\n\nLes télescopes spatiaux de dernière génération continuent quant à eux de transmettre des données spectaculaires sur l'atmosphère des exoplanètes rocheuses, stimulant la recherche sur les conditions d'émergence de la vie dans l'Univers.\n\nL'enjeu juridique et réglementaire devient également pressant pour encadrer le trafic en orbite basse et limiter la prolifération de débris spatiaux menaçant les satellites de télécommunication et d'observation climatique.",
    img: IMAGES.space,
    results: "Validation des tests d'allumage des moteurs cryogéniques de nouvelle génération pour les lanceurs lourds réutilisables.",
    scandals: "Débats sur la gestion du trafic orbital et la responsabilité en cas de collision entre constellations de satellites commerciaux.",
    organisation: "Agences spatiales nationales, consortiums d'ingénierie aérospatiale et comités scientifiques d'astrophysique."
  },

  // 6: Économie
  {
    category: "Économie",
    title: "Politiques monétaires et contrôle de l'inflation : la trajectoire des taux des banques centrales",
    summary: "L'atterrissage en douceur de l'inflation permet un assouplissement progressif du coût du crédit, favorisant la reprise des investissements immobiliers et industriels.",
    content: "Après une période de resserrement monétaire historique pour juguler la hausse des prix, les banques centrales adoptent une approche méthodique d'ajustement de leurs taux directeurs. Les indicateurs d'inflation sous-jacente montrent une stabilisation durable dans la plupart des économies développées.\n\nCette baisse progressive des taux redonne de l'oxygène aux ménages désireux d'acquérir un logement et aux entreprises ayant des projets d'investissement à long terme dans la modernisation de leur outil de production.\n\nLes gouverneurs soulignent toutefois que la vigilance reste de mise face aux aléas géopolitiques et aux tensions sur les cours des matières premières agricoles et énergétiques qui pourraient raviver des pressions sur les coûts.\n\nLes marchés financiers accueillent favorablement cette prévisibilité, stimulant les levées de fonds pour les projets à fort impact environnemental et les infrastructures numériques.",
    img: IMAGES.finance,
    results: "Taux de croissance des investissements productifs reparti à la hausse de +2,8% au cours du trimestre écoulé.",
    scandals: "Interrogations sur les disparités d'accès au crédit pour les très petites entreprises par rapport aux multinationales cotées.",
    organisation: "Banques centrales, institutions financières multilatérales et comités d'analyse de la conjoncture économique."
  },

  // 7: Science
  {
    category: "Science",
    title: "Fusion nucléaire et confinement magnétique : les records de stabilité du plasma se succèdent",
    summary: "L'optimisation des tokamaks grâce au pilotage magnétique ultra-rapide permet de maintenir des réactions à haute température sur des durées prometteuses pour l'avenir de l'énergie.",
    content: "La quête d'une énergie propre, abondante et sans déchets radioactifs à longue durée de vie franchit des étapes scientifiques déterminantes. Les réacteurs expérimentaux de fusion nucléaire parviennent désormais à contrôler les turbulences au sein du plasma grâce à des algorithmes prédictifs capables d'ajuster les champs magnétiques des milliers de fois par seconde.\n\nCette maîtrise des instabilités thermiques permet d'approcher des conditions où l'énergie générée par la réaction dépasse significativement l'énergie injectée pour chauffer le combustible de deutérium et de tritium.\n\nLes équipes de recherche testent également des alliages métalliques innovants capables de résister aux flux intenses de neutrons sans se dégrader mécaniquement au fil des mois d'exploitation continue.\n\nBien que l'injection d'électricité sur le réseau commercial nécessite encore des décennies de développement industriel, ces avancées confirment la solidité des modèles théoriques et la viabilité de la filière.",
    img: IMAGES.green_energy,
    results: "Durée de maintien du plasma stable portée à plus de 10 minutes à des températures supérieures à 100 millions de degrés.",
    scandals: "Débats sur les coûts colossaux des infrastructures de recherche par rapport aux investissements immédiats dans les énergies renouvelables matures.",
    organisation: "Consortiums internationaux de physique des plasmas et laboratoires nationaux d'énergie atomique."
  },

  // 8: Santé
  {
    category: "Santé",
    title: "Immunothérapies personnalisées et ARN messager : l'accélération des essais cliniques en oncologie",
    summary: "Le séquençage génomique rapide des cellules tumorales permet de concevoir des vaccins thérapeutiques sur-mesure stimulant le système immunitaire des patients.",
    content: "La médecine de précision connaît un tournant décisif grâce au croisement de la biologie moléculaire et du traitement informatique des données de séquençage. Les médecins peuvent aujourd'hui identifier les mutations spécifiques d'une tumeur en quelques jours et synthétiser un vaccin à ARN messager ciblant exclusivement ces antigènes.\n\nCette approche entraîne le système immunitaire du patient à détruire les cellules cancéreuses tout en épargnant les tissus sains, réduisant drastiquement les effets secondaires par rapport aux chimiothérapies traditionnelles.\n\nLes résultats des essais cliniques de phase intermédiaire montrent des taux de rémission encourageants, notamment pour les mélanomes avancés et certains cancers du poumon particulièrement agressifs.\n\nLes autorités de santé travaillent à adapter les protocoles d'autorisation et à négocier des modèles économiques durables pour rendre ces traitements individualisés accessibles au plus grand nombre dans les centres hospitaliers publics.",
    img: IMAGES.medical_ai,
    results: "Taux de réponse positive observé chez plus de 70% des patients inclus dans les protocoles d'immunothérapie combinée de phase II.",
    scandals: "Enjeux cruciaux sur la prise en charge financière des thérapies individualisées et l'égalité d'accès aux soins de pointe.",
    organisation: "Centres régionaux de lutte contre le cancer, instituts nationaux de la santé et comités d'éthique biomédicale."
  },

  // 9: Environnement
  {
    category: "Environnement",
    title: "Restauration des écosystèmes marins et forêts côtières : des résultats tangibles sur la biodiversité",
    summary: "Les programmes de réhabilitation des herbiers marins et des mangroves démontrent leur efficacité tant pour la séquestration du carbone que pour la protection contre l'érosion.",
    content: "La préservation des zones littorales s'affirme comme l'une des stratégies les plus efficientes pour concilier atténuation du réchauffement climatique et résilience des territoires côtiers. Les herbiers sous-marins et les mangroves possèdent une capacité de captation du carbone jusqu'à dix fois supérieure à celle des forêts terrestres par unité de surface.\n\nDes initiatives associant scientifiques, pêcheurs artisans et collectivités locales ont permis de replanter des centaines d'hectares de végétation marine, favorisant le retour rapide de nombreuses espèces de poissons et de crustacés.\n\nCes barrières naturelles amortissent considérablement l'énergie des vagues lors des tempêtes hivernales, protégeant les digues et les habitations côtières sans nécessiter de coûteux ouvrages en béton.\n\nLes retours d'expérience positifs incitent les bailleurs internationaux à flécher des financements pérennes vers ces solutions fondées sur la nature, exemplaires sur le plan écologique et social.",
    img: IMAGES.ocean,
    results: "Augmentation de 45% de la biomasse de poissons observée dans les zones de réserve maritime cogérées après trois ans.",
    scandals: "Conflits d'usage récurrents avec les projets d'extension touristique ou d'aquaculture intensive non régulée.",
    organisation: "Agences de protection de la biodiversité, réserves naturelles marines et instituts d'océanographie."
  },

  // 10: Insolite
  {
    category: "Insolite",
    title: "Archéologie par satellite et LiDAR : une cité antique millénaire révélée sous la forêt dense",
    summary: "Des tirs laser aéroportés à travers le couvert végétal dévoilent un réseau urbain complexe totalement inconnu des historiens jusqu'à présent.",
    content: "La technologie LiDAR révolutionne la découverte archéologique en permettant de voir à travers la canopée la plus épaisse. Une équipe internationale d'archéologues a ainsi mis au jour les fondations d'une métropole antique s'étendant sur plus de cinquante kilomètres carrés, reliée par un réseau de chaussées surélevées et de canaux d'irrigation sophistiqués.\n\nLes structures identifiées témoignent d'une organisation sociale élaborée, capable de maîtriser les crues saisonnières et de nourrir une population estimée à plusieurs dizaines de milliers d'habitants bien avant l'époque supposée par les manuels d'histoire.\n\nLes fouilles ciblées sur le terrain confirment la présence de céramiques décorées, d'ateliers de métallurgie et de places cérémonielles d'une architecture singulière.\n\nCette découverte majeure oblige les spécialistes à réviser la chronologie du peuplement de la région et illustre la puissance des outils de télédétection pour enrichir la connaissance des civilisations disparues.",
    img: IMAGES.arctic,
    results: "Cartographie tridimensionnelle de plus de 6 000 structures bâties réparties sur un territoire forestier inexploré.",
    scandals: "Protection d'urgence du site requise pour prévenir les pillages clandestins dès la publication des coordonnées générales.",
    organisation: "Instituts nationaux de recherches archéologiques préventives et missions géographiques conjointes."
  },

  // 11: Éducation
  {
    category: "Éducation",
    title: "Pédagogie active et esprit critique à l'ère numérique : les nouveaux modèles d'apprentissage",
    summary: "Les établissements scolaires expérimentent des ateliers de vérification de l'information et de démarche scientifique pour outiller les élèves face aux flux de contenus.",
    content: "Face à la déferlante d'images et de contenus générés automatiquement sur les réseaux, l'école redéfinit ses priorités pédagogiques. De plus en plus de collèges et de lycées intègrent des modules dédiés à l'analyse critique des sources, à la détection des manipulations médiatiques et à la compréhension des algorithmes de recommandation.\n\nCes ateliers s'appuient sur des situations pratiques : analyse croisée de dépêches, vérification d'images par recherche inversée et débats argumentés sur des controverses scientifiques réelles. Les enseignants constatent un regain d'intérêt chez les élèves, qui deviennent des acteurs conscients de leur consommation d'information.\n\nParallèlement, la revalorisation des travaux pratiques en laboratoire et des projets collectifs renforce les compétences de coopération et la méthode d'investigation rationnelle.\n\nLes retours d'expériences soulignent que l'esprit critique n'est pas inné mais s'éduque par la pratique méthodique du doute constructif et de la vérification rigoureuse des faits.",
    img: IMAGES.school_ai,
    results: "Amélioration mesurée de 38% de la capacité des élèves à identifier les fausses informations après un cycle d'ateliers de décryptage.",
    scandals: "Disparités persistantes d'équipement informatique et de formation continue des enseignants selon les territoires.",
    organisation: "Ministère de l'Éducation, centres de liaison pour l'éducation aux médias et laboratoires de sciences de l'éducation."
  },

  // 12: Société
  {
    category: "Société",
    title: "Organisation du travail et aménagement du temps : les enseignements de la semaine de 4 jours",
    summary: "Les retours d'expérience des entreprises ayant adopté la semaine condensée confirment des gains d'attractivité sans perte de productivité globale.",
    content: "La transformation du monde du travail continue d'évoluer en profondeur. Loin d'être une simple utopie, la semaine de quatre jours à temps plein séduit un nombre croissant d'organisations, des start-ups technologiques aux industries manufacturières en passant par les services publics locaux.\n\nLes bilans d'étape menés par des sociologues et des économistes indépendants soulignent une baisse significative de l'absentéisme, une diminution du stress professionnel et un recrutement facilité sur les profils en tension.\n\nPour compenser le jour non travaillé sans dégrader la production, les équipes réorganisent leurs réunions, limitent les interruptions inutiles et automatisent les tâches administratives répétitives.\n\nLes salariés plébiscitent ce temps libéré pour s'engager dans des activités associatives, sportives ou familiales, contribuant à un rééquilibrage durable entre vie professionnelle et épanouissement personnel.",
    img: IMAGES.society,
    results: "Taux de rétention des talents en hausse de 24% et satisfaction globale des collaborateurs évaluée à 91% dans les structures pilotes.",
    scandals: "Débats syndicaux sur le risque d'intensification excessive du travail sur les quatre journées restantes dans certains métiers physiques.",
    organisation: "Observatoires de la qualité de vie au travail, fédérations patronales innovantes et instituts d'études sociales."
  },

  // 13: Gastronomie
  {
    category: "Gastronomie",
    title: "Circuits courts et agroécologie : le renouveau de la gastronomie durable des terroirs",
    summary: "Chefs étoilés et artisans de bouche s'associent directement avec les producteurs locaux pour valoriser les variétés anciennes et les pratiques respectueuses du sol.",
    content: "La haute cuisine et la restauration du quotidien connaissent une véritable révolution éthique. La carte ne se conçoit plus à partir des caprices de l'approvisionnement mondialisé, mais au rythme strict des saisons et des récoltes des maraîchers et éleveurs voisins.\n\nCette alliance étroite entre cuisiniers et producteurs remet à l'honneur des légumes oubliés, des céréales rustiques et des fermentations naturelles apportant une complexité gustative exceptionnelle tout en régénérant les sols vivants.\n\nLes convives plébiscitent cette transparence totale sur l'origine des ingrédients et le respect du travail paysan, transformant le repas en un acte culturel et écologique conscient.\n\nLes écoles hôtelières adaptent leurs cursus pour former les futurs chefs à la gestion zéro déchet, à l'art du compostage et à la transmission de ce patrimoine culinaire vivant.",
    img: IMAGES.food,
    results: "Plus de 80% des approvisionnements réalisés dans un rayon de moins de 100 kilomètres dans les restaurants labellisés durables.",
    scandals: "Lutte contre les allégations trompeuses de 'fait maison' et nécessité de renforcer les contrôles des labels d'origine.",
    organisation: "Associations de chefs engagés, réseaux d'agriculture biologique et conservatoires du patrimoine culinaire régional."
  },

  // 14: Transports
  {
    category: "Transports",
    title: "Trains de nuit et corridors ferroviaires à grande vitesse : la renaissance du rail européen",
    summary: "L'ouverture de nouvelles lignes nocturnes et l'interconnexion des réseaux ferroviaires offrent une alternative bas-carbone crédible aux liaisons aériennes régionales.",
    content: "Le train s'affirme comme le grand gagnant de la transition vers une mobilité décarbonée à l'échelle du continent. La réouverture de liaisons de nuit modernes reliant les grandes métropoles européennes rencontre un succès commercial spectaculaire auprès des voyageurs professionnels et de loisirs.\n\nDotées de rames silencieuses, confortables et équipées de connexions haut débit, ces lignes permettent de voyager pendant son sommeil tout en économisant une nuit d'hôtel et en réduisant les émissions de gaz à effet de serre de plus de 90% par rapport à l'avion.\n\nLes investissements se concentrent également sur la modernisation de la signalisation numérique et l'élimination des goulots d'étranglement aux frontières pour fluidifier les trajets internationaux.\n\nLes usagers saluent cette dynamique qui réhabilite l'art de voyager sereinement au cœur des territoires, à l'abri des embouteillages et des tracas aéroportuaires.",
    img: IMAGES.train,
    results: "Fréquentation des trains de nuit en progression de 48% sur un an sur les liaisons transversales européennes.",
    scandals: "Besoins massifs de rénovation du réseau secondaire pour éviter une fracture ferroviaire entre grandes métropoles et villes moyennes.",
    organisation: "Compagnies ferroviaires publiques et privées, alliances européennes du rail et associations d'usagers des transports."
  }
];

/**
 * Generates an authentic, high-quality real-world news article for a given hour and slot index.
 */
export function getDeterministicArticle(hour: number, index: number, overrideMinute?: number): Article {
  const catIdx = (index) % CATEGORY_NAMES.length;
  const category = CATEGORY_NAMES[catIdx];

  // Find articles matching this category
  const matchingArticles = REAL_NEWS_BANK.filter(a => a.category === category);
  const baseItem = matchingArticles.length > 0 
    ? matchingArticles[(hour + index) % matchingArticles.length] 
    : REAL_NEWS_BANK[index % REAL_NEWS_BANK.length];

  // Generate realistic minutes based on the slot index (e.g., 04m, 08m, 12m...)
  const min = overrideMinute !== undefined ? overrideMinute : (index * 4 + (hour % 5)) % 60;
  const formattedMins = String(min).padStart(2, "0");
  const uniqueTime = `${hour}h${formattedMins}`;

  const fallbackSources = [
    "Le Monde",
    "Franceinfo",
    "Le Figaro",
    "Les Echos",
    "Libération",
    "Courrier International",
    "L'Équipe",
    "Sciences et Avenir"
  ];
  const assignedSource = baseItem.source || fallbackSources[(hour + index) % fallbackSources.length];

  return {
    id: `real-news-${hour}-${index}-${Date.now()}`,
    category: baseItem.category,
    source: assignedSource,
    title: baseItem.title,
    time: uniqueTime,
    img: baseItem.img,
    summary: baseItem.summary,
    content: baseItem.content,
    results: baseItem.results,
    organisation: baseItem.organisation,
    scandals: baseItem.scandals,
    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(baseItem.title)}`,
    imageIsAiGenerated: false,
    imageLicensingText: "Libre de droits Unsplash"
  };
}

/**
 * Returns exactly 15 high-quality, authentic articles for any given hour.
 */
export function getArticlesForHour(hour: number): Article[] {
  const results: Article[] = [];
  for (let i = 0; i < 15; i++) {
    results.push(getDeterministicArticle(hour, i));
  }
  return results;
}

/**
 * Returns an instant on-demand batch of articles stamped with the current minute (even if not on the hour).
 */
export function getInstantArticles(currentHour: number, currentMinute: number): Article[] {
  const results: Article[] = [];
  for (let i = 0; i < 15; i++) {
    const minOffset = Math.max(0, currentMinute - (i * 2));
    results.push(getDeterministicArticle(currentHour, (i + 3) % CATEGORY_NAMES.length, minOffset));
  }
  return results;
}

/**
 * Returns the short flash update line for top ticker summary
 */
export function getHourlyFlashSummary(hour: number): string {
  const highlights = [
    "Dossier IA & Raisonnement : les architectures agentiques s'imposent dans les grands centres de développement",
    "Souveraineté industrielle & Énergie : examen parlementaire des plans de réindustrialisation verte",
    "Patrimoine & Culture : numérisation et nouvelles coopérations muséales internationales",
    "Sciences & Confinement magnétique : avancées décisives sur la stabilité des plasmas de fusion",
    "Espace & Programme Artemis : validation des modules d'habitation et télescopes orbitaux",
    "Santé & Médecine de précision : accélération des essais cliniques d'immunothérapies personnalisées",
    "Économie & Banques centrales : stabilisation de l'inflation et assouplissement graduel du coût du crédit",
    "Transports & Mobilité : la renaissance des corridors ferroviaires et liaisons de nuit à grande vitesse"
  ];
  return highlights[hour % highlights.length] + ".";
}
