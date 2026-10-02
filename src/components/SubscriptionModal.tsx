import React, { useState } from "react";
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Key, 
  Layers, 
  Globe2, 
  ExternalLink, 
  CheckCircle2, 
  Clock
} from "lucide-react";
import { AlphabettePlan, AlphabetteSubscriptionState } from "../types";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "clair" | "sombre";
  currentSubscription?: AlphabetteSubscriptionState;
  subscriptionState?: AlphabetteSubscriptionState;
  onUpdateSubscription?: (newState: AlphabetteSubscriptionState) => void;
  onSelectPlan?: (plan: AlphabettePlan) => void;
  isTrialExpiredNotice?: boolean;
}

export const ALPHABETTE_SUITE_APPS = [
  {
    name: "Focus News (Infos Perso)",
    subtitle: "Actualités & Enquêtes",
    desc: "Actualité factuelle, grand format sur-mesure, analyse d'investigation sans publicité propulsée par Mistral AI.",
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
  },
  {
    name: "Nouveaux Logiciels Réguliers",
    subtitle: "Catalogue Évolutif",
    desc: "De nouvelles applications souveraines (métiers, citoyennes, IA) sont ajoutées en continu et incluses d'office.",
    icon: "✨",
    isCurrent: false,
    isUpcoming: true
  }
];

