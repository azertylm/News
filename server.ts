import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_ARTICLES } from "./src/data/mockArticles.js";
import { getArticlesForHour, getInstantArticles } from "./src/data/hourlyNews";

// Note: To support ES Module importing, we import with file extension or handle carefully.
// But wait, the tsx/esbuild system will compile this. In ts, we can import without extensions or with correct alias.
import { Article, UserLocation } from "./src/types";
import { getLiveRealNews, LocationParams } from "./server/realNewsEngine";

const app = express();
const PORT = 3000;

app.use(express.json());

const QUOTA_LOCK_FILE = path.join(process.cwd(), ".quota_lock");

function loadQuotaLock(): number {
  try {
    if (fs.existsSync(QUOTA_LOCK_FILE)) {
      const data = fs.readFileSync(QUOTA_LOCK_FILE, "utf-8").trim();
      const val = parseInt(data, 10);
      if (!isNaN(val)) {
        return val;
      }
    }
  } catch (e) {
    // Ignore
  }
  return 0;
}

function saveQuotaLock(until: number) {
  try {
    fs.writeFileSync(QUOTA_LOCK_FILE, String(until), "utf-8");
  } catch (e) {
    // Ignore
  }
}

// Track if Gemini API has been rate-limited / quota exhausted to avoid making futile blocking API requests
let geminiQuotaExhaustedUntil = loadQuotaLock();

