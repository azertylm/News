import React, { useState, useEffect } from "react";
import { Sparkles, Heart, Bookmark, SlidersHorizontal, Info, Clock, Play, Disc, Zap, PlusCircle, FileText, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Article, UserLocation } from "./types";
import { sanitizeArticle, sanitizeText } from "./utils/textCleaner";
import { getHourlyFlashSummary, getArticlesForHour, getInstantArticles } from "./data/hourlyNews";
import { exportEditionToPdf } from "./utils/exportPdf";
import Header from "./components/Header";
import PreferencesModal from "./components/PreferencesModal";
import LocationMediaBanner from "./components/LocationMediaBanner";
import NewsArticleCard from "./components/NewsArticleCard";
import ArticleDetailModal from "./components/ArticleDetailModal";

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<"feed" | "bookmarks">("feed");
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [preferencesInitialTab, setPreferencesInitialTab] = useState<"location" | "preferences" | "ai">("location");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Location and Regional Press Preferences
  const [location, setLocation] = useState<UserLocation>(() => {
    try {
      const stored = localStorage.getItem("myNewsLocation");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      country: "France",
      countryCode: "FR",
      region: "Île-de-France",
      city: "Paris",
      preferredSources: ["Le Monde", "Marianne", "Franceinfo", "Google News"]
    };
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Feed States
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  // Live Simulated Hour State & On-Demand Instant Editions
  const currentHourLocal = new Date().getHours();
  const [selectedHour, setSelectedHour] = useState<number>(currentHourLocal);
  const [isInstantEditionSelected, setIsInstantEditionSelected] = useState<boolean>(false);
  const [instantEditionTime, setInstantEditionTime] = useState<string | null>(null);

  // Digital Live Clock State (hh:mm:ss)
  const [liveTime, setLiveTime] = useState("");

  // Preferences (Saved in localStorage)
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [todayVibe, setTodayVibe] = useState("");
  const [bio, setBio] = useState("");
  const [activeProvider, setActiveProvider] = useState<"gemini" | "claude" | "mistral">("gemini");
  const [geminiKey, setGeminiKey] = useState("");
  
  const [theme, setTheme] = useState<"clair" | "sombre">("sombre");
  
  // Custom interactive layout mode: Personalized profile-filtered feed vs global unfiltered feed
  const [isPersonalizedMode, setIsPersonalizedMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("isPersonalizedModeActive");
      return stored !== "false";
    } catch {
      return true;
    }
  });

  // Interaction Trackers (persisted locally)
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  
  // Simple toast state for notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [hasExportedEditionPdf, setHasExportedEditionPdf] = useState(false);

  const handleExportCurrentEditionPdf = () => {
    const listToExport = sortedArticles && sortedArticles.length > 0 ? sortedArticles : articles;
    if (listToExport.length === 0) {
      showToast("Aucun article à exporter pour cette édition.");
      return;
    }
    exportEditionToPdf({
      articles: listToExport,
      editionHour: selectedHour,
      region: location.region
    });
    setHasExportedEditionPdf(true);
    showToast("📄 Journal complet généré et téléchargé en PDF !");
    setTimeout(() => setHasExportedEditionPdf(false), 2500);
  };

  // Live ticking clock useEffect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setLiveTime(`${hh}:${mm}:${ss}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-detect geolocation with reverse geocoding
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setIsDetectingLocation(true);
    showToast("Recherche de votre localisation précise en cours...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          const data = await res.json();
          if (data && data.address) {
            const country = data.address.country || "France";
            const countryCode = (data.address.country_code || "fr").toUpperCase();
            const region = data.address.state || data.address.region || data.address.county || "Région";
            const city = data.address.city || data.address.town || data.address.village || data.address.municipality || region;

            const newLoc: UserLocation = {
              country,
              countryCode,
              region,
              city,
              preferredSources: location.preferredSources && location.preferredSources.length > 0
                ? location.preferredSources
                : ["Le Monde", "Marianne", "Franceinfo", "Google News"]
            };
            setLocation(newLoc);
            localStorage.setItem("myNewsLocation", JSON.stringify(newLoc));
            showToast(`📍 Région détectée : ${city}, ${region} (${country})`);
            fetchNewsForHour(selectedHour, true, { loc: newLoc });
          } else {
            showToast("Position approximative détectée.");
          }
        } catch (e) {
          showToast("Position par défaut conservée.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        showToast("Accès GPS non autorisé. Vous pouvez choisir votre région manuellement.");
      },
      { timeout: 8000 }
    );
  };

  // Save Preferences Handler - immediately synchronizes and re-fetches for real-time reactivity!
  const handleSavePreferences = (
    cats: string[],
    custom: string[],
    vibe: string,
    userBio: string,
    provider: "gemini" | "claude" | "mistral",
    gKey: string,
    cKey: string,
    mKey: string,
    updatedLocation: UserLocation
  ) => {
    setCategories(cats);
    setCustomCategories(custom);
    setTodayVibe(vibe);
    setBio(userBio);
    setActiveProvider(provider);
    setGeminiKey(gKey);
    setLocation(updatedLocation);
    
    localStorage.setItem("myNewsPrefs", JSON.stringify(cats));
    localStorage.setItem("myCustomNewsPrefs", JSON.stringify(custom));
    localStorage.setItem("myNewsVibe", vibe);
    localStorage.setItem("myNewsBio", userBio);
    localStorage.setItem("myNewsActiveProvider", provider);
    localStorage.setItem("myNewsGeminiKey", gKey);
    localStorage.setItem("myNewsLocation", JSON.stringify(updatedLocation));

    showToast("Préférences régionales et éditoriales enregistrées !");
    setPreferencesOpen(false);

    // Dynamic re-fetch with latest options to reflect new preferences immediately
    fetchNewsForHour(selectedHour, false, {
      cats,
      custom,
      vibe,
      userBio,
      prov: provider,
      gKey,
      loc: updatedLocation
    });
  };

  // Load preferences and state on mount
  useEffect(() => {
    const defaultCats = ["IA", "Tech", "Politique", "Humour", "Espace"];
    try {
      let storedTheme = localStorage.getItem("myNewsTheme");
      if (storedTheme === "mi-sombre") {
        storedTheme = "sombre";
        localStorage.setItem("myNewsTheme", "sombre");
      }
      if (storedTheme === "clair" || storedTheme === "sombre") {
        setTheme(storedTheme);
      }

      const storedPrefs = localStorage.getItem("myNewsPrefs");
      const storedCustom = localStorage.getItem("myCustomNewsPrefs");
      const storedLikes = localStorage.getItem("myNewsLikes");
      const storedBookmarks = localStorage.getItem("myNewsBookmarks");
      const storedVibe = localStorage.getItem("myNewsVibe");
      const storedLocation = localStorage.getItem("myNewsLocation");

      if (storedPrefs) setCategories(JSON.parse(storedPrefs));
      else setCategories(defaultCats);

      if (storedCustom) setCustomCategories(JSON.parse(storedCustom));
      if (storedVibe) setTodayVibe(storedVibe);
      if (storedLocation) setLocation(JSON.parse(storedLocation));

      const storedBio = localStorage.getItem("myNewsBio") || "";
      const storedProvider = (localStorage.getItem("myNewsActiveProvider") || "gemini") as "gemini" | "claude" | "mistral";
      const storedGeminiKey = localStorage.getItem("myNewsGeminiKey") || "";

      setBio(storedBio);
      setActiveProvider(storedProvider);
      setGeminiKey(storedGeminiKey);

      if (storedLikes) setLikedIds(JSON.parse(storedLikes));
      if (storedBookmarks) setBookmarkedIds(JSON.parse(storedBookmarks));
    } catch (e) {
      console.error("Error loading localStorage data:", e);
      setCategories(defaultCats);
    }
  }, []);

  // Main API-based Hourly Article fetcher (supports override parameters for instant preference reactive fetch)
  const fetchNewsForHour = async (
    hour: number, 
    isPullRefresh = false,
    overridePrefs?: {
      cats?: string[];
      custom?: string[];
      vibe?: string;
      userBio?: string;
      prov?: "gemini" | "claude" | "mistral";
      gKey?: string;
      loc?: UserLocation;
    },
    isInstant = false
  ) => {
    if (isPullRefresh || isInstant) {
      setIsGenerating(true);
    } else {
      setLoading(true);
    }

    const catsToUse = overridePrefs?.cats ?? categories;
    const customToUse = overridePrefs?.custom ?? customCategories;
    const vibeToUse = overridePrefs?.vibe ?? todayVibe;
    const bioToUse = overridePrefs?.userBio ?? bio;
    const providerToUse = overridePrefs?.prov ?? activeProvider;
    const gKeyToUse = overridePrefs?.gKey ?? geminiKey;
    const locToUse = overridePrefs?.loc ?? location;

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-gemini-key": gKeyToUse,
        },
        body: JSON.stringify({
          hour,
          forceRefresh: isPullRefresh || isInstant,
          isInstantEdition: isInstant,
          categories: catsToUse,
          customCategories: customToUse,
          todayVibe: vibeToUse,
          bio: bioToUse,
          activeProvider: providerToUse,
          location: locToUse
        })
      });
      const data = await res.json();
      
      if (data.articles) {
        const cleaned = Array.isArray(data.articles) ? data.articles.map(sanitizeArticle) : [];
        setArticles(cleaned);
        setIsAiMode(!!data.fromAI);
        setApiMessage(data.message || (isInstant ? `Édition flash instantanée générée.` : `Actualités synchronisées de ${hour}h00.`));
        if (data.hasApiKey !== undefined) {
          setHasApiKey(!!data.hasApiKey);
        }
      } else {
        setArticles([]);
        setApiMessage("Contenu indisponible.");
      }
    } catch (e) {
      // Graceful fallback to client-side deterministic real news bank on network issue
      const now = new Date();
      const rawFallback = isInstant
        ? getInstantArticles(now.getHours(), now.getMinutes())
        : getArticlesForHour(hour !== undefined ? hour : now.getHours());
      
      const fallbackArticles = rawFallback.map(sanitizeArticle);
      setArticles(fallbackArticles);
      setIsAiMode(false);
      setApiMessage(isInstant ? `Édition instantanée chargée.` : `Actualités synchronisées.`);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  // Dedicated on-demand instant article creator (works anytime, even outside scheduled hour)
  const handleCreateInstantArticles = (overrideSubject?: string) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const timeLabel = `${hh}h${mm}`;
    
    setIsInstantEditionSelected(true);
    setInstantEditionTime(timeLabel);

    showToast(`Création immédiate de l'édition ${timeLabel} (hors heure)...`);

    const customToUse = overrideSubject 
      ? Array.from(new Set([...customCategories, overrideSubject]))
      : customCategories;

    fetchNewsForHour(now.getHours(), true, {
      cats: categories,
      custom: customToUse,
      vibe: todayVibe,
      userBio: bio,
      prov: activeProvider,
      gKey: geminiKey
    }, true);
  };

  // Re-fetch automatically whenever selectedHour changes
  useEffect(() => {
    if (!isInstantEditionSelected) {
      fetchNewsForHour(selectedHour);
    }
  }, [selectedHour, isInstantEditionSelected]);

  // Handle toast notifications
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Like Toggle
  const handleToggleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (likedIds.includes(id)) {
      updated = likedIds.filter((x) => x !== id);
      showToast("Article retiré de vos mentions J'aime");
    } else {
      updated = [...likedIds, id];
      showToast("Article ajouté à vos mentions J'aime !");
    }
    setLikedIds(updated);
    localStorage.setItem("myNewsLikes", JSON.stringify(updated));
  };

  // Bookmark Toggle
  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter((x) => x !== id);
      showToast("Article retiré de vos favoris");
    } else {
      updated = [...bookmarkedIds, id];
      showToast("Article sauvegardé dans vos favoris !");
    }
    setBookmarkedIds(updated);
    localStorage.setItem("myNewsBookmarks", JSON.stringify(updated));
  };

  // Image update handler from detail modal
  const handleUpdateImage = (id: string, newUrl: string, isAi: boolean, licensingText: string) => {
    const updated = articles.map(art => {
      if (art.id === id) {
        return {
          ...art,
          img: newUrl,
          imageIsAiGenerated: isAi,
          imageLicensingText: licensingText
        };
      }
      return art;
    });
    setArticles(updated);
    if (selectedArticle && selectedArticle.id === id) {
      setSelectedArticle({
        ...selectedArticle,
        img: newUrl,
        imageIsAiGenerated: isAi,
        imageLicensingText: licensingText
      });
    }
  };

  // Share Simulation
  const handleShare = (art: Article, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: art.title,
        text: art.summary,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(`${art.title} - ${art.summary}`);
      showToast("Lien de l'article copié dans le presse-papiers !");
    }
  };

  // Map likes & bookmarks into active articles
  const enhancedArticles = articles.map((art) => ({
    ...art,
    liked: likedIds.includes(art.id),
    bookmarked: bookmarkedIds.includes(art.id)
  }));

  // Score articles for personalized prioritization based on categories, custom terms, Vibe and Bio!
  const getArticleScore = (art: Article) => {
    let score = 0;
    const lowerTitle = art.title.toLowerCase();
    const lowerSummary = art.summary.toLowerCase();
    const lowerContent = art.content.toLowerCase();
    const lowerCat = art.category.toLowerCase();

    // 1. Base category match
    const getNormalized = (cat: string) => {
      const lower = cat.toLowerCase().trim();
      if (lower === "ia") return ["ia", "intelligence artificielle"];
      if (lower === "tech") return ["tech", "high-tech"];
      if (lower === "humour") return ["humour", "insolite"];
      return [lower];
    };

    const targetCats = [...categories, ...customCategories].flatMap(c => getNormalized(c));
    if (targetCats.some(t => lowerCat.includes(t) || t.includes(lowerCat))) {
      score += 150;
    }

    // 2. Exact match of custom categories in title/summary
    customCategories.forEach(custom => {
      const trimCustom = custom.toLowerCase().trim();
      if (trimCustom) {
        if (lowerTitle.includes(trimCustom)) score += 100;
        if (lowerSummary.includes(trimCustom)) score += 80;
        if (lowerContent.includes(trimCustom)) score += 40;
      }
    });

    // 3. User Vibe alignment
    if (todayVibe) {
      const vibeWords = todayVibe.toLowerCase().split(/[\s,.'"]+/).filter(w => w.length > 2);
      vibeWords.forEach(word => {
        if (lowerTitle.includes(word)) score += 60;
        if (lowerSummary.includes(word)) score += 40;
        if (lowerContent.includes(word)) score += 20;
      });
    }

    // 4. User Bio affinity
    if (bio) {
      const bioWords = bio.toLowerCase().split(/[\s,.'"]+/).filter(w => w.length > 3);
      bioWords.forEach(word => {
        if (lowerTitle.includes(word)) score += 40;
        if (lowerSummary.includes(word)) score += 30;
        if (lowerContent.includes(word)) score += 15;
      });
    }

    return score;
  };

  // Check if article matches selected categories / custom categories
  const normalizedMatch = (artCat: string) => {
    if (categories.length === 0 && customCategories.length === 0) return true;
    const normArt = artCat.toLowerCase().trim();
    
    const getNormalized = (cat: string) => {
      const lower = cat.toLowerCase().trim();
      if (lower === "ia") return ["ia", "intelligence artificielle"];
      if (lower === "tech") return ["tech", "high-tech"];
      if (lower === "humour") return ["humour", "insolite"];
      return [lower];
    };

    const allowedTargets = [...categories, ...customCategories].flatMap(c => getNormalized(c));
    return allowedTargets.some(target => 
      normArt.includes(target) || target.includes(normArt)
    );
  };

  // Simple string-match search over title/summary combinable with personalized filters
  const filteredArticles = enhancedArticles.filter((art) => {
    // Search query constraint (if non-empty)
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchesSearch = (
        art.title.toLowerCase().includes(query) ||
        art.summary.toLowerCase().includes(query) ||
        art.category.toLowerCase().includes(query) ||
        art.source.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // Personalized category filtering
    if (isPersonalizedMode) {
      const hasPrefs = categories.length > 0 || customCategories.length > 0;
      if (hasPrefs) {
        const matchesCat = normalizedMatch(art.category);
        const matchesCustomText = customCategories.some(custom => {
          const trimCustom = custom.toLowerCase().trim();
          return trimCustom && (
            art.title.toLowerCase().includes(trimCustom) ||
            art.summary.toLowerCase().includes(trimCustom)
          );
        });
        return matchesCat || matchesCustomText;
      }
    }

    return true;
  });

  // Sort by scores in personalized mode
  const sortedArticles = isPersonalizedMode
    ? [...filteredArticles].sort((a, b) => getArticleScore(b) - getArticleScore(a))
    : filteredArticles;

  const bookmarkedArticles = enhancedArticles.filter((art) => art.bookmarked);
  const filteredBookmarks = bookmarkedArticles.filter((art) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      art.title.toLowerCase().includes(query) ||
      art.summary.toLowerCase().includes(query) ||
      art.category.toLowerCase().includes(query)
    );
  });

  // Calculate past 7 hours indices in French (e.g. 14h00, 13h00...)
  const hoursTimeline = Array.from({ length: 7 }, (_, index) => {
    return (currentHourLocal - index + 24) % 24;
  });

  const pageBgClass = 
    theme === "clair"
      ? "min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-800 transition-colors duration-300"
      : "min-h-screen bg-black text-gray-100 flex flex-col font-sans selection:bg-blue-900/40 selection:text-blue-200 transition-colors duration-300";

  return (
    <div className={pageBgClass}>
      
      {/* HEADER BAR */}
      <Header
        onOpenSettings={() => {
          setPreferencesInitialTab("preferences");
          setPreferencesOpen(true);
        }}
        onOpenLocation={() => {
          setPreferencesInitialTab("location");
          setPreferencesOpen(true);
        }}
        onRefresh={() => {
          if (isInstantEditionSelected) {
            handleCreateInstantArticles();
          } else {
            fetchNewsForHour(selectedHour, true);
          }
        }}
        onInstantGenerate={() => handleCreateInstantArticles()}
        isGenerating={isGenerating}
        isAiMode={isAiMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        message={apiMessage}
        hasApiKey={hasApiKey}
        theme={theme}
        onChangeTheme={(t) => {
          setTheme(t);
          localStorage.setItem("myNewsTheme", t);
        }}
      />

      {/* MAIN LAYOUT */}
      <main className="max-w-5xl w-full mx-auto p-4 md:px-8 md:py-6 pt-18 sm:pt-20 md:pt-20 flex-1 flex flex-col pb-8">
        
        {/* BANNER DE LOCALISATION & JOURNAUX DE RÉFÉRENCE */}
        <LocationMediaBanner
          location={location}
          onDetectLocation={handleDetectLocation}
          isDetecting={isDetectingLocation}
          onOpenLocationSettings={() => {
            setPreferencesInitialTab("location");
            setPreferencesOpen(true);
          }}
          theme={theme}
        />

        {/* TIMELINE DE SÉLECTION D'HEURES & BOUTON DE CRÉATION HORS HEURE */}
        <div className={`mb-6 p-2 rounded-2xl border ${
          theme === "clair" ? "bg-white border-slate-200" : "bg-zinc-950/50 border-zinc-900"
        }`}>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            
            {/* BOUTON PRINCIPAL D'ACTION: CRÉER DES ARTICLES HORS HEURE */}
            <button
              onClick={() => handleCreateInstantArticles()}
              disabled={isGenerating}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 border ${
                isInstantEditionSelected
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400 shadow-lg shadow-orange-500/25"
                  : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
              }`}
              title="Activer la création immédiate d'articles sans attendre l'heure"
            >
              <Zap className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin text-white" : "text-amber-400"}`} />
              <span className="font-bold">
                {isInstantEditionSelected && instantEditionTime
                  ? `⚡ Édition Directe (${instantEditionTime})`
                  : "⚡ Créer maintenant (Hors heure)"}
              </span>
              {isInstantEditionSelected && (
                <span className="bg-white/25 text-[9px] px-1.5 py-0.2 rounded font-black uppercase">ACTIF</span>
              )}
            </button>

            <span className={`text-[10px] font-black font-mono uppercase tracking-wider pl-2 ${theme === "clair" ? "text-slate-400" : "text-white/35"}`}>
              Éditions :
            </span>
            <div className="flex gap-1.5">
              {hoursTimeline.map((hourVal) => {
                const isSelected = !isInstantEditionSelected && selectedHour === hourVal;
                const isCurrentLive = currentHourLocal === hourVal;
                
                let btnStyle = "";
                if (isSelected) {
                  btnStyle = "bg-blue-600 text-white shadow-lg shadow-blue-500/25 border-blue-500";
                } else {
                  btnStyle = theme === "clair"
                    ? "text-slate-600 hover:bg-slate-100 border-slate-200 bg-slate-50/50"
                    : "text-zinc-400 hover:bg-zinc-900 border-zinc-900 bg-zinc-950/50";
                }

                return (
                  <button
                    key={hourVal}
                    onClick={() => {
                      setIsInstantEditionSelected(false);
                      setSelectedHour(hourVal);
                      showToast(`Chargement de l'actualité de ${hourVal}h00`);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 shrink-0 ${btnStyle}`}
                  >
                    {isCurrentLive && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    )}
                    <span>{String(hourVal).padStart(2, '0')}h00</span>
                    {isCurrentLive && isSelected && (
                      <span className="bg-white/20 text-[9px] px-1.5 py-0.2 rounded font-black uppercase">LIVE</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ON-DEMAND INSTANT CREATION BANNER (HORS HEURE) */}
        <div className={`mb-6 p-4 rounded-2xl border transition-all ${
          isInstantEditionSelected
            ? theme === "clair"
              ? "bg-amber-50/80 border-amber-200 text-amber-950"
              : "bg-amber-950/20 border-amber-900/40 text-amber-100"
            : theme === "clair"
            ? "bg-white border-slate-200 text-slate-800"
            : "bg-zinc-950/60 border-zinc-900 text-zinc-200"
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isInstantEditionSelected
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              }`}>
                <Zap className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Création d'articles à la demande (Hors heure)
                  </h4>
                  {isInstantEditionSelected && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.2 rounded-full font-black uppercase">
                      Édition {instantEditionTime}
                    </span>
                  )}
                </div>
                <p className="text-[11px] opacity-75 mt-0.5 leading-relaxed">
                  Pas besoin d'attendre la prochaine heure pleine : déclenchez la rédaction de 15 nouveaux articles en temps réel selon vos thématiques.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleCreateInstantArticles()}
              disabled={isGenerating}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Création en cours..." : "Créer de nouveaux articles"}</span>
            </button>
          </div>
        </div>

        {/* HOURLY TICKER FLASH HEADLINE */}
        <div className={`mb-8 px-5 py-3.5 rounded-2xl border flex items-start gap-3 relative overflow-hidden ${
          theme === "clair" 
            ? "bg-blue-50/70 border-blue-100 text-slate-800" 
            : "bg-zinc-950/75 border-zinc-900 text-zinc-100" 
        }`}>
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl pointer-events-none"></div>
          <span className="bg-blue-600/10 text-blue-500 text-[10px] font-mono font-black border border-blue-500/20 px-2 py-0.5 rounded uppercase shrink-0 mt-0.5 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            {isInstantEditionSelected && instantEditionTime ? `Flash Direct ${instantEditionTime}` : `Flash ${selectedHour}h`}
          </span>
          <p className="text-xs md:text-sm font-medium leading-relaxed italic opacity-95">
            « {getHourlyFlashSummary(selectedHour)} »
          </p>
        </div>

        {/* NAV FILTER PILLS (FEED VS FAVORIS) */}
        <div className="flex items-center justify-between border-b pb-4 mb-6 border-slate-200/50 dark:border-white/5">
          <div className={
            theme === "clair"
              ? "flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200"
              : "flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5"
          }>
            <button
              onClick={() => setActiveTab("feed")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "feed"
                  ? "bg-blue-600 text-white shadow-md"
                  : theme === "clair"
                  ? "text-slate-500 hover:text-slate-800"
                  : "text-white/40 hover:text-white/85"
              }`}
            >
              L'Actualité Brûlante
            </button>
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "bookmarks"
                  ? "bg-blue-600 text-white shadow-md"
                  : theme === "clair"
                  ? "text-slate-500 hover:text-slate-800"
                  : "text-white/40 hover:text-white/85"
              }`}
            >
              <span>Favoris Sauvegardés</span>
              {bookmarkedIds.length > 0 && (
                <span className={theme === "clair" ? "bg-slate-300/60 text-slate-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold" : "bg-white/10 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold"}>
                  {bookmarkedIds.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Button to export full current edition as a multi-page PDF newspaper */}
            <button
              id="download-edition-pdf-button"
              onClick={handleExportCurrentEditionPdf}
              className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer py-1.5 px-3 rounded-lg border transition shadow-sm ${
                hasExportedEditionPdf
                  ? "bg-rose-600 border-rose-600 text-white"
                  : theme === "clair"
                  ? "border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700"
                  : "border-rose-900/40 bg-rose-950/25 hover:bg-rose-900/40 text-rose-300"
              }`}
              title="Télécharger l'intégralité de l'édition actuelle en format PDF (Revue de presse complète)"
            >
              {hasExportedEditionPdf ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>PDF Prêt !</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>Journal en PDF</span>
                </>
              )}
            </button>

            <button
              onClick={() => setPreferencesOpen(true)}
              className={
                theme === "clair"
                  ? "flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-bold cursor-pointer py-1.5 px-3 rounded-lg border border-slate-200 bg-white shadow-sm transition"
                  : "flex items-center gap-1.5 text-xs text-white/50 hover:text-blue-400 font-bold cursor-pointer py-1.5 px-3 rounded-lg border border-white/5 bg-white/5 transition"
              }
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtres thématiques</span>
            </button>
          </div>
        </div>

        {/* PREFERENCES BANNER & TOGGLE CONTROL */}
        {activeTab === "feed" && (
          <div className={`mb-6 p-4 rounded-2xl border transition-all duration-300 ${
            theme === "clair" 
              ? "bg-slate-50 border-slate-200/85" 
              : "bg-zinc-950/40 border-zinc-900"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className={`p-2 rounded-xl shrink-0 ${
                  isPersonalizedMode 
                    ? "bg-blue-600/10 text-blue-500" 
                    : theme === "clair" ? "bg-slate-200 text-slate-500" : "bg-white/5 text-white/40"
                }`}>
                  <SlidersHorizontal className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-90 flex items-center gap-1.5">
                    Mode d'affichage personnalisable :
                    {isPersonalizedMode ? (
                      <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.2 rounded font-black uppercase">Filtré & Trié</span>
                    ) : (
                      <span className="text-[10px] bg-slate-500/10 text-slate-500 border border-slate-500/20 px-2 py-0.2 rounded font-black uppercase">Flux Intégral (15 articles)</span>
                    )}
                  </h4>
                  <p className="text-[11px] opacity-60 mt-0.5 leading-relaxed">
                    {isPersonalizedMode 
                      ? `Vos filtres thématiques préférés (${[...categories, ...customCategories].join(", ") || "Aucun"}) sont appliqués avec tri intelligent basé sur votre vibe du jour et biographie.` 
                      : "Affiche l'intégralité des 15 articles différents générés procéduralement toutes les heures."
                    }
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => {
                  const targetState = !isPersonalizedMode;
                  setIsPersonalizedMode(targetState);
                  localStorage.setItem("isPersonalizedModeActive", String(targetState));
                  showToast(targetState ? "Filtres et préférences appliqués !" : "Affichage du flux complet");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all duration-300 shrink-0 ${
                  isPersonalizedMode
                    ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-700 shadow-md shadow-blue-500/10"
                    : theme === "clair"
                    ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    : "bg-zinc-950 text-zinc-300 border-zinc-900 hover:bg-zinc-900"
                }`}
              >
                {isPersonalizedMode ? "Voir le flux complet" : "Activer mon profil"}
              </button>
            </div>

            {/* Quick stats / keywords if personalized is enabled */}
            {isPersonalizedMode && (categories.length > 0 || customCategories.length > 0 || todayVibe || bio) && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-200/40 dark:border-white/5 items-center">
                <span className="text-[10px] font-bold opacity-45 mr-1 font-mono uppercase">Interférences & Filtres actifs :</span>
                {categories.map(c => (
                  <span key={c} className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-lg border border-blue-200/50 dark:border-blue-800/20">
                    {c}
                  </span>
                ))}
                {customCategories.map(c => (
                  <span key={c} className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-lg border border-purple-200/50 dark:border-purple-800/20">
                    ★ {c}
                  </span>
                ))}
                {todayVibe && (
                  <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg border border-amber-200/50 dark:border-amber-800/20">
                    ✎ Vibe: {todayVibe}
                  </span>
                )}
                {bio && (
                  <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-lg border border-rose-200/50 dark:border-rose-800/20">
                    👤 Bio: {bio.length > 20 ? `${bio.substring(0, 20)}...` : bio}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* FEED BODY */}
        <div className="flex-1">
          {loading ? (
            /* Elegant Skeleton Loader */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map((n, i) => {
                const isFirstSkel = i === 0;
                const skeletonCardClass = 
                  theme === "clair"
                    ? "bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col justify-between p-5 animate-pulse shadow-sm"
                    : "bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden flex flex-col justify-between p-5 animate-pulse shadow-md";
                const skeletonBlockClass = 
                  theme === "clair" ? "bg-slate-200 rounded" : "bg-white/5 rounded";
                return (
                  <div key={n} className={`${skeletonCardClass} ${isFirstSkel ? "md:col-span-2 min-h-[460px]" : "min-h-[380px]"}`}>
                    <div className={`${skeletonBlockClass} ${isFirstSkel ? "h-64" : "h-44"} w-full mb-4`} />
                    <div className="space-y-3 flex-1">
                      <div className={`${skeletonBlockClass} h-4 w-1/4`} />
                      <div className={`${skeletonBlockClass} h-6 w-3/4`} />
                      <div className={`${skeletonBlockClass} h-4 w-5/6`} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* TAB 1: ARTICLES FEED */}
              {activeTab === "feed" && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {sortedArticles.length === 0 ? (
                    <div className="text-center py-16 px-4 border rounded-3xl max-w-lg mx-auto bg-white/5 border-white/5">
                      <Info className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                      <h3 className="text-sm font-bold opacity-90">Aucun résultat</h3>
                      <p className="text-xs opacity-60 mt-1 max-w-xs mx-auto">
                        Effacez les filtres ou la recherche pour afficher les articles de cette heure.
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="mt-4 text-xs font-semibold text-blue-400 hover:underline cursor-pointer"
                        >
                          Réinitialiser la recherche
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Editorial grid layout showing all 15 hourly articles */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sortedArticles.map((art, idx) => {
                        // The very first article takes the massive wide full-bleed hero slot!
                        const isPrimaryHero = idx === 0;
                        return (
                          <div 
                            key={art.id} 
                            className={isPrimaryHero ? "md:col-span-2" : "col-span-1"}
                          >
                            <NewsArticleCard
                              article={art}
                              onSelect={(a) => setSelectedArticle(a)}
                              onToggleLike={(id, e) => handleToggleLike(id, e)}
                              onToggleBookmark={(id, e) => handleToggleBookmark(id, e)}
                              onShare={(a, e) => handleShare(a, e)}
                              index={idx}
                              theme={theme}
                              isHero={isPrimaryHero}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 2: SAVED ARTICLES */}
              {activeTab === "bookmarks" && (
                <motion.div
                  key="bookmarks"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {filteredBookmarks.length === 0 ? (
                    <div className="text-center py-16 px-4 border rounded-3xl max-w-lg mx-auto bg-white/5 border-white/5">
                      <Bookmark className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                      <h3 className="text-sm font-bold opacity-90">Vos favoris sont vides</h3>
                      <p className="text-xs opacity-60 mt-1 max-w-xs mx-auto">
                        Appuyez sur l'icône de marque-page d'un article pour le conserver ici.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredBookmarks.map((art, idx) => (
                        <div key={art.id} className="col-span-1">
                          <NewsArticleCard
                            article={art}
                            onSelect={(a) => setSelectedArticle(a)}
                            onToggleLike={(id, e) => handleToggleLike(id, e)}
                            onToggleBookmark={(id, e) => handleToggleBookmark(id, e)}
                            onShare={(a, e) => handleShare(a, e)}
                            index={idx}
                            theme={theme}
                            isHero={false}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className={`py-8 text-center text-xs mt-12 border-t ${
        theme === "clair" ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-black border-white/5 text-white/35"
      }`}>
        <p className="font-medium">Focus News de l'actualité © 2026</p>
        <p className="opacity-60 mt-1">Design épuré et intelligent par Google AI Studio Build</p>
      </footer>

      {/* INTERACTIVE OVERLAYS & MODALS */}
      <AnimatePresence>
        {preferencesOpen && (
          <PreferencesModal
            isOpen={preferencesOpen}
            onClose={() => setPreferencesOpen(false)}
            selectedCategories={categories}
            customCategories={customCategories}
            todayVibe={todayVibe}
            bio={bio}
            activeProvider={activeProvider}
            geminiKey={geminiKey}
            claudeKey=""
            mistralKey=""
            location={location}
            initialTab={preferencesInitialTab}
            onSave={handleSavePreferences}
            theme={theme}
          />
        )}

        {selectedArticle && (
          <ArticleDetailModal
            isOpen={!!selectedArticle}
            onClose={() => setSelectedArticle(null)}
            article={selectedArticle}
            onToggleLike={(id) => handleToggleLike(id)}
            onToggleBookmark={(id) => handleToggleBookmark(id)}
            onUpdateImage={handleUpdateImage}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* BRIEF NOTIFICATION TOAST BOX */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-blue-600 border border-blue-500 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-2xl shadow-xl shadow-blue-600/30 font-display text-center"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
