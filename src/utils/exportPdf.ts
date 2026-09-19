import { jsPDF } from "jspdf";
import { Article } from "../types";
import { sanitizeArticle } from "./textCleaner";

interface QAMessage {
  id: string;
  role: "user" | "journalist";
  text: string;
  time: string;
  journalistTitle?: string;
}

export interface ExportPdfOptions {
  article: Article;
  summary?: string[] | null;
  qaList?: QAMessage[];
}

export interface ExportEditionPdfOptions {
  articles: Article[];
  editionHour?: number;
  editionDate?: string;
  region?: string;
}

/**
 * Normalizes text for jsPDF standard fonts by replacing unsupported special characters
 * (smart quotes, em-dashes, non-breaking spaces) with clean standard UTF-8 equivalents.
 */
function cleanPdfText(str: string): string {
  if (!str) return "";
  return str
    .replace(/[\u00A0\u202F\u2007\u2009]/g, " ") // Non-breaking spaces
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // Smart single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // Smart double quotes
    .replace(/[\u2013\u2014]/g, "-") // En/Em dashes
    .replace(/\u2026/g, "...") // Ellipsis
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Creates and downloads a clean, professional multi-page PDF document for an individual article.
 */
export function exportArticleToPdf({
  article: rawArticle,
  summary,
  qaList = []
}: ExportPdfOptions): void {
  const article = sanitizeArticle(rawArticle);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 18;
  const marginTop = 22;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginX * 2; // 174mm

  let currentY = marginTop;

  const checkPageBreak = (neededSpace: number) => {
    if (currentY + neededSpace > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
      return true;
    }
    return false;
  };

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // --- 1. TOP NEWSPAPER BANNER ---
  doc.setFillColor(37, 99, 235); // Blue 600
  doc.rect(marginX, currentY, contentWidth, 1.5, "F");
  currentY += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text("FOCUS NEWS", marginX, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  const dateText = cleanPdfText(`Édition du ${dateFormatted}`);
  doc.text(dateText, pageWidth - marginX, currentY, { align: "right" });

  currentY += 7;

  // Category Pill
  const categoryName = cleanPdfText(article.category || "ACTUALITÉ").toUpperCase();
  doc.setFillColor(239, 246, 255); // Blue 50
  doc.setDrawColor(191, 219, 254); // Blue 200
  const categoryWidth = Math.min(doc.getTextWidth(categoryName) + 6, 80);
  doc.roundedRect(marginX, currentY - 3.5, categoryWidth, 5.5, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235); // Blue 600
  doc.text(categoryName, marginX + 3, currentY);

  currentY += 6;

  // --- 2. ARTICLE TITLE ---
  const cleanTitle = cleanPdfText(article.title);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);

  const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
  const titleHeight = titleLines.length * 7;
  checkPageBreak(titleHeight + 10);
  doc.text(titleLines, marginX, currentY);
  currentY += titleHeight + 2;

  // Metadata Bar (Source, publication time, reading time)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  const metaParts: string[] = [];
  if (article.time) metaParts.push(`Heure : ${cleanPdfText(article.time)}`);
  if (article.source) metaParts.push(`Source : ${cleanPdfText(article.source)}`);
  metaParts.push("Lecture : 4-6 min");
  if (article.articleIsAiGenerated) metaParts.push("Rédaction IA vérifiée");

  const metaLine = metaParts.join("   |   ");
  doc.text(metaLine, marginX, currentY);
  currentY += 4;

  // Subtle separator rule
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.3);
  doc.line(marginX, currentY, marginX + contentWidth, currentY);
  currentY += 6;

  // --- 3. EXECUTIVE SUMMARY (if available) ---
  if (summary && summary.length > 0) {
    const summaryTitle = "RÉSUMÉ EXÉCUTIF";
    const cleanedPoints = summary.map(p => cleanPdfText(p));

    // Calculate needed box height
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    let totalLinesHeight = 0;
    const splitPoints = cleanedPoints.map(point => {
      const lines = doc.splitTextToSize(`•  ${point}`, contentWidth - 14);
      totalLinesHeight += lines.length * 5 + 2;
      return lines;
    });

    const boxHeight = totalLinesHeight + 12;
    checkPageBreak(boxHeight + 6);

    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.roundedRect(marginX, currentY, contentWidth, boxHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(37, 99, 235);
    doc.text(summaryTitle, marginX + 6, currentY + 6);

    let pointY = currentY + 11;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    for (const lines of splitPoints) {
      doc.text(lines, marginX + 6, pointY);
      pointY += lines.length * 5 + 1.5;
    }

    currentY += boxHeight + 8;
  }

  // --- 4. ARTICLE BODY PARAGRAPHS ---
  const rawParagraphs = (article.content || "")
    .split(/\n\s*\n+/)
    .map(p => cleanPdfText(p))
    .filter(p => p.length > 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);

  for (const para of rawParagraphs) {
    const lines = doc.splitTextToSize(para, contentWidth);
    const paraHeight = lines.length * 5.2;

    checkPageBreak(paraHeight + 4);
    doc.text(lines, marginX, currentY);
    currentY += paraHeight + 4; // Space between paragraphs
  }

  // --- 5. COMPLEMENT DOSSIERS (Results, Organisation, Controversies) ---
  if (article.results || article.organisation || article.scandals) {
    checkPageBreak(25);
    currentY += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("DOSSIERS ET ANALYSES COMPLÉMENTAIRES", marginX, currentY);
    currentY += 6;

    const sections = [
      { title: "Bilan, Données & Résultats", text: article.results, color: [245, 158, 11] }, // Amber
      { title: "Coulisses & Organisation", text: article.organisation, color: [6, 182, 212] }, // Cyan
      { title: "Points de Vigilance & Controverses", text: article.scandals, color: [239, 68, 68] } // Red
    ];

    for (const sec of sections) {
      if (!sec.text) continue;
      const cleanSecText = cleanPdfText(sec.text);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const textLines = doc.splitTextToSize(cleanSecText, contentWidth - 12);
      const cardHeight = textLines.length * 4.8 + 10;

      checkPageBreak(cardHeight + 4);

      // Left colored vertical accent bar
      doc.setFillColor(sec.color[0], sec.color[1], sec.color[2]);
      doc.rect(marginX, currentY, 2, cardHeight, "F");

      // Box background
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX + 2, currentY, contentWidth - 2, cardHeight, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(sec.color[0], sec.color[1], sec.color[2]);
      doc.text(cleanPdfText(sec.title), marginX + 6, currentY + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(textLines, marginX + 6, currentY + 10);

      currentY += cardHeight + 4;
    }
  }

  // --- 6. INVESTIGATION Q&A THREAD (if present) ---
  if (qaList && qaList.length > 0) {
    checkPageBreak(30);
    currentY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("ÉCHANGE D'APPROFONDISSEMENT AVEC LA RÉDACTION", marginX, currentY);
    currentY += 6;

    for (const item of qaList) {
      const isUser = item.role === "user";
      const senderLabel = isUser ? "LECTEUR" : cleanPdfText(item.journalistTitle || "GRAND REPORTER FOCUS NEWS").toUpperCase();
      const cleanMsg = cleanPdfText(item.text);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const msgLines = doc.splitTextToSize(cleanMsg, contentWidth - 16);
      const msgHeight = msgLines.length * 4.6 + 9;

      checkPageBreak(msgHeight + 4);

      if (isUser) {
        doc.setFillColor(239, 246, 255); // Blue 50
        doc.setDrawColor(191, 219, 254);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
      }

      doc.roundedRect(marginX + (isUser ? 8 : 0), currentY, contentWidth - 8, msgHeight, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(isUser ? 37 : 71, isUser ? 99 : 85, isUser ? 235 : 105);
      doc.text(`${senderLabel}  (${cleanPdfText(item.time)})`, marginX + (isUser ? 12 : 4), currentY + 4.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(msgLines, marginX + (isUser ? 12 : 4), currentY + 8.5);

      currentY += msgHeight + 3.5;
    }
  }

  // --- 7. FOOTERS & PAGE NUMBERS (applied to every page) ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, marginX + contentWidth, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("Focus News — Le Quotidien Numérique Personnalisé", marginX, pageHeight - 7);

    const pageStr = `Page ${i} sur ${totalPages}`;
    doc.text(pageStr, pageWidth - marginX, pageHeight - 7, { align: "right" });
  }

  // Build clean filename
  const sanitizedTitle = (cleanTitle || "article")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 45);

  const fileName = `focus-news-${sanitizedTitle || "article"}.pdf`;
  doc.save(fileName);
}

/**
 * Creates and downloads a complete compiled daily digest PDF containing all articles of the selected edition.
 */
export function exportEditionToPdf({
  articles,
  editionHour,
  editionDate,
  region
}: ExportEditionPdfOptions): void {
  if (!articles || articles.length === 0) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 18;
  const marginTop = 22;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginX * 2;

  let currentY = marginTop;

  const checkPageBreak = (neededSpace: number) => {
    if (currentY + neededSpace > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
      return true;
    }
    return false;
  };

  const now = new Date();
  const dateFormatted = editionDate || now.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const hourText = editionHour !== undefined ? `${String(editionHour).padStart(2, "0")}h00` : "Édition Complète";

  // Front Header Cover
  doc.setFillColor(37, 99, 235);
  doc.rect(marginX, currentY, contentWidth, 2.5, "F");
  currentY += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text("FOCUS NEWS — ÉDITION DU JOUR", marginX, currentY);

  currentY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`${cleanPdfText(dateFormatted)} • ${hourText} ${region ? `• Région ${cleanPdfText(region)}` : ""}`, marginX, currentY);

  currentY += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, currentY, marginX + contentWidth, currentY);
  currentY += 8;

  // Sommaire / Table of Contents
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text("AU SOMMAIRE DE CETTE ÉDITION", marginX, currentY);
  currentY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);

  articles.slice(0, 12).forEach((art, index) => {
    const num = `${index + 1}. `;
    const cat = `[${cleanPdfText(art.category)}] `;
    const itemText = cleanPdfText(`${num}${cat}${art.title}`);
    const lines = doc.splitTextToSize(itemText, contentWidth - 4);
    doc.text(lines, marginX + 2, currentY);
    currentY += lines.length * 4.8 + 1;
  });

  currentY += 6;

  // Iterate over articles
  articles.forEach((art, idx) => {
    const cleanArt = sanitizeArticle(art);
    doc.addPage();
    currentY = marginTop;

    // Small article header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    doc.text(cleanPdfText(cleanArt.category.toUpperCase()), marginX, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Article ${idx + 1} sur ${articles.length}`, pageWidth - marginX, currentY, { align: "right" });
    currentY += 5;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(cleanPdfText(cleanArt.title), contentWidth);
    doc.text(titleLines, marginX, currentY);
    currentY += titleLines.length * 6 + 2;

    // Meta
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Source : ${cleanPdfText(cleanArt.source || "Presse vérifiée")}  •  Heure : ${cleanPdfText(cleanArt.time || "")}`, marginX, currentY);
    currentY += 3;
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, currentY, marginX + contentWidth, currentY);
    currentY += 6;

    // Paragraphs
    const paras = (cleanArt.content || "")
      .split(/\n\s*\n+/)
      .map(p => cleanPdfText(p))
      .filter(p => p.length > 0);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    for (const para of paras) {
      const lines = doc.splitTextToSize(para, contentWidth);
      const needed = lines.length * 5;
      checkPageBreak(needed + 4);
      doc.text(lines, marginX, currentY);
      currentY += needed + 3.5;
    }
  });

  // Footer for all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, marginX + contentWidth, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Focus News — Journal complet ${hourText}`, marginX, pageHeight - 7);

    const pageStr = `Page ${i} sur ${totalPages}`;
    doc.text(pageStr, pageWidth - marginX, pageHeight - 7, { align: "right" });
  }

  const sanitizedHour = hourText.replace(/[^a-z0-9]/gi, "-");
  doc.save(`focus-news-journal-${sanitizedHour}.pdf`);
}
