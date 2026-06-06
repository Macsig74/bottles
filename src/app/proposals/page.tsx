import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Plus, ThumbsUp } from 'lucide-react'
import { ProposalCard } from '@/components/proposals/ProposalCard'

export default async function ProposalsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: proposals } = await supabase
    .from('music_proposals')
    .select('*, profiles(name), proposal_votes(vote, user_id)')
    .order('created_at', { ascending: false })

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
          {proposals.map((p: any) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              userId={user.id}
            />
          ))}
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
