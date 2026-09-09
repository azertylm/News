import { Article } from "../types";
import { sanitizeArticle, sanitizeText } from "./textCleaner";

interface QAMessage {
  id: string;
  role: "user" | "journalist";
  text: string;
  time: string;
  journalistTitle?: string;
}

interface ExportHtmlOptions {
  article: Article;
  summary?: string[] | null;
  qaList?: QAMessage[];
  theme?: "clair" | "sombre";
}

/**
 * Escapes HTML entities to ensure safe rendering in raw HTML documents.
 */
function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generates a standalone, beautifully formatted, self-contained HTML document for the article
 * including executive summary, complementary insights, and full investigative Q&A thread.
 */
export function generateArticleHtmlDocument({
  article: rawArticle,
  summary,
  qaList = [],
  theme = "clair"
}: ExportHtmlOptions): string {
  const article = sanitizeArticle(rawArticle);
  const isDark = theme === "sombre";
  const now = new Date();
  const exportDate = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const categoryColor = "#2563eb"; // Blue 600

  // Format paragraphs
  const paragraphs = (article.content || "")
    .split("\n\n")
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${escapeHtml(p)}</p>`)
    .join("\n");

  // Summary section
  let summaryHtml = "";
  if (summary && summary.length > 0) {
    const summaryItems = summary
      .map(item => `<li>${escapeHtml(item)}</li>`)
      .join("\n");
    summaryHtml = `
      <section class="summary-box">
        <div class="box-badge">✨ Résumé Exécutif IA</div>
        <ul class="summary-list">
          ${summaryItems}
        </ul>
      </section>
    `;
  }

  // Complementary dossiers
  let complementsHtml = "";
  if (article.results || article.organisation || article.scandals) {
    let innerCards = "";
    if (article.results) {
      innerCards += `
        <div class="complement-card results">
          <div class="complement-header">
            <span class="complement-icon">🏆</span>
            <h4>Bilan, Données &amp; Résultats</h4>
          </div>
          <p>${escapeHtml(article.results)}</p>
        </div>
      `;
    }
    if (article.organisation) {
      innerCards += `
        <div class="complement-card organisation">
          <div class="complement-header">
            <span class="complement-icon">🧭</span>
            <h4>Coulisses &amp; Organisation</h4>
          </div>
          <p>${escapeHtml(article.organisation)}</p>
        </div>
      `;
    }
    if (article.scandals) {
      innerCards += `
        <div class="complement-card controversies">
          <div class="complement-header">
            <span class="complement-icon">⚠️</span>
            <h4>Points de Vigilance &amp; Controverses</h4>
          </div>
          <p>${escapeHtml(article.scandals)}</p>
        </div>
      `;
    }

    complementsHtml = `
      <section class="complements-section">
        <h3 class="section-heading">Dossiers &amp; Éléments d'Analyse Complémentaires</h3>
        <div class="complements-grid">
          ${innerCards}
        </div>
      </section>
    `;
  }

  // Q&A / Investigation Thread
  let qaHtml = "";
  if (qaList && qaList.length > 0) {
    const qaItems = qaList.map(item => {
      const isUser = item.role === "user";
      return `
        <div class="qa-message ${isUser ? 'qa-user' : 'qa-journalist'}">
          <div class="qa-meta">
            <span class="qa-sender">${isUser ? '👤 Lecteur' : `🎙️ ${escapeHtml(item.journalistTitle || 'Grand Reporter Focus News')}`}</span>
            <span class="qa-time">${escapeHtml(item.time)}</span>
          </div>
          <div class="qa-body">${escapeHtml(item.text).replace(/\n/g, '<br/>')}</div>
        </div>
      `;
    }).join("\n");

    qaHtml = `
      <section class="investigation-section">
        <div class="investigation-header">
          <div class="investigation-title-group">
            <span class="investigation-icon">💬</span>
            <div>
              <h3 class="section-heading" style="margin:0;">Échange d'Approfondissement avec la Rédaction</h3>
              <p class="section-sub">Questions-réponses exclusives et compléments d'enquête avec le Grand Reporter Focus News.</p>
            </div>
          </div>
        </div>
        <div class="qa-thread">
          ${qaItems}
        </div>
      </section>
    `;
  }

  return `<!DOCTYPE html>
<html lang="fr" data-theme="${isDark ? 'dark' : 'light'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(article.title)} | Focus News</title>
  <style>
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --primary: #2563eb;
      --primary-light: #eff6ff;
      --accent: #f59e0b;
      --shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03);
      --radius: 16px;
    }

    [data-theme="dark"] {
      --bg: #09090b;
      --card-bg: #18181b;
      --text-main: #f4f4f5;
      --text-muted: #a1a1aa;
      --border: #27272a;
      --primary: #3b82f6;
      --primary-light: rgba(59, 130, 246, 0.1);
      --accent: #fbbf24;
      --shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.65;
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 860px;
      margin: 0 auto;
    }

    /* Print & Export Bar */
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 12px 20px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }

    .brand {
      font-weight: 900;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand span {
      color: var(--primary);
    }

    .print-btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: opacity 0.2s;
    }

    .print-btn:hover {
      opacity: 0.9;
    }

    /* Main Article Container */
    .article-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
      margin-bottom: 30px;
    }

    .article-cover {
      width: 100%;
      height: 320px;
      object-fit: cover;
      display: block;
      border-bottom: 1px solid var(--border);
    }

    .article-content {
      padding: 40px;
    }

    .category-badge {
      display: inline-block;
      background: var(--primary);
      color: white;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 16px;
    }

    .article-title {
      font-size: 32px;
      font-weight: 800;
      line-height: 1.25;
      letter-spacing: -0.02em;
      margin-bottom: 16px;
      color: var(--text-main);
    }

    .meta-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
      font-size: 13px;
      color: var(--text-muted);
      padding-bottom: 24px;
      margin-bottom: 28px;
      border-bottom: 1px solid var(--border);
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    /* Executive Summary */
    .summary-box {
      background: var(--primary-light);
      border: 1px solid var(--primary);
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 32px;
    }

    .box-badge {
      font-size: 12px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }

    .summary-list {
      margin-left: 20px;
      font-size: 15px;
      font-weight: 500;
      color: var(--text-main);
    }

    .summary-list li {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    /* Article Body */
    .article-body {
      font-size: 17px;
      line-height: 1.8;
      color: var(--text-main);
    }

    .article-body p {
      margin-bottom: 22px;
    }

    /* Complements Section */
    .complements-section {
      margin-top: 40px;
      padding-top: 32px;
      border-top: 1px solid var(--border);
    }

    .section-heading {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
      color: var(--text-main);
    }

    .complements-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-top: 16px;
    }

    .complement-card {
      padding: 18px 20px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .complement-card.results {
      background: rgba(245, 158, 11, 0.06);
      border-color: rgba(245, 158, 11, 0.25);
    }

    .complement-card.organisation {
      background: rgba(6, 182, 212, 0.06);
      border-color: rgba(6, 182, 212, 0.25);
    }

    .complement-card.controversies {
      background: rgba(239, 68, 68, 0.06);
      border-color: rgba(239, 68, 68, 0.25);
    }

    .complement-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .complement-card p {
      font-size: 14px;
      color: var(--text-main);
      line-height: 1.6;
    }

    /* Investigation & Q&A Thread */
    .investigation-section {
      margin-top: 40px;
      padding-top: 32px;
      border-top: 2px dashed var(--border);
    }

    .investigation-header {
      margin-bottom: 24px;
    }

    .investigation-title-group {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .investigation-icon {
      font-size: 24px;
      background: var(--primary-light);
      padding: 6px 10px;
      border-radius: 10px;
    }

    .section-sub {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .qa-thread {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .qa-message {
      padding: 16px 20px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .qa-user {
      background: var(--primary-light);
      border-color: rgba(37, 99, 235, 0.2);
      margin-left: 30px;
    }

    .qa-journalist {
      background: var(--card-bg);
      border-color: var(--border);
      margin-right: 30px;
      box-shadow: var(--shadow);
    }

    .qa-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: 700;
      color: var(--primary);
    }

    .qa-time {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .qa-body {
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-main);
    }

    /* Footer */
    .doc-footer {
      text-align: center;
      padding: 24px;
      font-size: 12px;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      margin-top: 20px;
    }

    @media (max-width: 640px) {
      body { padding: 16px 8px; }
      .article-content { padding: 24px 18px; }
      .article-title { font-size: 24px; }
      .qa-user { margin-left: 10px; }
      .qa-journalist { margin-right: 10px; }
    }

    @media print {
      body {
        background: white !important;
        color: black !important;
        padding: 0 !important;
      }
      .action-bar { display: none !important; }
      .article-card {
        box-shadow: none !important;
        border: none !important;
      }
      .article-cover { max-height: 240px; }
    }
  </style>
</head>
<body>

  <div class="container">
    
    <!-- Action Bar for viewing or printing -->
    <div class="action-bar">
      <div class="brand">
        FOCUS <span>NEWS</span>
      </div>
      <div>
        <button class="print-btn" onclick="window.print()">
          🖨️ Imprimer / PDF
        </button>
      </div>
    </div>

    <!-- Main Article Document -->
    <article class="article-card">
      ${article.img ? `<img src="${escapeHtml(article.img)}" alt="${escapeHtml(article.title)}" class="article-cover" />` : ''}

      <div class="article-content">
        <span class="category-badge">${escapeHtml(article.category || 'Actualité')}</span>
        
        <h1 class="article-title">${escapeHtml(article.title)}</h1>

        <div class="meta-bar">
          <span class="meta-item">🕒 Heure de publication : <strong>${escapeHtml(article.time || 'Aujourd\'hui')}</strong></span>
          <span class="meta-item">📅 Édition : <strong>${exportDate}</strong></span>
          ${article.source ? `<span class="meta-item">📰 Source : <strong>${escapeHtml(article.source)}</strong></span>` : ''}
          ${article.articleIsAiGenerated ? `<span class="meta-item" style="color:#9333ea;">✨ Rédigé par Rédaction IA</span>` : ''}
        </div>

        ${summaryHtml}

        <div class="article-body">
          ${paragraphs}
        </div>

        ${complementsHtml}

        ${qaHtml}

      </div>

      <footer class="doc-footer">
        <p>Document généré et exporté depuis l'application <strong>Focus News</strong> — Tous droits réservés.</p>
        <p style="margin-top: 4px; font-size: 11px;">Date d'export : ${exportDate}</p>
      </footer>
    </article>

  </div>

</body>
</html>`;
}

/**
 * Initiates direct browser download of the formatted HTML file.
 */
export function downloadArticleAsHtml(options: ExportHtmlOptions): void {
  const htmlContent = generateArticleHtmlDocument(options);
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  // Format clean file name
  const sanitizedTitle = (options.article.title || "article")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);

  const fileName = `focus-news-${sanitizedTitle || "article"}.html`;
  
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
