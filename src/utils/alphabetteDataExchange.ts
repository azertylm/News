import { Article, UserLocation, AlphabetteDataBundle } from "../types";

/**
 * Synergie des données ALPHABETTE
 * Permet aux applications de la suite (Focus News, LidarSol, OSolar, ProxiLien, L'Œil de l'Atelier 3D)
 * d'échanger des dossiers, flux d'actualité et centres d'intérêt au format standardisé.
 * Hub central : http://alphabette.fr
 */

export function generateAlphabetteDataBundle(
  articles: Article[],
  location?: UserLocation,
  categories: string[] = [],
  customCategories: string[] = [],
  todayVibe = ""
): AlphabetteDataBundle {
  return {
    schemaVersion: "alphabette-interchange-v1.0",
    applicationSource: "Focus News — Infos Perso Grand Format",
    hubUrl: "http://alphabette.fr",
    exportedAt: new Date().toISOString(),
    userProfile: {
      location,
      selectedTopics: categories,
      customTopics: customCategories,
      vibe: todayVibe || undefined
    },
    articlesCount: articles.length,
    articles: articles.map(a => ({
      id: a.id,
      title: a.title,
      category: a.category,
      source: a.source,
      summary: a.summary,
      content: a.content,
      url: a.url,
      timestamp: a.time,
      results: a.results,
      scandals: a.scandals,
      organisation: a.organisation
    }))
  };
}

export function downloadAlphabetteBundle(bundle: AlphabetteDataBundle, filename = "alphabette-news-bundle.json"): void {
  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
