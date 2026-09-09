import { Article } from "../types";

/**
 * Utility to strip any leftover HTML tags, unescaped XML entities, 
 * font color blocks, or Google News aggregator fragments from display strings.
 */
export function sanitizeText(raw: string | undefined | null): string {
  if (!raw) return "";
  let text = String(raw);

  // 1. Unwrap CDATA
  text = text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1");

  // 2. Decode standard & numeric HTML entities
  const entityMap: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&#8217;": "'",
    "&#8216;": "'",
    "&#8220;": '"',
    "&#8221;": '"',
    "&#8230;": "...",
    "&#160;": " ",
    "&laquo;": "«",
    "&raquo;": "»",
    "&ndash;": "-",
    "&mdash;": "—"
  };

  for (let i = 0; i < 3; i++) {
    text = text.replace(/&[a-z0-9#]+;/gi, (match) => {
      const lower = match.toLowerCase();
      if (entityMap[lower]) return entityMap[lower];
      if (match.startsWith("&#x") || match.startsWith("&#X")) {
        const code = parseInt(match.substring(3, match.length - 1), 16);
        return !isNaN(code) ? String.fromCharCode(code) : "";
      }
      if (match.startsWith("&#")) {
        const code = parseInt(match.substring(2, match.length - 1), 10);
        return !isNaN(code) ? String.fromCharCode(code) : "";
      }
      return match;
    });
  }

  // 3. Strip all HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // 4. Remove residual attributes and closing tags
  text = text.replace(/https?:\/\/news\.google\.com[^\s"'>]+/gi, "");
  text = text.replace(/target=["']_blank["']/gi, "");
  text = text.replace(/color=["']#[a-f0-9]+["']/gi, "");
  text = text.replace(/<\/[a-z]+>/gi, "");
  text = text.replace(/<[a-z]+[^>]*>/gi, "");

  // 5. Clean whitespace
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Sanitizes all text fields of an Article object before rendering.
 */
export function sanitizeArticle(article: Article): Article {
  if (!article) return article;

  // Clean title & summary
  const cleanTitle = sanitizeText(article.title);
  const cleanSummary = sanitizeText(article.summary);

  // Clean paragraph by paragraph for content
  const cleanContent = (article.content || "")
    .split("\n\n")
    .map(p => sanitizeText(p))
    .filter(p => p.length > 0)
    .join("\n\n");

  return {
    ...article,
    title: cleanTitle || article.title,
    summary: cleanSummary || article.summary,
    content: cleanContent || article.content,
    scandals: sanitizeText(article.scandals),
    results: sanitizeText(article.results),
    organisation: sanitizeText(article.organisation)
  };
}
