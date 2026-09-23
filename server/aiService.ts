import { GoogleGenAI, Type } from "@google/genai";

export type AIProviderMode = "gemini" | "hybrid_mistral" | "local_only" | "mistral_cloud_only";

export interface AskAIOptions {
  systemInstruction?: string;
  temperature?: number;
  jsonOutput?: boolean;
  schemaDescription?: string;
  conversationHistory?: Array<{ role: "user" | "assistant" | "system"; text: string }>;
  timeoutLocalMs?: number;
  providerOverride?: AIProviderMode;
  modelOverride?: string;
  maxTokens?: number;
}

export interface AISovereigntyTelemetry {
  tier: "phase_1_prototypage" | "phase_2_local_souverain" | "phase_3_cloud_europeen";
  providerName: "gemini" | "local_ollama" | "mistral_cloud";
  providerLabel: string;
  model: string;
  hosting: string;
  badge: string;
  isLocal: boolean;
  isEuropeanCloud: boolean;
  fallbackTriggered: boolean;
  fallbackReason?: string;
  latencyMs: number;
}

export interface AIResponse {
  text: string;
  sovereignty: AISovereigntyTelemetry;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

export interface SystemAIStatus {
  activeMode: AIProviderMode;
  defaultMode: AIProviderMode;
  configuredKeys: {
    gemini: boolean;
    mistral: boolean;
    localUrl: string;
  };
  sovereigntyProfile: {
    company: "ALPHABETTE";
    founder: "Valentin RICHAUD";
    webHosting: "OVH Serveurs Souverains (alphabette.fr / alphabette.eu)";
    dataPolicy: "0 tracking publicitaire, respect strict RGPD, inférence locale prioritaire";
  };
  phases: {
    phase1: { name: string; provider: string; status: string };
    phase2: { name: string; provider: string; status: string };
    phase3: { name: string; provider: string; status: string };
  };
}

// Runtime in-memory provider override (can be changed via API or env)
let runtimeProviderOverride: AIProviderMode | null = null;

export function getActiveProviderMode(): AIProviderMode {
  if (runtimeProviderOverride) return runtimeProviderOverride;
  const envVal = (process.env.AI_PROVIDER || "gemini").toLowerCase().trim();
  if (envVal === "hybrid_mistral" || envVal === "hybrid" || envVal === "mistral_hybrid") {
    return "hybrid_mistral";
  }
  if (envVal === "local" || envVal === "local_only") {
    return "local_only";
  }
  if (envVal === "mistral" || envVal === "mistral_cloud_only") {
    return "mistral_cloud_only";
  }
  return "gemini";
}

export function setRuntimeProviderMode(mode: AIProviderMode | null): void {
  runtimeProviderOverride = mode;
  console.log(`[aiService] Mode IA commuté sur : ${mode || "défaut (.env)"}`);
}

// Custom error to differentiate local server failures from other errors
export class LocalAIUnavailableError extends Error {
  constructor(message: string, public readonly causeOriginal?: any) {
    super(message);
    this.name = "LocalAIUnavailableError";
  }
}

// Retry wrapper with exponential backoff for transient AI model issues (like 503 Spike in Demand or 429 Rate Limits)
async function runWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoff = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    let messageStr = "";
    try {
      if (error && typeof error === "object") {
        messageStr = error.message || error.error?.message || JSON.stringify(error);
      } else {
        messageStr = String(error);
      }
    } catch {
      messageStr = String(error);
    }

    const isRetryable =
      messageStr.includes("503") ||
      messageStr.includes("demand") ||
      messageStr.includes("unavailable") ||
      messageStr.includes("UNAVAILABLE") ||
      messageStr.includes("rate") ||
      messageStr.includes("temporarily") ||
      messageStr.includes("resource has been exhausted");

