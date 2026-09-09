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

export interface UserPreferences {
  categories: string[];
  customCategories: string[];
  todayVibe?: string;
  bio?: string;
  activeProvider?: "gemini" | "claude" | "mistral";
  geminiKey?: string;
  claudeKey?: string;
  mistralKey?: string;
  location?: UserLocation;
}

