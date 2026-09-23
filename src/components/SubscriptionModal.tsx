import React, { useState } from "react";
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Package, 
  Zap, 
  ExternalLink, 
  CheckCircle2, 
  HeartHandshake,
  Layers,
  ArrowRight
} from "lucide-react";
import { AlphabettePlan, AlphabetteSubscriptionState } from "../types";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "clair" | "sombre";
  currentSubscription?: AlphabetteSubscriptionState;
  subscriptionState?: AlphabetteSubscriptionState;
  onUpdateSubscription?: (newState: AlphabetteSubscriptionState) => void;
  onSelectPlan?: (plan: "individual_1eur" | "bundle_3eur") => void;
}

export const ALPHABETTE_SUITE_APPS = [
  {
    name: "INFOS PERSO GRAND FORMAT",
    subtitle: "Focus News",
    desc: "Actualité factuelle, grand format sur-mesure, analyse d'investigation sans publicité.",
    icon: "📰",
    isCurrent: true
  },
  {
    name: "LIDARSOL",
    subtitle: "Cartographie & Énergie",
    desc: "Analyse topographique LiDAR et potentiel solaire haute précision des territoires.",
    icon: "🛰️",
    isCurrent: false
  },
  {
    name: "OSOLAR",
    subtitle: "Dimensionnement Solaire",
    desc: "Simulations énergétiques indépendantes et calcul de rentabilité pour installations photovoltaïques.",
    icon: "☀️",
    isCurrent: false
  },
  {
    name: "PROXILIEN",
    subtitle: "Réseau Local & Solidarité",
    desc: "Plateforme de proximité éthique reliant citoyens, artisans et producteurs locaux.",
    icon: "🤝",
    isCurrent: false
  },
  {
    name: "L'ŒIL DE L'ATELIER 3D",
    subtitle: "Vision & Fabrication",
    desc: "Outil d'inspection et de supervision 3D pour la fabrication numérique et l'artisanat.",
    icon: "📐",
    isCurrent: false
  }
];