    if (retries > 0 && isRetryable) {
      console.warn(`[aiService] Retryable error (${messageStr.slice(0, 80)}...). Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, delay));
      return runWithRetry(fn, retries - 1, delay * backoff, backoff);
    }
    throw error;
  }
}

/**
 * Phase 1 Provider: Google Gemini API (Development & Prototyping)
 */
async function callGemini(prompt: string, options: AskAIOptions = {}): Promise<AIResponse> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment.");
  }

  const modelName = options.modelOverride || "gemini-3.8-flash";
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "alphabette-focusnews" } }
  });

  // Build contents payload
  const contentsPayload: any[] = [];
  if (options.conversationHistory && options.conversationHistory.length > 0) {
    for (const msg of options.conversationHistory) {
      contentsPayload.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }]
      });
    }
  }
  contentsPayload.push({
    role: "user",
    parts: [{ text: prompt }]
  });

  const config: any = {
    temperature: options.temperature ?? 0.7,
  };

  if (options.systemInstruction) {
    config.systemInstruction = options.systemInstruction;
  }

  if (options.jsonOutput) {
    config.responseMimeType = "application/json";
  }

  const response = await runWithRetry(() => ai.models.generateContent({
    model: modelName,
    contents: contentsPayload,
    config
  }));

  const text = response.text || "";
  const latencyMs = Date.now() - startTime;

  return {
    text,
    sovereignty: {
      tier: "phase_1_prototypage",
      providerName: "gemini",
      providerLabel: `Google Gemini (${modelName})`,
      model: modelName,
      hosting: "Google AI Cloud (Environnement de prototypage)",
      badge: "Phase 1 : Prototypage Google Gemini",
      isLocal: false,
      isEuropeanCloud: false,
      fallbackTriggered: false,
      latencyMs
    }
  };
}

/**
 * Phase 2 Provider: Dedicated Local AI Server (Ollama or vLLM - Mistral NeMo / Small)
 * Zero marginal inference cost, processed 100% on-premises with no telemetry.
 */
async function callLocalOllamaOrVLLM(prompt: string, options: AskAIOptions = {}): Promise<AIResponse> {
  const startTime = Date.now();
  const localBaseUrl = (process.env.LOCAL_AI_URL || "http://localhost:11434").replace(/\/+$/, "");
  const localModel = options.modelOverride || process.env.LOCAL_AI_MODEL || "mistral-nemo";
  const timeoutMs = options.timeoutLocalMs || parseInt(process.env.AI_LOCAL_TIMEOUT_MS || "4000", 10);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // We format messages according to standard Chat API compatible with both Ollama /api/chat and OpenAI/vLLM /v1/chat/completions
    const messages: Array<{ role: string; content: string }> = [];
    if (options.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }
    if (options.conversationHistory && options.conversationHistory.length > 0) {
      for (const h of options.conversationHistory) {
        messages.push({ role: h.role, content: h.text });
      }
    }
    messages.push({ role: "user", content: prompt });

    // We attempt Ollama /api/chat endpoint first (most common local deployment)
    const isOllamaEndpoint = !localBaseUrl.includes("/v1");
    const targetUrl = isOllamaEndpoint ? `${localBaseUrl}/api/chat` : `${localBaseUrl}/v1/chat/completions`;

    const requestBody = isOllamaEndpoint
      ? {
          model: localModel,
          messages,
          stream: false,
          format: options.jsonOutput ? "json" : undefined,
          options: {
            temperature: options.temperature ?? 0.7,
            num_predict: options.maxTokens ?? 2048,
          }
        }
      : {
          model: localModel,
          messages,
          stream: false,
          response_format: options.jsonOutput ? { type: "json_object" } : undefined,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2048,
        };

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new LocalAIUnavailableError(`Serveur local IA retourné code HTTP ${res.status}`);
    }

    const json: any = await res.json();
    let text = "";

    if (json.message?.content) {
      text = json.message.content;
    } else if (json.choices?.[0]?.message?.content) {
      text = json.choices[0].message.content;
    } else if (json.response) {
      text = json.response;
    } else {
      throw new LocalAIUnavailableError("Structure de réponse locale inattendue.");
    }

    const latencyMs = Date.now() - startTime;

    return {
      text,
      sovereignty: {
        tier: "phase_2_local_souverain",
        providerName: "local_ollama",
        providerLabel: `Moteur Local Souverain (${localModel})`,
        model: localModel,
        hosting: `Machine dédiée haute performance locale (${localBaseUrl})`,
        badge: "Phase 2 : Traitement 100% Local & Souverain (0€/inférence)",
        isLocal: true,
        isEuropeanCloud: false,
        fallbackTriggered: false,
        latencyMs
      }
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new LocalAIUnavailableError(`Timeout serveur local après ${timeoutMs}ms (machine occupée ou éteinte).`, err);
    }
    throw new LocalAIUnavailableError(err.message || "Erreur réseau connexion serveur local", err);
  }
}

/**
 * Phase 3 Provider: Official Mistral AI API (European Sovereign Cloud Fallback)
 * Hosted in France/EU under European jurisdiction.
 */
async function callMistralCloud(
  prompt: string, 
  options: AskAIOptions = {},
  fallbackReason?: string
): Promise<AIResponse> {
  const startTime = Date.now();
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY manquante pour le secours Cloud Européen.");
  }

  const modelName = options.modelOverride || process.env.MISTRAL_MODEL || "mistral-small-latest";
  const messages: Array<{ role: string; content: string }> = [];

  if (options.systemInstruction) {
    messages.push({ role: "system", content: options.systemInstruction });
  }
  if (options.conversationHistory && options.conversationHistory.length > 0) {
    for (const h of options.conversationHistory) {
      messages.push({ role: h.role, content: h.text });
    }
  }
  messages.push({ role: "user", content: prompt });

  const payload: any = {
    model: modelName,
    messages,
    temperature: options.temperature ?? 0.7,
  };

  if (options.jsonOutput) {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "User-Agent": "alphabette-focusnews-resilience"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Mistral AI Cloud a retourné une erreur ${response.status}: ${errorBody}`);
  }

