import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { ProposalVoteSection } from '@/components/proposals/ProposalVoteSection'
import { ProposalComments } from '@/components/proposals/ProposalComments'
import { ProposalStatusControl } from '@/components/proposals/ProposalStatusControl'
import { ProposalEditDelete } from '@/components/proposals/ProposalEditDelete'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const { data: proposal } = await supabase
    .from('music_proposals')
    .select('*, profiles(name)')
    .eq('id', id)
    .single()

  if (!proposal) notFound()

  const { data: votes } = await supabase
    .from('proposal_votes')
    .select('*, profiles(name)')
    .eq('proposal_id', id)
    .order('created_at', { ascending: true })

  const { data: comments } = await supabase
    .from('proposal_comments')
    .select('*, profiles(name)')
    .eq('proposal_id', id)
    .order('created_at', { ascending: true })

  const myVote = votes?.find(v => v.user_id === user.id) ?? null
  const yesVotes = votes?.filter(v => v.vote === 'yes') ?? []
  const noVotes = votes?.filter(v => v.vote === 'no') ?? []

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <Link
        href="/proposals"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour aux propositions
      </Link>

      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{proposal.title}</h1>
            <div className="text-zinc-400 mt-0.5">{proposal.artist}</div>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-lg shrink-0 ${statusStyle[proposal.status]}`}>
            {statusLabel[proposal.status]}
          </span>
        </div>

        <div className="text-xs text-zinc-500">
          Proposé par{' '}
          <span className="text-zinc-400">{(proposal.profiles as any)?.name ?? 'inconnu'}</span>
          {' · '}
          {format(new Date(proposal.created_at), 'd MMM yyyy', { locale: fr })}
        </div>

        {proposal.notes && (
          <p className="mt-3 text-sm text-zinc-300 bg-zinc-800 rounded-xl px-4 py-3">
            {proposal.notes}
          </p>
        )}

        {proposal.youtube_url && (
          <a
            href={proposal.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ExternalLink size={14} /> Écouter sur YouTube
          </a>
        )}

        {profile?.is_admin && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <ProposalStatusControl
              proposalId={id}
              currentStatus={proposal.status}
            />
          </div>
        )}

        <ProposalEditDelete
          proposalId={id}
          proposedBy={proposal.proposed_by}
          userId={user.id}
          isAdmin={profile?.is_admin ?? false}
          currentTitle={proposal.title}
          currentArtist={proposal.artist}
          currentNotes={proposal.notes}
          currentYoutubeUrl={proposal.youtube_url}
        />
      </div>

      {/* Voting */}
      <ProposalVoteSection
        proposalId={id}
        userId={user.id}
        myVote={myVote}
        yesVotes={yesVotes}
        noVotes={noVotes}
        proposalStatus={proposal.status}
      />

      {/* Comments */}
      <ProposalComments
        proposalId={id}
        userId={user.id}
        comments={comments ?? []}
      />
    </div>
  )
}