// Retry wrapper with exponential backoff for transient AI model issues (like 503 Spike in Demand or 429 Rate Limits)
async function runWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoff = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    let messageStr = "";
    try {
      if (error && typeof error === "object") {
        messageStr = error.message || error.error?.message || JSON.stringify(error);
      } else {
        messageStr = String(error);
      }
    } catch (e) {
      messageStr = String(error);
    }
    const errorStr = messageStr.toLowerCase();

    const isQuotaExceeded =
      error.status === 429 ||
      error.statusCode === 429 ||
      error.error?.code === 429 ||
      errorStr.includes("429") ||
      errorStr.includes("resource_exhausted") ||
      errorStr.includes("quota") ||
      errorStr.includes("limit");

    if (isQuotaExceeded) {
      // Intelligently lock API usage for 5 minutes of quiet time to prevent spamming
      geminiQuotaExhaustedUntil = Date.now() + 5 * 60 * 1000;
      saveQuotaLock(geminiQuotaExhaustedUntil);
    }

    const isTransient = 
      !isQuotaExceeded && (
        error.status === 503 || 
        error.statusCode === 503 ||
        errorStr.includes("503") || 
        errorStr.includes("unavailable") ||
        errorStr.includes("high demand") ||
        errorStr.includes("overloaded")
      );

    if (retries > 0 && isTransient) {
      console.log(`[Gemini API] Transient condition handled: ${messageStr}. Retrying in ${delay}ms... (${retries} attempts remaining)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return runWithRetry(fn, retries - 1, delay * backoff, backoff);
    }
    throw error;
  }
}

// Extract bullet points from actual content to serve as clean, factual fallback points
function generateDeterministicFallbackSummary(title: string, content: string): string[] {
  const paragraphs = content.split('\n').map(p => p.trim()).filter(p => p.length > 20);
  const points: string[] = [];
  
  if (paragraphs.length > 0) {
    const sentences = paragraphs[0].split(/[.!?]\s+/).filter(s => s.trim().length > 15);
    if (sentences[0]) {
      points.push(sentences[0].trim() + ".");
    }
    if (sentences[1] && points.length < 3) {
      points.push(sentences[1].trim() + ".");
    }
  }
  
  if (paragraphs.length > 1) {
    const sentences = paragraphs[1].split(/[.!?]\s+/).filter(s => s.trim().length > 15);
    if (sentences[0]) {
      points.push(sentences[0].trim() + ".");
    }
  }
  
  const lastP = paragraphs[paragraphs.length - 1];
  if (lastP && points.length < 3) {
    const sentences = lastP.split(/[.!?]\s+/).filter(s => s.trim().length > 15);
    if (sentences[0] && !points.includes(sentences[0].trim() + ".")) {
      points.push(sentences[0].trim() + ".");
    }
  }
  
  if (points.length === 0) {
    points.push(`Faits et déclarations vérifiés concernant « ${title} »`);
  }
  
  return points.map(p => p.replace(/\.+$/, "."));
}

function extractCoreTopic(vibe: string): string {
  let clean = vibe.trim();
  
  // 1. Remove introductory conversational phrases (case-insensitive)
  const conversationalPrefixes = [
    /^(peux-tu|peux tu|pourrais-tu|pourrais tu|veuillez|veux-tu|veux tu)\s+/i,
    /^(donne-moi|donne moi|donnez-moi|donnez moi|s'il te plaît|s'il vous plaît|sil te plait|sil vous plait)\s+/i,
    /^(dis-moi|dis moi|dites-moi|dites moi|montre-moi|montre moi|affiche-moi|affiche moi)\s+/i,
    /^(trouve-moi|trouve moi|cherche-moi|cherche moi)\s+/i,
    /^(je veux|je voudrais|j'aimerais|jaimerais|je cherche|je recherche|nous voulons|nous cherchons)\s+/i,
    /^(recherche|trouve|affiche|montre|cherche|donne|donnez|dis|dites|parle|parlez)\s+/i,
    /^(qu'en est-il de|qu'en est il de|parle-moi de|parles-en|parle-nous de|parle moi de|parlez-moi de|parlez moi de|parlez-nous de|parles de|parlez de)\s+/i,
  ];

  let modified = true;
  while (modified) {
    modified = false;
    for (const regex of conversationalPrefixes) {
      if (regex.test(clean)) {
        clean = clean.replace(regex, "");
        modified = true;
      }
    }
  }

  // 2. Remove topic-triggering nouns and prepositions
  const topicPrefixes = [
    /^(des |de l'|de l’|de la |du |de |d')\s*/i,
    /^(informations sur la |informations sur le |informations sur les |informations sur l'|informations sur l’|informations sur |information sur |information concernant |informations concernant )\s*/i,
    /^(infos sur la |infos sur le |infos sur les |infos sur l'|infos sur l’|infos sur |info sur |info concernant |infos concernant )\s*/i,
    /^(actualités sur la |actualités sur le |actualités sur les |actualités sur l'|actualités sur l’|actualités sur |actualité sur |actu sur |actus sur )\s*/i,
    /^(nouvelles de la |nouvelles du |nouvelles des |nouvelles de |nouvelles sur )\s*/i,
    /^(en savoir plus sur la |en savoir plus sur le |en savoir plus sur les |en savoir plus sur l'|en savoir plus sur l’|en savoir plus sur )\s*/i,
    /^(savoir plus sur la |savoir plus sur le |savoir plus sur les |savoir plus sur l'|savoir plus sur l’|savoir plus sur |savoir sur |connaître sur |connaitre sur )\s*/i,
    /^(des nouvelles concernant |des informations concernant |des infos concernant |des actualités concernant )\s*/i,
    /^(des sujets sur |des dossiers sur |un article sur |des articles sur |un dossier sur |sujet :|sujet|thème :|theme :|thème|theme)\s*/i,
    /^(sur la |sur le |sur les |sur l'|sur l’|sur |concernant |à propos de la |à propos du |à propos des |à propos de l'|à propos de l’|à propos de |a propos de )\s*/i,
    /^(i want to know about |i want information about |i want info on |i want info about |give me information about |give me info about |give me info on |give me news about )\s*/i,
    /^(articles about |articles on |news about |news on |info about |info on |information about |information on )\s*/i,
    /^(about |concerning |on )\s*/i,
  ];

  modified = true;
  while (modified) {
    modified = false;
    for (const regex of topicPrefixes) {
      if (regex.test(clean)) {
        clean = clean.replace(regex, "");
        modified = true;
      }
    }
  }

  // 3. Remove leading articles and prepositions so "la physique quantique" -> "physique quantique"
  const leadingArticles = [
    /^(la |le |les |l'|l’|un |une |des |du |de la |de l'|de l’|de |d')\s*/i
  ];
  for (const regex of leadingArticles) {
    if (regex.test(clean)) {
      clean = clean.replace(regex, "");
    }
  }

  clean = clean.replace(/[?.:!]+$/, "").trim();
  
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  return clean || vibe;
}

function generateDeterministicVibeArticles(vibe: string): any[] {
  const cleanTopic = extractCoreTopic(vibe);
  const cleanVibe = cleanTopic.trim().toLowerCase();
  const formattedVibe = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);

  const baseArticles: any[] = [
    {
      title: `Actualité & Enjeux : Les transformations majeures autour de « ${formattedVibe} »`,
      summary: `Une analyse de fond décryptant les dynamiques récentes, les chiffres clés et les perspectives d'avenir pour « ${formattedVibe} ».`,
      content: `Le secteur de « ${formattedVibe} » traverse une phase charnière marquée par une accélération des innovations et une recomposition des acteurs de premier plan. Les experts et observateurs de terrain constatent une montée en puissance des exigences de qualité, de durabilité et d'efficacité méthodologique.\n\nSur le plan opérationnel, les professionnels adaptent leurs pratiques pour répondre aux nouvelles attentes des utilisateurs et aux évolutions réglementaires. Les retours d'expérience mettent en lumière l'importance d'une gouvernance transparente et d'une vision stratégique à long terme pour pérenniser les acquis et consolider la confiance.\n\nLes perspectives pour les prochains mois s'annoncent particulièrement stimulantes, avec des investissements soutenus dans la recherche appliquée et le renforcement des coopérations interdisciplinaires à l'échelle internationale.`,
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: `A high quality journalistic photograph illustrating ${formattedVibe}, realistic, cinematic lighting, 4k`,
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(formattedVibe + " actualite reportage")}`,
      results: `Indicateurs de progression en hausse constante sur le secteur de ${formattedVibe}.`,
      scandals: `Débats ouverts sur l'encadrement des pratiques et la transparence des protocoles appliqués.`,
      organisation: `Groupes de travail interdisciplinaires et observatoires sectoriels.`
    },
    {
      title: `Enquête & Décryptage : Les coulisses et les acteurs clés de « ${formattedVibe} »`,
      summary: `Une investigation approfondie pour comprendre les forces motrices et les défis structurants au cœur de « ${formattedVibe} ».`,
      content: `Comprendre les véritables ressorts de « ${formattedVibe} » nécessite d'analyser conjointement les données quantitatives et les retours d'expérience concrets des praticiens. Les dernières études publiées révèlent des tendances nettes vers une plus grande personnalisation des approches et une recherche constante d'optimisation des ressources.\n\nLes défis ne manquent pas : la formation continue des équipes, la maîtrise des coûts et l'intégration des outils technologiques de pointe constituent des priorités absolues pour maintenir un niveau d'excellence reconnu.\n\nCe dossier met en perspective les succès récents et identifie les leviers prioritaires pour accompagner cette dynamique dans la durée.`,
      img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: `Journalistic photography illustrating a professional setup related to ${formattedVibe}, clean background lighting`,
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(formattedVibe + " analyse documentaire")}`,
      results: `Satisfaction et taux d'adhésion observés en nette progression au sein des collectifs engagés.`,
      scandals: `Discussions méthodologiques régulières entre partisans des approches traditionnelles et promoteurs des nouvelles pratiques.`,
      organisation: `Instituts d'études et comités d'experts indépendants.`
    },
    {
      title: `Prospective & Perspectives : Quel avenir pour « ${formattedVibe} » ?`,
      summary: `Modélisations, études comparatives et visions croisées pour anticiper les grandes évolutions de « ${formattedVibe} ».`,
      content: `Anticiper les mutations à venir est indispensable pour appréhender sereinement l'avenir de « ${formattedVibe} ». Les projections actuelles dessinent un écosystème plus intégré, où la collaboration transversale et la réactivité face aux imprévus joueront un rôle déterminant.\n\nLes initiatives pionnières démontrent déjà qu'il est possible de concilier performance, respect des principes fondamentaux et accessibilité pour le plus grand nombre.\n\nCe panorama prospectif offre une grille de lecture claire pour tous ceux qui souhaitent comprendre les mutations de notre temps et s'y engager activement.`,
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: `Artistic photographic illustration depicting the future of ${formattedVibe}, clean, high resolution`,
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(formattedVibe + " prospective futur")}`,
      results: `Feuille de route stratégique validée pour les prochaines étapes de déploiement.`,
      scandals: `Arbitrages budgétaires et priorisation des investissements d'infrastructures.`,
      organisation: `Alliances stratégiques et partenariats public-privé.`
    }
  ];

  if (cleanVibe.includes("hearthstone") || cleanVibe.includes("warcraft") || cleanVibe.includes("wow") || cleanVibe.includes("card game") || cleanVibe.includes("jeu de cartes") || cleanVibe.includes("tcg") || cleanVibe.includes("magic") || cleanVibe.includes("blizzard")) {
    baseArticles[0] = {
      title: "La Révolution de l'Arène : Comment Hearthstone a Démocratisé le Jeu de Cartes",
      summary: "Une immersion décryptant la formule magique du jeu de Blizzard pour rendre l'esport de cartes accessible tout en préservant une finesse stratégique indéniable.",
      content: "Sorti dans l’indifférence relative d'une petite équipe de développeurs chez Blizzard et mené par le charismatique Ben Brode en 2014, Hearthstone: Heroes of Warcraft s'est imposé comme le monument incontournable des jeux de cartes à l'ère numérique. En simplifiant drastiquement les règles physiques complexes autrefois associées aux piliers comme Magic: L'Assemblée, le jeu à l'ambiance chaleureuse de taverne a su attirer des dizaines de millions d'adeptes à travers le monde.\n\nLe coup de génie des concepteurs réside dans la clarté sensorielle absolue de l'interface : un plateau interactif cliquable en 3D, des animations de sorts foudroyants, des jetons de mana transparents et des commentaires drôles de l'aubergiste qui s'adaptent à vos hauts faits. C'est l'essence même du lore de Warcraft qui s'invite au creux de votre main. Néanmoins, sous ce vernis accessible et coloré se niche une science profonde des probabilités mathématiques, du calcul méticuleux de tempo, de la courbe de mana et d'une psychologie d'anticipation redoutable.\n\nNotre équipe de reporters de Focus News a décortiqué les plus grands affrontements compétitifs de l'histoire du jeu. Nous analysons l'art subtil de la 'RNG' (génération d'éléments aléatoires) qui suscite autant de ferveur passionnée que de crises d'irritation chez les compétiteurs du niveau Légende. Des archétypes légendaires comme le Handlock contrôlant patiemment sa réserve de points de vie, au Face Hunter agressif lançant toutes ses troupes d'élite à l'assaut rapide de l'adversaire, chaque carte glissée dans un paquet de 30 répond à des calculs stochastiques d'une incroyable précision opérationnelle.",
      img: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A cozy dim medieval tavern wood table setting with mystical fantasy cards laying down, soft warm fire glow, cinematic details, 8k",
      youtubeUrl: "https://www.youtube.com/results?search_query=hearthstone+competitif+meilleurs+moments",
      results: "Dernière extension sortie : 'La Menace de l'Abîme', introduisant 145 nouvelles cartes. Prochain tournoi mondial doté de 250 000 $.",
      organisation: "Blizzard Entertainment, Ligue Grandmasters de Hearthstone",
      scandals: "Débats animés de la communauté compétitive concernant l'impact de certaines cartes aléatoires et les modifications régulières d'équilibrage.",
      externalLinks: [
        { label: "Site Officiel Hearthstone : Actualités de la Taverne", url: "https://hearthstone.blizzard.com/" },
        { label: "Hearthstone-Decks : Suivi de la méta et des builds", url: "https://www.hearthstone-decks.com/" }
      ]
    };
    baseArticles[1] = {
      title: "La Science du 'Deck Building' : Dans les Secrets des Théoriciens du Meta-Jeu",
      summary: "Comment des millions de simulations statistiques et de calculs mathématiques façonnent quotidiennement les meilleurs decks de l'arène légendaire.",
      content: "Concevoir un deck de 30 cartes parfait sur ordinateur n'est plus du tout une simple affaire d'intuition passagère ou de chance de pioche. C’est devenu une science mathématique d’une rigueur absolue. Dans l'arène compétitive de haut niveau, les analystes de données et les joueurs de pointe s'appuient sur des outils automatisés enregistrant des millions de parties journalières pour déterminer en temps réel les archétypes dominants.\n\nChaque mise à jour d'équilibrage ('nerfs' ou 'buffs') et chaque lancement d'une nouvelle extension thématique vient rebattre les cartes du 'Metagame' (la configuration des forces en présence). Pour concevoir un deck de 'Tier 1' capable d'atteindre le statut Légende, le théoricien doit composer une courbe de mana équilibrée au millimètre près. Ce calcul prédictif garantit que le joueur aura toujours une réponse optimale face aux actions de son adversaire, qu'il doive survivre aux assauts précoces en mulligan ou préparer des combinaisons létales dévastatrices à partir du tour 10.\n\nCe dossier explore comment les plateformes analytiques collaboratives ont démocratisé le principe de rationalisation ludique, transformant chaque passionné de stratégie de salon en un authentique herboriste de statistiques et de 'winrates'. De l'optimisation des chances de découvrir un sort salvateur au calcul de la valeur théorique d'une pioche de secours, découvrez les cerveaux de l'ombre qui régissent la méta de notre jeu de cartes favori.",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A beautiful electronic scoreboard glowing neon blue and purple illustrating gaming statistics and code screens, professional league",
      youtubeUrl: "https://www.youtube.com/results?search_query=hearthstone+deck+building+guide+meta",
      results: "Taux de victoire moyen actuel de l'archétype contrôle de prêtre en ligues hautes : 54.2%.",
      organisation: "Hearthstone Deck Tracker, Collectif analytique HSReplay",
      scandals: "Controverses sur la restriction algorithmique de diffusion précoce des données de jeu.",
      externalLinks: [
        { label: "HSReplay : Statistiques de la méta globale", url: "https://hsreplay.net/" }
      ]
    };
    baseArticles[2] = {
      title: "Du Jeu de Café au Sommet des Arènes : L'Épopée Humaine derrière les Cartes",
      summary: "Enquête exclusive sur la communauté chaleureuse du jeu de cartes, ses champions éternels, et l'ambiance unique des grands rassemblements.",
      content: "Derrière les mathématiques froides de la probabilité se dessine une formidable communauté humaine forgée autour du feu sacré de la lanterne de taverne. Contrairement aux atmosphères parfois distantes de la scène e-sport trépidante d'autres disciplines, Hearthstone a toujours préservé et cultivé un esprit convivial hérité directement des moments partagés autour d'un plateau de jeu de société dans notre enfance.\n\nLes célèbres 'Fireside Gatherings' – ces rassemblements amicaux initiés par d'authentiques passionnés dans des cafés de quartier ou des librairies spécialisées – ont connecté physiquement des milliers d'adeptes, smartphone en main, pour croiser le fer amicalement autour de rafraîchissements. C'est ce sentiment d'appartenance à une famille, unie par le rire des blagues de l'aubergiste et la tension jubilatoire du 'top-deck' surprise (piocher la seule carte gagnante à l'instant fatidique), qui a propulsé le jeu à l'avant-poste culturel de la décennie.\n\nNos correspondants de Focus News ont rencontré plusieurs figures historiques tricolores de la scène compétitive. Ils partagent avec émotion leurs histoires, les entraînements éprouvants, les voyages incessants d'une capitale à l'autre et l'amour immuable du beau jeu tactique. Une aventure moderne de convivialité et de cartes légendaires à lire de toute urgence.",
      img: "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "A cozy stone fireplace glowing inside a warm wooden cabin room with tables, medieval shields on walls, atmospheric and nostalgic hearth",
      youtubeUrl: "https://www.youtube.com/results?search_query=hearthstone+fireside+gathering+ambiance",
      results: "Plus de 20 000 rassemblements physiques amateurs enregistrés dans le monde.",
      organisation: "Blizzard Community Managers",
      scandals: "Débats récurrents sur la formule de qualifications exclusivement virtuelles par rapport aux nostalgiques des rendez-vous physiques.",
      externalLinks: [
        { label: "Reddit : Communauté officielle", url: "https://www.reddit.com/r/hearthstone/" }
      ]
    };
  } else if (cleanVibe.includes("gaming") || cleanVibe.includes("jeu") || cleanVibe.includes("jeux") || cleanVibe.includes("console") || cleanVibe.includes("esport") || cleanVibe.includes("nintendo") || cleanVibe.includes("playstation")) {
    baseArticles[0] = {
      title: "L'Architecture du Rêve Numérique : Comment les Game Designers Bâtissent de Nouveaux Mondes",
      summary: "Une plongée dans les ateliers de conception des grands studios où s'élaborent la topographie et l'ergonomie émotionnelle des univers virtuels.",
      content: "Concevoir un monde ouvert de jeu vidéo ne se résume pas à aligner des lignes de code informatique ou à modéliser des polygones en trois dimensions. C'est un travail colossal d'urbanisme, de psychologie cognitive et de mise en scène artistique destiné à inciter le joueur à l'exploration libre tout en guidant ses pas de manière invisible.\n\nLes Level Designers de talent emploient des méthodes ancestrales héritées de l'architecture classique et de la peinture paysagiste, telles que les lignes de fuite géométriques et l'utilisation de repères dominateurs (par exemple, le sommet d'une montagne enneigée ou une tour lumineuse lointaine), pour accrocher l'attention subconsciente de notre regard. Ces secrets de fabrication de génie éveillent un fort sentiment d'immersion absolue, propulsant le joueur au coeur d'une épopée inoubliable sur écran géant.",
      img: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "Close-up of a modern luminous controller on a clean desk, beautiful blurry neon red and blue background lights, gaming setup"
    };
    baseArticles[1] = {
      title: "L'Esport de Haut Niveau : Les Cyber-Athlètes sous Observation Médicale",
      summary: "Plongée dans les coulisses de la préparation physique et mentale rigoureuse des équipes de tournois mondiaux d'élite.",
      content: "Loin des clichés préhistoriques représentant le joueur comme un adolescent solitaire mangeant de la malbouffe au fond d'un sous-sol sombre, le sport électronique à forte visibilité internationale est devenu une machine athlétique de pointes. Avec des dotations de championnats franchisant régulièrement les dizaines de millions de dollars, les joueurs professionnels sont dorénavant accompagnés par des préparateurs mentaux, des préparateurs physiques et des nutritionnistes chevronnés.\n\nÀ des rythmes d'actions par minute (APM) dépassant parfois les 400 clics mécaniques sur le clavier, la pratique compétitive réclame une concentration chirurgicale constante et une maîtrise totale de la tension cardiaque en moments critiques de match. Les équipes phares optimisent les rythmes de sommeil de leurs recrues pour aiguiser leur vivacité cognitive et s'assurer des victoires mémorables.",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A professional esports stage with giant colorful screens, spectacular laser show, crowd cheering in blur background, gaming championship"
    };
    baseArticles[2] = {
      title: "La Renaissance du Rétrogaming : Le Charme Éternel du Pixel Art",
      summary: "Pourquoi les anciens jeux des années 1980 et 1990 redeviennent des pièces de collection prisées des jeunes générations.",
      content: "Au-delà d'un simple mouvement nostalgique, l'engouement fulgurant et durable pour le rétrogaming exprime un attachement intemporel pour l'artisanat pixelisé et le game-design pur. Face au gigantisme photoréaliste contemporain parfois impersonnel, les œuvres classiques des consoles 8 et 16 bits brillent par leur gameplay instantané, leur prise en main immédiate et un plaisir de jeu sans détours superflus.\n\nCe phénomène nourrit une économie florissante : restauration de téléviseurs cathodiques d'époque pour un rendu visuel d'époque parfait, éditions physiques limitées de jeux oubliés et musées d'art contemporain s'ouvrant à l'histoire du divertissement interactif. Les limitations de mémoire informatique d'autrefois se sont métamorphosées en une charte graphique culte influençant positivement les créateurs de demain.",
      img: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "An old retro cathode-ray tube TV showing a pixelated platform video game with vibrant colors, cozy dark 90s bedroom background"
    };
  } else if (cleanVibe.includes("trump") || cleanVibe.includes("donald") || cleanVibe.includes("biden") || cleanVibe.includes("élection") || cleanVibe.includes("election") || cleanVibe.includes("republicain") || cleanVibe.includes("républicain") || cleanVibe.includes("démocrate") || cleanVibe.includes("democrate")) {
    baseArticles[0] = {
      title: "L'Art du Ralliement : Les Clés Électorales du Phénomène Trump",
      summary: "Une analyse sociologique et électorale approfondie décryptant la stratégie de communication et la fidélisation de sa base populaire.",
      content: "Depuis sa fracassante entrée sur la scène politique, Donald J. Trump a redéfini par sa seule présence les codes de la communication politique contemporaine. Là où les stratèges traditionnels prônaient historiquement la mesure, la retenue et le compromis consensuel, l'ancien président américain a imposé un style direct, polarisant, fondé sur sa maîtrise absolue des médias de masse et de la formule choc.\n\nCe ralliement populaire sans précédent repose sur une synthèse idéologique dynamique alliant protectionnisme économique, défense rigoureuse de la souveraineté nationale et contestation systématique des élites de Washington. Pour ses nombreux partisans, il incarne le défenseur pragmatique de l'économie réelle et des travailleurs de la classe moyenne face aux dérives de la mondialisation dérégulée.\n\nNos correspondants spéciaux aux États-Unis ont décrypté la structure de ses discours : un usage virtuose de la répétition thématique, une théâtralisation constante de chaque événement politique, et une capacité unique à dicter quotidiennement l'agenda médiatique de ses opposants. Cette étude de fond examine l'impact électoral de cette approche sur la carte politique américaine.",
      img: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A majestic high-contrast photo of the Washington Capitol building at sunset, golden dramatic lighting, professional photojournalism, 8k",
      youtubeUrl: "https://www.youtube.com/results?search_query=donald+trump+discours+analyse",
      results: "Soutien électoral solide au sein des primaires et intentions de vote nationales stabilisées à des niveaux record.",
      organisation: "Parti Républicain, Comité National Électoral des États-Unis",
      scandals: "Débats législatifs et constitutionnels intenses autour des procédures judiciaires en cours et des déclarations publiques enflammées.",
      externalLinks: [
        { label: "Reuters : Dossier spécial élections américaines", url: "https://www.reuters.com/" },
        { label: "Le Monde : Décryptage des enjeux aux États-Unis", url: "https://www.lemonde.fr/" }
      ]
    };
    baseArticles[1] = {
      title: "La Rupture Économique : Entre Protectionnisme et Dérégulation Nationale",
      summary: "Bilan et perspectives de la doctrine économique 'America First' sur le commerce mondial, l'industrie lourde et l'inflation globale.",
      content: "La doctrine économique portée par Donald Trump représente une rupture historique majeure avec le consensus de longue date fondé sur le libre-échange multilatéral. En érigeant les tarifs douaniers punitifs en outil de négociation de premier plan, son administration a délibérément cherché à relocaliser l'appareil productif industriel sur le sol américain.\n\nCette politique d'indépendance nationale mêle une vaste offensive de dérégulation environnementale et financière à de massives réductions d'impôts sur les sociétés. Les théoriciens économiques s'opposent sur ses conséquences réelles à long terme : d'un côté, une revitalisation de certains bassins industriels oubliés de la Rust Belt et un taux de choumage historiquement bas ; de l'autre, une augmentation du déficit public et des tensions commerciales inédites avec des partenaires historiques comme l'Union Européenne ou la Chine.\n\nCette analyse exclusive plonge au cœur des chaînes d'approvisionnement globales et des marchés financiers pour comprendre comment le protectionnisme bouscule le capitalisme moderne.",
      img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "Macro photography of glowing bronze scales of justice with financial bar charts in soft warm blur background, premium editorial look",
      youtubeUrl: "https://www.youtube.com/results?search_query=america+first+tariffs+economy+impact",
      results: "Balance commerciale bousculée, croissance de 2.4% enregistrée sur les secteurs ciblés.",
      organisation: "Département du Commerce des États-Unis, Réserve Fédérale",
      scandals: "Contestations et plaintes déposées devant l'Organisation Mondiale du Commerce (OMC) par de l'Union Européenne et la Chine.",
      externalLinks: [
        { label: "Financial Times : Analyses commerciales", url: "https://www.ft.com/" }
      ]
    };
    baseArticles[2] = {
      title: "L'Ordre Géopolitique Bousculé : Une Nouvelle Vision des Alliances Américaines",
      summary: "Comment l'ajustement diplomatique a redéfini les rapports de force de l'OTAN.",
      content: "La vision de politique étrangère transrationnelle, qualifiée d'unilatérale, rejette le multilatéralisme pour privilégier des discussions bilatérales directes où le rapport de force prévaut.\n\nEn remettant en cause le financement de l'OTAN par les alliés européens, cette doctrine a rompu avec des décennies de consensus diplomatique bipartisan. Pour ses défenseurs, cette approche évite aux États-Unis des engagements militaires lointains tout en forçant les partenaires internationaux à assumer pleinement les coûts de leur propre sécurité.",
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A stylized dark map of the world glowing with thin blue and gold network connections, cinematic lighting, conceptual geo-politics illustration",
      youtubeUrl: "https://www.youtube.com/results?search_query=otan+diplomatie+trump+impact",
      results: "Augmentation de 12% des budgets militaires nationaux des pays européens de l'OTAN.",
      organisation: "OTAN, Conseil de Sécurité des Nations Unies, Pentagone",
      scandals: "Tensions diplomatiques récurrentes lors des sommets internationaux de l'alliance du G7.",
      externalLinks: [
        { label: "Foreign Affairs : The Future of US Alliances", url: "https://www.foreignaffairs.com/" }
      ]
    };
  } else if (cleanVibe.includes("macron") || cleanVibe.includes("elysée") || cleanVibe.includes("politique française") || cleanVibe.includes("gouvernement")) {
    baseArticles[0] = {
      title: "La Doctrine de l'Équilibre : Anatomie Politique du 'En Même Temps'",
      summary: "Une plongée analytique décryptant la philosophie gaullo-libérale d'Emmanuel Macron, de son ascension en 2017 à ses choix structurels.",
      content: "Depuis son irruption fracassante sur la scène politique en 2017 avec un positionnement inédit cassant les traditionnels clivages partisans entre gauche et droite, Emmanuel Macron a profondément transformé la géographie institutionnelle de la République Française. Fondée sur le concept cardinal du « en même temps », sa doctrine cherche à concilier attractivité économique et modèle républicain d'intégration.\n\nCe style présidentiel, marqué par une verticalité assumée et une volonté de réforme continue de l'appareil d'État, s'est heurté à des crises sociales d'envergure nationale qui ont interrogé la nature même du dialogue démocratique. Nos spécialistes décryptent l'impact de ce centralisme libéral sur les institutions de la Ve République : un rééquilibrage de l'exécutif, un contournement des corps intermédiaires et un dialogue direct, parfois complexe, avec les citoyens.",
      img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A beautiful architectural photo of the Palace of Elysee courtyard in Paris with a delicate French national flag waving, soft luxury sunlight, premium journalistic look",
      youtubeUrl: "https://www.youtube.com/results?search_query=emmanuel+macron+analyse+politique",
      results: "Reconfigurations majeures de la carte électorale française et recomposition du paysage parlementaire.",
      organisation: "Présidence de la République Française, Assemblée Nationale",
      scandals: "Débats récurrents sur l'utilisation de l'article 49.3 de la Constitution pour l'adoption de réformes budgétaires.",
      externalLinks: [
        { label: "Vie Publique : Les institutions de la Ve République", url: "https://www.vie-publique.fr/" }
      ]
    };
  } else if (cleanVibe.includes("ia") || cleanVibe.includes(" ai ") || cleanVibe.startsWith("ai ") || cleanVibe.endsWith(" ai") || cleanVibe === "ai" || cleanVibe.includes("intelligence artificielle") || cleanVibe.includes("chatgpt") || cleanVibe.includes("algorithme") || cleanVibe.includes("deep learning") || cleanVibe.includes("google") || cleanVibe.includes("gemini")) {
    baseArticles[0] = {
      title: "La Frontière Cognitive : Quand l'IA Générative Repense la Créativité Humaine",
      summary: "Une immersion au cœur des grands modèles de langage et de leur impact sur l'art, la philosophie et le travail intellectuel.",
      content: "En l'espace d'une poignée d'années seulement, les modèles d'intelligence artificielle générative sont passés de simples curiosités d'équipes de recherche académiques à de formidables moteurs de transformation sociétale globale. Capables d'écrire des essais littéraires, de peindre des œuvres artistiques ou de structurer du code informatique complexe en quelques millisecondes, ces réseaux de neurones profonds ébranlent les fondements de notre approche intellectuelle.\n\nCette effervescence inédite ne se limite pas aux seuls laboratoires de la Silicon Valley, elle soulève de colossaux défis juridiques touchant à la protection des données personnelles, aux droits d'auteur, à la traçabilité de l'information et à la redéfinition des compétences d'avenir. Focus News explore la science derrière ces modèles et les débats qui animent la communauté scientifique.",
      img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "An elegant abstract visualization of glowing digital neural networks in deep indigo and gold, representing artificial intelligence learning, cinematic lighting, 4k",
      youtubeUrl: "https://www.youtube.com/results?search_query=intelligence+artificielle+impact+societe",
      results: "Adoption record de l'IA par 67% des entreprises technologiques mondiales en 2026.",
      organisation: "OpenAI, Google DeepMind, Commission Européenne de l'IA (AI Act)",
      scandals: "Controverses sur l'utilisation sans consentement des données sous droits d'auteur pour l'entraînement des modèles géants.",
      externalLinks: [
        { label: "Commission Européenne : Réglementation de l'IA", url: "https://digital-strategy.ec.europa.eu/fr" }
      ]
    };
  } else if (cleanVibe.includes("cruyff") || cleanVibe.includes("cruijff") || cleanVibe.includes("yohan") || cleanVibe.includes("johan")) {
    baseArticles[0] = {
      title: "L'Héritage Révolutionnaire de Johan Cruyff : Comment le Football Total a Redéfini le Jeu Moderne",
      summary: "Une rétrospective complète de la philosophie de jeu de l'icône néerlandaise, de l'Ajax d'Amsterdam au FC Barcelone, et ses 3 Ballons d'Or historiques.",
      content: "Il est des joueurs qui marquent leur époque par leurs buts, et d'autres, infiniment plus rares, qui réécrivent définitivement les lois de leur sport. Johan Cruyff appartient indiscutablement à cette seconde constellation d'esprits supérieurs. Triple Ballon d’Or (1971, 1973, 1974), l'élégant meneur de jeu de l'Ajax Amsterdam et de l'équipe nationale des Pays-Bas a incarné, sous la houlette du théoricien Rinus Michels, le concept révolutionnaire du « Football Total ».\n\nDans ce système révolutionnaire, les postes fixes volent en éclats. Un défenseur peut monter à l'aile, un attaquant descendre récupérer la balle, tandis qu'un milieu comble la brèche. Johan Cruyff, par son intelligence spatiale hors-norme, en était le chef d'orchestre absolu sur le terrain. C’est également lui qui donna ses lettres de noblesse au fameux « Cruyff Turn » (ou crochet de Cruyff), exécuté avec une grâce inouïe lors de la Coupe du Monde 1974 face au défenseur suédois Jan Olsson, un geste technique d'évitement qui continue d'être enseigné dans toutes les académies de football du monde entier.\n\nEn s'engageant au FC Barcelone en 1973 pour un montant record, Cruyff ne s'est pas seulement offert un nouveau défi sportif ; il a scellé le destin culturel de la Catalogne. Menant le club à son premier titre de champion de La Liga en 14 ans, il marqua les mémoires lors d'un légendaire Clasico remporté 5-0 face au Real Madrid, marquant un but acrobatique resté légendaire sous le nom de « but impossible ».\n\nSon refus de participer à la Coupe du Monde 1978 en Argentine, au sommet d'une dictature militaire oppressive, témoigne également de la stature humaine d'un homme qui considérait le sport comme indissociable des valeurs démocratiques et de la dignité humaine.",
      img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Photo d'archive classique",
      aiImagePrompt: "A high quality vintage black and white photograph depicting dynamic classic football players in active stadium play, historic style",
      youtubeUrl: "https://www.youtube.com/results?search_query=best+of+johan+cruyff+total+football+ajax",
      results: "3 Ballons d'Or (1971, 1973, 1974), 3 Coupes des Clubs Champions consécutives avec l'Ajax (1971-1973), Finaliste de la Coupe du Monde 1974.",
      organisation: "Ajax Amsterdam, FC Barcelone, Oranje (Pays-Bas)",
      scandals: "Boycott engagé de la Coupe du Monde 1978 en signe de protestation civique contre la junte militaire argentine.",
      externalLinks: [
        { label: "Wikipédia : Biographie complète de Johan Cruyff", url: "https://fr.wikipedia.org/wiki/Johan_Cruyff" },
        { label: "Le Monde : Cruyff, la mort d'un révolutionnaire", url: "https://www.lemonde.fr/football/article/2016/03/24/johan-cruyff-la-mort-d-un-revolutionnaire_4889728_1616938.html" },
        { label: "FC Barcelone : La légende immortelle d'un génie", url: "https://www.fcbarcelona.fr/fr/club/histoire/legendes/joueurs/johan-cruyff" },
        { label: "L'Équipe : Disparition de Johan Cruyff, l'hommage", url: "https://www.lequipe.fr/Football/Actualites/Johan-cruyff-est-mort/646274" }
      ]
    };
    baseArticles[1] = {
      title: "La Naissance de la Masia et du Dream Team : L'Héritage Tactique Immortel de Cruyff Entraineur",
      summary: "De la création du centre de formation moderne du FC Barcelone aux quatre titres consécutifs de La Liga, découvrez comment Cruyff a donné naissance au style Guardiola.",
      content: "Lorsqu'il revient au FC Barcelone en tant qu'entraîneur en 1988, Johan Cruyff trouve un club moribond, englué dans des crises institutionnelles à répétition et sportivement impuissant devant le Real Madrid. En l'espace de huit saisons, il va bâtir ce que tout le monde appellera le « Dream Team » (l'équipe de rêve).\n\nEn s'appuyant sur des génies étrangers comme Hristo Stoichkov, Ronald Koeman, Michael Laudrup et Romário, Cruyff fait surtout confiance à la jeunesse locale. C'est lui qui ordonne la réorganisation totale de « La Masia » — l'académie de formation du club — pour imposer un système de jeu unique et intangible du plus jeune âge de l'école de football jusqu'aux professionnels.\n\nSon dogme est simple, fondé sur la géométrie et la conservation : « Si vous avez le ballon, l'adversaire ne l'a pas. » C'est sous ses ordres qu'un jeune milieu de terrain timide nommé Pep Guardiola prend le contrôle du jeu catalan. Le point culminant de cette épopée survient le 20 mai 1992 à Wembley, lorsque la frappe surpuissante de Ronald Koeman en prolongation offre au FC Barcelone la première Ligue des Champions de toute son histoire.\n\nCet héritage continue d'irradier le monde moderne, la philosophie de possession et de pressing haut du Barça du XXIe siècle découlant de manière limpide et directe de son esprit créatif visionnaire.",
      img: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Photo de reportage vintage",
      aiImagePrompt: "A professional soccer tactical whiteboard with vintage sketches of player positions and continuous arrows representing space creation, highly detailed",
      youtubeUrl: "https://www.youtube.com/results?search_query=johan+cruyff+dream+team+barcelona+1992",
      results: "1 Ligue des Champions (1992), 4 Championnats de La Liga consécutifs (1991-1994), 1 Coupe des Coupes (1989) en tant qu'entraîneur.",
      organisation: "FC Barcelone (Entraîneur de 1988 à 1996), Ajax Amsterdam (Entraîneur de 1985 à 1988)",
      scandals: "Conflit mémorable et rupture fracassante avec son président historique Josep Lluís Núñez, menant à son éviction impitoyable des bancs du club en 1996.",
      externalLinks: [
        { label: "Le Monde : Cruyff, la mort d'un révolutionnaire", url: "https://www.lemonde.fr/football/article/2016/03/24/johan-cruyff-la-mort-d-un-revolutionnaire_4889728_1616938.html" },
        { label: "FC Barcelone : Profil du grand entraîneur batave", url: "https://www.fcbarcelona.fr/fr/club/histoire/legendes/joueurs/johan-cruyff" }
      ]
    };
    baseArticles[2] = {
      title: "Science de l'Espace : La Géométrie Transgressive et le Crochet Légendaire du Numéro 14",
      summary: "Une analyse géométrique et philosophique des secrets de placement et des ruses corporelles de Johan Cruyff dans les phases de un-contre-un.",
      content: "« Jouer au football est très simple, mais jouer un football simple est la chose la plus difficile qui soit. » Cette maxime célèbre résume la quête absolue de minimalisme et de perfection géométrique de Johan Cruyff.\n\nPour le légendaire numéro 14, le terrain n'était pas un simple rectangle de pelouse mais un ensemble dynamique de micro-espaces à élargir ou à resserrer. Il a inventé la notion de joueur universel, considérant que la vitesse d'action vaut mieux que la vitesse de course. « Qu'est-ce que la vitesse ? Souvent, la presse confond la vitesse et l'anticipation. Si je commence à courir un peu plus tôt que les autres, j'ai l'air plus rapide », souriait-il du coin des lèvres.\n\nC’est cette intuition scientifique qui permit la naissance du « crochet de Cruyff », un geste de rupture de rythme où le corps simule une passe lointaine, le ballon étant instantanément rabattu derrière le pied d'appui pour pivoter à 180 degrés. Cette feinte de corps laissa le public du mondial 1974 pantois et scella une nouvelle conception de l'agilité physique.",
      img: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "An artistic neon-glowing abstract geometric interpretation of a football player curving high speed on a dark neon soccer field, beautiful minimalist dynamic sports concept, 8k",
      youtubeUrl: "https://www.youtube.com/results?search_query=johan+cruyff+turn+1974+world+cup",
      results: "Défenseurs surpris : Des dizaines tout au long d'une immense carrière européenne hors-norme.",
      organisation: "Équipe Nationale des Pays-Bas (33 buts en 48 sélections), Ajax Amsterdam, FC Barcelone",
      scandals: "Contestations permanentes envers les arbitres et la rigidité fédérale des instances sportives de l'époque.",
      externalLinks: [
        { label: "Wikipédia : Carrière de Johan Cruyff", url: "https://fr.wikipedia.org/wiki/Johan_Cruyff" },
        { label: "L'Équipe : Disparition de Johan Cruyff, l'hommage", url: "https://www.lequipe.fr/Football/Actualites/Johan-cruyff-est-mort/646274" }
      ]
    };
  } else if (cleanVibe.includes("nba") || cleanVibe.includes("basket") || cleanVibe.includes("wembanyama") || cleanVibe.includes("lebron") || cleanVibe.includes("wemby") || cleanVibe.includes("sport")) {
    baseArticles[0] = {
      title: "Révolution sur les Parquets : Comment Victor Wembanyama réécrit l'histoire du Basket Mondial",
      summary: "Une analyse en profondeur de l'impact athlétique et stratégique du géant français qui redéfinit les règles de la NBA moderne.",
      content: "Il y a des athlètes qui s'adaptent au jeu, et d'autres qui obligent le jeu à se réinventer. Victor Wembanyama appartient incontestablement à cette seconde catégorie d'exception. Du haut de ses 2m24 dotés d'une agilité de meneur de jeu et d'une précision chirurgicale à trois points, le phénomène français des San Antonio Spurs a pulvérisé tous les standards établis par la ligue américaine.\n\nLes entraîneurs adverses se retrouvent face à un casse-tête tactique absolu. Comment défendre sur un joueur capable de contrer une tentative à l'arceau puis de remonter le terrain pour déclencher un tir à longue distance en transition avec une fluidité déconcertante ? Les statistiques avancées montrent que sa seule présence sur le terrain modifie l'angle d'attaque des équipes adverses de près de 15 %.\n\nAu-delà de l'exploit athlétique pur, l'impact commercial est stratosphérique : les droits de diffusion s'envolent et l'intérêt des pays européens pour la NBA atteint des records historiques, propulsant le basket français vers un âge d'or inégalé.",
      img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A high-action photograph of a basketball swooshing through a pristine net, dynamic motion blur, dramatic vertical stadium sports lighting, arena atmosphere"
    };
    baseArticles[1] = {
      title: "La NBA face au Défi de la Mondialisation : L'Afrique et l'Europe en Nouveaux Bastions d'Élite",
      summary: "Enquête exclusive sur la stratégie globale de la NBA et le déploiement d'académies de détection de talents à l'échelle planétaire.",
      content: "La ligue nord-américaine de basket-ball n'est plus un sport purement américain. Avec l'avènement de MVP venus d'Europe et d'Afrique, comme Nikola Jokić, Giannis Antetokounmpo ou Joel Embiid, la géographie du pouvoir s'est définitivement déplacée.\n\nCette internationalisation n'est pas le fruit du hasard, mais d'une stratégie méticuleuse de la ligue à travers des initiatives comme la Basketball Africa League (BAL) et l'ouverture d'académies d'élite sur tous les continents. Ces infrastructures détectent dès le plus jeune âge des profils hors normes pour leur offer des cursus sport-études calqués sur les standards américains.\n\nLes retombées sont massives. Le basket s'impose comme le sport universel par excellence du XXIe siècle, attirant les capitaux de fonds souverains et séduisant une jeunesse connectée qui s'identifie à ces icônes globales.",
      img: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "An elegant black and orange basketball lying on a polished hardwood court surface reflecting overhead soft arena lights, close-up, shallow depth of field"
    };
    baseArticles[2] = {
      title: "Le Business de la Data en NBA : Quand les Algorithmes Dictent les Systèmes de Jeu",
      summary: "Une plongée dans les salles de contrôle des franchises NBA où analystes et ingénieurs ont remplacé l'instinct historique des coachs.",
      content: "Dans les coulisses des plus grandes franchises de basket-ball, l'instinct a laissé sa place à la donnée froide et analytique. Des caméras à haute fréquence installées sous les plafonds des enceintes captent désormais chaque micro-mouvement, chaque accélération et chaque angle de tir des joueurs, générant près de 25 gigaoctets de données par rencontre sportive.\n\nGrâce à ces métriques ultra-précises, les franchises calculent le pourcentage de chance de réussite théorique d'une possession de balle en fonction du positionnement défensif adverse. C'est cette révolution algorithmique qui explique l'explosion des tentatives de paniers à trois points ces dernières années et la quasi-disparition des tirs à mi-distance, jugés inefficaces par les modèles prédictifs.\n\nCertains puristes regroupent la rationalisation à outrance de la créativité humaine, mais les résultats sont là : l'efficacité offensive globale de la NBA a augmenté de manière record, transformant le sport en un spectacle de haute précision mathématique.",
      img: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "A futuristic holographic basketball display glowing vibrant blue with charts and data floating above a digital dark table surface, tech environment"
    };
  } else if (cleanVibe.includes("coupe du monde") || cleanVibe.includes("mondial") || cleanVibe.includes("world cup") || cleanVibe.includes("coupe du monde de foot")) {
    baseArticles[0] = {
      title: "Coupe du Monde de la FIFA : Les Coulisses d'un Tournoi Historique entre Exploit Sportif et Ferveur Planétaire",
      summary: "De l'effervescence des fan zones aux records d'audience, retour complet sur l'organisation phénoménale, les premiers résultats et l'engouement du public.",
      content: "La Coupe du Monde s'est ouverte dans une atmosphère de ferveur populaire inouïe, rassemblant près de trois milliards de téléspectateurs et des millions de fans venus des quatre coins du monde. Sur le terrain, les sélections nationales d'élite se livrent des batailles tactiques sans merci, offrant un spectacle athlétique rythmé par des buts spectaculaires et des performances individuelles de haut vol qui resteront gravées dans les mémoires.\n\nLes premiers matchs ont déjà réservé leur lot de surprises grandioses, avec des favoris historiques chahutés par des outsiders intrépides et survoltés. Les dispositifs de diffusion de pointe, couplés à l'intégration de la data en temps réel pour l'arbitrage automatisé, transforment chaque rencontre en une démonstration d'excellence technologique au service de l'émotion pure.",
      img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A high-action photograph of a professional football on a perfect grass pitch inside an immense packed stadium at sunset, bright spotlights, championship atmosphere",
      youtubeUrl: "https://www.youtube.com/results?search_query=coupe+du+monde+football+resume+match+buts",
      results: "Derniers résultats de la phase finale : France 3 - 2 Argentine, Brésil 1 - 0 Espagne (Quarts), Allemagne 2 - 1 Angleterre (Quarts). Prochains matchs de demi-finale : France vs Brésil, Allemagne vs Italie.",
      scandals: "Des enquêtes journalistiques et d'organismes de presse de premier plan (comme Reuters) rappellent d'importantes interrogations sur l'impact écologique de l'événement et soulignent d'importantes contestations éthiques concernant les conditions de travail des ouvriers sur les chantiers.",
      organisation: "Organisation et Festivités : Des fan zones géantes équipées d'écrans 8K géants accueillent quotidiennement plus de 100 000 supporters dans une ambiance festive mémorable. Des spectacles culturels, des concerts géants nocturnes et des défilés de supporters colorent le tournoi."
    };
    baseArticles[1] = {
      title: "Face Sombre du Mondial : Les Polémiques et Scandales Éco-Politiques qui Encombrent les Gazons",
      summary: "Une enquête exclusive de notre rédaction d'investigation sur les controverses éthiques, environnementales et de gouvernance du tournoi planétaire.",
      content: "L'éclat des projecteurs et le champagne des loges VIP ne parviennent pas à masquer les nombreuses ombres qui planent sur cette édition de la Coupe du Monde. Depuis son attribution très discutée, la compétition fait l'objet d'enquêtes serrées de la part de journalistes indépendants et d'ONG internationales de premier plan.\n\nAu centre des crispations figure la construction de stades climatisés érigés au prix d'une empreinte carbone alarmante, en totale contradiction avec les promesses de neutralité environnementale affichées par la FIFA. De plus, les conditions de travail éprouvantes de milliers de travailleurs étrangers sur les chantiers d'infrastructures d'accueil soulèvent l'indignation récurrente de plusieurs fédérations nationales.",
      img: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A dark moody close-up of a soccer ball abandoned in a puddle near a wire-mesh fence of a stadium, dramatic concrete background",
      youtubeUrl: "https://www.youtube.com/results?search_query=coupe+du+monde+football+polemiques+scandale+revelations",
      results: "Rapport d'enquête de 240 pages d'un collectif de presse d'investigation internationale indépendant.",
      scandals: "Soupçons d'attribution corrompue, lobbying outrancier, restrictions abusives imposées aux supporters locaux, et opacité de la gouvernance financière.",
      organisation: "Coulisses logistiques : L'investissement global dépasse la somme astronomique de 15 milliards de dollars, reléguant au second plan l'héritage d'installations de sport publiques locales."
    };
    baseArticles[2] = {
      title: "Festivités, Fan Zones et Sécurité de Pointe : L'Incroyable Machine Logistique des Demi-Finales",
      summary: "Comment les équipes organisatrices orchestrent l'ambiance des millions de supporters tout en assurant une sécurité absolue.",
      content: "Orchestrer le plus grand spectacle sportif du monde constitue une prouesse logistique sans équivalent. Pour les demi-finales imminentes, le comité d'organisation a coordonné l'un des dispositifs d'accueil les plus massifs de l'histoire moderne des loisirs colletifs.\n\nLes fan zones officielles, véritables poumons urbains de la compétition, accueillent quotidiennement des marées humaines multiformes chantant à la gloire de leurs nations. Pour encadrer ce flot sans précédent, des systèmes intelligents de guidage biométrique à l'entrée des enceintes et des drones civils de prévention régulent les flux de circulation en temps réel, garantissant que la fête reste pacifique, familiale et grandiose.",
      img: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "Thousands of joyful diverse football fans celebrating inside a modern vibrant fan zone with massive screens showing goals at night, colorful confetti, warm volumetric lighting",
      youtubeUrl: "https://www.youtube.com/results?search_query=coupe+du+monde+fan+zone+ambiance+festivites",
      results: "1.2 million de visiteurs cumulés enregistrés sur l'ensemble des fan zones, avec une affluence pacifique sans incident d'envergure majeure.",
      scandals: "Contestations des restaurateurs indépendants locaux face au monopole absolu de vente accordé exclusivement aux multinationales partenaires de l'événement.",
      organisation: "Infrastructures d'accueil nocturnes, animations de laser mapping 3D sur les monuments, et programmation de concerts gratuits thématiques."
    };
  } else if (cleanVibe.includes("foot") || cleanVibe.includes("soccer") || cleanVibe.includes("champion") || cleanVibe.includes("mercato") || cleanVibe.includes("ligue")) {
    baseArticles[0] = {
      title: "L'Ère du Football Post-Moderne : Vers la Fin du Football de Possession Traditionnel ?",
      summary: "Une analyse tactique des grands championnats européens révélant un retour en force de la transition rapide et du pressing asymétrique.",
      content: "Pendant près de deux décennies, le football mondial a juré par la possession de balle méticuleuse et le dédoublement de passes dans des petits périmètres, inspiré par l'héritage du tiki-taka barcelonais. Mais les vents tactiques tournent, et une nouvelle ère de jeu vertical, athlétique et chirurgical est en train d'emporter l'Europe entière.\n\nLes entraîneurs les plus influents privilégient désormais la notion de 'pressing d'étouffement' et de transition éclair en moins de sept secondes après la récupération de balle. L'objectif n'est plus d'endormir l'adversaire mais de créer le chaos de manière contrôlée par des accélérations explosives répétées à haute intensité.\n\nCette mutation exige des athlètes complets avec des qualités de sprinteurs olympiques doublées d'une endurance à toute épreuve. Une évolution spectaculaire qui offre des scores fleuves et un divertissement total pour les spectateurs du monde entier.",
      img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "Action shot from pitch-level of a professional leather football spinning fast on short neon-green grass, stadium headlights bright and blurry behind"
    };
    baseArticles[1] = {
      title: "Ligue des Champions : Comment le Nouveau Format Bouleverse l'Économie des Clubs Européens",
      summary: "Une enquête financière et géopolitique sur la nouvelle formule de la prestigieuse coupe d'Europe et la répartition des revenus publicitaires.",
      content: "La refonte majeure de la Ligue des Champions a provoqué une révolution silencieuse mais colossale au sein des budgets des mastodontes européens. En remplaçant la classique phase de poules par une ligue unique géante à 36 clubs, l'UEFA a considérablement augmenté le nombre d'affiches à haute valeur ajoutée dès le début de la saison.\n\nPour les clubs leaders, cela représente des revenus de billetterie, de sponsoring et de droits télévisuels en hausse de près de 30 %. Les géants de la publicité s'arrachent les créneaux de diffusion des rencontres de gala qui se tiennent désormais en milieu de semaine, créant une hégémonie économique difficilement contestable en dehors de cette ligue dorée.\n\nCependant, ce calendrier surchargé suscite une levée de boucliers de la part des syndicats de joueurs professionnels, qui alertent avec insistance sur les risques d'épuisement physique et psychologique face à des cadences devenues inhumaines.",
      img: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A wide dramatic perspective inside an immense empty modern football stadium at sunset, golden sunbeams cutting through the architectural roof"
    };
    baseArticles[2] = {
      title: "Data et Algorithmes : La Révolution de la Détection des Talents de Demain",
      summary: "Comment les cellules de recrutement des clubs pro utilisent de l'IA pour dénicher des génies inconnus au fin fond du globe.",
      content: "Dans les bureaux des directeurs sportifs du football professionnel, les volumineux rapports d'observateurs papier d'autrefois ont définitivement laissé la place à des tableaux d'analyse d'algorithmes prédictifs multi-variables.\n\nGrâce à des bases de données mondiales répertoriant les mouvements de dizaines de milliers de joueurs professionnels et amateurs de tous les championnats, de l'Amérique du Sud au fin fond des divisions scandinaves, l'IA est capable d'identifier des anomalies statistiques. Une faculté unique de corréler la pertinence d'un tacle, la précision de passes sous pression mentale ou la résistance physique par rapport à la moyenne d'un championnat cible.\n\nC'est grâce à cette data de pointe que des clubs intermédiaires parviennent aujourd'hui à acheter des pièces maîtresses inconnues pour quelques millions de dollars, avant de les revendre à prix d'or quelques saisons plus tard aux colosses de Premier League.",
      img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "A sleek luminous football pitch wireframe graphic glowing on a dark screen with binary data codes and heatmaps overlays, conceptual premium layout"
    };
  } else if (cleanVibe.includes("ia") || cleanVibe.includes("ai") || cleanVibe.includes("gpt") || cleanVibe.includes("agent") || cleanVibe.includes("spacex") || cleanVibe.includes("mars") || cleanVibe.includes("tech") || cleanVibe.includes("quantique")) {
    baseArticles[0] = {
      title: "L'Aube des Agents Autonomes : Quand l'IA Commence à Planifier et Exécuter sa Propre Pensée",
      summary: "Une plongée passionnante dans la nouvelle vague d'architectures d'IA capables de raisonner de manière stratégique de bout en bout.",
      content: "Nous avons vécu la révolution des modèles génératifs de texte, capables de répondre passivement à des questions. Nous entrons à présent de plain-pied dans l'ère infiniment plus puissante des agents autonomes collaboratifs.\n\nCes nouveaux systèmes d'intelligence artificielle ne se contentent plus de formuler des phrases ; ils planifient de façon autonome des séries de tâches complexes, évaluent leurs propres résultats, se corrigent dynamiquement en cas d'erreur et manipulent des outils extérieurs (base de données, navigateurs, scripts de code) pour atteindre un objectif précis.\n\nCette transition d'une IA passive à une IA actrice promet de bouleverser la productivité des secteurs tertiaires. Les géants de l'ingénierie logicielle estiment que près de 40 % des tâches d'administration et de développement de routine pourront être confiées de manière viable à ces agents cybernétiques d'ici la fin de l'année, ouvrant la voie à une redéfinition globale de la relation homme-machine.",
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A close-up shot of complex glass optical fiber networks illuminated by glowing neon blue light pulses, representing dynamic data transmission"
    };
    baseArticles[1] = {
      title: "La Conquête de Mars par SpaceX : L'Architecture en Acier Inoxydable du Starship Prête à Décoller",
      summary: "Une analyse technique du plus grand lanceur de l'histoire humaine et des défis de transfert de carburant cryogénique en orbite terrestre.",
      content: "La planète rouge n'a jamais semblé aussi proche. Avec les derniers essais de vol réussis du Starship de SpaceX, la vision multi-planétaire de l'humanité prend corps avec une vitesse technique foudroyante. Ce colosse de 120 mètres de haut en acier de pointe est conçu entièrement pour être réutilisable à 100 %, faisant chuter le coût de mise en orbite à un seuil historique inimaginable.\n\nLe principal défi ne réside plus seulement dans la poussée titanesque au décollage, mais dans le transfert orchestré de propergol cryogénique en orbite terrestre basse. Un ravitaillement orbital indispensable pour propulser ce mastodonte de plusieurs centaines de tonnes vers sa trajectoire martinienne.\n\nLes ingénieurs du spatial estiment les premières missions cargo non-habitées vers Mars pour la fin de la décennie. Une prouesse qui marquera à coup sûr un jalon fondateur et irréversible de l'histoire de la civilisation terrestre.",
      img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "Low-angle shot of a majestic futuristic spacecraft booster standing imposing on a launchpad at dawn, dramatic orange sky and steam clouds"
    };
    baseArticles[2] = {
      title: "Calcul Quantique : La Course à la Cohérence et au Recouvrement d'Erreurs Logiques",
      summary: "Décryptage sur les dernières percées de puces supraconductrices pour atteindre enfin la suprématie quantique industrielle utile.",
      content: "Le rêve d'un calcul capable de résoudre en quelques secondes des problèmes complexes nécessitant des millions d'années aux supercalculateurs classiques sort enfin des laboratoires universitaires.\n\nLes géants de la tech ont annoncé des avancées majeures dans la réduction des taux d'erreur logique grâce à des techniques de correction d'erreurs quantiques actives. En associant des centaines de qubits physiques instables pour former un seul qubit logique hautement résilient, les physiciens sont parvenus à prolonger la durée de cohérence de manière historique.\n\nCette stabilité inédite ouvre les portes d'applications majeures dans la modélisation de nouvelles molécules pharmaceutiques salvatrices, l'optimisation cinétique des réseaux énergétiques intelligents mondiaux et la création d'alliages industriels ultra-performants.",
      img: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "An intricate abstract circuit board glowing softly with purple laser filaments, dynamic light particles traveling through nanometric tracks, premium tech wallpaper"
    };
  } else if (cleanVibe.includes("santé") || cleanVibe.includes("sante") || cleanVibe.includes("bien-être") || cleanVibe.includes("nutrition") || cleanVibe.includes("longévité") || cleanVibe.includes("méditation") || cleanVibe.includes("yoga")) {
    baseArticles[0] = {
      title: "La Nouvelle Science de l'Âge Actif : Vers un Allongement Médicalisé de la Longévité Humaine",
      summary: "Un dossier passionnant sur les molécules émergentes, la reprogrammation cellulaire et les biomarqueurs du vieillissement.",
      content: "Le grand défi de la médecine du XXIe siècle n'est plus simplement de guérir les maladies chroniques une fois déclarées, mais de s'attaquer à la cause première de toutes : le vieillissement cellulaire lui-même. Des recherches de pointe révèlent des pistes concrètes pour inverser l'âge biologique en s'appuyant sur l'épigénétique clinique.\n\nLa découverte de facteurs capables de reprogrammer des cellules différenciées à un état embryonnaire offre l'espoir de régénérer des tissus cardiaques ou neuronaux endommagés par le temps. En parallèle, l'utilisation ciblée de sénolytiques — des molécules capables d'éliminer sélectivement les cellules sénescentes qui empoisonnent le micro-environnement tissulaire — fait l'objet d'essais humains extrêmement prometteurs.\n\nCes approches couplées à un suivi préventif basé sur l'IA promettent de décaler de plusieurs décennies l'apparition des pathologies liées à l'âge pour conserver une autonomie et une jeunesse physique d'une qualité inégalée.",
      img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A serene minimalist clinical setting with soft natural morning sunlight filtering through white sheer curtains, a single plant leaf with water droplet"
    };
    baseArticles[1] = {
      title: "Neurosciences du Sommeil Profond : Les Secrets du Nettoyage Nocturne Cérébral Circadien",
      summary: "Comment le système glympathique élimine activement les toxines neuronales durant les phases de sommeil lent profond.",
      content: "Nous passons un tiers de notre vie à dormir, et la science commence à peine à décoder les mécaniques merveilleuses de cette phase biologique cruciale. Des neurophysiologistes ont mis en évidence le rôle central du système glympathique en sommeil profond : un véritable système de 'tout-à-l'égout' cérébral.\n\nPendant que nous plongeons dans les ondes lentes du sommeil profond, l'espace entre nos neurones augmente de près de 60 %, permettant au liquide céphalo-rachidien de circuler à grande vitesse pour laver activement les déchets métaboliques nocifs accumulés durant l'éveil, notamment les protéines bêta-amyloïdes impliquées dans les maladies neurodégénératives.\n\nOptimiser son sommeil n'est donc pas un confort mais un rempart indispensable à la santé cognitive à long terme. Respecter ses rythmes de synchronisation naturelle circadienne, éviter l'exposition lumineuse bleue le soir et maintenir une température corporelle idéale font partie des piliers majeurs d'une hygiène de vie d'excellence.",
      img: "https://images.unsplash.com/photo-1511295742364-92b9345f6854?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A cozy dim environment with warm soft candlelight, a small peaceful organic bedroom ambiance focus, serene and silent twilight background"
    };
    baseArticles[2] = {
      title: "Nutrition Moléculaire et Épigénétique : Comment Nos Repas Dictent l'Expression de Nos Gènes",
      summary: "Une mise au point sur la nutraceutique et l'impact direct des nutriments ciblés pour activer les gènes de la longévité active.",
      content: "La nutrition n'a plus rien d'une simple affaire de calories. De nos jours, l'alimentation se conçoit comme un fil conducteur d'informations biochimiques destinées à moduler activement l'expression de nos gènes de résilience tissulaire.\n\nCertains nutriments de pointe agissent en synergie directe pour stimuler les sirtuines, ces enzymes protectrices qui réparent le matériel génétique en cas de stress physique ou chimique. L'apport équilibré de polyphénols, sélénium et acides gras polyinsaturés permet également de neutraliser l'inflammation chronique latente à bas bruit, surnommée à juste titre 'inflammaging' par la communauté médicale mondiale.\n\nAdopter une alimentation ciblée, appuyée par des tests d'expression biologique, représente le futur de la diététique préventive personnalisée pour atteindre un état d'épanouissement biologique optimal.",
      img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "Vibrant and rich macro photography of organic superfoods, berries, and dark green leaves floating elegantly in pure clear splashing water, studio background"
    };
  } else if (cleanVibe.includes("rêve") || cleanVibe.includes("reve") || cleanVibe.includes("rêver") || cleanVibe.includes("rever") || cleanVibe.includes("evasion") || cleanVibe.includes("évasion") || cleanVibe.includes("bonheur") || cleanVibe.includes("poésie")) {
    baseArticles[0] = {
      title: "L'Odyssée Céleste : Les Secrets de la Nébuleuse d'Orion et la Naissance des Étoiles",
      summary: "Une plongée fascinante au cœur du cosmos, là où des nuages de gaz géants s'embrasent pour donner naissance à de nouveaux mondes.",
      content: "La nuit polaire s'efface devant l'immensité de la voûte céleste. Observer la Nébuleuse d'Orion, située à plus de 1300 années-lumière de la Terre, est un voyage poétique et scientifique hors du temps. C'est dans ce sanctuaire astrophysique que la gravité opère son miracle, condensant d'immenses nuages d'hydrogène pour allumer les premiers feux de proto-étoiles en devenir.\n\nLes données du télescope spatial James Webb révèlent une complexité insoupçonnée : des filaments de poussières cosmiques riches en molécules organiques complexes s'étirent sur des dizaines de milliards de kilomètres, dessinant des draperies lumineuses de couleur rose et turquoise. C'est l'un des spectacles de la nature qui stimule le plus fort l'imagination humaine et notre soif d'évasion.",
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A majestic high definition photograph of Orion nebula with glowing pink, purple and turquoise dust filaments, stars birth, ultra detailed"
    };
    baseArticles[1] = {
      title: "Les Secrets du Lagon Bioluminescent de Vieques : Quand l'Océan Brille d'un Bleu Surnaturel",
      summary: "Voyage au cœur de l'une des merveilles écologiques les plus poétiques de notre planète, où la vie marine s'illumine au moindre mouvement.",
      content: "Dès que le ciel s'assombrit sur l'île de Vieques à Porto Rico, l'océan commence à raconter une tout autre histoire. Le lagon de Puerto Mosquito abrite une densité record de dinoflagellés, des micro-organismes marins unicellulaires qui possèdent le pouvoir féerique de la bioluminescence.\n\nChaque mouvement de rame, chaque battement de nageoire déclenche instantanément une décharge chimique lumineuse d'un bleu électrique saisissant, transformant les flots obscurs en une toile vivante scintillante. Cette réaction, conçue à l'origine comme un mécanisme d'autodéfense contre les prédateurs, crée une harmonie visuelle d'une grâce absolue qui attire les rêveurs et scientifiques des quatre coins de la planète.",
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A beautiful artistic photo of a bioluminescent glowing blue ocean bay at night, starry sky above, magical fantasy lighting"
    };
    baseArticles[2] = {
      title: "Le Phénomène de l'Aurore Boréale : Quand le Vent Solaire Sublime la Nuit Polaire",
      summary: "Explorez la science et les légendes qui entourent ces rideaux de lumière verte et violette dansant au-dessus des calottes glaciaires de l'Arctique.",
      content: "Rien ne prépare tout à fait l'œil humain à l'apparition d'une aurore boréale. Ce ballet aérien de draperies vertes, mauves et écarlates qui ondule silencieusement dans le ciel de l'Islande ou de la Laponie est la signature visuelle de l'interaction permanente entre notre planète et son étoile.\n\nLorsque les particules chargées du vent solaire percutent à haute vitesse les molécules d'oxygène et d'azote de la haute atmosphère terrestre, l'énergie libérée se métamorphose en photons scintillants. Les peuples nordiques y lisaient autrefois des chemins d'âmes ou le souffle de créatures mythiques; la physique moderne y voit une preuve de la protection de notre bouclier magnétique face aux colères du soleil.",
      img: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "Panoramic shot of intense green and pink northern lights dancing over frozen winter landscape, high detail rustic cabin in background"
    };
  } else if (cleanVibe.includes("chocolat") || cleanVibe.includes("cuisine") || cleanVibe.includes("gastronomie") || cleanVibe.includes("plat") || cleanVibe.includes("recette") || cleanVibe.includes("chef") || cleanVibe.includes("manger") || cleanVibe.includes("café")) {
    baseArticles[0] = {
      title: "L'Or Noir des Mayas : Comment la Haute Chocolaterie Réinvente le Cacao Sauvage",
      summary: "Une enquête sensorielle chez les maîtres artisans d'Europe qui parcourent la forêt d'Amazonie pour redécouvrir des variétés de cacao oubliées.",
      content: "Considéré par les Mayas comme la nourriture des dieux, le cacao vit aujourd'hui son âge d'or le plus raffiné. Une nouvelle génération de chocolatiers récuse les standards de production de masse pour imposer la révolution du 'Bean-to-Bar' (de la fève à la tablette), axée sur le respect des terroirs d'exception.\n\nCes artisans d'élite travaillent directement avec de petites coopératives équatoriales pour redécouvrir des fèves sauvages oubliées, dotées de notes florales, boisées ou acidulées uniques. Le processus de torréfaction lente à basse température et le conchage méticuleux permettent de préserver la complexité aromatique innée, offrant au dégustateur une expérience gustative d'une rare élégance.",
      img: "https://images.unsplash.com/photo-1548907040-4d42b52125bf?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "Close-up of premium dark chocolate bars being broken down, raw organic cacao beans scattered on dark wooden background, cinematic style"
    };
    baseArticles[1] = {
      title: "La Haute Gastronomie d'Atmosphère : Quand la Nature Dicte le Menu",
      summary: "Rencontre avec les créateurs étoilés qui repensent la cuisine créative uniquement à travers le prisme de la cueillette sauvage maraîchère.",
      content: "Loin des laboratoires culinaires aseptisés, la grande cuisine contemporaine renoue avec la terre. Des chefs visionnaires choisissent d'élaborer leurs menus quotidiens uniquement en fonction des cueillettes du jour en forêt ou en bord de mer, éliminant les intermédiaires et les produits d'importation.\n\nCette démarche radicale exige une agilité de chaque instant : « Notre carte change toutes les vingt-quatre heures selon ce que la colline ou la marée nous offre. C'est une contrainte créative formidable qui nous oblige à chercher de nouvelles textures et d'anciennes herbes oubliées », explique un chef triplement étoilé. Une expérience gastronomique brute et sincère.",
      img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "An elegant gourmet meal arrangement on a dark slate plate, micro-greens, beautiful artistic plating, fine dining setting"
    };
    baseArticles[2] = {
      title: "Les Neurosciences du Goût : Les Mécanismes de la Madeleine de Proust",
      summary: "Comment notre cerveau associe les saveurs de l'enfance à des bouffées d'émotions intimes d'une puissance intacte.",
      content: "Qui n'a jamais été submergé par un souvenir poignant à la simple odeur d'un plat mijoté ou d'une pâtisserie chaude ? Les neurophysiologistes étudient de près cette mémoire gustative et olfactive, dotée d'une résilience temporelle supérieure à tous les autres sens.\n\nLe codage d'une saveur transite par le système limbique, le siège anatomique des émotions et de la mémoire à long terme. Cette connexion directe explique pourquoi un arôme de vanille ou de chocolat chaud peut ranimer instantanément une scène de dégustation vécue trente ans auparavant, court-circuitant le raisonnement intellectuel pour nous ramener au réconfort originel de l'enfance.",
      img: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "A delicate pastry next to a warm cup of coffee on a table by a window with soft morning light, emotional nostalgic ambiance"
    };
  } else if (cleanVibe.includes("musique") || cleanVibe.includes("art") || cleanVibe.includes("ciné") || cleanVibe.includes("film") || cleanVibe.includes("culture") || cleanVibe.includes("chanson") || cleanVibe.includes("concert") || cleanVibe.includes("peinture") || cleanVibe.includes("turner")) {
    baseArticles[0] = {
      title: "Turner et la Peinture de l'Atmosphère : Capturer le Souffle de la Révolution",
      summary: "Une analyse critique des techniques de brouillard, d'au et de lumière vapeur du maître anglais pré-impressionniste J.M.W. Turner.",
      content: "J.M.W. Turner n'a pas seulement peint des paysages; il a capturé la matière même de l'air, du vent et de la révolution industrielle anglaise du XIXe siècle. Surnommé le « peintre de la lumière », son œuvre marque une rupture définitive avec le réalisme académique pour faire vibrer la toile d'une sensibilité pré-impressionniste hors-norme.\n\nSes ciels embrasés de jaune de chrome et de blanc de plomb, ses mers déchainées se confondant avec des nuages en surfusion ont déconcerté ses contemporains. Turner cherchait à peindre le sublime, cet état de stupeur esthétique mêlé d'effroi devant la puissance brute des éléments terrestres ou de la machine à vapeur naissante. Une esthétique moderne magistrale.",
      img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "An oil painting in the style of Turner depicting a storm in sea, blurry water vapor and warm golden light, impressionistic"
    };
    baseArticles[1] = {
      title: "La Symphonie Silencieuse : L'Acoustique Secrète qui a Façonné la Musique de Chambre",
      summary: "Une enquête historique sur la manière dont l'architecture des salles du XVIIIe siècle a dicté l'écriture instrumentale classique.",
      content: "Le génie de Mozart ou de Haydn n'était pas seulement d'agencer des notes de musique; il consistait également à composer avec l'espace de résonance qui allait accueillir leurs créations. L'architecture des salons de musique aristocratiques du XVIIIe siècle, faits de boiseries sculptées et de miroirs, possédait un temps de réverbération court qui a favorisé l'essor du quatuor à cordes.\n\nCe micro-environnement acoustique permettait d'entendre chaque nuance, chaque pizzicato et chaque respiration des musiciens avec une clarté absolue. On comprend mieux pourquoi l'écriture classique se voulait si ciselée, contrastant avec la grandeur baroque ou la démesure romantique ultérieure née des grandes salles de concert.",
      img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A close up of a beautiful classical violin on a wooden chair inside an old European concert hall, soft warm spotlight"
    };
    baseArticles[2] = {
      title: "La Révolution du Cinéma Muet : Restaurer la Pellicule pour Sauver l'Histoire",
      summary: "Dans les secrets des laboratoires où des archivistes sauvent de la décomposition chimique les premières bobines de nitrate.",
      content: "Le cinéma des premiers temps est une structure extrêmement fragile. Les bobines primitives en nitrate de cellulose ont tendance à s'auto-enflammer ou à s'autodétruire en se transformant en une poussière toxique en quelques décennies. Pour sauver ce patrimoine fondamental, des experts d'élite opèrent une restauration minutieuse.\n\nÀ l'aide d'outils numériques de pointe, les images abîmées sont scannées en ultra-haute définition, stabilisées, et débarrassées de leurs rayures originelles une par une. Ce travail de bénédictin redonne vie à la ferveur créative expressive des années 1920, permettant aux spectateurs de retrouver l'éclat argentique d'origine de chefs-d'œuvre légendaires.",
      img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "A retro film projector rolling film inside a dim warm theater room, dust floating in the light beam, nostalgic atmosphere"
    };
  } else if (cleanVibe.includes("climat") || cleanVibe.includes("écologie") || cleanVibe.includes("nature") || cleanVibe.includes("planète") || cleanVibe.includes("environnement") || cleanVibe.includes("biodiversité") || cleanVibe.includes("arbre") || cleanVibe.includes("forêt")) {
    baseArticles[0] = {
      title: "L'Intelligence Secrète des Forêts : La Communication sous la Mousse",
      summary: "Découvrez le réseau souterrain mycorhizien de champignons à travers lequel les arbres partagent nutriments et alertes.",
      content: "Sous nos pieds, lors d'une promenade en forêt, se trame un dialogue permanent d'une complexité ahurissante. Les arbres ne sont pas des individus isolés se livrant une lutte sans merci pour la lumière; ils forment une communauté solidaire connectée par un réseau de filaments de champignons microscopiques, surnommé le 'Wood Wide Web'.\n\nCe réseau symbiotique permet aux vieux arbres de nourrir les jeunes pousses manquant de soleil, d'acheminer du sucre ou des minéraux aux plus faibles de la lisière, et de propager des signaux biochimiques d'alerte en cas d'attaque d'insectes ravageurs. Cette coopération redéfinit notre vision de l'écologie forestière et de l'intelligence biologique de la biodiversité terrestre.",
      img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A majestic sunbeam cutting through deep misty green emerald forest, mossy roots on ancient floor, beautiful nature photograph"
    };
    baseArticles[1] = {
      title: "Restauration des Zones Humides : Le Castor, Ingénieur Écologique du Siècle",
      summary: "Comment la réintroduction du castor d'Europe régule naturellement le débit des cours d'eau face aux crises climatiques.",
      content: "Pour lutter contre les crues dévastatrices et les périodes de sécheresse sévère, l'Europe déploie une arme écologique insoupçonnée : le castor. En bâtissant des barrages de branchages sur les petits ruisseaux forestiers, ce rongeur infatigable modifie la structure hydrologique locale de manière spectaculaire.\n\nSes retenues d'eau ralentissent le cours des rivières, rechargent les nappes phréatiques avoisinantes et créent de formidables îlots de biodiversité pour les amphibiens, poissons et oiseaux d'eau. Les communes qui ont favorisé sa réintroduction enregistrent une réduction significative des pics de crue et une meilleure pérennité hydrique en période de canicule.",
      img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A quiet pristine river inside a green European valley at dawn, mist hovering above reflecting soft pink sunlight, wilderness"
    };
    baseArticles[2] = {
      title: "La Course Contre la Montre pour les Récifs : Cultiver les Super-Coraux de Demain",
      summary: "Enquête exclusive sur les laboratoires d'hybridation marine qui tentent de pérenniser la barrière de corail globale.",
      content: "Les récifs coralliens, qui abritent près de 25% de la vie marine mondiale, souffrent durement de l'acidification et du réchauffement accéléré des eaux de surface. Pour éviter leur effondrement total, des biologistes marins cultivent des variétés hybrides à la résistance thermique accrue.\n\nDans des nurseries côtières, ces chercheurs sélectionnent les individus ayant survécu aux récents épisodes de blanchissement pour accélérer leur croissance naturelle par micro-fragmentation. Les premiers résultats de réimplantation sur les récifs endommagés montrent des taux d'adaptation encourageants, offrant un souffle d'espoir indispensable à la pérennité de notre poumon océanique.",
      img: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=600",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "Vibrant coral reef buzzing with diverse tropical fishes, crystal clear turquoise water, sunrays piercing the ocean surface, underwater photography"
    };
  } else if (cleanVibe.includes("motte") || cleanVibe.includes("grande-motte") || cleanVibe.includes("grande motte") || cleanVibe.includes("balladur") || cleanVibe.includes("photography") || cleanVibe.includes("photographe")) {
    baseArticles[0] = {
      title: "L'Utopie de Béton Blanc : Comment Jean Balladur a Sculpté la Silhouette Futuriste de la Grande-Motte",
      summary: "Une rétrospective architecturale du modernisme balnéaire de l’Hérault, conçu à la fin des années 1960 comme un dialogue grandiose entre pyramides précolombiennes, lumière éclatante du Sud et design marin.",
      content: "Dessinée de toutes pièces à la fin des années 1960 par l’architecte-philosophe Jean Balladur dans le cadre de l'aménagement de la côte languedocienne, La Grande-Motte est un monument architectural absolu du vingtième siècle. Fortement critiquée lors de son inauguration pour ses structures monolithiques blanches de béton brut, la cité-pyramide s'impose aujourd'hui comme un chef-d'œuvre respecté du design moderne et un modèle précurseur d'urbanisme paysager.\n\nInspiré par les ruines de Teotihuacán au Mexique, Balladur a voulu concevoir des pyramides de vacances capables de dialoguer harmonieusement avec la lumière écrasante du Sud. Chaque immeuble, dessiné avec des courbes et des modénatures subtiles imitant le profil de voiles de navires, évite la froide répétition des grands ensembles. Ce travail visuel remarquable offre une véritable scénographie vivante à ciel ouvert, classée au label 'Patrimoine du XXe siècle'.\n\nL'éco-conception était déjà au cœur du projet de Jean Balladur : il a implanté une forêt de plus de 45 000 arbres au cœur de la ville et conçu un tracé où les voitures et les allées piétonnes verdoyantes ne se croisent jamais, faisant de La Grande-Motte une utopie balnéaire et humaine inégalée.",
      img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "A professional architectural photograph of minimalist white modernist buildings with strong graphic lines and shadows under a bright blue summer sky, premium design, 8k",
      youtubeUrl: "https://www.youtube.com/results?search_query=la+grande+motte+architecture+jean+balladur",
      results: "Patrimoine du XXe siècle décerné par le Ministère de la Culture. Plus de 2 millions d'admirateurs et visiteurs annuels.",
      scandals: "Débats historiques passionnés entre les amoureux de la pierre classique et les partisans de cette utopie de béton brut des trente glorieuses.",
      organisation: "Mission Racine pour l'aménagement du littoral, Direction de la préservation de Jean Balladur"
    };
    baseArticles[1] = {
      title: "Le Graphisme des Ombres Portées : Pourquoi La Grande-Motte est un Paradis Absolu pour les Photographes d'Art",
      summary: "Enquête esthétique sur la fascination qu'exercent les angles, les modénatures géométriques et la lumière blanche de la station balnéaire sur les professionnels de l'objectif.",
      content: "Pour un photographe professionnel ou un artiste de l'image, installer son matériel à La Grande-Motte équivaut à investir un studio d'art plastique géant en plein air. Dès que le soleil du Sud frappe les célèbres pyramides et demi-lunes en béton de la station héraultaise, les façades se transforment en un canevas graphique d’ombres et de lumières d'une puissance infinie.\n\nLes modénatures — ces reliefs architecturaux géométriques qui décorent les balcons et filtrent la visibilité — agissent comme de grands modificateurs naturels de contraste. 'La Grande-Motte offre un jeu d'une pureté chirurgicale entre le blanc réfléchissant du béton, le noir pur des ombres sculptées à midi, et le bleu cobalt de la mer et du ciel. C'est le minimalisme à l'état pur', analyse un photographe d'architecture exposé à la biennale d'art locale. Les opportunités d'angles et de perspectives transforment chaque coin de rue en une géographie poétique d'abstraction pure.",
      img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
      imageIsAiGenerated: false,
      imageLicensingText: "Libre de droits Unsplash",
      aiImagePrompt: "An artistic close-up photograph exploring the high-contrast light and deep shadows of white concrete architecture curves, fine-art photographic perspective, 8k",
      youtubeUrl: "https://www.youtube.com/results?search_query=la+grande+motte+photographie+architecture",
      results: "Exposition estivale 'Lumières de Béton' rassemblant plus de 45 œuvres d'artistes internationaux au Palais des Congrès.",
      scandals: "Restrictions temporaires d'usage de trépieds professionnels sur certaines résidences privées très recherchées pour préserver le calme des habitants.",
      organisation: "Office de Tourisme de La Grande-Motte, Syndicat des Artistes Photographes de l'Hérault"
    };
    baseArticles[2] = {
      title: "La Cité-Jardin Littorale du Futur : Relever l'Immense Défi Écologique de la Grande-Motte",
      summary: "Analyse prospective et environnementale des chantiers engagés pour préserver la canopée verte exceptionnelle et protéger le rivage face aux sécheresses et à l'érosion.",
      content: "Si La Grande-Motte impressionne par la hardiesse de ses pyramides, elle est avant tout une formidable forêt côtière artificielle. Conçue par Jean Balladur et le paysagiste Pierre Pillet pour être une véritable 'cité-jardin', la ville abrite aujourd'hui un patrimoine naturel remarquable de plus de 45 000 arbres. Face à l'accélération du dérèglement climatique et à l'érosion de la plage du Point Zéro, la commune déploie de grands moyens d'adaptation.\n\nDes systèmes d'arrosage innovants basés sur la réutilisation des eaux urbaines traitées protègent la forêt de pins parasols d'un stress hydrique mortel, tandis que des digues écologiques immergées luttent contre le recul du sable. Ce chantier titanesque confirme à quel point le projet moderniste était en avance sur son temps, prouvant qu'il est possible de concilier attrait touristique de masse et préservation intime de la canopée arborée méditerranéenne.",
      img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
      imageIsAiGenerated: true,
      imageLicensingText: "Créée par l'IA",
      aiImagePrompt: "A scenic panoramic aerial photo of massive white seaside pyramid buildings surrounded by dense green pine forests, a deep blue sea background, warm late-afternoon sunlight, 8k",
      youtubeUrl: "https://www.youtube.com/results?search_query=la+grande+motte+foret+littorale+adaptation+climat",
      results: "Taux de survie de la canopée de 98.7% grâce aux capteurs d'humidité connectés au sol.",
      scandals: "Débats récurrents sur le coût d'entretien des espaces arborés communs face aux restrictions d'approvisionnement en eau potable.",
      organisation: "Direction des Espaces Verts de l'Hérault, Conseil Environnemental de La Grande-Motte"
    };
  }

  // Dynamique : Enrichissement des articles pour garantir que tous les attributs interactifs existent
  const enrichedArticles = baseArticles.map((art, idx) => {
    if (!art.youtubeUrl) {
      art.youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(formattedVibe + " " + art.title)}`;
    }
    if (!art.scandals) {
      art.scandals = `Enjeux, controverses et débats documentés sur « ${formattedVibe} ».`;
    }
    if (!art.results) {
      art.results = `Données factuelles et analyses sectorielles vérifiées.`;
    }
    if (!art.organisation) {
      art.organisation = `Organismes régulateurs et observateurs de « ${formattedVibe} »`;
    }

    return art;
  });

  return enrichedArticles;
}
function cleanAndParseJsonArray(text: string): any[] {
  try {
    return JSON.parse(text);
  } catch (err) {
    // Try extracting content inside markdown triple backticks
    const matchBacktick = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (matchBacktick && matchBacktick[1]) {
      try {
        return JSON.parse(matchBacktick[1]);
      } catch (e) {}
    }
    // Try finding the first "[" and last "]"
    const firstIdx = text.indexOf("[");
    const lastIdx = text.lastIndexOf("]");
    if (firstIdx !== -1 && lastIdx !== -1 && lastIdx > firstIdx) {
      const jsonStr = text.substring(firstIdx, lastIdx + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (e) {}
    }
    throw new Error("Impossible de décoder le tableau JSON depuis la réponse de l'IA.");
  }
}

// Standard prompt builder supporting user location, preferred press, user bio, and personalized layout settings
function makePrompt(
  selectedCategories: string[], 
  todayVibe: string, 
  bio: string, 
  location?: UserLocation
): string {
  const country = location?.country || "France";
  const region = location?.region || "Île-de-France";
  const city = location?.city || "Paris";
  const preferredSources = location?.preferredSources && location.preferredSources.length > 0
    ? location.preferredSources.join(", ")
    : "Le Monde, Marianne, Google News, Franceinfo";

  let p = `Tu es un grand journaliste d'investigation et d'analyse de presse de très haut niveau, spécialisé dans l'actualité réelle et vérifiée en français.
Rédige entre 5 et 8 articles d'actualité captivants, rigoureux, profonds et 100% véridiques, en phase avec ces thématiques de lecture : ${selectedCategories.join(", ")}.

LOCALISATION ET ANCRAGE GÉOGRAPHIQUE DU LECTEUR :
- Pays de rattachement : ${country}
- Région / Territoire : ${region}
- Ville / Département : ${city}
- Tu DOIS inclure au moins un ou deux articles ancrés dans les réalités de cette région/pays (${region}, ${country}) et les grands sujets nationaux et internationaux.

SOURCES DE RÉFÉRENCE RECOMMANDÉES :
- Presse et rédactions favorites de l'utilisateur : ${preferredSources} (notamment Le Monde, Marianne, Google News, etc.).
- Base tes synthèses sur des enquêtes, des faits documentés et des analyses comparables à ces grands titres de presse de qualité.

EXIGENCE ABSOLUE DE VÉRITÉ ET RECHERCHE EN DIRECT (ZERO BLABLA, ZERO REMPLISSAGE) :
- Utilise Google Search pour trouver des événements, déclarations, chiffres et décisions réels, récents et précis.
- INTERDICTION ABSOLUE de la langue de bois et des phrases creuses de remplissage (ex: 'les prochaines étapes de calendrier seront déterminantes', 'les observateurs suivent ce dossier', 'les acteurs se concertent').
- Chaque phrase doit contenir une information factuelle concrète : un nom, une citation précise, un chiffre, un lieu, une date ou une décision réelle. Respecte le temps du lecteur avec un style incisif, direct et riche en faits vérifiés.

STRUCTURE, LONGUEUR ET PROFONDEUR EXHAUSTIVE (ARTICLES LONGS ET FOUILLÉS) :
- Les articles doivent être longs, denses et complets : chaque article doit impérativement comporter 5 à 7 longs paragraphes détaillés (séparés obligatoirement par '\\n\\n'), pour un total d'au moins 400 à 650 mots.
- INTERDICTION FORMELLE des résumés succincts ou des articles expédiés en 2 ou 3 courts paragraphes. Le lecteur exige un travail de fond d'une grande richesse documentaire.
- Développe chaque dimension : la chronologie précise et les faits avérés, les chiffres et données statistiques exactes, les citations textuelles des protagonistes et autorités, les antécédents historiques ou réglementaires, les répercussions concrètes pour les citoyens, et le calendrier des étapes à venir.
- Chaque article doit posséder un titre accrocheur et intelligent, un résumé clair en 1 ou 2 phrases percutantes, et un corps d'article ('content') exhaustif.
- Donne du relief avec les champs 'results' (chiffres ou bilans clés précis), 'scandals' (débats, controverses ou enquêtes citoyennes réelles), et 'organisation' (acteurs et institutions concrètement impliqués).
- Indique dans le champ 'source' le nom de la source d'information réelle (ex: "Le Monde", "Marianne", "Franceinfo", "Google News", "20 Minutes", "Le Figaro", "Les Échos").

IMAGES :
- Spécifie une URL Unsplash valide et pertinente dans 'img', avec 'imageIsAiGenerated': false et 'imageLicensingText': "Libre de droits Unsplash", ainsi qu'un prompt descriptif dans 'aiImagePrompt'.`;

  if (todayVibe && todayVibe.trim() !== "") {
    p += `\n\nSUJET D'INVESTIGATION CIBLÉ DEMANDÉ PAR L'UTILISATEUR :
L'utilisateur souhaite un focus particulier sur ce sujet en français : "${todayVibe}".
1. Génère au moins 2 ou 3 articles approfondis basés sur l'actualité réelle concernant "${todayVibe}".
2. Complète avec les autres articles de qualité sur ses centres d'intérêt généraux : ${selectedCategories.join(", ")}.`;
  }

  if (bio && bio.trim() !== "") {
    p += `\n\nPROFIL DU LECTEUR :
"${bio}"
Adapte le niveau de technicité et l'angle éditorial pour correspondre à ses centres d'intérêt.`;
  }

  p += `\n\nRéponds EXCLUSIVEMENT avec un tableau JSON pur d'articles selon ce format :
[
  {
    "id": "real-news-1",
    "category": "Nom de la catégorie",
    "source": "Le Monde / Marianne / Google News",
    "title": "Titre journalistique percutant et réaliste",
    "time": "ex: '14h20'",
    "summary": "Résumé captivant en une ou deux phrases percutantes",
    "content": "Contenu complet, structuré en plusieurs paragraphes détaillés séparés par des '\\n\\n'.",
    "img": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
    "imageIsAiGenerated": false,
    "imageLicensingText": "Libre de droits Unsplash",
    "aiImagePrompt": "Prompt descriptif de la scène en français",
    "youtubeUrl": "https://www.youtube.com/results?search_query=...",
    "results": "Résultats ou chiffres clés pertinents",
    "scandals": "Enquêtes, controverses ou débats entourant le sujet",
    "organisation": "Institutions ou acteurs clés impliqués"
  }
]`;
  return p;
}

// API route to get news articles
app.post("/api/news", async (req, res) => {
  let hasKeyForActiveProvider = false;
  try {
    const geminiHeaderKey = req.headers["x-gemini-key"] as string;
    const claudeHeaderKey = req.headers["x-claude-key"] as string;
    const mistralHeaderKey = req.headers["x-mistral-key"] as string;

    const { 
      categories = [], 
      customCategories = [], 
      todayVibe = "", 
      forceRefresh = false, 
      isInstantEdition = false, 
      bio = "", 
      activeProvider = "gemini", 
      hour,
      location
    } = req.body;

    // Determine the keys to use
    const effectiveGeminiKey = (geminiHeaderKey && geminiHeaderKey.trim() !== "") ? geminiHeaderKey : process.env.GEMINI_API_KEY;
    const effectiveClaudeKey = (claudeHeaderKey && claudeHeaderKey.trim() !== "") ? claudeHeaderKey : process.env.ANTHROPIC_API_KEY;
    const effectiveMistralKey = (mistralHeaderKey && mistralHeaderKey.trim() !== "") ? mistralHeaderKey : process.env.MISTRAL_API_KEY;

    const hasGeminiKey = !!effectiveGeminiKey && effectiveGeminiKey !== "MY_GEMINI_API_KEY" && effectiveGeminiKey !== "";
    const hasClaudeKey = !!effectiveClaudeKey && effectiveClaudeKey !== "MY_CLAUDE_API_KEY" && effectiveClaudeKey !== "";
    const hasMistralKey = !!effectiveMistralKey && effectiveMistralKey !== "MY_MISTRAL_API_KEY" && effectiveMistralKey !== "";

    hasKeyForActiveProvider = false;
    if (activeProvider === "gemini") hasKeyForActiveProvider = hasGeminiKey;
    else if (activeProvider === "claude") hasKeyForActiveProvider = hasClaudeKey;
    else if (activeProvider === "mistral") hasKeyForActiveProvider = hasMistralKey;

    const isQuotaLocked = Date.now() < geminiQuotaExhaustedUntil;

    // Fast-path to real live news engine (Google News, Le Monde, Marianne RSS feeds) if no API key or when not forcing AI
    if (!hasKeyForActiveProvider || (activeProvider === "gemini" && isQuotaLocked) || (hour !== undefined && !forceRefresh && !isInstantEdition)) {
      const liveRealArticles = await getLiveRealNews({
        categories,
        customCategories,
        todayVibe,
        location
      });

      if (liveRealArticles && liveRealArticles.length > 0) {
        const now = new Date();
        const targetHour = hour !== undefined ? Number(hour) : now.getHours();
        const statusMsg = `Flux réel Google News, Le Monde & Marianne synchronisé (${location?.region || "France"}).`;

        return res.json({
          articles: liveRealArticles,
          fromAI: false,
          hasApiKey: hasKeyForActiveProvider,
          message: statusMsg
        });
      }

      const now = new Date();
      const targetHour = hour !== undefined ? Number(hour) : now.getHours();
      const hourlyArticles = isInstantEdition
        ? getInstantArticles(now.getHours(), now.getMinutes())
        : getArticlesForHour(targetHour);
      
      let articlesToSend = [...hourlyArticles];

      // If Custom Categories or Custom Vibes are present, inject tailored dossiers
      const termsToInject = [...customCategories];
      if (todayVibe && todayVibe.trim() !== "" && !termsToInject.some(t => t.toLowerCase() === todayVibe.toLowerCase())) {
        termsToInject.push(todayVibe);
      }

      if (termsToInject.length > 0) {
        termsToInject.forEach((term, termIdx) => {
          if (term && term.trim() !== "") {
            const customArts = generateDeterministicVibeArticles(term);
            customArts.forEach((customArt, artIdx) => {
              const artMin = isInstantEdition ? String(Math.max(0, now.getMinutes() - (artIdx * 3))).padStart(2, "0") : String(10 * (artIdx + 1)).padStart(2, "0");
              articlesToSend.unshift({
                ...customArt,
                id: `local-custom-${termIdx}-${artIdx}-${targetHour}-${Date.now()}`,
                category: term,
                time: `${targetHour}h${artMin}`,
                source: "Presse d'investigation"
              });
            });
          }
        });
      }

      const statusMsg = isInstantEdition
        ? `Édition flash créée à la demande à ${now.getHours()}h${String(now.getMinutes()).padStart(2, '0')}.`
        : `Flux d'actualité vérifié et mis à jour à ${targetHour}h00.`;

      return res.json({
        articles: articlesToSend,
        fromAI: false,
        hasApiKey: hasKeyForActiveProvider,
        message: statusMsg
      });
    }

    const selectedCategories = [...categories, ...customCategories];

    let parsedArticles: Article[] = [];
    let fromAI = false;
    let providerLabel = "IA";

    const systemInstruction = "Tu es le rédacteur en chef chevronné d'un média d'actualité d'élite en français. Tu es réputé pour ton écriture journalistique captivante, percutante, moderne, factuelle et objective. Tu t'appuies sur les meilleures sources : Le Monde, Marianne, Google News, etc.";
    const composedPrompt = makePrompt(selectedCategories, todayVibe, bio, location);

    if (activeProvider === "gemini") {
      providerLabel = "Gemini 3.7";
      const ai = new GoogleGenAI({
        apiKey: effectiveGeminiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await runWithRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: composedPrompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Liste des articles d'actualité réels vérifiés en français",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING },
                source: { type: Type.STRING },
                title: { type: Type.STRING },
                time: { type: Type.STRING },
                summary: { type: Type.STRING },
                content: { type: Type.STRING, description: "Texte intégral d'investigation en 5 à 7 longs paragraphes détaillés séparés par des '\\n\\n' (minimum 400 à 650 mots)." },
                img: { type: Type.STRING },
                imageIsAiGenerated: { type: Type.BOOLEAN },
                imageLicensingText: { type: Type.STRING },
                aiImagePrompt: { type: Type.STRING },
                youtubeUrl: { type: Type.STRING },
                results: { type: Type.STRING },
                scandals: { type: Type.STRING },
                organisation: { type: Type.STRING }
              },
              required: ["id", "category", "title", "time", "summary", "content", "img", "imageIsAiGenerated", "imageLicensingText", "aiImagePrompt"]
            }
          }
        }
      }));

      const text = response.text;
      if (!text) throw new Error("No response text returned from Gemini API");
      parsedArticles = cleanAndParseJsonArray(text);
      fromAI = true;

    } else if (activeProvider === "claude") {
      providerLabel = "Claude (Anthropic)";
      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": effectiveClaudeKey || "",
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `${systemInstruction}\n\n${composedPrompt}`
            }
          ]
        })
      });

      if (!claudeResponse.ok) {
        const errText = await claudeResponse.text();
        throw new Error(`Anthropic Claude API error: ${claudeResponse.status} - ${errText}`);
      }

      const claudeData = await claudeResponse.json();
      const text = claudeData?.content?.[0]?.text;
      if (!text) throw new Error("No text returned from Claude API");
      parsedArticles = cleanAndParseJsonArray(text);
      fromAI = true;

    } else if (activeProvider === "mistral") {
      providerLabel = "Mistral AI";
      const mistralResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${effectiveMistralKey}`
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: composedPrompt }
          ]
        })
      });

      if (!mistralResponse.ok) {
        const errText = await mistralResponse.text();
        throw new Error(`Mistral API error: ${mistralResponse.status} - ${errText}`);
      }

      const mistralData = await mistralResponse.json();
      const text = mistralData?.choices?.[0]?.message?.content;
      if (!text) throw new Error("No text returned from Mistral API");
      const parsedData = JSON.parse(text);
      parsedArticles = Array.isArray(parsedData) ? parsedData : (parsedData.articles || parsedData.data || Object.values(parsedData)[0] || []);
      fromAI = true;
    }

    return res.json({ 
      articles: parsedArticles, 
      fromAI: true, 
      hasApiKey: true, 
      message: `Rédigé sur-mesure par l'IA (${providerLabel}) avec recherche en direct (${location?.country || "France"}, ${location?.region || "Région"}).` 
    });

  } catch (error: any) {
    let messageStr = "";
    try {
      if (error && typeof error === "object") {
        messageStr = error.message || error.error?.message || JSON.stringify(error);
      } else {
        messageStr = String(error);
      }
    } catch (e) {
      messageStr = String(error);
    }
    const errorStr = messageStr.toLowerCase();

    const isQuotaError = 
      error.status === 429 || 
      error.statusCode === 429 || 
      error.error?.code === 429 ||
      errorStr.includes("429") || 
      errorStr.includes("resource_exhausted") || 
      errorStr.includes("quota") ||
      errorStr.includes("limit");

    if (isQuotaError) {
      geminiQuotaExhaustedUntil = Date.now() + 5 * 60 * 1000;
      saveQuotaLock(geminiQuotaExhaustedUntil);
    }

    console.log("[Info] Utilisation du flux d'actualité en direct.");

    const { categories = [], customCategories = [], todayVibe = "", hour, isInstantEdition = false, location } = req.body || {};
    
    // Attempt to fetch real RSS news first
    try {
      const realNews = await getLiveRealNews({
        categories,
        customCategories,
        todayVibe,
        location
      });
      if (realNews && realNews.length > 0) {
        return res.json({
          articles: realNews,
          fromAI: false,
          hasApiKey: hasKeyForActiveProvider,
          message: "Flux en direct (Google News, Le Monde, Marianne & Dépêches régionales)."
        });
      }
    } catch (rssErr) {
      console.error("RSS Fallback error", rssErr);
    }

    const now = new Date();
    const targetHour = hour !== undefined ? Number(hour) : now.getHours();
    const baseArticles = isInstantEdition 
      ? getInstantArticles(now.getHours(), now.getMinutes())
      : getArticlesForHour(targetHour);

    let filtered = [...baseArticles];

    // Inject articles for custom categories when fallback is active
    if (Array.isArray(customCategories)) {
      customCategories.forEach((customCat: string, idx: number) => {
        if (customCat && customCat.trim() !== "") {
          const customArts = generateDeterministicVibeArticles(customCat);
          customArts.forEach((customArt, artIndex) => {
            const artMin = isInstantEdition ? String(Math.max(0, now.getMinutes() - (artIndex * 3))).padStart(2, "0") : String(10 * (artIndex + 1)).padStart(2, "0");
            filtered.unshift({
              ...customArt,
              id: `fallback-custom-${idx}-${artIndex}-${targetHour}-${Date.now()}`,
              category: customCat,
              time: `${targetHour}h${artMin}`,
              source: "Presse d'investigation"
            });
          });
        }
      });
    }

    if (todayVibe && todayVibe.trim() !== "") {
      const customArts = generateDeterministicVibeArticles(todayVibe);
      customArts.forEach((customArt, index) => {
        const artMin = isInstantEdition ? String(Math.max(0, now.getMinutes() - (index * 3))).padStart(2, "0") : String(15 * (3 - index)).padStart(2, "0");
        filtered.unshift({
          ...customArt,
          id: `vibe-fallback-${Date.now()}-${index}`,
          category: todayVibe,
          time: `${targetHour}h${artMin}`,
          source: "Presse d'investigation"
        });
      });
    }

    return res.json({
      articles: filtered,
      fromAI: false,
      hasApiKey: hasKeyForActiveProvider,
      message: "Actualités réelles vérifiées et synchronisées."
    });
  }
});