  const data: any = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  const latencyMs = Date.now() - startTime;

  return {
    text,
    sovereignty: {
      tier: "phase_3_cloud_europeen",
      providerName: "mistral_cloud",
      providerLabel: `Mistral AI Cloud Souverain (${modelName})`,
      model: modelName,
      hosting: "Infrastructure Mistral AI (Data centers France / Union Européenne)",
      badge: fallbackReason 
        ? "Phase 3 : Secours Cloud Européen (Bascule auto suite coupure locale)" 
        : "Phase 3 : Cloud Européen Mistral AI",
      isLocal: false,
      isEuropeanCloud: true,
      fallbackTriggered: Boolean(fallbackReason),
      fallbackReason,
      latencyMs
    },
    usage: {
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens
    }
  };
}

/**
 * Strategy: Hybrid Sovereign Mistral Execution
 * Step 1: Attempts the high-performance local server first.
 * Step 2: If the local server is unreachable or exceeds timeout (3-5s),
 * intercepts error and seamlessly fails over to Mistral Cloud (Europe).
 * Step 3: If Mistral key is unavailable or fails, gracefully falls back to Gemini if available.
 */
async function executeHybridMistral(prompt: string, options: AskAIOptions = {}): Promise<AIResponse> {
  try {
    // Attempt local execution first
    console.log(`[aiService/Hybrid] Tentative d'inférence locale sur ${process.env.LOCAL_AI_URL || "http://localhost:11434"}...`);
    const localRes = await callLocalOllamaOrVLLM(prompt, options);
    console.log(`[aiService/Hybrid] Inférence locale réussie en ${localRes.sovereignty.latencyMs}ms.`);
    return localRes;
  } catch (localErr: any) {
    const reason = localErr?.message || "Délai dépassé ou serveur local non joignable";
    console.warn(`[aiService/Hybrid] Serveur local indisponible (${reason}). Bascule immédiate vers le secours Cloud Européen Mistral AI.`);

    if (process.env.MISTRAL_API_KEY) {
      try {
        const cloudRes = await callMistralCloud(prompt, options, reason);
        console.log(`[aiService/Hybrid] Secours Cloud Européen exécuté avec succès en ${cloudRes.sovereignty.latencyMs}ms.`);
        return cloudRes;
      } catch (mistralCloudErr: any) {
        console.error("[aiService/Hybrid] Secours Mistral Cloud également en échec:", mistralCloudErr.message);
      }
    } else {
      console.warn("[aiService/Hybrid] Aucune clé MISTRAL_API_KEY configurée pour le secours Cloud.");
    }

    // Ultimate fallback to Gemini if configured
    if (process.env.GEMINI_API_KEY) {
      console.log("[aiService/Hybrid] Bascule ultime sur Gemini en secours de développement...");
      const geminiRes = await callGemini(prompt, options);
      geminiRes.sovereignty.fallbackTriggered = true;
      geminiRes.sovereignty.fallbackReason = `Local: ${reason} + Clé Mistral Cloud absente.`;
      geminiRes.sovereignty.badge = "Secours Prototypage Gemini (Local indisponible)";
      return geminiRes;
    }

    throw new Error(`Échec de l'architecture hybride : ${reason}. Vérifiez LOCAL_AI_URL ou configurez MISTRAL_API_KEY.`);
  }
}