export default function SubscriptionModal({
  isOpen,
  onClose,
  theme,
  currentSubscription,
  subscriptionState,
  onUpdateSubscription,
  onSelectPlan
}: SubscriptionModalProps) {
  const activeSub: AlphabetteSubscriptionState = currentSubscription || subscriptionState || {
    isSubscribed: false,
    plan: "none",
    features: []
  };

  const [selectedPlan, setSelectedPlan] = useState<AlphabettePlan>(
    activeSub.plan === "none" ? "bundle_3eur" : activeSub.plan
  );
  const [showSuccessNotice, setShowSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleActivatePlan = (plan: AlphabettePlan) => {
    const isSubscribed = plan !== "none";
    const newState: AlphabetteSubscriptionState = {
      isSubscribed,
      plan,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: plan === "bundle_3eur" 
        ? ["Suite complète ALPHABETTE (5 logiciels)", "IA Hybride Illimitée", "Zéro pub", "Hébergement souverain OVH", "Support prioritaire Valentin RICHAUD"]
        : ["Focus News / Infos Perso Grand Format", "IA Hybride Illimitée", "Zéro pub", "Hébergement souverain OVH"]
    };

    localStorage.setItem("alphabette_sub_plan", plan);
    localStorage.setItem("alphabette_sub_date", newState.activatedAt || "");
    if (onUpdateSubscription) {
      onUpdateSubscription(newState);
    }
    if (onSelectPlan && (plan === "individual_1eur" || plan === "bundle_3eur")) {
      onSelectPlan(plan);
    }
    setShowSuccessNotice(true);
    setTimeout(() => {
      setShowSuccessNotice(false);
      onClose();
    }, 1800);
  };

  const handleCancelPass = () => {
    const newState: AlphabetteSubscriptionState = {
      isSubscribed: false,
      plan: "none",
      features: []
    };
    localStorage.removeItem("alphabette_sub_plan");
    localStorage.removeItem("alphabette_sub_date");
    onUpdateSubscription(newState);
    onClose();
  };

  const bgModal = theme === "clair" ? "bg-white text-slate-900" : "bg-zinc-950 text-zinc-100";
  const borderCol = theme === "clair" ? "border-slate-200" : "border-zinc-800";
  const cardBg = theme === "clair" ? "bg-slate-50 border-slate-200" : "bg-zinc-900/70 border-zinc-800";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border ${bgModal} ${borderCol} overflow-hidden`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderCol} bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-transparent`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-bold text-lg">
              α
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Modèle d'Accès Éthique ALPHABETTE</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Tarifs Transparents
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                1 € ou 3 € / mois • Zéro publicité • Zéro pistage • Souveraineté européenne
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">
          
          {/* Manifesto Callout */}
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 flex items-start gap-3.5">
            <HeartHandshake className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
                Le Manifeste ALPHABETTE par Valentin RICHAUD
              </span>
              <p className="text-slate-600 dark:text-zinc-300 text-xs leading-relaxed">
                « Nous croyons à des logiciels utiles, rapides et intègres. En refusant la revente de données personnelles et la publicité invasive, nous finançons notre travail par un abonnement symbolique et équitable accessible à tous : 1€ pour un logiciel, ou 3€ pour l'ensemble du catalogue. »
              </p>
            </div>
          </div>

          {/* Pricing Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Solo Plan: 1 € / mois */}
            <div 
              onClick={() => setSelectedPlan("individual_1eur")}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                selectedPlan === "individual_1eur"
                  ? "border-blue-600 ring-2 ring-blue-600/30 shadow-lg bg-blue-50/40 dark:bg-blue-950/20"
                  : `${cardBg} hover:border-slate-300 dark:hover:border-zinc-700`
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                    Formule Solo
                  </span>
                  {activeSub.plan === "individual_1eur" && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold tracking-tight">1 €</span>
                  <span className="text-slate-500 dark:text-zinc-400 text-xs font-semibold">/ mois</span>
                </div>

                <h3 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">
                  Focus News / Infos Perso Grand Format
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
                  Accès complet et illimité à votre journal intelligent personnalisé, enquêtes approfondies et synthèses sans pub.
                </p>

                <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Actualités en direct (Le Monde, Marianne, Google News)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Moteur IA souverain (Synthèse + Investigation)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Export PDF & Lecture Grand Format adaptable</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Zéro cookie tiers ni pistage publicitaire</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActivatePlan("individual_1eur");
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer text-center ${
                    currentSubscription.plan === "individual_1eur"
                      ? "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
                  }`}
                >
                  {currentSubscription.plan === "individual_1eur" ? "Formule Déjà Active" : "Choisir Formule Solo (1 €/mois)"}
                </button>
              </div>
            </div>

            {/* Bundle Plan: 3 € / mois (Featured) */}
            <div 
              onClick={() => setSelectedPlan("bundle_3eur")}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                selectedPlan === "bundle_3eur"
                  ? "border-purple-600 ring-2 ring-purple-600/30 shadow-lg bg-purple-50/40 dark:bg-purple-950/20"
                  : `${cardBg} hover:border-slate-300 dark:hover:border-zinc-700`
              }`}
            >
              <div className="absolute -top-3 right-5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md">
                ⭐ Recommandé • 5 Applis
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    Bundle ALPHABETTE Intégral
                  </span>
                  {activeSub.plan === "bundle_3eur" && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold tracking-tight">3 €</span>
                  <span className="text-slate-500 dark:text-zinc-400 text-xs font-semibold">/ mois</span>
                </div>

                <h3 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">
                  Suite Complète ALPHABETTE (5 Logiciels)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
                  Accès universel à l'ensemble du catalogue éthique de Valentin RICHAUD : LiDAR, solaire, proximité et actualités.
                </p>

                <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-500 shrink-0" />
                    <span><strong>5 Applications :</strong> Focus News, LIDARSOL, OSOLAR, PROXILIEN, L'ŒIL DE L'ATELIER 3D</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Moteur IA Hybride souverain local & cloud illimité</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Badge exclusif Membre Bienfaiteur ALPHABETTE</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Soutien direct à l'indépendance numérique en France</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActivatePlan("bundle_3eur");
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer text-center ${
                    currentSubscription.plan === "bundle_3eur"
                      ? "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20"
                  }`}
                >
                  {currentSubscription.plan === "bundle_3eur" ? "Formule Déjà Active" : "Choisir Bundle ALPHABETTE (3 €/mois)"}
                </button>
              </div>
            </div>

          </div>

          {/* Unified Catalogue Breakdown */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-500" />
              Catalogue Unifié ALPHABETTE inclus dans le Bundle (3 €)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {ALPHABETTE_SUITE_APPS.map((app) => (
                <div 
                  key={app.name}
                  className={`p-3 rounded-xl border ${cardBg} flex flex-col justify-between ${
                    app.isCurrent ? "border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{app.icon}</span>
                      {app.isCurrent && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                          Cette appli
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-xs mt-1.5 text-slate-900 dark:text-white truncate">
                      {app.name}
                    </h5>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-1">
                      {app.subtitle}
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-tight">
                      {app.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Success toast if activated */}
          {showSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 animate-bounce shadow-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pass ALPHABETTE activé avec succès ! Merci de votre soutien à l'indépendance numérique.</span>
            </div>
          )}

          {/* Subscription Cancellation / Reset if already active */}
          {currentSubscription.isSubscribed && (
            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-zinc-400">
                Abonnement en cours : <strong>{currentSubscription.plan === "bundle_3eur" ? "Bundle 3€/mois" : "Solo 1€/mois"}</strong>
              </span>
              <button
                onClick={handleCancelPass}
                className="text-red-500 hover:text-red-600 font-semibold hover:underline cursor-pointer"
              >
                Désactiver mon abonnement de test
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${borderCol} flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60`}>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
            Hébergement souverain OVH • Domaine alphabette.fr
          </div>

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
