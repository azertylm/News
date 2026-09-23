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

export interface AISovereigntyTelemetry {
  tier: "phase_1_prototypage" | "phase_2_local_souverain" | "phase_3_cloud_europeen";
  providerName: "gemini" | "local_ollama" | "mistral_cloud" | "claude";
  providerLabel: string;
  model: string;
  hosting: string;
  badge: string;
  isLocal: boolean;
  isEuropeanCloud: boolean;
  fallbackTriggered: boolean;
  fallbackReason?: string;
  latencyMs: number;
}

export interface SystemAIStatus {
  activeMode: "gemini" | "hybrid_mistral" | "local_only" | "mistral_cloud_only";
  defaultMode: string;
  configuredKeys: {
    gemini: boolean;
    mistral: boolean;
    localUrl: string;
  };
  sovereigntyProfile: {
    company: "ALPHABETTE";
    founder: "Valentin RICHAUD";
    webHosting: "OVH Serveurs Souverains (alphabette.fr / alphabette.eu)";
    dataPolicy: string;
  };
  phases: {
    phase1: { name: string; provider: string; status: string };
    phase2: { name: string; provider: string; status: string };
    phase3: { name: string; provider: string; status: string };
  };
}

export type AlphabettePlan = "none" | "individual_1eur" | "bundle_3eur";

export interface AlphabetteSubscriptionState {
  isSubscribed: boolean;
  plan: AlphabettePlan;
  activatedAt?: string;
  expiresAt?: string;
  features: string[];
}

export interface UserPreferences {
  categories: string[];
  customCategories: string[];
  todayVibe?: string;
  bio?: string;
  activeProvider?: "gemini" | "hybrid_mistral" | "claude" | "mistral";
  geminiKey?: string;
  claudeKey?: string;
  mistralKey?: string;
  location?: UserLocation;
}

