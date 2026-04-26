import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, ThumbsUp, ThumbsDown, CheckCircle, XCircle, Circle } from 'lucide-react'

export default async function ProposalsPage() {
  const supabase = await createClient()

  const { data: proposals } = await supabase
    .from('music_proposals')
    .select('*, profiles(name), proposal_votes(vote)')
    .order('created_at', { ascending: false })

  const statusLabel: Record<string, string> = {
    open: 'En cours',
    accepted: 'Accepté',
    rejected: 'Refusé',
  }

  const statusStyle: Record<string, string> = {
    open: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'accepted') return <CheckCircle size={14} />
    if (status === 'rejected') return <XCircle size={14} />
    return <Circle size={14} />
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Propositions</h1>
          <p className="text-zinc-400 text-sm mt-1">Propose un morceau, vote pour ou contre</p>
        </div>
        <Link
          href="/proposals/new"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Proposer
        </Link>
      </div>

      {proposals && proposals.length > 0 ? (
        <ul className="space-y-3">
          {proposals.map((p: any) => {
            const yes = p.proposal_votes?.filter((v: any) => v.vote === 'yes').length ?? 0
            const no = p.proposal_votes?.filter((v: any) => v.vote === 'no').length ?? 0
            return (
              <li key={p.id}>
                <Link
                  href={`/proposals/${p.id}`}
                  className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{p.title}</div>
                      <div className="text-sm text-zinc-400">{p.artist}</div>
                      <div className="text-xs text-zinc-500 mt-1">
                        Proposé par {(p.profiles as any)?.name ?? 'inconnu'}
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg shrink-0 ${statusStyle[p.status]}`}>
                      <StatusIcon status={p.status} />
                      {statusLabel[p.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <ThumbsUp size={14} />
                      {yes}
                    </span>
                    <span className="flex items-center gap-1.5 text-red-400">
                      <ThumbsDown size={14} />
                      {no}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="text-center py-16 text-zinc-500">
          <ThumbsUp size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune proposition pour l&apos;instant.</p>
          <Link
            href="/proposals/new"
            className="inline-flex items-center gap-1 mt-4 text-amber-400 hover:text-amber-300 text-sm transition-colors"
          >
            <Plus size={14} /> Faire la première proposition
          </Link>
        </div>
      )}
    </div>
  )
}
