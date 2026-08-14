import React, { useState, useEffect } from "react";
import { X, Sparkles, Volume2, Bookmark, Heart, Play, Square, AlertCircle, RefreshCw, Trophy, AlertTriangle, Compass, Youtube, BookOpen, ArrowRight, ExternalLink, Clock } from "lucide-react";
import { Article } from "../types";
import { getCategoryFallbackImage } from "../data/mockArticles";
import { getSmartArticleUrl } from "./NewsArticleCard";

interface ArticleDetailModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onUpdateImage: (id: string, newUrl: string, isAi: boolean, licensingText: string) => void;
  theme: "clair" | "sombre";
}

export default function ArticleDetailModal({
  article,
  isOpen,
  onClose,
  onToggleLike,
  onToggleBookmark,
  onUpdateImage,
  theme
}: ArticleDetailModalProps) {
  const [summary, setSummary] = useState<string[] | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  // Prime and cache the list of French voices asynchronously
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      };
    }
  }, []);

  // Reset internal modal state when article changes or modal closes
  useEffect(() => {
    setSummary(null);
    setLoadingSummary(false);
    
    // Stop speaking if modal is closed
    if (!isOpen && isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [article, isOpen]);

  if (!isOpen || !article) return null;

  // Handles generating the 3-bullet summary via our Server API proxy
  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    setSummary(null);
    try {
      const geminiKey = localStorage.getItem("myNewsGeminiKey") || "";
      const claudeKey = localStorage.getItem("myNewsClaudeKey") || "";
      const mistralKey = localStorage.getItem("myNewsMistralKey") || "";
      const activeProvider = localStorage.getItem("myNewsActiveProvider") || "gemini";

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-gemini-key": geminiKey,
          "x-claude-key": claudeKey,
          "x-mistral-key": mistralKey,
          "x-active-provider": activeProvider
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content
        })
      });
      const data = await res.json();
      if (data.summaryPoints) {
        setSummary(data.summaryPoints);
      } else {
        setSummary(["Désolé, impossible de synthétiser le texte de l'article pour le moment."]);
      }
    } catch (err) {
      console.warn("Summarization request handled gracefully with fallback:", err);
      setSummary(["Une erreur est survenue lors de la communication avec l'assistant de résumé."]);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Uses native Web Speech Synthesis for high-fidelity offline instant voiceovers
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      // Setup Text
      const textToRead = `${article.title}. ${article.content}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "fr-FR"; // Correct French locale
      
      // Select the highest quality natural/premium/Google French masculine voice available
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const frVoices = voices.filter(v => v.lang.toLowerCase().startsWith("fr"));
        
        if (frVoices.length > 0) {
          // Priority List for Masculine French Voices:
          // Thomas (macOS/iOS Premium), Paul (Windows), Claude (Windows), Nicolas (iOS/macOS), Gilles/Alain/Daniel/Jean
          const maleNames = ["thomas", "paul", "nicolas", "claude", "daniel", "jean", "alain", "gilles", "henri", "mathieu"];
          
          const maleFrVoice = frVoices.find(v => {
            const nameLower = v.name.toLowerCase();
            return maleNames.some(name => nameLower.includes(name));
          });
          
          const googleVoice = frVoices.find(v => v.name.toLowerCase().includes("google"));
          const premiumVoice = frVoices.find(v => v.name.toLowerCase().includes("premium") || v.name.toLowerCase().includes("natural"));
          
          const selectedVoice = maleFrVoice || googleVoice || premiumVoice || frVoices.find(v => v.localService) || frVoices[0];
          
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log("SpeechSynthesis selected voice:", selectedVoice.name);
          }
        }
      }

      // Elocution coefficient set to 1.05 for a professional and fluid reading pace
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      
      utterance.onend = () => {
        setIsPlayingAudio(false);
      };
      
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      setSpeechUtterance(utterance);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };
  const articleImg = article.img || getCategoryFallbackImage(article.category);

  // Theme configuration values
  const modalContainerClass = 
    theme === "clair"
      ? "bg-white text-slate-800 border border-slate-200 shadow-2xl flex flex-col max-h-[96vh] w-full max-w-5xl rounded-3xl overflow-hidden"
      : "bg-black text-[#f3f4f6] border border-zinc-950 shadow-2xl flex flex-col max-h-[96vh] w-full max-w-5xl rounded-3xl overflow-hidden";

  const imgOverlayGradient = 
    theme === "clair"
      ? "absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent"
      : "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent";

  const modalBodyBg = 
    theme === "clair" ? "bg-white overflow-y-auto p-5 sm:p-8 space-y-6 flex-1" : "overflow-y-auto p-5 sm:p-8 space-y-6 flex-1";

  const titleTextClass = 
    theme === "clair" ? "text-slate-900 font-bold font-display mt-3 line-clamp-2" : "text-white font-bold font-display mt-3 line-clamp-2";

  const metadataBorderClass = 
    theme === "clair" ? "border-b border-slate-100 py-3 flex flex-wrap items-center justify-between gap-4" : "flex flex-wrap items-center justify-between gap-4 py-3 border-b border-white/5";

  const authorBadgeClass = 
    theme === "clair"
      ? "font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-100/80"
      : "font-bold text-white uppercase bg-white/10 px-2 py-0.5 rounded text-[10px] border border-white/5";

  const metaTextInfoColor = 
    theme === "clair" ? "text-slate-500 flex items-center gap-2.5 text-xs" : "flex items-center gap-2.5 text-xs text-white/40";

  // Actions
  const voiceoverBtnClass = 
    theme === "clair"
      ? `flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition ${
          isPlayingAudio
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
            : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-250"
        }`
      : `flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition ${
          isPlayingAudio
            ? "bg-emerald-950/30 border-emerald-900/60 text-emerald-400"
            : "bg-white/5 border-transparent hover:border-white/10 text-gray-300 hover:text-white"
        }`;

  const bookmarkBtnClass = 
    theme === "clair"
      ? `p-2 rounded-xl text-xs border cursor-pointer transition ${
          article.bookmarked
            ? "bg-blue-600 border-blue-600 text-white"
            : "bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-200"
        }`
      : `p-2 rounded-xl text-xs border cursor-pointer transition ${
          article.bookmarked
            ? "bg-blue-600 border-blue-600 text-white"
            : "bg-white/5 border-transparent hover:border-white/10 text-white/40 hover:text-white/80"
        }`;

  const likeBtnClass = 
    theme === "clair"
      ? `p-2 rounded-xl text-xs border cursor-pointer transition ${
          article.liked
            ? "bg-rose-55 border-rose-200 text-rose-600 font-bold"
            : "bg-slate-100 border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
        }`
      : `p-2 rounded-xl text-xs border cursor-pointer transition ${
          article.liked
            ? "bg-rose-950/20 border-rose-900/40 text-rose-500"
            : "bg-white/5 border-transparent hover:border-white/10 text-white/40 hover:text-rose-400"
        }`;

  // Panels
  const execSummaryPanelClass = 
    theme === "clair"
      ? "bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 shadow-sm"
      : "bg-white/5 border border-white/5 rounded-2xl py-2.5 px-4 shadow-sm";

  const execSummaryTitleClass = 
    theme === "clair" ? "text-xs font-bold uppercase tracking-wider text-slate-600 font-mono" : "text-xs font-bold uppercase tracking-wider text-white/80 font-mono";

  const summaryLinesClass = 
    theme === "clair" ? "text-sm sm:text-base text-slate-800 leading-relaxed font-sans font-medium" : "text-sm sm:text-base text-white/95 leading-relaxed font-sans font-medium";

  const summaryEmptyTextClass = 
    theme === "clair" ? "text-xs text-slate-500/80 italic font-medium" : "text-xs text-white/50/80 italic font-medium";

  const imageStudioBoxClass = 
    theme === "clair"
      ? "bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
      : "bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3";

  const imageStudioTitleClass = 
    theme === "clair" ? "text-xs font-bold uppercase tracking-wider text-slate-600 font-mono" : "text-xs font-bold uppercase tracking-wider text-white/70 font-mono";

  const imageStudioInfoClass = 
    theme === "clair"
      ? "text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200"
      : "text-[11px] text-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5";

  // News Complements
  const sectionsBorderClass = 
    theme === "clair" ? "space-y-4 border-t border-b border-slate-100 py-6" : "space-y-4 border-t border-b border-white/5 py-6";

  const resultsCardClass = 
    theme === "clair"
      ? "bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 flex gap-4 items-start"
      : "bg-[#fbbf24]/5 border border-[#fbbf24]/20 rounded-xl p-4 flex gap-4 items-start";

  const resultsTitleTextClass = 
    theme === "clair" ? "text-amber-800" : "text-[#fbbf24]";

  const resultsBodyTextClass = 
    theme === "clair" ? "text-xs text-slate-800 mt-1.5 leading-relaxed" : "text-xs text-white/90 mt-1.5 leading-relaxed";

  const organisationCardClass = 
    theme === "clair"
      ? "bg-cyan-50/60 border border-cyan-200/80 rounded-xl p-4 flex gap-4 items-start"
      : "bg-[#06b6d4]/5 border border-[#06b6d4]/20 rounded-xl p-4 flex gap-4 items-start";

  const organisationTitleClass = 
    theme === "clair" ? "text-cyan-800" : "text-[#06b6d4]";

  const organisationBodyClass = 
    theme === "clair" ? "text-xs text-slate-800 mt-1.5 leading-relaxed" : "text-xs text-white/90 mt-1.5 leading-relaxed";

  const scandalsCardClass = 
    theme === "clair"
      ? "bg-rose-50/60 border border-rose-200/80 rounded-xl p-4 flex gap-4 items-start"
      : "bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex gap-4 items-start";

  const scandalsTitleClass = 
    theme === "clair" ? "text-rose-700" : "text-red-400";

  const scandalsBodyClass = 
    theme === "clair" ? "text-xs text-slate-700 mt-1.5 leading-relaxed italic" : "text-xs text-white/95 mt-1.5 leading-relaxed italic";

  // Full Text Body
  const fullTextClass = 
    theme === "clair" ? "text-base sm:text-lg lg:text-xl font-sans text-slate-800 leading-relaxed space-y-6 font-normal" : "text-base sm:text-lg lg:text-xl font-sans text-white/90 leading-relaxed space-y-6";

  // Footer Frame
  const footerClass = 
    theme === "clair"
      ? "p-6 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0"
      : "p-6 border-t border-white/5 bg-black/40 flex justify-end shrink-0";

  const closeFooterBtnClass = 
    theme === "clair"
      ? "bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 font-medium text-sm px-6 py-2.5 rounded-xl transition cursor-pointer"
      : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium text-sm px-6 py-2.5 rounded-xl transition cursor-pointer";

  return (
    <div id="article-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={modalContainerClass}>
        
        {/* Compact slim header to lose no space */}
        <div className={`px-4 py-2 text-xs shrink-0 flex items-center justify-between border-b ${
          theme === "clair" ? "border-slate-100 bg-white" : "border-white/5 bg-zinc-950"
        }`}>
          <div className="flex items-center gap-2">
            <span id="modal-category-overlay" className="bg-blue-600 text-white font-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-md">
              {article.category}
            </span>
            <span className={`text-[10px] font-mono ${theme === "clair" ? "text-slate-500" : "text-white/45"}`}>
              Photo d'illustration
            </span>
          </div>
          <button
            id="modal-close-button"
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-white/10 transition cursor-pointer ${
              theme === "clair" ? "text-slate-600 hover:bg-slate-100" : "text-white/80"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body (scrollable) */}
        <div className={modalBodyBg}>
          {/* Banner inside scrollable to not block layout */}
          <div className={`relative h-12 sm:h-14 w-full ${
            theme === "clair" ? "bg-slate-100" : "bg-zinc-900"
          } rounded-2xl overflow-hidden mb-3.5 shrink-0 shadow-inner`}>
            <img
              id="modal-article-banner-image"
              src={articleImg}
              alt={article.title}
              referrerPolicy="origin-when-cross-origin"
              className="w-full h-full object-cover opacity-90 animate-fade-in"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%231e3a8a'/><stop offset='50%' stop-color='%233b82f6'/><stop offset='100%' stop-color='%231d4ed8'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><g transform='translate(400,300) scale(4)'><path d='M-10-15 H10 V15 H-10 Z' fill='none' stroke='white' stroke-width='1.5' stroke-linejoin='round'/><line x1='-6' y1='-8' x2='6' y2='-8' stroke='white' stroke-width='1.5'/><line x1='-6' y1='-4' x2='2' y2='-4' stroke='white' stroke-width='1.5'/><line x1='-6' y1='0' x2='4' y2='0' stroke='white' stroke-width='1.5'/><line x1='-6' y1='4' x2='6' y2='4' stroke='white' stroke-width='1.5'/></g></svg>";
              }}
            />
            {/* Licensing block inside image */}
            <div id="modal-image-license-badge" className="absolute top-2.5 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase border border-white/5 flex items-center gap-1 shadow-sm">
              {article.imageIsAiGenerated ? (
                <>
                  <Sparkles className="w-2.5 h-2.5 text-purple-400 animate-pulse" />
                  <span className="text-purple-300">{article.imageLicensingText || "Créée par l'IA"}</span>
                </>
              ) : (
                <>
                  <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-300">{article.imageLicensingText || "Libre Unsplash"}</span>
                </>
              )}
            </div>
          </div>

          {/* Title right under banner inside scroll */}
          <div>
            <h1 id="modal-article-title" className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display leading-tight tracking-tight ${
              theme === "clair" ? "text-slate-900" : "text-white"
            }`}>
              {article.title}
            </h1>
          </div>
          
          {/* Author/Source and Actions Bar */}
          <div className={metadataBorderClass}>
            <div className={`${metaTextInfoColor} flex-wrap`}>
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Lecture : 5 min</span>
              </span>
              {article.articleIsAiGenerated && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-purple-600 dark:text-purple-400 font-bold font-mono text-[9px] bg-purple-100 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-900/30">
                    <Sparkles className="w-2.5 h-2.5" />
                    RÉDIGÉ PAR L'IA
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Native Voiceover Button */}
              <button
                id="modal-voiceover-button"
                onClick={handleToggleAudio}
                className={voiceoverBtnClass}
                title="Écouter l'article"
              >
                {isPlayingAudio ? (
                  <>
                    <Square className="w-3" fill="currentColor" />
                    <span>Arrêter l'audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3" fill="currentColor" />
                    <span>Synthèse Vocale</span>
                  </>
                )}
              </button>

              {/* Bookmark */}
              <button
                id="modal-bookmark-button"
                onClick={() => onToggleBookmark(article.id)}
                className={bookmarkBtnClass}
              >
                <Bookmark className="w-4 h-4" fill={article.bookmarked ? "currentColor" : "none"} />
              </button>

              {/* Like */}
              <button
                id="modal-like-button"
                onClick={() => onToggleLike(article.id)}
                className={likeBtnClass}
              >
                <Heart className="w-4 h-4" fill={article.liked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* AI Bullet Summary Widget */}
          <div className={execSummaryPanelClass}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <h4 className={execSummaryTitleClass}>
                  Résumé Exécutif Assistant IA
                </h4>
              </div>

              {!summary && !loadingSummary && (
                <button
                  id="modal-generate-summary-button"
                  onClick={handleGenerateSummary}
                  className="bg-blue-600/20 hover:bg-blue-600 border border-blue-500/20 text-blue-600 hover:text-white text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer font-sans"
                >
                  Générer le résumé
                </button>
              )}
            </div>

            {loadingSummary && (
              <div className="flex items-center gap-2 py-1 text-xs text-blue-600 font-mono animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                <span>Analyse exclusive de l'article en cours par l'IA...</span>
              </div>
            )}

            {summary && (
              <ul className="space-y-1.5">
                {summary.map((point, index) => (
                  <li key={index} className="flex gap-1.5 text-xs">
                    <span className="text-blue-600 mt-1 shrink-0">•</span>
                    <span className={summaryLinesClass}>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {!summary && !loadingSummary && (
              <p className={summaryEmptyTextClass}>
                Obtenez instantanément un résumé en points clés par notre IA en un clic.
              </p>
            )}
          </div>

          {/* Real-time details / Compléments d'actualités */}
          {(article.scandals || true) && (
            <div id="modal-realtime-complement" className={sectionsBorderClass}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Dépêches & Compléments d'Actualité (Reuters & RSS)
              </h3>

              {article.scandals && article.scandals.trim() !== "" && (
                <div id="realtimenews-scandals-card" className={scandalsCardClass}>
                  <div className="bg-red-500/10 p-2 rounded-lg text-red-500 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${scandalsTitleClass}`}>Polémiques, Controverses & Enquêtes</h4>
                    <p className={scandalsBodyClass}>{article.scandals}</p>
                  </div>
                </div>
              )}

              <div id="realtimenews-video-section" className="mt-3 pt-3 border-t border-dashed border-white/10">
                {(() => {
                  const querySearch = article.youtubeUrl && article.youtubeUrl.trim() !== ""
                    ? article.youtubeUrl
                    : `https://www.youtube.com/results?search_query=${encodeURIComponent(article.title)}`;
                  return (
                    <a
                      id="realtimenews-youtube-link"
                      href={querySearch}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all duration-300 shadow-sm hover:shadow-md group cursor-pointer w-full ${
                        theme === "clair"
                          ? "border-red-200 bg-red-50/50 hover:bg-red-50 text-slate-800 hover:text-red-600"
                          : "border-red-900/30 bg-red-950/20 hover:bg-red-950/35 text-gray-200 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-red-600 rounded-lg text-white group-hover:scale-105 transition-transform">
                          <Youtube className="w-3.5 h-3.5" fill="currentColor" />
                        </div>
                        <div>
                          <h4 className="text-[9px] font-bold uppercase tracking-wider text-red-500 font-mono leading-none mb-0.5">Vidéo & Enquêtes</h4>
                          <p className="text-[11px] font-semibold leading-none font-sans">Regarder le sujet sur YouTube</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-red-500 group-hover:translate-x-1 transition-transform shrink-0" />
                    </a>
                  );
                })()}
              </div>

            </div>
          )}

          {/* Full Content Body */}
          <div id="modal-article-full-content" className={fullTextClass}>
            {article.content.split("\n\n").map((para, idx) => (
              <p key={idx} className="indent-4 text-justify leading-relaxed">
                {para}
              </p>
            ))}
          </div>

        </div>



      </div>
    </div>
  );
}
