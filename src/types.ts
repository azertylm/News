export interface Article {
  id: string;
  category: string;
  source: string;
  title: string;
  time: string;
  img: string;
  summary: string;
  content: string;
  liked?: boolean;
  bookmarked?: boolean;
  imageIsAiGenerated?: boolean;
  articleIsAiGenerated?: boolean;
  imageLicensingText?: string;
  aiImagePrompt?: string;
  aiImageLoading?: boolean;
  
  // Enhanced real-time news fields
  youtubeUrl?: string;
  results?: string;
  scandals?: string;
  organisation?: string;
  url?: string;
  
  // Custom external links requested by the user
  externalLinks?: { label: string; url: string }[];
}

export interface UserLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  preferredSources: string[];
}

// 3 Niveaux d'Accès Officiels Alphabette
export type AIAccessTier = "trial" | "byok" | "managed";

export interface AISovereigntyTelemetry {
  tier: "trial_7d" | "byok_client" | "managed_alphabette" | "local_metal" | "mistral_cloud" | "phase_1_prototypage" | "phase_2_local_souverain" | "phase_3_cloud_europeen";
  providerName: "mistral_cloud" | "mistral_local" | "gemini" | "local_ollama";
  providerLabel: string;
  model: string;
  hosting: string;
  badge: string;
  isLocal: boolean;
  isEuropeanCloud: boolean;
  rgpdCompliant: boolean;
  zeroTraining: boolean;
  fallbackTriggered: boolean;
  fallbackReason?: string;
  latencyMs: number;
}

export interface SystemAIStatus {
  activeMode: "mistral_exclusive" | "local_metal" | "mistral_cloud" | "hybrid_mistral" | "gemini" | "local_only" | "mistral_cloud_only";
  defaultMode: string;
  configuredKeys: {
    mistral: boolean;
    gemini?: boolean;
    localUrl: string;
    baseUrl: string;
    model: string;
  };
  sovereigntyProfile: {
    company: "ALPHABETTE";
    founder: "Valentin RICHAUD";
    webHosting: "OVH Serveurs Souverains (alphabette.fr / alphabette.eu)";
    aiProvider: "Mistral AI Exclusif (France / Union Européenne)";
    dataPolicy: "Conformité RGPD native, aucune réutilisation pour entraînement public, données hébergées en UE";
    centralHub: "http://alphabette.fr";
  };
  phases: {
    phase1: { name: string; provider: string; status: string };
    phase2: { name: string; provider: string; status: string };
    phase3: { name: string; provider: string; status: string };
  };
}

// Grille Tarifaire Officielle ALPHABETTE (Abonnements Annuels)
export type AlphabettePlan = 
  | "trial_7d"             // Période d'essai 7 jours offerts (clé Alphabette)
  | "individual_byok_15"   // Formule BYOK (Clé client) : 15 € / an
  | "individual_confort_15"// Formule Confort (Clé Alphabette incluse) : 15 € / an
  | "bundle_byok_40"       // Pass Bouquet BYOK (Toutes les applications) : 40 € / an
  | "bundle_integral_40"   // Pass Bouquet Intégral (Toutes les applications) : 40 € / an
  | "individual_byok_39"   // Rétrocompatibilité
  | "individual_confort_59"// Rétrocompatibilité
  | "bundle_byok_99"       // Rétrocompatibilité
  | "bundle_integral_199"  // Rétrocompatibilité
  | "individual_1eur"      // Rétrocompatibilité
  | "bundle_3eur"          // Rétrocompatibilité
  | "none";

export interface AlphabetteSubscriptionState {
  isSubscribed: boolean;
  plan: AlphabettePlan;
  accessMode: AIAccessTier;
  activatedAt?: string;
  expiresAt?: string;
  daysRemainingTrial?: number;
  features: string[];
}

export interface UserPreferences {
  categories: string[];
  customCategories: string[];
  todayVibe?: string;
  bio?: string;
  accessMode?: AIAccessTier;
  activeProvider?: "mistral" | "hybrid_mistral" | "gemini";
  mistralKey?: string;
  geminiKey?: string;
  location?: UserLocation;
}

// Format standardisé d'échange de données inter-applications ALPHABETTE
export interface AlphabetteDataBundle {
  schemaVersion: "alphabette-interchange-v1.0";
  applicationSource: "Focus News — Infos Perso Grand Format";
  hubUrl: "http://alphabette.fr";
  exportedAt: string;
  userProfile: {
    location?: UserLocation;
    selectedTopics: string[];
    customTopics: string[];
    vibe?: string;
  };
  articlesCount: number;
  articles: Array<{
    id: string;
    title: string;
    category: string;
    source: string;
    summary: string;
    content: string;
    url?: string;
    timestamp: string;
    results?: string;
    scandals?: string;
    organisation?: string;
  }>;
}
