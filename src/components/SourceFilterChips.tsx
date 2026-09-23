import React from "react";
import { Newspaper, Check, EyeOff, RotateCcw } from "lucide-react";

interface SourceFilterChipsProps {
  sources: string[];
  disabledSources: string[];
  sourceCounts: Record<string, number>;
  onToggleSource: (source: string) => void;
  onEnableAll: () => void;
  onIsolateSource?: (source: string) => void;
  theme: string;
  totalFilteredCount: number;
}

export const SourceFilterChips: React.FC<SourceFilterChipsProps> = ({
  sources,
  disabledSources,
  sourceCounts,
  onToggleSource,
  onEnableAll,
  onIsolateSource,
  theme,
  totalFilteredCount
}) => {
  if (sources.length === 0) {
    return null;
  }

  const allActive = disabledSources.length === 0;
  const allDisabled = disabledSources.length >= sources.length;
  const activeCount = sources.length - disabledSources.length;

  const containerBg =
    theme === "clair"
      ? "bg-slate-50/90 border-slate-200/90 text-slate-800"
      : "bg-zinc-950/50 border-zinc-900 text-zinc-100";

  const headerTitleColor =
    theme === "clair" ? "text-slate-800" : "text-zinc-200";

  const subTextColor =
    theme === "clair" ? "text-slate-500" : "text-zinc-400";

  return (
    <div
      id="source-filter-container"
      className={`mb-6 p-4 rounded-2xl border transition-all ${containerBg}`}
    >
      {/* Header with Title, Counts & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-200/50 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider font-mono ${headerTitleColor}`}>
                Filtrer par source
              </span>
              <span
                id="source-filter-active-count-badge"
                className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                  allActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : allDisabled
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                }`}
              >
                {activeCount} / {sources.length} active{activeCount > 1 ? "s" : ""}
              </span>
            </div>
            <p className={`text-[11px] ${subTextColor} mt-0.5`}>
              Basculez chaque rédaction en direct pour personnaliser l'affichage de votre édition.
            </p>
          </div>
        </div>

        {/* Global Reset / Enable All */}
        {!allActive && (
          <button
            id="source-filter-enable-all-btn"
            onClick={onEnableAll}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
              theme === "clair"
                ? "bg-white hover:bg-slate-100 text-blue-700 border-blue-200 shadow-xs"
                : "bg-zinc-900 hover:bg-zinc-800 text-blue-400 border-blue-900/40"
            }`}
            title="Réactiver toutes les sources de presse"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Tout réactiver</span>
          </button>
        )}
      </div>

      {/* Chips Group */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 'Toutes' chip */}
        <button
          id="source-chip-all"
          onClick={onEnableAll}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            allActive
              ? "bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-500/20"
              : theme === "clair"
              ? "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
              : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border-zinc-800"
          }`}
          title="Afficher toutes les sources de presse sans exclusion"
        >
          {allActive && <Check className="w-3 h-3" />}
          <span>Toutes</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
              allActive
                ? "bg-white/20 text-white font-black"
                : theme === "clair"
                ? "bg-slate-100 text-slate-600"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {sources.reduce((sum, s) => sum + (sourceCounts[s] || 0), 0)}
          </span>
        </button>

        {/* Individual Source Chips */}
        {sources.map((source) => {
          const isToggledOff = disabledSources.includes(source);
          const isToggledOn = !isToggledOff;
          const count = sourceCounts[source] || 0;
          const chipId = `source-chip-${source.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

          let chipClasses = "";
          if (isToggledOn) {
            chipClasses =
              theme === "clair"
                ? "bg-white hover:bg-blue-50/70 text-slate-900 border-slate-300/90 shadow-xs"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-700/80 shadow-xs";
          } else {
            chipClasses =
              theme === "clair"
                ? "bg-slate-100/80 text-slate-400 border-dashed border-slate-300 line-through opacity-60 hover:opacity-100"
                : "bg-zinc-950 text-zinc-600 border-dashed border-zinc-800 line-through opacity-50 hover:opacity-90";
          }

          return (
            <div key={source} className="inline-flex items-center group relative">
              <button
                id={chipId}
                onClick={(e) => {
                  if (e.altKey && onIsolateSource) {
                    e.preventDefault();
                    onIsolateSource(source);
                  } else {
                    onToggleSource(source);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${chipClasses}`}
                title={
                  isToggledOn
                    ? `Cliquer pour masquer « ${source} » (Alt+clic pour isoler)`
                    : `Cliquer pour réactiver « ${source} »`
                }
              >
                {isToggledOn ? (
                  <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-600 text-white shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : (
                  <EyeOff className="w-3 h-3 text-slate-400 dark:text-zinc-600 shrink-0" />
                )}

                <span className={isToggledOff ? "italic" : ""}>{source}</span>

                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isToggledOn
                      ? theme === "clair"
                        ? "bg-slate-100 text-slate-700 font-semibold"
                        : "bg-zinc-800 text-zinc-300 font-semibold"
                      : theme === "clair"
                      ? "bg-slate-200/60 text-slate-400"
                      : "bg-zinc-900 text-zinc-600"
                  }`}
                >
                  {count}
                </span>
              </button>

              {/* Quick 'Isoler' button for desktop power users on hover */}
              {isToggledOn && sources.length > 1 && onIsolateSource && (
                <button
                  id={`${chipId}-isolate`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onIsolateSource(source);
                  }}
                  className="hidden group-hover:flex items-center ml-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-blue-600 hover:text-white transition cursor-pointer"
                  title={`N'afficher que « ${source} »`}
                >
                  Seul
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Warning banner when all sources are disabled */}
      {allDisabled && (
        <div
          id="all-sources-disabled-banner"
          className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Toutes les sources sont désactivées. Aucun article ne s'affiche actuellement.</span>
          </div>
          <button
            id="all-sources-disabled-reset-btn"
            onClick={onEnableAll}
            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition"
          >
            Tout afficher
          </button>
        </div>
      )}
    </div>
  );
};
