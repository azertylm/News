import { Article } from "../types";

export const ALL_CATEGORIES = [
  "IA",
  "Tech",
  "Politique",
  "Espace",
  "Sport",
  "Science",
  "Économie",
  "Culture",
  "Santé",
  "Environnement"
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: "mock-ai-1",
    category: "IA",
    source: "Le Monde",
    title: "L'émergence des modèles d'inférence avec raisonnement pas-à-pas",
    time: "14h",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600",
    summary: "Les nouvelles architectures d'intelligence artificielle intègrent des chaînes de pensée dynamiques permettant de résoudre des problèmes mathématiques et d'ingénierie logicielle d'une haute complexité.",
    content: "Une étape majeure vient d'être franchie dans le domaine des technologies d'apprentissage profond. Contrairement aux générations précédentes de grands modèles linguistiques qui produisaient des réponses directes par probabilité statistique, les récents systèmes de raisonnement s'accordent un temps de calcul interne avant de délivrer leur conclusion.\n\nCe processus d'auto-correction et d'exploration par arborescence permet de détecter les erreurs de logique en amont et de vérifier la cohérence de chaque étape du raisonnement. Dans le secteur du développement logiciel, les taux de réussite sur la correction de bugs complexes et l'optimisation d'algorithmes ont bondi de manière spectaculaire.\n\nLes chercheurs soulignent que cette approche démultiplie l'efficacité des agents autonomes, capables de mener des analyses pluridisciplinaires, de synthétiser des corpus scientifiques denses et d'assister les ingénieurs dans la conception de solutions logicielles critiques.\n\nLes entreprises technologiques orientent désormais leurs investissements vers l'optimisation matérielle de ces phases d'inférence, cherchant à concilier puissance d'analyse et sobriété énergétique des infrastructures de calcul.",
    results: "Gain d'exactitude mesuré supérieur à 40% sur les benchmarks internationaux de programmation et de mathématiques avancées.",
    scandals: "Débats continus sur la transparence des étapes de réflexion interne et la protection des données propriétaires utilisées lors des vérifications.",
    organisation: "Laboratoires internationaux de recherche en intelligence artificielle et consortiums universitaires."
  },
  {
    id: "mock-pol-1",
    category: "Politique",
    source: "Franceinfo",
    title: "Souveraineté industrielle et transition énergétique : les arbitrages des nouveaux plans budgétaires",
    time: "13h",
    img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=600",
    summary: "Les parlements examinent des programmes d'investissement massifs pour relocaliser les filières critiques de semi-conducteurs, de batteries et d'équipements de décarbonation.",
    content: "Dans un contexte international marqué par la réorganisation des flux d'échanges, les politiques publiques placent l'autonomie stratégique au cœur de leurs priorités. Les projets de lois de finances allouent des enveloppes substantielles à la modernisation des outils industriels et à la formation aux nouveaux métiers techniques.\n\nL'objectif est d'assurer la résilience des chaînes d'approvisionnement tout en atteignant les objectifs de réduction des émissions de gaz à effet de serre. Les nouvelles installations d'usines bénéficient d'incitations fiscales conditionnées au respect de critères environnementaux stricts et à l'embauche locale.\n\nLes concertations entre acteurs publics et industriels s'intensifient pour garantir un maillage territorial équilibré et revitaliser les bassins d'emploi traditionnels sans créer de disparités régionales.\n\nLes observateurs soulignent la nécessité de pérenniser ces efforts sur le temps long pour consolider une industrie souveraine, agile et compétitive sur la scène mondiale.",
    results: "Plus de 15 milliards d'euros engagés sur les filières prioritaires de décarbonation et de composants stratégiques.",
    scandals: "Négociations serrées sur le partage des coûts d'adaptation entre les grands groupes industriels et les budgets publics.",
    organisation: "Commissions parlementaires des finances et agences de transition écologique."
  },
  {
    id: "mock-space-1",
    category: "Espace",
    source: "Sciences et Avenir",
    title: "Le programme lunaire international prépare les modules d'habitation du pôle Sud",
    time: "11h",
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
    summary: "Les agences spatiales et leurs partenaires technologiques finalisent les tests des systèmes de survie en boucle fermée pour l'installation d'une base scientifique permanente sur la Lune.",
    content: "L'exploration lunaire habitée entre dans une phase opérationnelle concrète. Les missions préparatoires se concentrent sur la région du pôle Sud lunaire, où les cratères perpétuellement ombragés renferment d'importantes réserves de glace d'eau.\n\nCette ressource est indispensable pour la production d'oxygène respirable et d'hydrogène destiné à alimenter les propulseurs des vaisseaux d'exploration lointaine, ouvrant la voie à des séjours scientifiques de longue durée.\n\nLes ingénieurs valident les boucliers anti-radiations, les sas étanches et les générateurs d'énergie solaire montés sur des mâts élevés pour capter la lumière rasante des sommets lunaires.\n\nCette collaboration scientifique internationale pose les fondations logistiques indispensables pour les futures missions d'exploration vers Mars.",
    results: "Validation réussie des tests d'étanchéité et de recyclage d'air sur les prototypes de modules en environnement simulé.",
    scandals: "Questions ouvertes sur le cadre juridique international d'utilisation et de protection des ressources spatiales partagées.",
    organisation: "Agences spatiales internationales et comités de recherche astrophysique."
  },
  {
    id: "mock-sport-1",
    category: "Sport",
    source: "L'Équipe",
    title: "Science de la récupération et longévité : la révolution de la préparation des athlètes d'élite",
    time: "10h",
    img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=600",
    summary: "Grâce aux analyses biomécaniques et au suivi nutritionnel individualisé, les champions modernes repoussent les limites de la régularité et de la longévité en compétition.",
    content: "Le sport de haut niveau connaît une transformation profonde sous l'impulsion des sciences appliquées. Les préparateurs physiques et médecins du sport s'appuient désormais sur des mesures de charge musculaire en temps réel pour ajuster les charges d'entraînement et prévenir les blessures d'usure.\n\nCette méthodologie permet aux athlètes de conserver une explosivité et une lucidité tactique optimales tout au long de saisons particulièrement chargées sur les circuits internationaux.\n\nLes compétitions de tennis, d'athlétisme et de cyclisme témoignent de performances exceptionnelles portées par une gestion intelligente des temps de repos et de la préparation mentale sous haute pression.\n\nLes académies de jeunes talents adoptent progressivement ces protocoles pour favoriser une progression saine et durable dès les premières années de pratique.",
    results: "Diminution de 35% des indisponibilités pour blessures musculaires au sein des effectifs appliquant le suivi individualisé.",
    scandals: "Vigilance constante et renforcement des contrôles pour prévenir toute dérive médicale ou technologique non autorisée.",
    organisation: "Instituts du sport de haute performance et comités médicaux des fédérations sportives internationales."
  },
  {
    id: "mock-science-1",
    category: "Science",
    source: "Franceinfo",
    title: "Fusion nucléaire : le pilotage magnétique ultra-rapide stabilise le plasma record",
    time: "9h",
    img: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=600",
    summary: "Des réacteurs de recherche parviennent à juguler les turbulences au cœur des tokamaks grâce à des algorithmes de contrôle en temps réel, franchissant un jalon pour l'énergie propre.",
    content: "La recherche sur la fusion par confinement magnétique progresse à grands pas vers la production d'énergie continue et décarbonée. En ajustant les champs magnétiques des milliers de fois par seconde, les scientifiques parviennent à maintenir un plasma de deutérium à plus de 100 millions de degrés sans contact avec les parois du réacteur.\n\nCette stabilité inédite permet de prolonger les durées de réaction et d'étudier le comportement des matériaux face aux flux intenses de neutrons issus de la fusion des noyaux atomiques.\n\nLes données recueillies consolident les plans d'ingénierie des futurs prototypes industriels destinés à démontrer la rentabilité énergétique globale de cette filière.\n\nLes chercheurs saluent une avancée majeure qui valide des décennies d'efforts théoriques et expérimentaux en physique fondamentale des hautes énergies.",
    results: "Durée de stabilité du plasma portée à plus de 10 minutes consécutives sur les bancs de test expérimentaux.",
    scandals: "Débats sur les horizons de déploiement industriel face à l'urgence climatique immédiate.",
    organisation: "Consortiums internationaux de physique des plasmas et instituts de recherche sur l'énergie."
  },
  {
    id: "mock-eco-1",
    category: "Économie",
    source: "Les Echos",
    title: "Stabilisation de l'inflation et politique monétaire : l'ajustement méthodique des taux d'intérêt",
    time: "8h",
    img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600",
    summary: "L'assouplissement progressif du loyer de l'argent par les banques centrales redynamise l'accès au crédit immobilier et soutient les plans d'investissement productifs des PME.",
    content: "La maîtrise progressive des pressions sur les prix permet aux institutions monétaires d'engager un cycle de réduction mesurée de leurs taux directeurs. Cette détente monétaire apporte un soulagement attendu par les ménages et les acteurs du secteur de la construction.\n\nLes entreprises bénéficient de conditions de financement plus favorables pour concrétiser leurs projets d'automatisation, de modernisation écologique et d'embauches qualifiées.\n\nLes banquiers centraux rappellent que le rythme des ajustements restera dicté par l'analyse fine des données d'emploi, de consommation et des cours des matières premières à l'échelle internationale.\n\nCe climat de visibilité financière retrouvée stimule la confiance des investisseurs et favorise la stabilité macroéconomique à moyen terme.",
    results: "Reprise des dossiers de financement d'investissements professionnels de +3,2% au cours du dernier trimestre.",
    scandals: "Surveillance attentive du niveau d'endettement souverain et privé dans la phase de transition monétaire.",
    organisation: "Banques centrales, institutions financières internationales et comités d'analyse économique."
  },
  {
    id: "mock-culture-1",
    category: "Culture",
    source: "Le Monde",
    title: "Le renouveau des grandes rétrospectives et la numérisation des chefs-d'œuvre patrimoniaux",
    time: "7h",
    img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600",
    summary: "Les grands musées déploient des technologies de restitution tridimensionnelle pour valoriser des collections rares et rendre l'art accessible à un public élargi.",
    content: "Les institutions muséales innovent pour proposer des expériences de visite mêlant rigueur historique et approches interactives. Grâce à la numérisation haute définition, le public peut observer les détails invisibles à l'œil nu des toiles de maîtres et des sculptures antiques.\n\nCes projets s'accompagnent d'un travail d'approfondissement sur la provenance et le contexte de création des œuvres, éclairant l'histoire sous un jour accessible et rigoureux.\n\nLes partenariats entre conservatoires et créateurs contemporains permettent de concevoir des parcours sonores et immersifs particulièrement appréciés des jeunes générations.\n\nCette dynamique témoigne de la vitalité d'un secteur culturel soucieux de préserver son patrimoine tout en s'ouvrant aux nouveaux modes de médiation artistique.",
    results: "Fréquentation record des expositions thématiques avec plus de 450 000 visiteurs accueillis sur la saison.",
    scandals: "Débats sur les coûts de numérisation et la conservation physique prioritaire des réserves historiques.",
    organisation: "Conseils des musées, instituts d'histoire de l'art et associations de médiation culturelle."
  }
];

export function getCategoryFallbackImage(category: string): string {
  const normalized = category.toLowerCase().trim();
  if (normalized.includes("ia") || normalized.includes("intelligence") || normalized.includes("artificial")) {
    return "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("tech") || normalized.includes("ordinateur") || normalized.includes("code") || normalized.includes("development")) {
    return "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("politique") || normalized.includes("gouvernement") || normalized.includes("loi")) {
    return "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("espace") || normalized.includes("spacex") || normalized.includes("astronomie") || normalized.includes("lune") || normalized.includes("star")) {
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600";
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
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("santé") || normalized.includes("médical") || normalized.includes("médecine") || normalized.includes("biologie")) {
    return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("climat") || normalized.includes("écologie") || normalized.includes("nature") || normalized.includes("environnement")) {
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600";
  }
  return "https://images.unsplash.com/photo-1495020689067-958852a6565d?auto=format&fit=crop&q=80&w=600";
}
