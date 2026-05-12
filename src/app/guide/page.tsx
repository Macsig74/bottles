import Link from 'next/link'
import {
  ArrowLeft,
  CalendarDays,
  ListMusic,
  ThumbsUp,
  FolderOpen,
  Wallet,
  CheckCircle2,
  XCircle,
  Pin,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  Music2,
} from 'lucide-react'

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-amber-300 text-sm">
      💡 {children}
    </div>
  )
}

function Step({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="shrink-0 w-6 h-6 rounded-full bg-amber-400 text-zinc-900 text-xs font-bold flex items-center justify-center mt-0.5">
        {label}
      </span>
      <span>{children}</span>
    </div>
  )
}

function Tag({ children, color = 'zinc' }: { children: React.ReactNode; color?: string }) {
  const styles: Record<string, string> = {
    zinc: 'bg-zinc-800 text-zinc-300',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    red: 'bg-red-500/20 text-red-400',
    amber: 'bg-amber-500/20 text-amber-400',
    blue: 'bg-blue-500/20 text-blue-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${styles[color]}`}>
      {children}
    </span>
  )
}

export default function GuidePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Comment utiliser le site</h1>
        <p className="text-zinc-400 mt-2">
          Tout ce qu'il faut savoir pour gérer les répétitions, la playlist, les propositions et la trésorerie des Bottles.
        </p>
      </div>

      <div className="space-y-5">

        {/* Accueil */}
        <Section icon={Music2} title="Page d'accueil">
          <p>
            La page d'accueil donne un aperçu rapide de l'activité du groupe :
          </p>
          <ul className="space-y-1.5 list-none pl-0">
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Les <strong className="text-white">prochains concerts</strong> avec le nombre de jours restants</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Les <strong className="text-white">prochaines répétitions proposées</strong> avec les votes</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Les <strong className="text-white">derniers morceaux</strong> ajoutés à la playlist</li>
          </ul>
          <p>Clique sur n'importe quel élément pour accéder à la section correspondante.</p>
        </Section>

        {/* Répétitions */}
        <Section icon={CalendarDays} title="Répétitions">
          <p>
            La section répétitions permet de proposer des dates et de voter pour savoir qui peut venir.
          </p>

          <div className="space-y-2">
            <p className="font-semibold text-white">Proposer une date</p>
            <Step label="1">Clique sur <Tag>+ Proposer une date</Tag> en haut à droite.</Step>
            <Step label="2">Renseigne la date, l'heure et éventuellement des notes, puis valide.</Step>
            <Step label="3">La répétition apparaît dans la liste avec le statut <Tag color="amber">en attente</Tag>.</Step>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-white">Voter</p>
            <p>
              Sur chaque carte, utilise les boutons{' '}
              <span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 size={13} /> Oui</span>{' '}
              et{' '}
              <span className="inline-flex items-center gap-1 text-red-400"><XCircle size={13} /> Non</span>{' '}
              pour indiquer ta disponibilité. Reclique pour annuler ton vote.
            </p>
            <p>Les avatars colorés montrent en un coup d'œil qui est présent (vert) ou absent (rouge).</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-white">Modifier ou supprimer</p>
            <p>
              Si tu as proposé la date (ou si tu es admin), les icônes{' '}
              <span className="inline-flex items-center gap-1"><Pencil size={13} className="text-amber-400" /> modifier</span>{' '}
              et{' '}
              <span className="inline-flex items-center gap-1"><Trash2 size={13} className="text-red-400" /> supprimer</span>{' '}
              apparaissent en bas de la carte.
            </p>
          </div>

          <Tip>
            Les admins peuvent <span className="inline-flex items-center gap-1"><Pin size={12} /> confirmer</span> une date officielle — elle apparaît alors en vert avec le bandeau "Prochaine répétition officielle".
          </Tip>
        </Section>

        {/* Playlist */}
        <Section icon={ListMusic} title="Playlist">
          <p>
            La playlist liste tous les morceaux que le groupe joue ou apprend, dans l'ordre choisi.
          </p>

          <div className="space-y-2">
            <p className="font-semibold text-white">Ajouter un morceau</p>
            <Step label="1">Clique sur <Tag>+ Ajouter</Tag>.</Step>
            <Step label="2">Remplis le titre, l'artiste et éventuellement des notes.</Step>
            <Step label="3">Tu peux ensuite ouvrir la fiche du morceau pour y uploader des partitions par instrument.</Step>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-white">Réordonner</p>
            <p>
              Glisse-dépose les morceaux via la poignée{' '}
              <GripVertical size={14} className="inline text-zinc-400" />{' '}
              à gauche de chaque ligne pour changer l'ordre.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-white">Modifier ou supprimer</p>
            <p>
              Les icônes <Pencil size={13} className="inline text-amber-400" /> et <Trash2 size={13} className="inline text-red-400" /> sont visibles à droite de chaque morceau.
              La suppression demande confirmation avant d'agir.
            </p>
          </div>
        </Section>

        {/* Propositions */}
        <Section icon={ThumbsUp} title="Propositions de morceaux">
          <p>
            Tu veux qu'on apprenne un nouveau morceau ? Propose-le ici et laisse le groupe voter.
          </p>

          <div className="space-y-2">
            <p className="font-semibold text-white">Faire une proposition</p>
            <Step label="1">Clique sur <Tag>+ Proposer</Tag>.</Step>
            <Step label="2">Indique le titre, l'artiste, un lien YouTube (optionnel) et des notes.</Step>
            <Step label="3">La proposition est visible par tout le groupe avec le statut <Tag color="amber">En cours</Tag>.</Step>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-white">Voter et commenter</p>
            <p>
              Ouvre une proposition pour voter{' '}
              <Tag color="emerald">👍 Pour</Tag> ou <Tag color="red">👎 Contre</Tag>,
              et laisser un commentaire.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-white">Modifier ou supprimer ta proposition</p>
            <p>
              Ouvre ta proposition et utilise les boutons <Tag>Modifier</Tag> / <Tag>Supprimer</Tag> qui apparaissent en bas de la fiche si tu en es l'auteur (ou si tu es admin).
            </p>
          </div>

          <Tip>
            Les admins peuvent changer le statut d'une proposition en <Tag color="emerald">Accepté</Tag> ou <Tag color="red">Refusé</Tag> depuis la fiche détail.
          </Tip>
        </Section>

        {/* Bibliothèque */}
        <Section icon={FolderOpen} title="Bibliothèque">
          <p>
            La bibliothèque est un espace de stockage partagé pour tous les fichiers du groupe : partitions, photos, documents administratifs, etc.
          </p>
          <ul className="space-y-1.5">
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Crée des <strong className="text-white">dossiers</strong> pour organiser les fichiers par catégorie.</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Navigue dans les dossiers en cliquant dessus.</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Clique sur un fichier pour le télécharger ou le visualiser.</li>
          </ul>
        </Section>

        {/* Trésorerie */}
        <Section icon={Wallet} title="Trésorerie">
          <p>
            La trésorerie permet de suivre les finances du groupe : recettes, dépenses et solde courant.
          </p>

          <div className="space-y-2">
            <p className="font-semibold text-white">Les trois types de transactions</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <TrendingUp size={15} className="text-emerald-400 shrink-0" />
                <span><strong className="text-white">Entrée</strong> — une recette (cotisations, cachet, etc.)</span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingDown size={15} className="text-red-400 shrink-0" />
                <span><strong className="text-white">Dépense</strong> — un achat ou une charge</span>
              </li>
              <li className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-blue-400 shrink-0" />
                <span><strong className="text-white">Solde actuel</strong> — pour définir le solde de départ ou corriger une valeur</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-white">Ajouter une transaction</p>
            <Step label="1">Clique sur le bouton correspondant au type (Entrée, Dépense ou Solde actuel).</Step>
            <Step label="2">Saisis le montant et une description, puis clique sur <Tag>Enregistrer</Tag>.</Step>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-white">Modifier, supprimer, réordonner</p>
            <p>
              Chaque ligne dispose des icônes <Pencil size={13} className="inline text-amber-400" /> et <Trash2 size={13} className="inline text-red-400" />.
              Tu peux aussi glisser-déposer via la poignée <GripVertical size={14} className="inline text-zinc-400" /> pour réordonner l'historique.
            </p>
          </div>

          <Tip>
            Le solde en haut se met à jour en temps réel dès qu'une transaction est ajoutée ou modifiée par n'importe quel membre.
          </Tip>
        </Section>

        {/* Admins */}
        <section className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold text-white">Droits des admins</h2>
          <p className="text-sm text-zinc-300">
            Certaines actions sont réservées aux membres ayant le rôle <Tag color="amber">admin</Tag> :
          </p>
          <ul className="text-sm text-zinc-300 space-y-1.5">
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Confirmer ou retirer une répétition officielle</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Modifier ou supprimer n'importe quelle répétition</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Accepter ou refuser une proposition de morceau</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Modifier ou supprimer n'importe quelle proposition</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Supprimer n'importe quelle transaction de trésorerie</li>
          </ul>
        </section>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            C'est parti !
          </Link>
        </div>

      </div>
    </div>
  )
}
