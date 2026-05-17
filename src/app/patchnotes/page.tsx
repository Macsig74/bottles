import Link from "next/link";
import { ArrowLeft, Zap, Wrench, Sparkles } from "lucide-react";

type EntryType = "new" | "fix" | "improve";

interface Entry {
  type: EntryType;
  text: string;
}

interface Version {
  version: string;
  date: string;
  entries: Entry[];
}

const VERSIONS: Version[] = [
  {
    version: "1.7",
    date: "17 mai 2026",
    entries: [
      {
        type: "new",
        text: "Concerts : créer des concerts avec date, lieu et notes",
      },
      {
        type: "new",
        text: "Concerts : setlist par concert — ajouter des morceaux depuis la playlist",
      },
      {
        type: "new",
        text: "Concerts : drag-and-drop pour réordonner la setlist",
      },
      {
        type: "new",
        text: "Concerts : accès aux partitions directement depuis la setlist",
      },
      {
        type: "improve",
        text: "Bandeau concert dynamique — pointe vers la page du prochain concert",
      },
      {
        type: "new",
        text: "Icônes d'instrument dans les avatars (guitare acoustique, électrique, basse, batterie…)",
      },
    ],
  },
  {
    version: "1.6",
    date: "12 mai 2026",
    entries: [{ type: "fix", text: "date du concert du 20 juin" }],
  },
  {
    version: "1.5",
    date: "12 mai 2026",
    entries: [
      {
        type: "new",
        text: 'Page "Comment utiliser le site" accessible depuis l\'accueil',
      },
      {
        type: "fix",
        text: "Correction de l'affichage des heures de répétition (décalage UTC corrigé)",
      },
    ],
  },
  {
    version: "1.4",
    date: "12 mai 2026",
    entries: [
      {
        type: "new",
        text: "Répétitions : boutons modifier et supprimer pour le proposant ou un admin",
      },
      {
        type: "new",
        text: "Propositions : modifier et supprimer sa propre proposition (ou admin)",
      },
      {
        type: "new",
        text: "Trésorerie : drag-and-drop pour réordonner les transactions",
      },
      {
        type: "new",
        text: 'Accueil : section "Prochains concerts" avec toutes les dates à venir',
      },
      {
        type: "fix",
        text: "Trésorerie : l'édition des transactions fonctionnait pas (policy Supabase manquante)",
      },
      {
        type: "fix",
        text: "Trésorerie : la suppression étendue au créateur de la transaction",
      },
    ],
  },
  {
    version: "1.3",
    date: "mai 2026",
    entries: [
      {
        type: "new",
        text: 'Bandeau "Prochain concert" en haut du site avec compte à rebours',
      },
    ],
  },
  {
    version: "1.2",
    date: "mai 2026",
    entries: [
      { type: "fix", text: "Répétitions passées masquées automatiquement" },
      { type: "fix", text: "Correction de l'affichage des dates" },
      {
        type: "improve",
        text: "Optimisation responsive mobile sur toutes les pages",
      },
      {
        type: "fix",
        text: "Icônes modifier/supprimer toujours visibles dans la trésorerie",
      },
    ],
  },
  {
    version: "1.1",
    date: "mai 2026",
    entries: [
      {
        type: "new",
        text: "Trésorerie : édition et suppression des transactions pour tous les membres",
      },
      {
        type: "new",
        text: "Playlist : drag-and-drop pour réordonner les morceaux",
      },
      { type: "new", text: "Playlist : édition et suppression des morceaux" },
    ],
  },
  {
    version: "1.0",
    date: "mai 2026",
    entries: [
      {
        type: "new",
        text: "Trésorerie : suivi des entrées, dépenses et ajustement du solde",
      },
      {
        type: "new",
        text: "Propositions : soumettre un morceau, voter pour/contre et commenter",
      },
      {
        type: "new",
        text: "Propositions : mises à jour en temps réel des votes et commentaires",
      },
      {
        type: "new",
        text: "Bibliothèque : stockage de fichiers partagés avec navigation par dossiers",
      },
      {
        type: "new",
        text: "Répétitions : proposer des dates et voter pour sa disponibilité",
      },
      {
        type: "new",
        text: "Playlist : liste des morceaux avec partitions par instrument",
      },
      { type: "new", text: "Lancement du site des Bottles 🎸" },
    ],
  },
];

const typeConfig: Record<
  EntryType,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  new: {
    label: "Nouveau",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: Sparkles,
  },
  improve: {
    label: "Amélioration",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    icon: Zap,
  },
  fix: {
    label: "Correction",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: Wrench,
  },
};

export default function PatchNotesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Notes de mise à jour</h1>
        <p className="text-zinc-400 mt-2">
          Historique de toutes les nouveautés et corrections du site.
        </p>
      </div>

      <div className="space-y-6">
        {VERSIONS.map((v, i) => (
          <div key={v.version} className="relative">
            {/* Timeline line */}
            {i < VERSIONS.length - 1 && (
              <div className="absolute left-[11px] top-10 bottom-[-24px] w-px bg-zinc-800" />
            )}

            <div className="flex items-start gap-4">
              {/* Dot */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 z-10 ${
                  i === 0
                    ? "bg-amber-400 border-amber-400"
                    : "bg-zinc-900 border-zinc-600"
                }`}
              >
                {i === 0 && (
                  <div className="w-2 h-2 rounded-full bg-zinc-900" />
                )}
              </div>

              <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">
                      v{v.version}
                    </span>
                    {i === 0 && (
                      <span className="text-xs bg-amber-400 text-zinc-900 font-semibold px-2 py-0.5 rounded-full">
                        Actuel
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">{v.date}</span>
                </div>

                <ul className="space-y-2.5">
                  {v.entries.map((entry, j) => {
                    const cfg = typeConfig[entry.type];
                    const Icon = cfg.icon;
                    return (
                      <li key={j} className="flex items-start gap-2.5">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg border shrink-0 mt-0.5 ${cfg.bg} ${cfg.color}`}
                        >
                          <Icon size={10} />
                          {cfg.label}
                        </span>
                        <span className="text-sm text-zinc-300">
                          {entry.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
