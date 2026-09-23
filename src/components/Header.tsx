import { Settings, RefreshCw, Sparkles, Sun, Moon, Zap, MapPin, ShieldCheck, Package } from "lucide-react";
import { AISovereigntyTelemetry, AlphabetteSubscriptionState } from "../types";

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenLocation?: () => void;
  onOpenSovereignty?: () => void;
  onOpenSubscription?: () => void;
  onRefresh: () => void;
  onInstantGenerate?: () => void;
  isGenerating: boolean;
  isAiMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  message?: string;
  hasApiKey: boolean;
  theme: "clair" | "sombre";
  onChangeTheme: (theme: "clair" | "sombre") => void;
  sovereigntyTelemetry?: AISovereigntyTelemetry;
  subscriptionState?: AlphabetteSubscriptionState;
}

export default function Header({
  onOpenSettings,
  onOpenLocation,
  onOpenSovereignty,
  onOpenSubscription,
  onRefresh,
  onInstantGenerate,
  isGenerating,
  isAiMode,
  searchQuery,
  setSearchQuery,
  message,
  hasApiKey,
  theme,
  onChangeTheme,
  sovereigntyTelemetry,
  subscriptionState
}: HeaderProps) {
  // Theme styling helpers
  const headerClass = 
    theme === "clair"
      ? "bg-white/90 border-slate-200/80 backdrop-blur-md shadow-sm"
      : theme === "sombre"
      ? "bg-black/95 border-zinc-900 backdrop-blur-md"
      : "bg-black/40 border-b border-white/5 backdrop-blur-md";

  const brandTextClass = 
    theme === "clair" ? "text-slate-950" : "text-white";

  const badgeClass = 
    theme === "clair"
      ? "bg-blue-50 border-blue-200/80 text-blue-600"
      : theme === "sombre"
      ? "bg-blue-950/30 border-blue-900/40 text-blue-400"
      : "bg-blue-500/10 border-blue-500/20 text-blue-400";

  const auxButtonClass = 
    theme === "clair"
      ? "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700"
      : theme === "sombre"
      ? "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
      : "bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300";

  const labelTextClass = 
    theme === "clair" ? "text-slate-700 font-semibold" : "text-gray-200 font-semibold";

  return (
    <header className={`fixed top-0 w-full z-50 h-14 flex items-center transition-all duration-300 border-b ${headerClass}`}>
      <div className="w-full max-w-5xl mx-auto px-4 md:px-8 flex flex-row items-center justify-between gap-4">
        
        {/* Title and Sovereignty Badges */}
        <div className="flex items-center gap-2.5 md:gap-3">
          <h1 className={`text-xl md:text-2xl font-bold tracking-tight uppercase font-display ${brandTextClass}`}>
            Focus <span className="text-blue-600">News</span>
          </h1>
          
          {/* Sovereignty Badge with ALPHABETTE identity */}
          {onOpenSovereignty && (
            <button
              onClick={onOpenSovereignty}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold border shrink-0 transition-all hover:scale-105 cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm"
              title="Architecture IA souveraine & résiliente ALPHABETTE (Valentin RICHAUD - OVH France)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="hidden sm:inline">
                {sovereigntyTelemetry?.badge || "Traitement souverain"}
              </span>
              <span className="sm:hidden">Souverain</span>
            </button>
          )}

          {/* Access / Subscription badge */}
          {onOpenSubscription && (
            <button
              onClick={onOpenSubscription}
              className={`hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition cursor-pointer ${
                subscriptionState?.isSubscribed
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold"
                  : "bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-purple-400"
              }`}
              title="Accès éthique ALPHABETTE (1€ solo / 3€ bundle suite)"
            >
              <Package className="w-3 h-3 text-purple-500" />
              <span>
                {subscriptionState?.isSubscribed 
                  ? (subscriptionState.plan === "bundle_3eur" ? "Suite 3€" : "Solo 1€") 
                  : "Pass 1€/3€"}
              </span>
            </button>
          )}
        </div>

        {/* Action controls with theme switcher */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* Theme Switcher Selector Pill */}
          <div id="theme-switcher-pills" className={`flex items-center gap-1 p-0.5 rounded-full border transition-all ${
            theme === "clair" 
              ? "bg-slate-100 border-slate-200/80 shadow-inner" 
              : "bg-zinc-950 border-zinc-900"
          }`}>
            <button
              onClick={() => onChangeTheme("clair")}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer outline-none ${
                theme === "clair"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-350"
              }`}
              title="Mode Clair"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden leading-none md:inline">Clair</span>
            </button>
            <button
              onClick={() => onChangeTheme("sombre")}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer outline-none ${
                theme === "sombre"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-350"
              }`}
              title="Mode Sombre"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden leading-none md:inline">Sombre</span>
            </button>
          </div>

          {/* Action controls on mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            {onOpenSubscription && (
              <button
                onClick={onOpenSubscription}
                className="p-2 rounded-full transition text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/30"
                title="Accès ALPHABETTE"
              >
                <Package className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onInstantGenerate || onRefresh}
              disabled={isGenerating}
              className={`p-2 rounded-full transition text-amber-500 bg-amber-500/10 border border-amber-500/30 disabled:opacity-50 ${
                isGenerating ? "animate-spin" : ""
              }`}
              title="Créer des articles maintenant (hors heure)"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRefresh}
              disabled={isGenerating}
              className={`p-2 rounded-full transition disabled:opacity-50 ${auxButtonClass} ${
                isGenerating ? "animate-spin" : ""
              }`}
              title="Générer par IA"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {onOpenLocation && (
              <button
                onClick={onOpenLocation}
                className={`p-2 rounded-full transition ${auxButtonClass}`}
                title="Régions & Journaux de référence"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-full transition ${auxButtonClass}`}
              title="Modifier mes centres d'intérêt"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Regular buttons: visible on desktop/tablet */}
          <div className="hidden md:flex items-center gap-2">
            {onOpenSubscription && (
              <button
                onClick={onOpenSubscription}
                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition cursor-pointer border ${
                  subscriptionState?.isSubscribed
                    ? "bg-purple-600/10 border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold"
                    : `${auxButtonClass} ${labelTextClass}`
                }`}
                title="Modèle économique ALPHABETTE (1€ solo ou 3€ bundle)"
              >
                <Package className="w-3.5 h-3.5 text-purple-500" />
                <span>
                  {subscriptionState?.isSubscribed 
                    ? (subscriptionState.plan === "bundle_3eur" ? "Pass Suite 3€" : "Pass Solo 1€")
                    : "Formules 1€ / 3€"}
                </span>
              </button>
            )}

            {onOpenLocation && (
              <button
                onClick={onOpenLocation}
                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition cursor-pointer ${auxButtonClass} ${labelTextClass}`}
                title="Régler ma région et mes journaux de référence"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Région & Médias</span>
              </button>
            )}

            <button
              onClick={onInstantGenerate || onRefresh}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shadow-lg shadow-orange-500/20"
              title="Créer une nouvelle édition d'articles immédiatement sans attendre l'heure"
            >
              <Zap className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Création..." : "Créer hors heure"}</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shadow-lg shadow-blue-500/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "IA..." : "Régénérer"}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition cursor-pointer ${auxButtonClass} ${labelTextClass}`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Sujets</span>
            </button>
          </div>
        </div>

      </div>

      {/* Optional helper message */}
      {message && !message.toLowerCase().includes("saturé") && !message.toLowerCase().includes("démo") && !message.toLowerCase().includes("quota") && (
        <div className={`absolute bottom-[-24px] left-0 w-full text-center text-[10px] font-mono py-1 border-b flex items-center justify-center gap-1.5 px-4 truncate transition-all ${
          theme === "clair" 
            ? "bg-white/95 border-slate-200 text-slate-500" 
            : theme === "sombre"
            ? "bg-black border-zinc-900 text-zinc-400"
            : "bg-black/85 border-white/5 text-white/40"
        }`}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span>{message}</span>
        </div>
      )}
    </header>
  );
}
