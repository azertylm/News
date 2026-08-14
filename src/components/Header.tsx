import { Settings, RefreshCw, Sparkles, Sun, Moon } from "lucide-react";

interface HeaderProps {
  onOpenSettings: () => void;
  onRefresh: () => void;
  isGenerating: boolean;
  isAiMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  message?: string;
  hasApiKey: boolean;
  theme: "clair" | "sombre";
  onChangeTheme: (theme: "clair" | "sombre") => void;
}

export default function Header({
  onOpenSettings,
  onRefresh,
  isGenerating,
  isAiMode,
  searchQuery,
  setSearchQuery,
  message,
  hasApiKey,
  theme,
  onChangeTheme
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
        
        {/* Title and Badge */}
        <div className="flex items-center gap-3 md:gap-5">
          <h1 className={`text-xl md:text-2xl font-bold tracking-tight uppercase font-display ${brandTextClass}`}>
            Focus <span className="text-blue-600">News</span>
          </h1>
          
          {/* AI vs Demo Mode Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-medium border shrink-0 ${badgeClass}`}>
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span className="font-bold">Rédacteur IA</span>
          </div>
        </div>

        {/* Action controls with theme switcher */}
        <div className="flex items-center gap-2 md:gap-4">
          
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

          {/* Action controls */}
          <div className="flex items-center gap-1.5 md:hidden">
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
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-full transition ${auxButtonClass}`}
              title="Modifier mes centres d'intérêt"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Regular buttons: visible on desktop/tablet */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={onRefresh}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-lg shadow-blue-500/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "IA..." : "Régénérer"}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl transition cursor-pointer ${auxButtonClass} ${labelTextClass}`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Sujets de lecture</span>
            </button>
          </div>
        </div>

      </div>

      {/* Optional helper message (cleaned from key warning and quota mention, very positive and minimal) */}
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
