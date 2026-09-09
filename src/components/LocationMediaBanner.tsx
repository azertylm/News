import React, { useState } from "react";
import { MapPin, Newspaper, Compass, Loader2, CheckCircle2, ChevronRight, Globe2 } from "lucide-react";
import { UserLocation } from "../types";

interface LocationMediaBannerProps {
  location: UserLocation;
  onDetectLocation: () => void;
  isDetecting: boolean;
  onOpenLocationSettings: () => void;
  theme: "clair" | "sombre";
}

export default function LocationMediaBanner({
  location,
  onDetectLocation,
  isDetecting,
  onOpenLocationSettings,
  theme
}: LocationMediaBannerProps) {
  const containerClass =
    theme === "clair"
      ? "bg-slate-50 border border-slate-200/90 text-slate-800 shadow-sm"
      : "bg-zinc-950/80 border border-zinc-850/80 text-zinc-200 backdrop-blur-md";

  const badgeLocationClass =
    theme === "clair"
      ? "bg-blue-100/70 border-blue-200 text-blue-800"
      : "bg-blue-950/40 border-blue-900/40 text-blue-300";

  const badgeSourceClass =
    theme === "clair"
      ? "bg-emerald-100/70 border-emerald-200 text-emerald-800"
      : "bg-emerald-950/30 border-emerald-900/40 text-emerald-300";

  const buttonClass =
    theme === "clair"
      ? "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs"
      : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white";

  const preferredSourcesList = location.preferredSources && location.preferredSources.length > 0
    ? location.preferredSources.slice(0, 3).join(" • ") + (location.preferredSources.length > 3 ? ` +${location.preferredSources.length - 3}` : "")
    : "Le Monde • Marianne • Google News";

  return (
    <div className={`w-full max-w-5xl mx-auto mb-6 p-3.5 sm:p-4 rounded-2xl transition-all duration-200 ${containerClass}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Location & Verified Real Press Sources */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0">
          
          {/* Location pill */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 shrink-0 ${badgeLocationClass}`}>
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="font-bold">{location.country || "France"}</span>
              <span className="opacity-40">•</span>
              <span className="truncate max-w-[140px] sm:max-w-[180px]">{location.region || "Île-de-France"} {location.city ? `(${location.city})` : ""}</span>
            </div>

            {/* Preferred Press pill */}
            <div className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 shrink-0 ${badgeSourceClass}`}>
              <Newspaper className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-bold text-[11px]">Sources :</span>
              <span className="truncate max-w-[160px] sm:max-w-[220px] font-sans">{preferredSourcesList}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Articles réels & Google News</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          
          {/* GPS Auto-detect Button */}
          <button
            onClick={onDetectLocation}
            disabled={isDetecting}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${buttonClass}`}
            title="Détecter automatiquement ma région et ma ville via GPS"
          >
            {isDetecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
            ) : (
              <Compass className="w-3.5 h-3.5 text-blue-500" />
            )}
            <span className="hidden sm:inline">{isDetecting ? "Détection..." : "Détecter position"}</span>
            <span className="sm:hidden">{isDetecting ? "..." : "GPS"}</span>
          </button>

          {/* Change Country / Region / Press button */}
          <button
            onClick={onOpenLocationSettings}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${buttonClass}`}
            title="Changer de pays, région ou journaux de référence"
          >
            <Globe2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Régions & Journaux</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>
        </div>

      </div>
    </div>
  );
}