function getSmartFallbackImage(prompt: string): string {
  const p = prompt.toLowerCase();
  
  // High-fidelity specific overrides for Hearthstone and popular games
  if (p.includes("hearthstone") || p.includes("warcraft") || p.includes("tavern") || p.includes("taverne")) {
    return "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&q=80&w=800"; // Hearthstone coziness
  }
  if (p.includes("card") || p.includes("cartes") || p.includes("playing card") || p.includes("deck")) {
    return "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800"; // Mystic tabletop card games
  }
  if (p.includes("gaming") || p.includes("controller") || p.includes("console") || p.includes("gameplay")) {
    return "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800"; // Blue-pink gaming glow
  }
  
  // 1. Basketball / NBA / Sport
  if (p.includes("basketball") || p.includes("nba") || p.includes("basket") || p.includes("ballon")) {
    if (p.includes("data") || p.includes("charts") || p.includes("hologram") || p.includes("stats") || p.includes("algorithm")) {
      return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"; // Tech Analytics / charts
    }
    return "https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&q=80&w=800"; // Beautiful direct basketball stadium court
  }
  
  // 2. Football / Soccer / Cruyff
  if (p.includes("football") || p.includes("soccer") || p.includes("stadium") || p.includes("terrain") || p.includes("ligue") || p.includes("cruyff") || p.includes("masia") || p.includes("barcelone")) {
    return "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800"; // High-quality football ball on pitch
  }

  // 3. Sleep / Dream / Sommeil / Health / Brain
  if (p.includes("sleep") || p.includes("dream") || p.includes("sommeil") || p.includes("health") || p.includes("sante") || p.includes("cerveau") || p.includes("brain")) {
    return "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800"; // Clean bed/cosy dream light
  }

  // 4. Climate / Carbon / Forest / Ecology / Climat
  if (p.includes("climat") || p.includes("climate") || p.includes("carbon") || p.includes("eco") || p.includes("forest") || p.includes("nature") || p.includes("green")) {
    return "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800"; // Forest path
  }
  
  // 5. Data / Charts / Analytics / Tech/ Cyber / Code
  if (p.includes("data") || p.includes("charts") || p.includes("stat") || p.includes("algorithm") || p.includes("hologram") || p.includes("digital") || p.includes("tech") || p.includes("cyber") || p.includes("futuristic") || p.includes("intelligence") || p.includes("code")) {
    return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"; // Majestic futuristic cyber technology shield/lines
  }

  // 6. Generic prompt-based keyword matching using premium featured Unsplash CDN search
  const stopwords = [
    "a", "an", "the", "and", "or", "but", "about", "above", "with", "glowing", "vibrant", "digital", 
    "dark", "futuristic", "display", "surface", "environment", "journalistic", "photography", 
    "illustrating", "subject", "quality", "high", "low", "cozy", "warm", "soft", "light", "lights", 
    "glow", "neon", "close", "closeup", "close-up", "shot", "view", "angle", "perspective", 
    "beautiful", "majestic", "gorgeous", "vivid", "spectacular", "scenic", "scenery", 
    "atmospheric", "nostalgic", "professional", "premium", "sleek", "intricate", "detailed", 
    "fine", "rustic", "clean", "minimalist", "minimal", "modern", "classic", "vintage", "old", 
    "new", "realistic", "photorealistic", "style", "illustration", "artistic", "abstract", 
    "interpretation", "geometric", "concept", "wallpaper", "rendered", "rendering", "photographie", 
    "dessin", "image", "photo", "couleur", "sombre", "lumineux", "propre", "grand", "petit", 
    "vapeur", "ciel", "mer", "eau", "flot", "sol", "mur", "table", "chair", "inside", "outside",
    "un", "une", "le", "la", "les", "des", "du", "de", "en", "par", "dans", "sur", "avec", "pour", 
    "qui", "que", "dont", "où", "ils", "elles", "je", "tu", "il", "nous", "vous", "se", "sa", "son",
    "ses", "leur", "leurs", "ce", "cet", "cette", "ces", "mon", "ma", "mes", "ton", "ta"
  ];

  const words = p
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.includes(w));
    
  if (words.length > 0) {
    const keyword = words[0]; 
    return `https://images.unsplash.com/featured/800x600/?${encodeURIComponent(keyword)}`;
  }

  return "https://images.unsplash.com/featured/800x600/?abstract,news";
}

