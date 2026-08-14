import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Sparkles, Mic, Settings, Cpu, User, Eye, EyeOff, Key } from "lucide-react";
import { ALL_CATEGORIES } from "../data/mockArticles";

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
  onSave: (
    categories: string[],
    custom: string[],
    todayVibe: string,
    bio: string,
    activeProvider: "gemini" | "claude" | "mistral",
    geminiKey: string,
    claudeKey: string,
    mistralKey: string
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
  onSave,
  theme
}: PreferencesModalProps) {
  const [activeTab, setActiveTab] = useState<"preferences" | "ai">("preferences");
  const [activeCategories, setActiveCategories] = useState<string[]>(selectedCategories);
  const [activeCustom, setActiveCustom] = useState<string[]>(customCategories);
  const [activeVibe, setActiveVibe] = useState(todayVibe);
  const [newCustomInput, setNewCustomInput] = useState("");

  // AI & Keys internal states
  const [activeBio, setActiveBio] = useState(bio);
  const [provider, setProvider] = useState<"gemini" | "claude" | "mistral">(activeProvider);
  const [gKey, setGKey] = useState(geminiKey);
  const [cKey, setCKey] = useState(claudeKey);
  const [mKey, setMKey] = useState(mistralKey);

  // Hidden/Visible password toggle
  const [showGKey, setShowGKey] = useState(false);
  const [showCKey, setShowCKey] = useState(false);
  const [showMKey, setShowMKey] = useState(false);

  // Speech Recognition States
  const [isListeningInterests, setIsListeningInterests] = useState(false);
  const [isListeningVibe, setIsListeningVibe] = useState(false);
  const [isListeningBio, setIsListeningBio] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechFeedback, setSpeechFeedback] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActiveCategories(selectedCategories);
      setActiveCustom(customCategories);
      setActiveVibe(todayVibe);
      setActiveBio(bio);
      setProvider(activeProvider);
      setGKey(geminiKey);
      setCKey(claudeKey);
      setMKey(mistralKey);
    }
  }, [isOpen, selectedCategories, customCategories, todayVibe, bio, activeProvider, geminiKey, claudeKey, mistralKey]);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    if (activeCategories.includes(cat)) {
      setActiveCategories(activeCategories.filter((c) => c !== cat));
    } else {
      setActiveCategories([...activeCategories, cat]);
    }
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
    onSave(
      activeCategories,
      activeCustom,
      activeVibe,
      activeBio,
      provider,
      gKey,
      cKey,
      mKey
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

      recognition.onstart = () => {
        setIsListeningInterests(true);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        if (event.error === "not-allowed") {
          setSpeechError("L'accès au microphone a été refusé. Veuillez vérifier les permissions.");
        } else {
          setSpeechError("Impossible de décoder votre voix. Réessayez au calme.");
        }
        setIsListeningInterests(false);
      };

      recognition.onend = () => {
        setIsListeningInterests(false);
      };

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
      console.error(err);
      setSpeechError("Impossible de démarrer l'enregistrement vocal.");
      setIsListeningInterests(false);
    }
  };

  const startListeningVibe = () => {
    if (!SpeechRecognitionAPI) {
      setSpeechError("La reconnaissance vocale n'est pas supportée.");
      return;
    }
    try {
      setSpeechError(null);
      setSpeechFeedback("");
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningVibe(true);
      };

      recognition.onerror = () => {
        setSpeechError("Décodage de la voix impossible.");
        setIsListeningVibe(false);
      };

      recognition.onend = () => {
        setIsListeningVibe(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setActiveVibe(transcript);
          setSpeechFeedback(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setSpeechError("Impossible de démarrer le micro.");
      setIsListeningVibe(false);
    }
  };

  const startListeningBio = () => {
    if (!SpeechRecognitionAPI) {
      setSpeechError("La reconnaissance vocale n'est pas supportée.");
      return;
    }
    try {
      setSpeechError(null);
      setSpeechFeedback("");
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningBio(true);
      };

      recognition.onerror = () => {
        setSpeechError("Décodage vocal de la description impossible.");
        setIsListeningBio(false);
      };

      recognition.onend = () => {
        setIsListeningBio(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setActiveBio((prev) => {
            return prev ? `${prev} ${transcript}` : transcript;
          });
          setSpeechFeedback(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setSpeechError("Erreur microphone.");
      setIsListeningBio(false);
    }
  };

  // Conditional styling class properties
  const containerClass = 
    theme === "clair"
      ? "bg-white text-slate-800 border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] w-full max-w-xl rounded-3xl overflow-hidden"
      : theme === "sombre"
      ? "bg-black text-[#f3f4f6] border border-zinc-905 shadow-2xl flex flex-col max-h-[90vh] w-full max-w-xl rounded-3xl overflow-hidden animate-fade-in"
      : "glass-panel w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200";

  const headerBgClass = 
    theme === "clair"
      ? "p-6 border-b border-slate-100 bg-slate-50 pb-4"
      : "p-6 border-b border-white/5 bg-black/20 pb-4";

  const closeBtnClass = 
    theme === "clair"
      ? "p-2 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-full text-slate-400 hover:text-slate-800 transition cursor-pointer"
      : "p-2 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-full text-white/40 hover:text-white transition cursor-pointer";

  const titleClass = 
    theme === "clair" ? "text-xl font-bold font-display text-slate-900" : "text-xl font-bold font-display text-white";

  const descClass = 
    theme === "clair" ? "text-xs text-slate-500 mt-1" : "text-xs text-white/40 mt-1";

  const tabsWrapperClass = 
    theme === "clair"
      ? "flex bg-slate-100 p-1 rounded-xl border border-slate-200"
      : "flex bg-white/5 p-1 rounded-xl border border-white/5";

  const tabBtnInactiveClass = 
    theme === "clair"
      ? "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
      : "text-white/60 hover:text-white hover:bg-white/5";

  const bodyBgClass = 
    theme === "clair" ? "bg-white overflow-y-auto p-6 space-y-6 flex-1" : "overflow-y-auto p-6 space-y-6 flex-1";

  const feedbackBgClass = 
    theme === "clair"
      ? "text-[11px] text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col gap-1"
      : "text-[11px] text-white/50 bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col gap-1";

  const textLabelClass = 
    theme === "clair" ? "text-xs font-bold uppercase tracking-wider text-slate-550 mb-3 font-mono block" : "text-xs font-bold uppercase tracking-wider text-white/40 mb-3 font-mono block";

  const inputTextClass = 
    theme === "clair"
      ? "flex-1 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-350 focus:border-blue-500 focus:bg-white focus:outline-none text-xs text-slate-800 placeholder:text-slate-400 font-sans"
      : "flex-1 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 hover:border-white/10 focus:border-amber-500/50 focus:outline-none text-xs text-gray-200 placeholder:text-white/30";

  const vocalBtnInactiveClass = 
    theme === "clair"
      ? "bg-slate-100 text-amber-600 border border-slate-200 hover:bg-amber-50"
      : "bg-white/5 text-amber-400 border border-white/5 hover:bg-white/10";

  const customTagWrapperClass = 
    theme === "clair"
      ? "bg-slate-100 border border-slate-200 text-slate-700 pl-3 pr-2 py-1.5 rounded-xl text-xs flex items-center gap-2"
      : "bg-white/5 border border-white/5 text-gray-300 pl-3 pr-2 py-1.5 rounded-xl text-xs flex items-center gap-2";

  const footerWrapperClass = 
    theme === "clair"
      ? "p-6 border-t border-slate-105 bg-slate-50 flex gap-3"
      : "p-6 border-t border-white/5 bg-black/40 flex gap-3";

  const cancelBtnClass = 
    theme === "clair"
      ? "flex-1 bg-slate-200 hover:bg-slate-300 border border-slate-300 py-3 rounded-xl font-bold text-xs text-slate-705 transition uppercase tracking-wider cursor-pointer text-center"
      : "flex-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 py-3 rounded-xl font-bold text-xs text-white/80 transition uppercase tracking-wider cursor-pointer text-center";

  return (
    <div id="preferences-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={containerClass}>
        
        {/* Header with Title and Tab Navigation */}
        <div className={headerBgClass}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className={titleClass}>Centre de Préférences Connecté</h2>
              <p className={descClass}>Configurez vos filtres et intégrez les intelligences artificielles.</p>
            </div>
            <button 
              onClick={onClose} 
              className={closeBtnClass}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Elegant Tabs */}
          <div className={tabsWrapperClass}>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "preferences"
                  ? "bg-blue-600 text-white shadow-md font-extrabold"
                  : tabBtnInactiveClass
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Mes Thématiques</span>
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "ai"
                  ? "bg-purple-600 text-white shadow-md font-extrabold"
                  : tabBtnInactiveClass
              }`}
            >
              <Cpu className="w-3.5 h-3.5 animate-pulse text-purple-400" />
              <span>Paramètres IA & Clés</span>
            </button>
          </div>
        </div>

        {/* Content body (scrollable) */}
        <div className={bodyBgClass}>

          {/* Feedback & Error Banner */}
          {speechError && (
            <div className="text-xs text-red-500 font-semibold bg-red-500/10 p-3 rounded-2xl border border-red-500/10 animate-fade-in">
              ⚠️ {speechError}
            </div>
          )}

          {speechFeedback && (
            <div className={feedbackBgClass}>
              <span className="font-bold text-blue-600 uppercase tracking-wider text-[9px] font-mono">Message capté par la voix :</span>
              <p className="italic">« {speechFeedback} »</p>
            </div>
          )}
          
          {activeTab === "preferences" ? (
            <div className="space-y-6">
              {/* Default Standard Categories section */}
              <div>
                <h3 className={textLabelClass}>
                  Thématiques de lecture favorites
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const isActive = activeCategories.includes(cat);
                    const catBtnClass = 
                      isActive
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/15"
                        : theme === "clair"
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900"
                        : "bg-white/5 text-white/60 border-white/5 hover:border-white/10 hover:text-white";
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition duration-200 flex items-center gap-1.5 cursor-pointer ${catBtnClass}`}
                      >
                        {isActive && <Check className="w-3 h-3" />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Envie de lecture aujourd'hui */}
              <div className={`pt-5 border-t ${theme === "clair" ? "border-slate-100" : "border-white/5"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <h3 className={textLabelClass}>
                    De quoi avez-vous envie aujourd'hui ?
                  </h3>
                </div>
                <p className={`text-xs mb-3 leading-relaxed ${theme === "clair" ? "text-slate-600" : "text-white/60"}`}>
                  L'intelligence artificielle créera instantanément ou filtrera l'actualité selon votre envie du moment.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activeVibe}
                    onChange={(e) => setActiveVibe(e.target.value)}
                    placeholder="Ex: Les dernières puces de Nvidia, ou les résultats d'athlétisme..."
                    className={inputTextClass}
                  />
                  <button
                    type="button"
                    onClick={startListeningVibe}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center shrink-0 ${
                      isListeningVibe 
                        ? "bg-amber-500 text-black border-amber-400 font-bold scale-105 animate-pulse" 
                        : vocalBtnInactiveClass
                    }`}
                    title="Dicter votre envie de lecture"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI Custom categories section */}
              <div className={`pt-5 border-t ${theme === "clair" ? "border-slate-100" : "border-white/5"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                  <h3 className={textLabelClass}>
                    Sujets d'intérêts sur mesure
                  </h3>
                </div>
                <p className={`text-xs mb-3 leading-relaxed ${theme === "clair" ? "text-slate-500" : "text-white/55"}`}>
                  Dites ou écrivez des sujets ultra-spécifiques pour guider continuellement votre fil de presse.
                </p>

                <form onSubmit={handleAddCustom} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newCustomInput}
                    onChange={(e) => setNewCustomInput(e.target.value)}
                    placeholder="Ex: Drone FPV, Permaculture, Art Moderne..."
                    maxLength={40}
                    className={inputTextClass}
                  />
                  <button
                    type="button"
                    onClick={startListeningInterests}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center shrink-0 ${
                      isListeningInterests 
                        ? "bg-blue-600 text-white border-blue-400 font-bold scale-100 animate-pulse" 
                        : vocalBtnInactiveClass
                    }`}
                    title="Dicter vos passions"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold uppercase cursor-pointer ${
                      theme === "clair"
                        ? "bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border-slate-200 text-slate-700"
                        : "bg-white/5 hover:bg-white/10 hover:text-white text-gray-300 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {activeCustom.length === 0 ? (
                    <div className={`text-xs italic py-2 ${theme === "clair" ? "text-slate-400" : "text-white/30"}`}>Aucun sujet personnalisé.</div>
                  ) : (
                    activeCustom.map((item) => {
                      const customCardClass = 
                        theme === "clair"
                          ? "flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-semibold"
                          : "flex items-center gap-2 bg-blue-950/25 border border-blue-900/40 text-blue-300 px-3 py-1.5 rounded-xl text-xs font-semibold";
                      return (
                        <div key={item} className={customCardClass}>
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => removeCustom(item)}
                            className="hover:bg-blue-105 p-0.5 rounded-md text-blue-500 hover:text-blue-700 transition cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Select Active AI provider */}
              <div>
                <h3 className={textLabelClass}>
                  Moteur d'intelligence artificielle actif
                </h3>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => setProvider("gemini")}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
                      provider === "gemini"
                        ? "bg-blue-600/20 border-blue-500 text-blue-500"
                        : theme === "clair"
                        ? "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-350 hover:text-slate-900"
                        : "bg-white/5 border-transparent text-white/60 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold leading-none">Google Gemini</span>
                  </button>

                  <button
                    onClick={() => setProvider("claude")}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
                      provider === "claude"
                        ? "bg-amber-600/20 border-amber-500 text-amber-600"
                        : theme === "clair"
                        ? "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-350 hover:text-slate-900"
                        : "bg-white/5 border-transparent text-white/60 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <Cpu className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-bold leading-none">Claude (Anthropic)</span>
                  </button>

                  <button
                    onClick={() => setProvider("mistral")}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
                      provider === "mistral"
                        ? "bg-orange-600/20 border-orange-500 text-orange-400"
                        : "bg-white/5 border-transparent text-white/60 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <Settings className="w-5 h-5 text-orange-500" />
                    <span className="text-xs font-bold leading-none">Mistral AI</span>
                  </button>
                </div>
              </div>

              {/* API Keys Configuration */}
              <div className={`space-y-4 pt-4 border-t ${theme === "clair" ? "border-slate-100" : "border-white/5"}`}>
                <h3 className={textLabelClass}>
                  Clés d'API Personnelles (Sécurisé LocalStorage)
                </h3>
                <p className={`text-[11px] leading-relaxed ${theme === "clair" ? "text-slate-500" : "text-white/50"}`}>
                  Insérez vos clés d'API personnelles. Elles sont transmises de manière sécurisée en en-tête pour alimenter vos requêtes, résumés et illustrations. Si laissé vide pour Gemini, le serveur utilisera la clé système.
                </p>

                {/* Gemini Private Key */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold block ${theme === "clair" ? "text-slate-700" : "text-white/70"}`}>Clé API Google Gemini (Optionnelle)</label>
                  <div className="relative">
                    <input
                      type={showGKey ? "text" : "password"}
                      value={gKey}
                      onChange={(e) => setGKey(e.target.value)}
                      placeholder={geminiKey ? "••••••••••••••••" : "AIzaSy..."}
                      className={
                        theme === "clair"
                          ? "w-full bg-slate-50 border border-slate-200 text-slate-800 pr-10 pl-4 py-2.5 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none text-xs"
                          : "w-full bg-white/5 pl-4 pr-10 py-2.5 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none text-xs text-gray-200"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowGKey(!showGKey)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${theme === "clair" ? "text-slate-400 hover:text-slate-800" : "text-white/40 hover:text-white"}`}
                    >
                      {showGKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Claude Anthropic Private Key */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold block ${theme === "clair" ? "text-slate-700" : "text-white/70"}`}>Clé API Anthropic Claude</label>
                  <div className="relative">
                    <input
                      type={showCKey ? "text" : "password"}
                      value={cKey}
                      onChange={(e) => setCKey(e.target.value)}
                      placeholder={claudeKey ? "••••••••••••••••" : "sk-ant-..."}
                      className={
                        theme === "clair"
                          ? "w-full bg-slate-50 border border-slate-200 text-slate-800 pr-10 pl-4 py-2.5 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-none text-xs"
                          : "w-full bg-white/5 pl-4 pr-10 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 focus:outline-none text-xs text-gray-200"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowCKey(!showCKey)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${theme === "clair" ? "text-slate-400 hover:text-slate-800" : "text-white/40 hover:text-white"}`}
                    >
                      {showCKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mistral AI Private Key */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold block ${theme === "clair" ? "text-slate-700" : "text-white/70"}`}>Clé API Mistral AI</label>
                  <div className="relative">
                    <input
                      type={showMKey ? "text" : "password"}
                      value={mKey}
                      onChange={(e) => setMKey(e.target.value)}
                      placeholder={mistralKey ? "••••••••••••••••" : "votre clé Mistral..."}
                      className={
                        theme === "clair"
                          ? "w-full bg-slate-50 border border-slate-200 text-slate-800 pr-10 pl-4 py-2.5 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none text-xs"
                          : "w-full bg-white/5 pl-4 pr-10 py-2.5 rounded-xl border border-white/10 focus:border-orange-500 focus:outline-none text-xs text-gray-200"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowMKey(!showMKey)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${theme === "clair" ? "text-slate-400 hover:text-slate-800" : "text-white/40 hover:text-white"}`}
                    >
                      {showMKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Bio (Your Portrait) */}
              <div className={`pt-4 border-t ${theme === "clair" ? "border-slate-100" : "border-white/5"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" />
                    <h3 className={textLabelClass}>
                      Votre Portrait Lecteur (Personnalisation de l'actualité)
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={startListeningBio}
                    className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center shrink-0 ${
                      isListeningBio 
                        ? "bg-purple-600 text-white border-purple-400 font-bold scale-100 animate-pulse" 
                        : theme === "clair"
                        ? "bg-slate-100 text-purple-600 border-slate-200 hover:bg-purple-50"
                        : "bg-white/5 text-purple-400 border-white/5 hover:bg-white/10"
                    }`}
                    title="Dicter votre biographie"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className={`text-xs mb-2.5 leading-relaxed ${theme === "clair" ? "text-slate-600" : "text-white/55"}`}>
                  L'IA prendra en compte qui vous êtes (métier, style, refus politiques/sports particuliers) pour trier ou ré-écrire activement les dépêches.
                </p>

                <textarea
                  value={activeBio}
                  onChange={(e) => setActiveBio(e.target.value)}
                  placeholder="Ex: Je suis étudiant en ingénierie, passionné de basket et d'astronomie. Je n'aime pas le jargon complexe et je préfère un ton rigoureux mais rythmé. N'affiche pas de faits divers angoissants."
                  rows={4}
                  className={
                    theme === "clair"
                      ? "w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:bg-white text-xs rounded-2xl p-4 resize-none font-sans"
                      : "w-full bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 focus:border-purple-500 focus:outline-none text-xs text-gray-200 placeholder:text-white/20 resize-none font-sans"
                  }
                />
              </div>
            </div>
          )}

        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-white/5 bg-black/10 flex">
          <button
            onClick={handleSave}
            className={`w-full ${activeTab === 'ai' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/10' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/10'} py-2.5 rounded-xl font-bold text-xs text-white transition shadow-lg cursor-pointer uppercase tracking-wider text-center`}
          >
            Sauvegarder et actualiser
          </button>
        </div>

      </div>
    </div>
  );
}
