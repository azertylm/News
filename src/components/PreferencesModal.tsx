import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Sparkles, Mic, Settings, Cpu, MapPin, Newspaper, Compass, Loader2, Globe2 } from "lucide-react";
import { ALL_CATEGORIES } from "../data/mockArticles";
import { UserLocation } from "../types";

export const AVAILABLE_COUNTRIES = [
  { name: "France", code: "FR", flag: "🇫🇷" },
  { name: "Belgique", code: "BE", flag: "🇧🇪" },
  { name: "Suisse", code: "CH", flag: "🇨🇭" },
  { name: "Canada", code: "CA", flag: "🇨🇦" },
  { name: "Royaume-Uni", code: "GB", flag: "🇬🇧" },
  { name: "États-Unis", code: "US", flag: "🇺🇸" },
  { name: "Allemagne", code: "DE", flag: "🇩🇪" },
  { name: "Espagne", code: "ES", flag: "🇪🇸" },
  { name: "Italie", code: "IT", flag: "🇮🇹" },
  { name: "Monde / International", code: "ALL", flag: "🌍" }
];

export const FRENCH_REGIONS = [
  { name: "Île-de-France", cities: "Paris, Versailles, Saint-Denis" },
  { name: "Auvergne-Rhône-Alpes", cities: "Lyon, Grenoble, Saint-Étienne" },
  { name: "Nouvelle-Aquitaine", cities: "Bordeaux, Limoges, Poitiers" },
  { name: "Occitanie", cities: "Toulouse, Montpellier, Nîmes" },
  { name: "Hauts-de-France", cities: "Lille, Amiens, Arras" },
  { name: "Provence-Alpes-Côte d'Azur", cities: "Marseille, Nice, Toulon" },
  { name: "Bretagne", cities: "Rennes, Brest, Quimper" },
  { name: "Grand Est", cities: "Strasbourg, Nancy, Reims, Metz" },
  { name: "Pays de la Loire", cities: "Nantes, Angers, Le Mans" },
  { name: "Normandie", cities: "Rouen, Caen, Le Havre" },
  { name: "Bourgogne-Franche-Comté", cities: "Dijon, Besançon" },
  { name: "Centre-Val de Loire", cities: "Orléans, Tours" },
  { name: "Corse", cities: "Ajaccio, Bastia" },
  { name: "Outre-Mer", cities: "Guadeloupe, Martinique, Réunion" }
];

export const TOP_PRESS_SOURCES = [
  { id: "Le Monde", name: "Le Monde", desc: "Quotidien national de référence & Enquêtes", badge: "⭐ Recommandé", defaultChecked: true },
  { id: "Marianne", name: "Marianne", desc: "Journalisme d'enquête, débats & esprit critique", badge: "⭐ Recommandé", defaultChecked: true },
  { id: "Google News", name: "Google News", desc: "Agrégateur d'actualités en temps réel et alertes", badge: "Live", defaultChecked: true },
  { id: "Franceinfo", name: "Franceinfo / AFP", desc: "Fil continu, dépêches vérifiées et direct", badge: "Direct", defaultChecked: true },
  { id: "Le Figaro", name: "Le Figaro", desc: "Actualité politique, économie et société", badge: "National", defaultChecked: false },
  { id: "Libération", name: "Libération", desc: "Société, culture, environnement et débats", badge: "National", defaultChecked: false },
  { id: "Les Échos", name: "Les Échos", desc: "Économie, marchés financiers et entreprises", badge: "Économie", defaultChecked: false },
  { id: "Presse Régionale", name: "Presse Régionale", desc: "Ouest-France, Le Parisien, Sud Ouest, France 3...", badge: "Régions", defaultChecked: true },
  { id: "Courrier International", name: "Courrier International", desc: "Le meilleur de la presse mondiale traduit", badge: "Monde", defaultChecked: false }
];

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  customCategories: string[];
  todayVibe: string;
  bio: string;
  activeProvider: "gemini" | "claude" | "mistral";
  geminiKey: string;
  claudeKey: string;
  mistralKey: string;
  location: UserLocation;
  initialTab?: "location" | "preferences" | "ai";
  onSave: (
    categories: string[],
    custom: string[],
    todayVibe: string,
    bio: string,
    activeProvider: "gemini" | "claude" | "mistral",
    geminiKey: string,
    claudeKey: string,
    mistralKey: string,
    location: UserLocation
  ) => void;
  theme: "clair" | "sombre";
}

