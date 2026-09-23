import React from "react";
import { Heart, Share2, Bookmark, ArrowRight, Clock, Sparkles, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { Article } from "../types";
import { getCategoryFallbackImage } from "../data/mockArticles";
import { sanitizeText } from "../utils/textCleaner";

export function getSmartArticleUrl(article: { source: string; title: string; url?: string }): string {
  // Check if article has a valid deep link (with a path other than a blank root)
  if (article.url && article.url.trim() !== "") {
    try {
      const parsed = new URL(article.url);
      if (parsed.pathname && parsed.pathname !== "/" && parsed.pathname.length > 2) {
        return article.url;
      }
    } catch {
      // ignore invalid URL parsing
    }
  }

  // Broad-match search on Google (without strict quotes) is exceptionally powerful 
  // at finding the real-world equivalent report on the source newspaper/agency.
  const query = `${article.source} ${article.title}`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

interface NewsArticleCardProps {
  key?: React.Key;
  article: Article;
  onSelect: (art: Article) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onShare: (art: Article, e: React.MouseEvent) => void;
  index: number;
  theme: "clair" | "sombre";
  isHero?: boolean;
}

export default function NewsArticleCard({
  article,
  onSelect,
  onToggleLike,
  onToggleBookmark,
  onShare,
  index,
  theme,
  isHero = false
}: NewsArticleCardProps) {
  const imageUrl = article.img || getCategoryFallbackImage(article.category);

  // Conditional styles based on current theme
  const wrapperClass = 
    theme === "clair"
      ? "bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-300 flex flex-col focus-within:ring-1 focus-within:ring-blue-500/40 h-full rounded-3xl overflow-hidden"
      : "bg-zinc-950/80 border border-zinc-900 hover:bg-zinc-900/40 transition-all duration-300 flex flex-col focus-within:ring-1 focus-within:ring-blue-500/50 h-full rounded-3xl overflow-hidden";

  const metaTextClass = 
    theme === "clair" ? "text-slate-500" : "text-white/40";

  const sourceBadgeClass = 
    theme === "clair"
      ? "text-blue-700 font-mono font-bold uppercase text-[9px] bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
      : "text-zinc-300 font-mono font-bold uppercase text-[9px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800";

  const titleTextClass = 
    theme === "clair"
      ? "text-slate-900 group-hover:text-blue-600"
      : "text-neutral-100 group-hover:text-white";

  const summaryTextClass = 
    theme === "clair" ? "text-slate-600" : "text-white/55";

  const footerBorderClass = 
    theme === "clair" ? "border-slate-100" : "border-white/5";

  const readMoreClass = 
    theme === "clair" ? "text-blue-600 hover:text-blue-700" : "text-blue-400/90 group-hover:text-blue-400";

  const bookmarkBtnClass = 
    article.bookmarked
      ? "bg-blue-600 border-blue-600 text-white shadow"
      : theme === "clair"
      ? "bg-slate-100 hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 border-slate-200/60"
      : "bg-zinc-900 text-zinc-500 hover:text-zinc-200 border-zinc-800 hover:bg-zinc-800";

  const likeBtnClass = 
    article.liked
      ? theme === "clair"
        ? "bg-rose-50 border-rose-200 text-rose-600"
        : "bg-rose-950/20 border-rose-900/30 text-rose-500"
      : theme === "clair"
      ? "bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-slate-200/60 hover:border-rose-150"
      : "bg-zinc-900 text-zinc-500 hover:text-rose-400 border-zinc-800 hover:bg-zinc-800";

  const shareBtnClass = 
    theme === "clair"
      ? "bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border-slate-200/60 hover:border-blue-150"
      : "bg-zinc-900 text-zinc-500 hover:text-blue-400 border-zinc-800 hover:bg-zinc-800";

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%231e3a8a'/><stop offset='50%' stop-color='%233b82f6'/><stop offset='100%' stop-color='%231d4ed8'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><g transform='translate(400,300) scale(4)'><path d='M-10-15 H10 V15 H-10 Z' fill='none' stroke='white' stroke-width='1.5' stroke-linejoin='round'/><line x1='-6' y1='-8' x2='6' y2='-8' stroke='white' stroke-width='1.5'/><line x1='-6' y1='-4' x2='2' y2='-4' stroke='white' stroke-width='1.5'/><line x1='-6' y1='0' x2='4' y2='0' stroke='white' stroke-width='1.5'/><line x1='-6' y1='4' x2='6' y2='4' stroke='white' stroke-width='1.5'/></g></svg>";
  };

  const imgBgClass = 
    theme === "clair"
      ? "bg-slate-100"
      : "bg-zinc-900";

  const imgHeightClass = isHero
    ? "h-20 sm:h-26 md:h-[120px] lg:h-[144px]"
    : "h-16 sm:h-18 md:h-20";

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      className={`group ${wrapperClass}`}
    >
      {/* Image container */}
      <div 
        onClick={() => onSelect(article)}
        className={`relative ${imgHeightClass} w-full overflow-hidden ${imgBgClass} cursor-pointer`}
      >
        <img
          src={imageUrl}
          alt={article.title}
          referrerPolicy="origin-when-cross-origin"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          loading="lazy"
          onError={handleImageError}
        />
        
        {/* Category Overlay Tag */}
        <div className="absolute top-4 left-4 bg-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20">
          {article.category}
        </div>
      </div>

      {/* Body content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata source and time */}
          <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
            {article.source && (
              <span className={sourceBadgeClass}>
                {article.source}
              </span>
            )}
            <div className={`flex items-center gap-1 ${metaTextClass}`}>
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="font-semibold">Lecture : 5 min</span>
            </div>
            {article.articleIsAiGenerated && (
              <>
                <span className={metaTextClass}>•</span>
                <span className="flex items-center gap-0.5 text-purple-600 dark:text-purple-400 font-bold font-mono text-[9px] bg-purple-100 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-900/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  RÉDIGÉ PAR L'IA
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h2 
            onClick={() => onSelect(article)}
            className={`text-lg sm:text-xl lg:text-2xl font-extrabold leading-normal font-display cursor-pointer line-clamp-3 transition duration-200 ${titleTextClass}`}
          >
            {sanitizeText(article.title)}
          </h2>

          {/* Summary */}
          <p className={`mt-4 text-xs sm:text-sm lg:text-base leading-relaxed font-sans line-clamp-3 ${summaryTextClass}`}>
            {sanitizeText(article.summary)}
          </p>
        </div>

        {/* Footer with actions */}
        <div className={`flex items-center justify-between pt-4 mt-5 border-t ${footerBorderClass}`}>
          {/* Read button */}
          <button
            onClick={() => onSelect(article)}
            className={`text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer font-sans ${readMoreClass}`}
          >
            <span>Lire l'article</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Social interactives */}
          <div className="flex items-center gap-2">
            {/* Save / Bookmarked */}
            <button
              onClick={(e) => onToggleBookmark(article.id, e)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${bookmarkBtnClass}`}
              title={article.bookmarked ? "Retirer des favoris" : "Enregistrer"}
            >
              <Bookmark className="w-3.5 h-3.5" fill={article.bookmarked ? "currentColor" : "none"} />
            </button>

            {/* Like */}
            <button
              onClick={(e) => onToggleLike(article.id, e)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${likeBtnClass}`}
              title={article.liked ? "Je n'aime plus" : "Aimer"}
            >
              <Heart className="w-3.5 h-3.5" fill={article.liked ? "currentColor" : "none"} />
            </button>

            {/* Share */}
            <button
              onClick={(e) => onShare(article, e)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${shareBtnClass}`}
              title="Partager"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