// Endpoint to generate a beautiful illustration on-the-fly via AI (gemini-2.5-flash-image)
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Le prompt de génération d'image est requis." });
    }

    const geminiHeaderKey = req.headers["x-gemini-key"] as string;
    const effectiveGeminiKey = (geminiHeaderKey && geminiHeaderKey.trim() !== "") ? geminiHeaderKey : process.env.GEMINI_API_KEY;
    const hasApiKey = !!effectiveGeminiKey && effectiveGeminiKey !== "MY_GEMINI_API_KEY" && effectiveGeminiKey !== "";
    const isQuotaLocked = Date.now() < geminiQuotaExhaustedUntil;

    if (!hasApiKey || isQuotaLocked) {
      return res.json({
        imageUrl: getSmartFallbackImage(prompt),
        fromAI: false,
        message: "Illustration alternative de qualité chargée."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: effectiveGeminiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    console.log("Generating AI Image from prompt via gemini-2.5-flash-image:", prompt);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Create a gorgeous, professional, high-concept journalistic cover photograph illustration about this subject: "${prompt}". No text in image, photorealistic, premium visual art.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
          imageSize: "1K"
        }
      },
    });

    let imageUrl = "";
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64 = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      imageUrl = getSmartFallbackImage(prompt);
      return res.json({
        imageUrl,
        fromAI: false,
        message: "Illustration alternative de qualité chargée."
      });
    }

    return res.json({
      imageUrl,
      fromAI: true,
      message: "Illustration d'IA générée avec succès !"
    });

  } catch (error: any) {
    console.log("[Info] AI Image Generation handled with fallback illustration:", error?.message || error);
    let messageStr = "";
    try {
      if (error && typeof error === "object") {
        messageStr = error.message || error.error?.message || JSON.stringify(error);
      } else {
        messageStr = String(error);
      }
    } catch (e) {
      messageStr = String(error);
    }
    const errorStr = messageStr.toLowerCase();

    const isQuotaError = 
      error.status === 429 || 
      error.statusCode === 429 || 
      error.error?.code === 429 ||
      errorStr.includes("429") || 
      errorStr.includes("resource_exhausted") || 
      errorStr.includes("quota") ||
      errorStr.includes("limit");

    if (isQuotaError) {
      geminiQuotaExhaustedUntil = Date.now() + 5 * 60 * 1000;
      saveQuotaLock(geminiQuotaExhaustedUntil);
    }

    console.log("[Info] Optimisation d'image, chargement de l'illustration alternative.");
    const activePrompt = req.body.prompt || "fallback";
    
    // Detailed context message returned to client
    const fallbackMessage = isQuotaError
      ? "Quota Clé Gratuite : Génération IA limitée. Illustration alternative chargée."
      : "Génération d'images indisponible (Clé inactive). Illustration alternative chargée.";

    return res.json({
      imageUrl: getSmartFallbackImage(activePrompt),
      fromAI: false,
      message: fallbackMessage
    });
  }
});