export default function PreferencesModal({
  isOpen,
  onClose,
  selectedCategories,
  customCategories,
  todayVibe,
  bio,
  activeProvider,
  geminiKey,
  claudeKey,
  mistralKey,
  location,
  initialTab = "location",
  onSave,
  theme
}: PreferencesModalProps) {
  const [activeTab, setActiveTab] = useState<"location" | "preferences" | "ai">(initialTab);
  
  // Location States
  const [activeCountry, setActiveCountry] = useState(location?.country || "France");
  const [activeCountryCode, setActiveCountryCode] = useState(location?.countryCode || "FR");
  const [activeRegion, setActiveRegion] = useState(location?.region || "Île-de-France");
  const [activeCity, setActiveCity] = useState(location?.city || "Paris");
  const [activeSources, setActiveSources] = useState<string[]>(
    location?.preferredSources && location.preferredSources.length > 0
      ? location.preferredSources
      : ["Le Monde", "Marianne", "Franceinfo", "Google News"]
  );
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // Topics States
  const [activeCategories, setActiveCategories] = useState<string[]>(selectedCategories);
  const [activeCustom, setActiveCustom] = useState<string[]>(customCategories);
  const [activeVibe, setActiveVibe] = useState(todayVibe);
  const [newCustomInput, setNewCustomInput] = useState("");

  // AI & Keys States
  const [activeBio, setActiveBio] = useState(bio);
  const [provider, setProvider] = useState<"gemini" | "claude" | "mistral">(activeProvider);
  const [gKey, setGKey] = useState(geminiKey);
  const [cKey, setCKey] = useState(claudeKey);
  const [mKey, setMKey] = useState(mistralKey);

  // Speech Recognition States
  const [isListeningInterests, setIsListeningInterests] = useState(false);
  const [isListeningVibe, setIsListeningVibe] = useState(false);
  const [isListeningBio, setIsListeningBio] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechFeedback, setSpeechFeedback] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      setActiveCategories(selectedCategories);
      setActiveCustom(customCategories);
      setActiveVibe(todayVibe);
      setActiveBio(bio);
      setProvider(activeProvider);
      setGKey(geminiKey);
      setCKey(claudeKey);
      setMKey(mistralKey);

      if (location) {
        setActiveCountry(location.country || "France");
        setActiveCountryCode(location.countryCode || "FR");
        setActiveRegion(location.region || "Île-de-France");
        setActiveCity(location.city || "Paris");
        setActiveSources(
          location.preferredSources && location.preferredSources.length > 0
            ? location.preferredSources
            : ["Le Monde", "Marianne", "Franceinfo", "Google News"]
        );
      }
    }
  }, [isOpen, selectedCategories, customCategories, todayVibe, bio, activeProvider, geminiKey, claudeKey, mistralKey, location, initialTab]);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    if (activeCategories.includes(cat)) {
      setActiveCategories(activeCategories.filter((c) => c !== cat));
    } else {
      setActiveCategories([...activeCategories, cat]);
    }
  };

  const toggleSource = (sourceId: string) => {
    if (activeSources.includes(sourceId)) {
      if (activeSources.length > 1) {
        setActiveSources(activeSources.filter((s) => s !== sourceId));
      }
    } else {
      setActiveSources([...activeSources, sourceId]);
    }
  };

  const handleCountryChange = (cName: string, cCode: string) => {
    setActiveCountry(cName);
    setActiveCountryCode(cCode);
    if (cCode === "FR" && !activeRegion) {
      setActiveRegion("Île-de-France");
      setActiveCity("Paris");
    }
  };

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setIsDetectingGps(true);
    setGpsStatus("Détection GPS en cours...");
    
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

            setActiveCountry(country);
            setActiveCountryCode(countryCode);
            setActiveRegion(region);
            setActiveCity(city);
            setGpsStatus(`📍 Détecté : ${city}, ${region} (${country})`);
          } else {
            setGpsStatus("Position approximative détectée.");
          }
        } catch (e) {
          setGpsStatus("Localisation par défaut appliquée.");
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsStatus("Accès GPS non autorisé. Vous pouvez choisir votre région manuellement ci-dessous.");
      },
      { timeout: 7000 }
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCustomInput.trim();
    if (clean && !activeCustom.map(c => c.toLowerCase()).includes(clean.toLowerCase())) {
      setActiveCustom([...activeCustom, clean]);
      setNewCustomInput("");
    }
  };

  const removeCustom = (cat: string) => {
    setActiveCustom(activeCustom.filter((c) => c !== cat));
  };

  const handleSave = () => {
    const updatedLocation: UserLocation = {
      country: activeCountry,
      countryCode: activeCountryCode,
      region: activeRegion,
      city: activeCity,
      preferredSources: activeSources
    };

    onSave(
      activeCategories,
      activeCustom,
      activeVibe,
      activeBio,
      provider,
      gKey,
      cKey,
      mKey,
      updatedLocation
    );
    onClose();
  };

  // Web Speech API support
  const SpeechRecognitionAPI =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const startListeningInterests = () => {
    if (!SpeechRecognitionAPI) {
      setSpeechError("La reconnaissance vocale n'est pas supportée par votre navigateur actuel.");
      return;
    }
    try {
      setSpeechError(null);
      setSpeechFeedback("");
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListeningInterests(true);
      recognition.onerror = () => {
        setSpeechError("Impossible de décoder votre voix. Réessayez au calme.");
        setIsListeningInterests(false);
      };
      recognition.onend = () => setIsListeningInterests(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSpeechFeedback(transcript);
          const words = transcript
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
            .split(/\s+et\s+|\s+ou\s+|,\s*|\s+/)
            .map((w: string) => w.trim())
            .filter((w: string) => w.length > 1);

          const stopwords = ["avec", "pour", "dans", "mais", "pourquoi", "quand", "comment", "alors", "donc"];
          const filtered = words.filter((w: string) => !stopwords.includes(w.toLowerCase()));

          if (filtered.length > 0) {
            setActiveCustom((prev) => {
              const next = [...prev];
              filtered.forEach((word) => {
                const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
                if (!next.map(n => n.toLowerCase()).includes(capitalized.toLowerCase())) {
                  next.push(capitalized);
                }
              });
              return next;
            });
          }
        }
      };

      recognition.start();
    } catch (err) {
      setIsListeningInterests(false);
    }
  };

  const startListeningVibe = () => {
    if (!SpeechRecognitionAPI) return;
    try {
      setSpeechError(null);
      setSpeechFeedback("");
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListeningVibe(true);
      recognition.onerror = () => setIsListeningVibe(false);
      recognition.onend = () => setIsListeningVibe(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setActiveVibe(transcript);
          setSpeechFeedback(transcript);
        }
      };
      recognition.start();
    } catch (err) {
      setIsListeningVibe(false);
    }
  };

  const containerClass =
    theme === "clair"
      ? "bg-white text-slate-800 border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] w-full max-w-2xl rounded-3xl overflow-hidden"
      : "bg-zinc-950 text-[#f3f4f6] border border-zinc-800 shadow-2xl flex flex-col max-h-[92vh] w-full max-w-2xl rounded-3xl overflow-hidden";

  const headerBgClass =
    theme === "clair"
      ? "p-5 sm:p-6 border-b border-slate-100 bg-slate-50"
      : "p-5 sm:p-6 border-b border-zinc-900 bg-black/40";

  const tabsWrapperClass =
    theme === "clair"
      ? "flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1"
      : "flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 gap-1";

  const tabBtnInactiveClass =
    theme === "clair"
      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60";

  const bodyBgClass =
    theme === "clair" ? "bg-white overflow-y-auto p-5 sm:p-6 space-y-6 flex-1" : "bg-zinc-950 overflow-y-auto p-5 sm:p-6 space-y-6 flex-1";

  const textLabelClass =
    theme === "clair"
      ? "text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-mono flex items-center gap-1.5"
      : "text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2 font-mono flex items-center gap-1.5";

  const inputTextClass =
    theme === "clair"
      ? "w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none text-xs text-slate-800 placeholder:text-slate-400"
      : "w-full bg-zinc-900 px-3.5 py-2.5 rounded-xl border border-zinc-800 focus:border-blue-500 focus:outline-none text-xs text-zinc-100 placeholder:text-zinc-500";

  return (
    <div id="preferences-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={containerClass}>
        
        {/* Header with Title and Tabs */}
        <div className={headerBgClass}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className={`text-lg sm:text-xl font-bold font-display ${theme === "clair" ? "text-slate-900" : "text-white"}`}>
                Configuration de l'Information
              </h2>
              <p className={`text-xs mt-0.5 ${theme === "clair" ? "text-slate-500" : "text-zinc-400"}`}>
                Basé sur l'actualité réelle : Le Monde, Marianne, Google News & presse régionale.
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition cursor-pointer ${
                theme === "clair"
                  ? "hover:bg-slate-200 text-slate-400 hover:text-slate-800"
                  : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3-Tab Navigator */}
          <div className={tabsWrapperClass}>
            <button
              onClick={() => setActiveTab("location")}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "location"
                  ? "bg-blue-600 text-white shadow-sm"
                  : tabBtnInactiveClass
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">Région & Journaux</span>
            </button>

            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "preferences"
                  ? "bg-blue-600 text-white shadow-sm"
                  : tabBtnInactiveClass
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="truncate">Thématiques</span>
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "ai"
                  ? "bg-purple-600 text-white shadow-sm"
                  : tabBtnInactiveClass
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-300" />
              <span className="truncate">IA & Clés</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className={bodyBgClass}>
          
          {/* TAB 1: LOCATION & TOP JOURNALS */}
          {activeTab === "location" && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Auto Geolocation Card */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                theme === "clair" ? "bg-blue-50/60 border-blue-200" : "bg-blue-950/20 border-blue-900/40"
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className={`text-xs font-bold uppercase tracking-wider ${theme === "clair" ? "text-blue-900" : "text-blue-300"}`}>
                      Position Géographique
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${theme === "clair" ? "text-slate-600" : "text-zinc-300"}`}>
                    Position actuelle : <strong className="text-blue-600">{activeCountry}</strong> • {activeRegion} {activeCity ? `(${activeCity})` : ""}
                  </p>
                  {gpsStatus && (
                    <p className="text-[11px] font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                      {gpsStatus}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleAutoDetectLocation}
                  disabled={isDetectingGps}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm disabled:opacity-50"
                >
                  {isDetectingGps ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Compass className="w-3.5 h-3.5" />
                  )}
                  <span>{isDetectingGps ? "Détection..." : "Détecter automatiquement"}</span>
                </button>
              </div>

              {/* Country Selection */}
              <div>
                <label className={textLabelClass}>
                  <Globe2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Pays de rattachement</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_COUNTRIES.map((c) => {
                    const isSelected = activeCountry === c.name || activeCountryCode === c.code;
                    return (
                      <button
                        key={c.code}
                        onClick={() => handleCountryChange(c.name, c.code)}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                            : theme === "clair"
                            ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                            : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                        }`}
                      >
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Region & City Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={textLabelClass}>
                    <span>Région / Territoire</span>
                  </label>
                  <input
                    type="text"
                    value={activeRegion}
                    onChange={(e) => setActiveRegion(e.target.value)}
                    placeholder="Ex: Île-de-France, Bretagne, Occitanie..."
                    className={inputTextClass}
                  />
                </div>
                <div>
                  <label className={textLabelClass}>
                    <span>Ville ou Département</span>
                  </label>
                  <input
                    type="text"
                    value={activeCity}
                    onChange={(e) => setActiveCity(e.target.value)}
                    placeholder="Ex: Paris, Lyon, Bordeaux, Toulouse..."
                    className={inputTextClass}
                  />
                </div>
              </div>

              {/* Quick Select French Regions */}
              {activeCountryCode === "FR" && (
                <div>
                  <span className={`text-[11px] font-semibold block mb-2 ${theme === "clair" ? "text-slate-500" : "text-zinc-400"}`}>
                    Sélection rapide des 13 régions métropolitaines :
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border rounded-xl">
                    {FRENCH_REGIONS.map((r) => {
                      const isSel = activeRegion === r.name;
                      return (
                        <button
                          key={r.name}
                          onClick={() => {
                            setActiveRegion(r.name);
                            const firstCity = r.cities.split(",")[0].trim();
                            setActiveCity(firstCity);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] border transition cursor-pointer ${
                            isSel
                              ? "bg-blue-600 text-white border-blue-500 font-bold"
                              : theme === "clair"
                              ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                              : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                          }`}
                        >
                          {r.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Verified Press Publications Selection */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <Newspaper className="w-4 h-4 text-emerald-500" />
                  <label className={textLabelClass}>
                    <span>Journaux & Rédactions de Référence</span>
                  </label>
                </div>
                <p className={`text-xs mb-3 ${theme === "clair" ? "text-slate-600" : "text-zinc-400"}`}>
                  Sélectionnez vos rédactions d'actualité préférées (Le Monde, Marianne, Google News, etc.) :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TOP_PRESS_SOURCES.map((source) => {
                    const isChecked = activeSources.includes(source.id);
                    return (
                      <div
                        key={source.id}
                        onClick={() => toggleSource(source.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                          isChecked
                            ? theme === "clair"
                              ? "bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-xs"
                              : "bg-emerald-950/20 border-emerald-800/60 text-white"
                            : theme === "clair"
                            ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 opacity-75"
                            : "bg-zinc-900/60 hover:bg-zinc-800/60 border-zinc-800 text-zinc-400 opacity-75"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs">{source.name}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                              isChecked ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-zinc-500/10 text-zinc-500"
                            }`}>
                              {source.badge}
                            </span>
                          </div>
                          <p className={`text-[11px] mt-0.5 leading-tight ${theme === "clair" ? "text-slate-500" : "text-zinc-400"}`}>
                            {source.desc}
                          </p>
                        </div>

                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-zinc-400/40"
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TOPICS & INTERESTS */}
          {activeTab === "preferences" && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Standard Categories */}
              <div>
                <h3 className={textLabelClass}>
                  Thématiques de lecture favorites
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const isActive = activeCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                            : theme === "clair"
                            ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                            : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                        }`}
                      >
                        {isActive && <Check className="w-3 h-3" />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Today's Specific Vibe */}
              <div className={`pt-4 border-t ${theme === "clair" ? "border-slate-100" : "border-zinc-900"}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className={textLabelClass}>
                    Sujet d'investigation ciblé aujourd'hui
                  </h3>
                </div>
                <p className={`text-xs mb-2.5 ${theme === "clair" ? "text-slate-600" : "text-zinc-400"}`}>
                  Rechercher des articles réels sur un événement précis (ex: « Réforme des retraites », « Procès historique », « Élections », etc.) :
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activeVibe}
                    onChange={(e) => setActiveVibe(e.target.value)}
                    placeholder="Tapez un fait d'actualité précis..."
                    className={inputTextClass}
                  />
                  <button
                    type="button"
                    onClick={startListeningVibe}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1 cursor-pointer shrink-0 ${
                      isListeningVibe
                        ? "bg-red-600 text-white animate-pulse"
                        : theme === "clair"
                        ? "bg-slate-100 text-amber-600 border-slate-200"
                        : "bg-zinc-900 text-amber-400 border-zinc-800"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Custom Topics */}
              <div className={`pt-4 border-t ${theme === "clair" ? "border-slate-100" : "border-zinc-900"}`}>
                <h3 className={textLabelClass}>
                  Ajouter des rubriques sur-mesure
                </h3>
                <form onSubmit={handleAddCustom} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCustomInput}
                    onChange={(e) => setNewCustomInput(e.target.value)}
                    placeholder="Ex: Énergie solaire, Formule 1, Gastronomie..."
                    className={inputTextClass}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                  <button
                    type="button"
                    onClick={startListeningInterests}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 cursor-pointer shrink-0 ${
                      isListeningInterests
                        ? "bg-red-600 text-white animate-pulse"
                        : theme === "clair"
                        ? "bg-slate-100 text-amber-600 border-slate-200"
                        : "bg-zinc-900 text-amber-400 border-zinc-800"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </form>

                {activeCustom.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeCustom.map((c) => (
                      <div
                        key={c}
                        className={`px-3 py-1.5 rounded-xl text-xs border flex items-center gap-2 ${
                          theme === "clair"
                            ? "bg-slate-100 border-slate-200 text-slate-800"
                            : "bg-zinc-900 border-zinc-800 text-zinc-200"
                        }`}
                      >
                        <span className="font-semibold">{c}</span>
                        <button
                          onClick={() => removeCustom(c)}
                          className="hover:text-red-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: AI & API KEYS */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className={textLabelClass}>
                  Moteur d'Intelligence Artificielle
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "gemini", name: "Gemini 3.7", desc: "Google Search Grounding" },
                    { id: "claude", name: "Claude 3.5", desc: "Anthropic" },
                    { id: "mistral", name: "Mistral", desc: "Mistral Large" }
                  ].map((p) => {
                    const isSel = provider === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setProvider(p.id as any)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          isSel
                            ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                            : theme === "clair"
                            ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                            : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                        }`}
                      >
                        <span className="font-bold text-xs block">{p.name}</span>
                        <span className="text-[10px] opacity-75">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={textLabelClass}>
                  Profil et centres d'intérêt du lecteur
                </label>
                <textarea
                  value={activeBio}
                  onChange={(e) => setActiveBio(e.target.value)}
                  placeholder="Ex: Ingénieur passionné de politique et d'économie, je cherche des analyses factuelles étayées par des données..."
                  rows={3}
                  className={inputTextClass}
                />
              </div>

              <div className="p-3.5 rounded-xl border bg-amber-500/10 border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                💡 <strong>Garantie de factualité :</strong> Les articles générés sont systématiquement recoupés avec <strong>Google Search Grounding</strong> et les dépêches de <strong>Le Monde</strong>, <strong>Marianne</strong> et <strong>Google News</strong>.
              </div>
            </div>
          )}

        </div>

        {/* Footer with Action Buttons */}
        <div className={`p-4 sm:p-5 border-t flex gap-3 ${
          theme === "clair" ? "border-slate-100 bg-slate-50" : "border-zinc-900 bg-black/40"
        }`}>
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition uppercase tracking-wider cursor-pointer text-center ${
              theme === "clair"
                ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
            }`}
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white transition uppercase tracking-wider cursor-pointer text-center shadow-md shadow-blue-500/20"
          >
            Appliquer & Synchroniser
          </button>
        </div>

      </div>
    </div>
  );
}