/**
 * UNIFIED AI ENTRY POINT: askAI(prompt, options)
 * The application's business logic NEVER calls raw API endpoints directly.
 * It always calls this unified method, guaranteeing compliance with the Strategy pattern,
 * dynamic switching between Phase 1 (Gemini) and Phase 2/3 (Hybrid Sovereign Mistral).
 */
export async function askAI(prompt: string, options: AskAIOptions = {}): Promise<AIResponse> {
  const mode = options.providerOverride || getActiveProviderMode();

  switch (mode) {
    case "hybrid_mistral":
      return await executeHybridMistral(prompt, options);

    case "local_only":
      return await callLocalOllamaOrVLLM(prompt, options);

    case "mistral_cloud_only":
      return await callMistralCloud(prompt, options);

    case "gemini":
    default:
      try {
        return await callGemini(prompt, options);
      } catch (geminiErr: any) {
        // If Gemini is rate-limited or fails and we have Mistral keys, try graceful failover
        if (process.env.MISTRAL_API_KEY) {
          console.warn(`[aiService] Gemini en échec (${geminiErr.message}), bascule vers Mistral Cloud...`);
          return await callMistralCloud(prompt, options, `Gemini indisponible: ${geminiErr.message}`);
        }
        throw geminiErr;
      }
  }
}

/**
 * Helper to safely extract JSON arrays or objects from AI responses
 */
export function parseAIJsonResponse<T = any>(rawText: string, fallback: T): T {
  try {
    let clean = rawText.trim();
    // Strip markdown fences
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return JSON.parse(clean) as T;
  } catch (e) {
    // Try to extract bracketed array or braced object if surrounded by chat chatter
    const arrayMatch = rawText.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]) as T;
      } catch {}
    }
    const objectMatch = rawText.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as T;
      } catch {}
    }
    return fallback;
  }
}

/**
 * Returns complete sovereignty status for UI dashboards, badges, and healthchecks
 */
export async function getAISystemStatus(): Promise<SystemAIStatus> {
  const activeMode = getActiveProviderMode();
  const localUrl = process.env.LOCAL_AI_URL || "http://localhost:11434";
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasMistral = Boolean(process.env.MISTRAL_API_KEY);

  // Quick non-blocking ping to check if local server is alive
  let localServerStatus = "Non testé";
  try {
    const pingController = new AbortController();
    const timeout = setTimeout(() => pingController.abort(), 1200);
    const pingRes = await fetch(`${localBaseUrl(localUrl)}/api/tags`, { signal: pingController.signal }).catch(() => null);
    clearTimeout(timeout);
    if (pingRes && pingRes.ok) {
      localServerStatus = "En ligne & Prêt (Ollama)";
    } else {
      localServerStatus = "Hors ligne (secours Cloud automatique prêt)";
    }
  } catch {
    localServerStatus = "Hors ligne (secours Cloud automatique prêt)";
  }

  return {
    activeMode,
    defaultMode: (process.env.AI_PROVIDER || "gemini").toLowerCase() as AIProviderMode,
    configuredKeys: {
      gemini: hasGemini,
      mistral: hasMistral,
      localUrl
    },
    sovereigntyProfile: {
      company: "ALPHABETTE",
      founder: "Valentin RICHAUD",
      webHosting: "OVH Serveurs Souverains (alphabette.fr / alphabette.eu)",
      dataPolicy: "0 tracking publicitaire, respect strict RGPD, inférence locale prioritaire"
    },
    phases: {
      phase1: {
        name: "Prototypage & Conception",
        provider: "Google Gemini (Google AI Studio)",
        status: hasGemini ? "Opérationnel (Développement)" : "Non configuré"
      },
      phase2: {
        name: "Production Cible Souveraine",
        provider: `Serveur Dédié Local (${localUrl} - Mistral NeMo)`,
        status: localServerStatus
      },
      phase3: {
        name: "Résilience & Secours Cloud",
        provider: "Mistral AI Officiel (France / Union Européenne)",
        status: hasMistral ? "Prêt en bascule transparente (<4s)" : "En attente de clé MISTRAL_API_KEY"
      }
    }
  };
}

function localBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}
