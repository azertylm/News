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
      --font-scale: 1;
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
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    /* Print, Font Size & Export Bar */
    .action-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      margin-bottom: 24px;
      padding: 14px 20px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      position: sticky;
      top: 16px;
      z-index: 100;
    }

    .brand {
      font-weight: 900;
      font-size: 17px;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand span {
      color: var(--primary);
    }

    /* Font Size Controls Group */
    .font-size-control-group {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary-light);
      padding: 4px 10px;
      border-radius: 12px;
      border: 1px solid rgba(37, 99, 235, 0.2);
    }

    .font-control-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .font-btn-pill {
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--text-main);
      font-size: 12px;
      font-weight: 700;
      padding: 5px 10px;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      min-width: 32px;
    }

    .font-btn-pill:hover {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }

    .font-btn-pill.active {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.35);
    }

    .font-scale-indicator {
      font-size: 12px;
      font-weight: 800;
      font-mono: monospace;
      color: var(--primary);
      min-width: 44px;
      text-align: center;
    }

    .actions-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .print-btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
      transition: all 0.2s;
    }

    .print-btn:hover {
      opacity: 0.92;
      transform: translateY(-1px);
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
      height: 360px;
      object-fit: cover;
      display: block;
      border-bottom: 1px solid var(--border);
    }

    .article-content {
      padding: 44px 40px;
    }

    .category-badge {
      display: inline-block;
      background: var(--primary);
      color: white;
      font-size: calc(11px * var(--font-scale));
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 5px 12px;
      border-radius: 8px;
      margin-bottom: 18px;
    }

    .article-title {
      font-size: calc(32px * var(--font-scale));
      font-weight: 800;
      line-height: 1.25;
      letter-spacing: -0.02em;
      margin-bottom: 18px;
      color: var(--text-main);
      transition: font-size 0.15s ease;
    }

    .meta-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
      font-size: calc(13px * var(--font-scale));
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
      border-radius: 14px;
      padding: 22px 26px;
      margin-bottom: 34px;
    }

    .box-badge {
      font-size: calc(12px * var(--font-scale));
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 14px;
    }

    .summary-list {
      margin-left: 20px;
      font-size: calc(16px * var(--font-scale));
      font-weight: 500;
      color: var(--text-main);
      transition: font-size 0.15s ease;
    }

    .summary-list li {
      margin-bottom: 10px;
      line-height: 1.55;
    }

    /* Article Body */
    .article-body {
      font-size: calc(18px * var(--font-scale));
      line-height: 1.85;
      color: var(--text-main);
      transition: font-size 0.15s ease;
    }

    .article-body p {
      margin-bottom: 24px;
      text-align: justify;
      text-indent: 1.5em;
    }

    /* Complements Section */
    .complements-section {
      margin-top: 44px;
      padding-top: 32px;
      border-top: 1px solid var(--border);
    }

    .section-heading {
      font-size: calc(20px * var(--font-scale));
      font-weight: 700;
      margin-bottom: 18px;
      color: var(--text-main);
      transition: font-size 0.15s ease;
    }

    .complements-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-top: 16px;
    }

    .complement-card {
      padding: 20px 22px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .complement-card.results {
      background: rgba(245, 158, 11, 0.07);
      border-color: rgba(245, 158, 11, 0.3);
    }

    .complement-card.organisation {
      background: rgba(6, 182, 212, 0.07);
      border-color: rgba(6, 182, 212, 0.3);
    }

    .complement-card.controversies {
      background: rgba(239, 68, 68, 0.07);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .complement-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: calc(15px * var(--font-scale));
      font-weight: 700;
      margin-bottom: 10px;
    }

    .complement-card p {
      font-size: calc(15px * var(--font-scale));
      color: var(--text-main);
      line-height: 1.7;
    }

    /* Investigation & Q&A Thread */
    .investigation-section {
      margin-top: 44px;
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
      font-size: 26px;
      background: var(--primary-light);
      padding: 6px 12px;
      border-radius: 12px;
    }

    .section-sub {
      font-size: calc(13px * var(--font-scale));
      color: var(--text-muted);
      margin-top: 4px;
    }

    .qa-thread {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .qa-message {
      padding: 18px 22px;
      border-radius: 14px;
      border: 1px solid var(--border);
    }

    .qa-user {
      background: var(--primary-light);
      border-color: rgba(37, 99, 235, 0.25);
      margin-left: 40px;
    }

    .qa-journalist {
      background: var(--card-bg);
      border-color: var(--border);
      margin-right: 40px;
      box-shadow: var(--shadow);
    }

    .qa-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: calc(13px * var(--font-scale));
      font-weight: 700;
      color: var(--primary);
    }

    .qa-time {
      font-size: calc(11px * var(--font-scale));
      color: var(--text-muted);
      font-weight: 500;
    }

    .qa-body {
      font-size: calc(15px * var(--font-scale));
      line-height: 1.7;
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
    
    <!-- Action Bar for viewing, font resizing, and printing -->
    <div class="action-bar" id="reader-toolbar">
      <div class="brand">
        FOCUS <span>NEWS</span>
      </div>

      <!-- Interactive Font Size Scaler for HTML Version -->
      <div class="font-size-control-group" id="font-controls">
        <span class="font-control-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
          Police :
        </span>
        <button class="font-btn-pill" id="btn-font-dec" onclick="stepFontScale(-0.15)" title="Diminuer la taille de la police (raccourci clavier : -)">
          A-
        </button>
        <span class="font-scale-indicator" id="font-scale-text">100%</span>
        <button class="font-btn-pill" id="btn-font-inc" onclick="stepFontScale(0.15)" title="Agrandir la taille de la police (raccourci clavier : +)">
          A+
        </button>
        <button class="font-btn-pill active" id="btn-preset-100" onclick="setFontScale(1.0)" title="Taille standard">
          100%
        </button>
        <button class="font-btn-pill" id="btn-preset-125" onclick="setFontScale(1.25)" title="Confort de lecture (+25%)">
          125%
        </button>
        <button class="font-btn-pill" id="btn-preset-150" onclick="setFontScale(1.5)" title="Grand texte (+50%)">
          150%
        </button>
        <button class="font-btn-pill" id="btn-preset-180" onclick="setFontScale(1.8)" title="Très grand texte (+80%)">
          180%
        </button>
      </div>

      <div class="actions-right">
        <button class="print-btn" onclick="window.print()" title="Imprimer ou enregistrer au format PDF">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
          Créer un PDF / Imprimer
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
        <p>Document généré et exporté depuis l'application <strong>Focus News</strong> (groupe <strong>ALPHABETTE</strong>, fondé par Valentin RICHAUD).</p>
        <p style="margin-top: 4px; font-size: 11px;">Hébergement souverain OVH • Zéro pistage publicitaire • Date d'export : ${exportDate}</p>
      </footer>
    </article>

  </div>

  <script>
    (function() {
      var currentScale = 1.0;
      var MIN_SCALE = 0.85;
      var MAX_SCALE = 2.4;

      function updateActiveButtons() {
        var presets = [1.0, 1.25, 1.5, 1.8];
        presets.forEach(function(val) {
          var id = "btn-preset-" + Math.round(val * 100);
          var btn = document.getElementById(id);
          if (btn) {
            if (Math.abs(currentScale - val) < 0.05) {
              btn.classList.add("active");
            } else {
              btn.classList.remove("active");
            }
          }
        });

        var indicator = document.getElementById("font-scale-text");
        if (indicator) {
          indicator.textContent = Math.round(currentScale * 100) + "%";
        }
      }

      window.setFontScale = function(scale) {
        currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, Math.round(scale * 100) / 100));
        document.documentElement.style.setProperty("--font-scale", currentScale);
        updateActiveButtons();
        try {
          localStorage.setItem("focusNewsHtmlReaderFontScale", currentScale.toString());
        } catch (e) {}
      };

      window.stepFontScale = function(delta) {
        window.setFontScale(currentScale + delta);
      };

      // Restore user preferred font size if stored
      try {
        var saved = localStorage.getItem("focusNewsHtmlReaderFontScale");
        if (saved) {
          var parsed = parseFloat(saved);
          if (!isNaN(parsed) && parsed >= MIN_SCALE && parsed <= MAX_SCALE) {
            window.setFontScale(parsed);
          }
        }
      } catch (e) {}

      // Keyboard shortcuts: '+' to enlarge, '-' to decrease, '0' to reset
      document.addEventListener("keydown", function(e) {
        if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          window.stepFontScale(0.15);
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          window.stepFontScale(-0.15);
        } else if (e.key === "0") {
          e.preventDefault();
          window.setFontScale(1.0);
        }
      });
    })();
  </script>
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