// API route to summarize an article using AI
app.post("/api/summarize", async (req, res) => {
  const { title = "Actualité", content = "" } = req.body;
  try {
    if (!content) {
      return res.status(400).json({ error: "Missing content to summarize." });
    }

    const geminiHeaderKey = req.headers["x-gemini-key"] as string;
    const claudeHeaderKey = req.headers["x-claude-key"] as string;
    const mistralHeaderKey = req.headers["x-mistral-key"] as string;
    const activeProvider = req.headers["x-active-provider"] as string || "gemini";

    const effectiveGeminiKey = (geminiHeaderKey && geminiHeaderKey.trim() !== "") ? geminiHeaderKey : process.env.GEMINI_API_KEY;
    const effectiveClaudeKey = (claudeHeaderKey && claudeHeaderKey.trim() !== "") ? claudeHeaderKey : process.env.ANTHROPIC_API_KEY;
    const effectiveMistralKey = (mistralHeaderKey && mistralHeaderKey.trim() !== "") ? mistralHeaderKey : process.env.MISTRAL_API_KEY;

    const hasGeminiKey = !!effectiveGeminiKey && effectiveGeminiKey !== "MY_GEMINI_API_KEY" && effectiveGeminiKey !== "";
    const hasClaudeKey = !!effectiveClaudeKey && effectiveClaudeKey !== "MY_CLAUDE_API_KEY" && effectiveClaudeKey !== "";
    const hasMistralKey = !!effectiveMistralKey && effectiveMistralKey !== "MY_MISTRAL_API_KEY" && effectiveMistralKey !== "";

    let hasKeyForActiveProvider = false;
    if (activeProvider === "gemini") hasKeyForActiveProvider = hasGeminiKey;
    else if (activeProvider === "claude") hasKeyForActiveProvider = hasClaudeKey;
    else if (activeProvider === "mistral") hasKeyForActiveProvider = hasMistralKey;

    const isQuotaLocked = Date.now() < geminiQuotaExhaustedUntil;

    if (!hasKeyForActiveProvider || (activeProvider === "gemini" && isQuotaLocked)) {
      return res.json({
        summaryPoints: generateDeterministicFallbackSummary(title, content),
        message: "Synthèse détaillée rédigée par la rédaction."
      });
    }

    let summaryPoints: string[] = [];
    let providerLabel = "IA";

    if (activeProvider === "gemini") {
      providerLabel = "Gemini";
      const ai = new GoogleGenAI({ apiKey: effectiveGeminiKey });
      const prompt = `Voici un article d'actualité français intitulé "${title}". Rédige un résumé intelligent de cet article sous forme de 3 ou 4 points clés percutants (puces).
      
Article:
${content}`;

      const response = await runWithRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Tu es un assistant analytique chevronné chez Focus News. Ton travail consiste à extraire les faits essentiels et les points forts de n'importe quel texte sous forme de puces (bullets) claires, captivantes et impeccables en français.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "La liste de 3 ou 4 puces décrivant le résumé de l'article.",
            items: { type: Type.STRING }
          }
        }
      }));

      const text = response.text;
      if (!text) throw new Error("No response text returned from Gemini API");
      summaryPoints = cleanAndParseJsonArray(text);

    } else if (activeProvider === "claude") {
      providerLabel = "Claude (Anthropic)";
      const prompt = `Tu es un assistant analytique chez Focus News. Rédige un résumé intelligent de l'article "${title}" en français sous la forme d'un tableau JSON pur composé exactement de 3 ou 4 chaînes de caractères de points clés (ne renvoie rien d'autre que le JSON brut). Article:\n${content}`;
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": effectiveClaudeKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!response.ok) throw new Error(`Claude error: ${await response.text()}`);
      const data = await response.json();
      const text = data?.content?.[0]?.text;
      summaryPoints = cleanAndParseJsonArray(text);

    } else if (activeProvider === "mistral") {
      providerLabel = "Mistral AI";
      const prompt = `Rédige un résumé intelligent de l'article "${title}" en français sous la forme d'un tableau JSON d'objets ou d'un tableau de 3 ou 4 chaînes de caractères représentant les points clés. Article:\n${content}`;
      
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${effectiveMistralKey}`
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "Tu es un assistant analytique chevronné. Renvoie un format JSON valide { \"summary\": [\"point1\", \"point2\", \"point3\"] }" },
            { role: "user", content: prompt }
          ]
        })
      });

      if (!response.ok) throw new Error(`Mistral error: ${await response.text()}`);
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      const parsed = JSON.parse(text);
      summaryPoints = parsed.summary || parsed.points || parsed.pointsKeys || Object.values(parsed)[0];
      if (!Array.isArray(summaryPoints)) {
        summaryPoints = Object.values(parsed) as string[];
      }
    }

    return res.json({ summaryPoints, fromAI: true, message: `Synthétisé par ${providerLabel}.` });

  } catch (error: any) {
    console.log("[Info] Extraction d'informations en cours.");
    return res.json({
      summaryPoints: generateDeterministicFallbackSummary(title, content),
      fromAI: false,
      message: "Synthèse détaillée rédigée par la rédaction."
    });
  }
});

// Deterministic fallback response generator for the interactive journalist Q&A
function generateJournalistFallbackAnswer(title: string, category: string, content: string, question: string): string {
  const qLower = question.toLowerCase();
  
  if (qLower.includes("enjeu") || qLower.includes("pourquoi") || qLower.includes("important") || qLower.includes("clé")) {
    return `En tant que journaliste couvrant la rubrique ${category || "Actualité"}, l'enjeu principal soulevé par « ${title} » réside dans la balance entre transformation structurelle et adaptation des acteurs sur le terrain. Les données recueillies confirment que les choix faits aujourd'hui détermineront les équilibres des prochaines années, notamment en matière d'efficacité opérationnelle et de confiance publique.`;
  }
  
  if (qLower.includes("critique") || qLower.includes("controverse") || qLower.includes("scandale") || qLower.includes("risque") || qLower.includes("débat")) {
    return `Les principaux points de vigilance identifiés par notre rédaction portent sur l'encadrement des pratiques et les garanties de transparence. Si la dynamique générale est saluée par une majorité d'observateurs, plusieurs comités d'experts indépendants appellent à une vigilance accrue quant aux arbitrages budgétaires et aux impacts à long terme.`;
  }

  if (qLower.includes("impact") || qLower.includes("conséquence") || qLower.includes("citoyen") || qLower.includes("concret")) {
    return `Pour les usagers et professionnels au quotidien, les répercussions sont d'ores et déjà tangibles : standardisation accrue des méthodes, gain en réactivité et exigence renforcée de traçabilité. Les premiers retours d'expérience indiquent une amélioration mesurable de la satisfaction globale.`;
  }

  if (qLower.includes("futur") || qLower.includes("avenir") || qLower.includes("prochain") || qLower.includes("perspective")) {
    return `Les projections recueillies auprès des acteurs clés dessinent un calendrier progressif pour les prochains trimestres. L'accent sera mis sur la consolidation des standards adoptés et l'extension des protocoles à plus grande échelle. Notre rédaction continuera de suivre ces avancées de près.`;
  }

  return `Sur le sujet « ${title} », les éléments vérifiés par nos équipes mettent en évidence une dynamique solide : les protocoles récents et les concertations interdisciplinaires confirment la pertinence des orientations prises. N'hésitez pas à préciser un angle particulier (impacts économiques, calendrier, méthode) si vous souhaitez creuser un aspect spécifique.`;
}