export default function SubscriptionModal({
  isOpen,
  onClose,
  theme,
  currentSubscription,
  subscriptionState,
  onUpdateSubscription,
  onSelectPlan,
  isTrialExpiredNotice = false
}: SubscriptionModalProps) {
  const activeSub: AlphabetteSubscriptionState = currentSubscription || subscriptionState || {
    isSubscribed: false,
    plan: "trial_7d",
    accessMode: "trial",
    features: []
  };

  const [selectedPlan, setSelectedPlan] = useState<AlphabettePlan>(
    activeSub.plan === "none" ? "bundle_integral_40" : activeSub.plan
  );
  const [showSuccessNotice, setShowSuccessNotice] = useState(false);
  const [successPlanName, setSuccessPlanName] = useState("");

  if (!isOpen) return null;

  const handleActivatePlan = (plan: AlphabettePlan) => {
    const isSubscribed = plan !== "none";
    let planLabel = "";
    let accessMode: "trial" | "byok" | "managed" = "managed";
    let features: string[] = [];

    switch (plan) {
      case "individual_byok_15":
      case "individual_byok_39":
        planLabel = "Formule BYOK (15 € / an)";
        accessMode = "byok";
        features = [
          "Accès illimité à Focus News",
          "Consommation sur votre propre clé Mistral AI",
          "Zéro publicité • Zéro pistage",
          "Hébergement souverain OVH France"
        ];
        break;
      case "individual_confort_15":
      case "individual_confort_59":
        planLabel = "Formule Confort (15 € / an)";
        accessMode = "managed";
        features = [
          "Accès illimité à Focus News",
          "Clé API Mistral AI gérée et incluse par Alphabette",
          "Consommation d'IA managée clé en main",
          "Zéro publicité • Zéro pistage",
          "Hébergement souverain OVH France"
        ];
        break;
      case "bundle_byok_40":
      case "bundle_byok_99":
        planLabel = "Pass Bouquet BYOK (40 € / an)";
        accessMode = "byok";
        features = [
          "Accès illimité à TOUTES les applications de la suite ALPHABETTE",
          "Inclusion automatique de tous les nouveaux logiciels sans surcoût",
          "Gestion unifiée avec votre propre clé API Mistral",
          "Synergie des données inter-applications",
          "Hébergement souverain OVH France"
        ];
        break;
      case "bundle_integral_40":
      case "bundle_integral_199":
      default:
        planLabel = "Pass Bouquet Intégral (40 € / an)";
        accessMode = "managed";
        features = [
          "Accès illimité à TOUTES les applications de la suite ALPHABETTE",
          "Inclusion automatique de tous les nouveaux logiciels sans surcoût",
          "Clés d'API Mistral gérées et incluses pour l'ensemble des outils",
          "Zéro compte développeur à créer chez Mistral",
          "Synergie complète des données inter-applications",
          "Support prioritaire par le fondateur Valentin RICHAUD"
        ];
        break;
    }

    const newState: AlphabetteSubscriptionState = {
      isSubscribed,
      plan,
      accessMode,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      features
    };

    localStorage.setItem("alphabette_sub_plan", plan);
    localStorage.setItem("alphabette_sub_date", newState.activatedAt || "");
    localStorage.setItem("alphabette_access_mode", accessMode);

    if (onUpdateSubscription) {
      onUpdateSubscription(newState);
    }
    if (onSelectPlan) {
      onSelectPlan(plan);
    }

    setSuccessPlanName(planLabel);
    setShowSuccessNotice(true);
    setTimeout(() => {
      setShowSuccessNotice(false);
      onClose();
    }, 1600);
  };

  const isLight = theme === "clair";
  const bgModal = isLight ? "bg-white text-slate-900" : "bg-zinc-950 text-zinc-100";
  const borderCol = isLight ? "border-slate-300" : "border-zinc-800";
  const cardBg = isLight ? "bg-white border-2 border-slate-300" : "bg-zinc-900 border-2 border-zinc-800";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border ${bgModal} ${borderCol} overflow-hidden`}>
        
        {/* En-tête officiel ALPHABETTE avec fort contraste */}
        <div className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b ${borderCol} ${
          isLight ? "bg-slate-100" : "bg-zinc-900"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
              α
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Grille Tarifaire Officielle ALPHABETTE
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                  Mistral AI Exclusif
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 mt-0.5">
                15 € / an pour l'application • 40 € / an pour le bouquet • Souveraineté européenne • 0 publicité
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition cursor-pointer shrink-0 ml-2"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps défilable avec typographie nette et lisible */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Bandeau d'information Période d'essai ou Alerte expiration */}
          {isTrialExpiredNotice ? (
            <div className="p-4 rounded-xl border-2 bg-amber-100 border-amber-400 dark:bg-amber-950/60 dark:border-amber-600/60 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 font-medium">
                <p className="font-extrabold text-sm sm:text-base text-amber-950 dark:text-amber-200">
                  Vos 7 jours d'essai offerts sont arrivés à échéance
                </p>
                <p className="mt-1">
                  Pour continuer à profiter de Focus News et de la puissance de Mistral AI, choisissez ci-dessous une formule individuelle (15 €/an) ou débloquez l'intégralité du <strong>Bouquet Alphabette</strong> (40 €/an).
                </p>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm ${
              isLight ? "bg-blue-50 border-blue-300 text-blue-950" : "bg-blue-950/50 border-blue-700 text-blue-100"
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md bg-blue-700 text-white font-mono text-xs font-black shrink-0">
                  7 JOURS OFFERTS
                </span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  Tout nouvel utilisateur bénéficie d'un accès complet alimenté par l'infrastructure Mistral Alphabette.
                </span>
              </div>
              <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 shrink-0">
                Sans engagement • Aucune carte bancaire requise
              </span>
            </div>
          )}

          {/* Section 1 : Application Individuelle */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                  1. Application Individuelle (Focus News) — 15 € / an
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Tarification annuelle</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Formule BYOK (15 € / an) */}
              <div 
                onClick={() => setSelectedPlan("individual_byok_15")}
                className={`p-5 rounded-2xl transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedPlan === "individual_byok_15" || selectedPlan === "individual_byok_39"
                    ? "border-2 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-600" 
                    : cardBg
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100">
                      Formule BYOK
                    </span>
                    <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">Clé client Mistral</h4>
                  <div className="my-2.5 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-blue-700 dark:text-blue-400">15 €</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300"> / an</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200 leading-relaxed mb-3">
                    Accès illimité aux fonctionnalités de Focus News. Vous renseignez et gérez votre propre clé API Mistral AI.
                  </p>
                  <ul className="text-xs sm:text-sm font-semibold space-y-2 text-slate-900 dark:text-zinc-100">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Accès complet et illimité à Focus News</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Consommation sur votre quota Mistral personnel</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Données souveraines hébergées en UE (OVH)</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleActivatePlan("individual_byok_15"); }}
                  className="mt-5 w-full py-2.5 rounded-xl font-black text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white transition shadow cursor-pointer"
                >
                  Choisir BYOK (15 €/an)
                </button>
              </div>

              {/* Formule Confort (15 € / an) */}
              <div 
                onClick={() => setSelectedPlan("individual_confort_15")}
                className={`p-5 rounded-2xl transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedPlan === "individual_confort_15" || selectedPlan === "individual_confort_59"
                    ? "border-2 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-600" 
                    : cardBg
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-black bg-blue-600 text-white">
                      Formule Confort
                    </span>
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">Clé Alphabette incluse</h4>
                  <div className="my-2.5 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-blue-700 dark:text-blue-400">15 €</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300"> / an</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200 leading-relaxed mb-3">
                    Accès complet clé en main : consommation d'IA Mistral managée par nos soins en continu.
                  </p>
                  <ul className="text-xs sm:text-sm font-semibold space-y-2 text-slate-900 dark:text-zinc-100">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Accès illimité à Focus News</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Clés Mistral AI fournies &amp; managées d'office</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Zéro compte développeur ni configuration technique</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleActivatePlan("individual_confort_15"); }}
                  className="mt-5 w-full py-2.5 rounded-xl font-black text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white transition shadow cursor-pointer"
                >
                  Choisir Confort (15 €/an)
                </button>
              </div>

            </div>
          </div>

          {/* BANDEAU DE CROSS-SELLING DU BOUQUET ALPHABETTE (40 € / AN) */}
          <div className={`p-5 sm:p-6 rounded-2xl border-2 relative overflow-hidden ${
            isLight 
              ? "bg-purple-50/90 border-purple-400 text-slate-900 shadow-md" 
              : "bg-gradient-to-br from-purple-950/60 via-zinc-900 to-indigo-950/60 border-purple-500 text-zinc-100 shadow-xl"
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></span>
                <span className="text-sm sm:text-base font-black uppercase tracking-wider text-purple-950 dark:text-purple-200">
                  Le Bouquet Alphabette Complet — 40 € / an
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-700 text-white shadow-sm">
                Toutes les Applications Incluses • Accès Illimité
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 leading-relaxed mb-5">
              Pourquoi vous limiter à une seule application pour 15 € ? Débloquez l'intégralité du catalogue ALPHABETTE actuel et de l'ensemble de ses futurs ajouts pour seulement 40 € / an :
            </p>

            {/* Grille Bouquet Alphabette avec fonds opaques à fort contraste */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Pass Bouquet BYOK (40 € / an) */}
              <div 
                onClick={() => setSelectedPlan("bundle_byok_40")}
                className={`p-5 rounded-2xl transition-all cursor-pointer relative flex flex-col justify-between ${
                  isLight 
                    ? "bg-white border-2 border-purple-400 text-slate-900 shadow-sm" 
                    : "bg-zinc-900 border-2 border-purple-500/70 text-zinc-100 shadow-md"
                } ${
                  selectedPlan === "bundle_byok_40" || selectedPlan === "bundle_byok_99"
                    ? "ring-2 ring-purple-600 border-purple-600" 
                    : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-700">
                      Bouquet BYOK
                    </span>
                    <Layers className="w-5 h-5 text-purple-700 dark:text-purple-400" />
                  </div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">Pass Bouquet BYOK</h4>
                  <div className="my-2.5 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-purple-700 dark:text-purple-300">40 €</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300"> / an</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200 leading-relaxed mb-3">
                    Accès illimité à l'intégralité de la suite logicielle Alphabette avec votre propre clé API Mistral.
                  </p>
                  <ul className="text-xs sm:text-sm font-semibold space-y-2 text-slate-900 dark:text-zinc-100">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Accès illimité à l'ensemble des logiciels de la suite</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Nouveaux logiciels inclus d'office au fil des sorties</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Synergie &amp; échange de données standardisées</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Votre clé Mistral partagée entre toutes les apps</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleActivatePlan("bundle_byok_40"); }}
                  className="mt-5 w-full py-2.5 rounded-xl font-black text-xs sm:text-sm bg-purple-700 hover:bg-purple-800 text-white transition shadow cursor-pointer"
                >
                  Activer Bouquet BYOK (40 €/an)
                </button>
              </div>

              {/* Pass Bouquet Intégral (40 € / an) */}
              <div 
                onClick={() => setSelectedPlan("bundle_integral_40")}
                className={`p-5 rounded-2xl transition-all cursor-pointer relative flex flex-col justify-between ${
                  isLight 
                    ? "bg-white border-2 border-emerald-500 text-slate-900 shadow-md" 
                    : "bg-zinc-900 border-2 border-emerald-500 text-zinc-100 shadow-lg"
                } ${
                  selectedPlan === "bundle_integral_40" || selectedPlan === "bundle_integral_199"
                    ? "ring-2 ring-emerald-600 border-emerald-600" 
                    : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-600 text-white">
                      ⭐ Formule Recommandée
                    </span>
                    <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">Pass Bouquet Intégral</h4>
                  <div className="my-2.5 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">40 €</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300"> / an</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200 leading-relaxed mb-3">
                    Accès illimité à toute la suite logicielle avec les clés d'API Mistral gérées et incluses par Alphabette.
                  </p>
                  <ul className="text-xs sm:text-sm font-semibold space-y-2 text-slate-900 dark:text-zinc-100">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Accès illimité à tout le catalogue actuel et ses futurs ajouts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Clés Mistral AI gérées et incluses pour tous les outils</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Zéro compte à créer ni maintenance requise</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                      <span>Support direct du fondateur Valentin RICHAUD</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleActivatePlan("bundle_integral_40"); }}
                  className="mt-5 w-full py-2.5 rounded-xl font-black text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition shadow cursor-pointer"
                >
                  Activer Bouquet Intégral (40 €/an)
                </button>
              </div>

            </div>
          </div>

          {/* Aperçu des applications de la suite Alphabette */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                Écosystème ALPHABETTE : applications interconnectées
              </h4>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                Catalogue en expansion continue
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-3">
              Chaque logiciel résout un besoin spécifique et communique avec les autres via des formats de données ouverts et souverains.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ALPHABETTE_SUITE_APPS.map((app) => (
                <div 
                  key={app.name}
                  className={`p-3.5 rounded-xl border-2 text-xs flex items-start gap-3 shadow-sm ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-zinc-900 border-zinc-800 text-zinc-100"
                  } ${
                    app.isCurrent ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{app.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-sm text-slate-900 dark:text-white truncate">
                        {app.name}
                      </span>
                      {app.isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white">
                          Active
                        </span>
                      )}
                      {app.isUpcoming && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-700 text-white">
                          En continu
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                      {app.subtitle}
                    </p>
                    <p className="text-xs font-medium text-slate-700 dark:text-zinc-300 mt-1 leading-snug">
                      {app.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Garanties souveraineté & RGPD avec texte contrasté */}
          <div className={`p-4 rounded-xl border-2 space-y-2 text-xs sm:text-sm ${
            isLight 
              ? "bg-emerald-50 border-emerald-300 text-emerald-950" 
              : "bg-emerald-950/40 border-emerald-600/50 text-emerald-100"
          }`}>
            <div className="flex items-center gap-2 font-black text-sm sm:text-base text-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Engagement RGPD &amp; Souveraineté Européenne Totale</span>
            </div>
            <p className="font-medium text-slate-800 dark:text-zinc-200 leading-relaxed">
              Toutes les applications de la suite Alphabette reposent exclusivement sur <strong>Mistral AI</strong> (entreprise française) et un hébergement <strong>OVH Cloud en France</strong>. Vos données professionnelles et requêtes ne quittent jamais le cadre juridique de l'Union européenne et ne sont jamais utilisées pour entraîner des modèles publics.
            </p>
          </div>

        </div>

        {/* PIED DE PAGE OBLIGATOIRE AVEC LIEN VERS LE HUB CENTRAL (HAUT CONTRASTE) */}
        <div className={`p-4 sm:px-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${borderCol} ${
          isLight ? "bg-slate-100" : "bg-zinc-900"
        }`}>
          <div className="flex items-center gap-2.5">
            <Globe2 className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0" />
            <a
              href="http://alphabette.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-black text-xs sm:text-sm text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Découvrir toutes les applications de la suite sur http://alphabette.fr</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer text-slate-900 bg-white hover:bg-slate-200 border-slate-300 dark:text-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 shadow-sm"
          >
            Fermer
          </button>
        </div>

        {/* Notice de succès */}
        {showSuccessNotice && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="p-6 rounded-2xl bg-emerald-600 text-white text-center shadow-2xl animate-fade-in max-w-sm">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-black text-lg">Abonnement Validé !</h3>
              <p className="text-sm font-medium opacity-95 mt-1">{successPlanName} activé avec succès.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
