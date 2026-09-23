import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Cpu, 
  Server, 
  Cloud, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Lock,
  EyeOff,
  Flame,
  ArrowRight
} from "lucide-react";
import { AISovereigntyTelemetry, SystemAIStatus } from "../types";

interface SovereigntyModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "clair" | "sombre";
  telemetry?: AISovereigntyTelemetry;
  currentTelemetry?: AISovereigntyTelemetry;
  onProviderChanged?: (newMode: "gemini" | "hybrid_mistral") => void;
}

export default function SovereigntyModal({
  isOpen,
  onClose,
  theme,
  telemetry,
  currentTelemetry,
  onProviderChanged
}: SovereigntyModalProps) {
  const activeTelemetry = currentTelemetry || telemetry;
  const [systemStatus, setSystemStatus] = useState<SystemAIStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isTestingFailover, setIsTestingFailover] = useState(false);
  const [failoverTestResult, setFailoverTestResult] = useState<{
    success: boolean;
    text: string;
    sovereignty: AISovereigntyTelemetry;
  } | null>(null);
  const [isTogglingProvider, setIsTogglingProvider] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSystemStatus();
    }
  }, [isOpen]);

  const fetchSystemStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch("/api/ai/status");
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (e) {
      console.error("Error fetching AI status", e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleToggleMode = async (mode: "gemini" | "hybrid_mistral") => {
    setIsTogglingProvider(true);
    try {
      const res = await fetch("/api/ai/toggle-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode })
      });
      if (res.ok) {
        await fetchSystemStatus();
        if (onProviderChanged) onProviderChanged(mode);
      }
    } catch (e) {
      console.error("Error toggling provider", e);
    } finally {
      setIsTogglingProvider(false);
    }
  };

  const handleRunFailoverTest = async () => {
    setIsTestingFailover(true);
    setFailoverTestResult(null);
    try {
      const res = await fetch("/api/ai/test-failover", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setFailoverTestResult(data);
      }
    } catch (e) {
      console.error("Failover test error", e);
    } finally {
      setIsTestingFailover(false);
    }
  };

  if (!isOpen) return null;

  const bgModal = theme === "clair" ? "bg-white text-slate-900" : "bg-zinc-950 text-zinc-100";
  const borderCol = theme === "clair" ? "border-slate-200" : "border-zinc-800";
  const cardBg = theme === "clair" ? "bg-slate-50 border-slate-200" : "bg-zinc-900/70 border-zinc-800";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border ${bgModal} ${borderCol} overflow-hidden`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${borderCol} bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-transparent`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Architecture Souveraine & Résiliente</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  ALPHABETTE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Écosystème éthique fondé par Valentin RICHAUD • Hébergement OVH France
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
          
          {/* Active Telemetry Banner */}
          {activeTelemetry && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      Dernier traitement : {activeTelemetry.badge}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      {activeTelemetry.latencyMs} ms
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                    Moteur : <strong>{activeTelemetry.providerLabel}</strong> ({activeTelemetry.model}) • Hébergement : {activeTelemetry.hosting}
                  </p>
                  {activeTelemetry.fallbackTriggered && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                      ⚠️ Bascule de secours activée : {activeTelemetry.fallbackReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3-Phase Strategy Diagram */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-500" />
              Stratégie Technique du Moteur IA en 3 Phases
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Phase 1 */}
              <div className={`p-3.5 rounded-xl border ${cardBg} flex flex-col justify-between relative overflow-hidden`}>
                <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Actuelle
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-500">PHASE 1</span>
                  <h4 className="font-bold text-xs mt-0.5">Prototypage & Conception</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Utilisation de <strong>Google Gemini (SDK GenAI)</strong> pour valider l'ergonomie, la rédaction d'élite et le grounding factuel.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800 text-[10px] font-medium text-slate-600 dark:text-zinc-400">
                  Modèle : gemini-2.5-flash
                </div>
              </div>

              {/* Phase 2 */}
              <div className={`p-3.5 rounded-xl border ${cardBg} flex flex-col justify-between relative overflow-hidden`}>
                <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Cible
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-500">PHASE 2</span>
                  <h4 className="font-bold text-xs mt-0.5">Moteur Local Souverain</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Serveur dédié on-premises exécutant <strong>Ollama / vLLM (Mistral NeMo)</strong>. Zéro euro par requête, confidentialité 100% absolue.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800 text-[10px] font-medium text-slate-600 dark:text-zinc-400">
                  Hébergement : Machine locale
                </div>
              </div>

              {/* Phase 3 */}
              <div className={`p-3.5 rounded-xl border ${cardBg} flex flex-col justify-between relative overflow-hidden`}>
                <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  Secours
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-purple-500">PHASE 3</span>
                  <h4 className="font-bold text-xs mt-0.5">Secours Cloud Européen</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Si le serveur local est éteint ou ne répond pas sous 4s, bascule automatique transparente sur <strong>Mistral AI (France / UE)</strong>.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800 text-[10px] font-medium text-slate-600 dark:text-zinc-400">
                  Hébergement : Cloud France / UE
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Provider Selector & Live Failover Test */}
          <div className={`p-4 rounded-xl border ${cardBg} space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-xs">Sélecteur du Fournisseur en Direct</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Testez la réactivité du moteur selon le mode de déploiement sélectionné.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-zinc-800 self-start sm:self-auto">
                <button
                  onClick={() => handleToggleMode("gemini")}
                  disabled={isTogglingProvider}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    systemStatus?.activeMode === "gemini"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Phase 1 : Gemini
                </button>
                <button
                  onClick={() => handleToggleMode("hybrid_mistral")}
                  disabled={isTogglingProvider}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    systemStatus?.activeMode === "hybrid_mistral"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Hybride Souverain</span>
                </button>
              </div>
            </div>

            {/* Live failover resilience testing */}
            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-xs text-slate-700 dark:text-zinc-300">
                  Simulateur de Résilience & Failover Automatique
                </span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Déclenche une requête d'essai vers le serveur local puis valide la bascule de secours si indisponible.
                </p>
              </div>

              <button
                onClick={handleRunFailoverTest}
                disabled={isTestingFailover}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition flex items-center gap-2 cursor-pointer shadow-md shrink-0 disabled:opacity-50"
              >
                {isTestingFailover ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>{isTestingFailover ? "Test en cours..." : "Tester la résilience"}</span>
              </button>
            </div>

            {/* Test result output */}
            {failoverTestResult && (
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 animate-fade-in text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Test réussi • {failoverTestResult.sovereignty.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">
                    Latence : {failoverTestResult.sovereignty.latencyMs}ms
                  </span>
                </div>
                <p className="italic text-slate-700 dark:text-zinc-300">
                  « {failoverTestResult.text} »
                </p>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-emerald-500/20">
                  Exécuté par : <strong>{failoverTestResult.sovereignty.providerLabel}</strong> ({failoverTestResult.sovereignty.model}) • Hébergement : {failoverTestResult.sovereignty.hosting}
                  {failoverTestResult.sovereignty.fallbackTriggered && (
                    <span className="text-amber-600 dark:text-amber-400 ml-2">
                      (Bascule automatique : {failoverTestResult.sovereignty.fallbackReason})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ethical Commitments by Valentin RICHAUD */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 space-y-2.5">
            <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              Charte Éthique & Souveraineté Numérique ALPHABETTE
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-slate-600 dark:text-zinc-400">
              <div className="flex items-start gap-2">
                <EyeOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Zéro Pistage :</strong> Aucun tracker publicitaire, aucun cookie invasif, aucun profilage commercial.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Server className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Hébergement OVH France :</strong> Les serveurs front-end et vitrines reposent sur l'infrastructure souveraine OVH (alphabette.fr / alphabette.eu).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Indépendance Rédactionnelle :</strong> Les algorithmes sélectionnent les informations sur critères de pertinence publique et de pluralisme.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Flame className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Modèle par Abonnement Équitable :</strong> Financement direct et transparent sans monétisation de votre attention.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${borderCol} flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60`}>
          <a
            href="https://alphabette.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Catalogue unifié ALPHABETTE</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white transition cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