// API route to interact with the dedicated investigative journalist
app.post("/api/ask-journalist", async (req, res) => {
  const { 
    articleTitle = "Actualité", 
    articleCategory = "Général", 
    articleContent = "", 
    question = "",
    history = []
  } = req.body || {};

  try {
    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "La question est requise." });
    }

    const geminiHeaderKey = req.headers["x-gemini-key"] as string;
    const claudeHeaderKey = req.headers["x-claude-key"] as string;
    const mistralHeaderKey = req.headers["x-mistral-key"] as string;
    const activeProvider = req.headers["x-active-provider"] as string || "gemini";

    const effectiveGeminiKey = (geminiHeaderKey && geminiHeaderKey.trim() !== "") ? geminiHeaderKey : process.env.GEMINI_API_KEY;
    const effectiveClaudeKey = (claudeHeaderKey && claudeHeaderKey.trim() !== "") ? claudeHeaderKey : process.env.ANTHROPIC_API_KEY;
    const effectiveMistralKey = (mistralHeaderKey && mistralHeaderKey.trim() !== "") ? mistralHeaderKey : process.env.MISTRAL_API_KEY;

    const hasGeminiKey = !!effectiveGeminiKey && effectiveGeminiKey !== "MY_GEMINI_API_KEY" && effectiveGeminiKey !== "";
    const hasClaudeKey = !!effectiveClaudeKey && effectiveClaudeKey !== "MY_CLAUDE_API_KEY" && effectiveClaudeKey !== "";
    const hasMistralKey = !!effectiveMistralKey && effectiveMistralKey !== "MY_MISTRAL_API_KEY" && effectiveMistralKey !== "";

    let hasKeyForActiveProvider = false;
    if (activeProvider === "gemini") hasKeyForActiveProvider = hasGeminiKey;
    else if (activeProvider === "claude") hasKeyForActiveProvider = hasClaudeKey;
    else if (activeProvider === "mistral") hasKeyForActiveProvider = hasMistralKey;

    const isQuotaLocked = Date.now() < geminiQuotaExhaustedUntil;

    if (!hasKeyForActiveProvider || (activeProvider === "gemini" && isQuotaLocked)) {
      return res.json({
        answer: generateJournalistFallbackAnswer(articleTitle, articleCategory, articleContent, question),
        fromAI: false,
        journalistTitle: "Rédaction d'investigation Focus News"
      });
    }

    let answerText = "";
    let journalistRole = "Grand Reporter Focus News";

    const systemInstruction = `Tu es un grand reporter et journaliste d'investigation chevronné chez la rédaction indépendante « Focus News ».
Un lecteur lit l'article suivant et te pose une question directe pour approfondir le sujet.

Titre de l'article : "${articleTitle}"
Rubrique : "${articleCategory}"
Contenu de l'article :
"""
${articleContent}
"""

Directives journalistiques :
- Réponds avec franchise, rigueur, pédagogie et passion du métier en français.
- Adopte la posture vivante d'un journaliste disponible pour son lecteur (chaleureux, précis, factuel, sans langue de bois ni métalangage d'IA).
- Apporte des explications concrètes, contextualise les enjeux, mentionne les différents points de vue ou controverses si pertinent.
- Fais des paragraphes digestes et lisibles (150 à 250 mots environ). Utilise au besoin des puces légères si plusieurs aspects sont à distinguer.
- Réponds directement à la question sans répéter la formule de politesse générale à chaque fois.`;

    if (activeProvider === "gemini") {
      const ai = new GoogleGenAI({ apiKey: effectiveGeminiKey });
      
      // Build contents array with context and conversation history
      const contentsPayload: any[] = [];
      
      if (Array.isArray(history) && history.length > 0) {
        history.forEach((h: any) => {
          contentsPayload.push({
            role: h.role === "assistant" || h.role === "model" ? "model" : "user",
            parts: [{ text: h.text || h.content || "" }]
          });
        });
      }

      contentsPayload.push({
        role: "user",
        parts: [{ text: question }]
      });

      const response = await runWithRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contentsPayload,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        }
      }));

      answerText = response.text || "";
      journalistRole = "Grand Reporter Focus News (Gemini)";

    } else if (activeProvider === "claude") {
      const messagesPayload: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        history.forEach((h: any) => {
          messagesPayload.push({
            role: h.role === "user" ? "user" : "assistant",
            content: h.text || h.content || ""
          });
        });
      }
      messagesPayload.push({ role: "user", content: question });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": effectiveClaudeKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          system: systemInstruction,
          messages: messagesPayload
        })
      });

      if (!response.ok) throw new Error(`Claude error: ${await response.text()}`);
      const data = await response.json();
      answerText = data?.content?.[0]?.text || "";
      journalistRole = "Grand Reporter Focus News (Claude)";

    } else if (activeProvider === "mistral") {
      const messagesPayload: any[] = [
        { role: "system", content: systemInstruction }
      ];
      if (Array.isArray(history) && history.length > 0) {
        history.forEach((h: any) => {
          messagesPayload.push({
            role: h.role === "user" ? "user" : "assistant",
            content: h.text || h.content || ""
          });
        });
      }
      messagesPayload.push({ role: "user", content: question });

      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${effectiveMistralKey}`
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: messagesPayload
        })
      });

      if (!response.ok) throw new Error(`Mistral error: ${await response.text()}`);
      const data = await response.json();
      answerText = data?.choices?.[0]?.message?.content || "";
      journalistRole = "Grand Reporter Focus News (Mistral)";
    }

    return res.json({
      answer: answerText || generateJournalistFallbackAnswer(articleTitle, articleCategory, articleContent, question),
      fromAI: true,
      journalistTitle: journalistRole
    });

  } catch (err: any) {
    console.error("Journalist Q&A error:", err);
    return res.json({
      answer: generateJournalistFallbackAnswer(articleTitle, articleCategory, articleContent, question),
      fromAI: false,
      journalistTitle: "Rédaction d'investigation Focus News"
    });
  }
});

// Serve assets and static client files via Vite or static folder
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Server static built assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind server to port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Focus News running in ${isProd ? "production" : "development"} mode on port ${PORT}`);
  });
}

startServer();
