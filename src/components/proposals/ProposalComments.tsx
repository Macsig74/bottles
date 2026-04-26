'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, Send, Loader2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  profiles: { name: string } | null
}

interface Props {
  proposalId: string
  userId: string
  comments: Comment[]
}

export function ProposalComments({ proposalId, userId, comments: initialComments }: Props) {
  const supabase = createClient()

  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('proposal_comments')
      .select('*, profiles(name)')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: true })

    if (data) setComments(data as Comment[])
  }, [proposalId, supabase])

  useEffect(() => {
    const channel = supabase
      .channel(`comments-${proposalId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proposal_comments', filter: `proposal_id=eq.${proposalId}` },
        () => { fetchComments() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [proposalId, fetchComments, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)

    await supabase.from('proposal_comments').insert({
      proposal_id: proposalId,
      user_id: userId,
      content: content.trim(),
    })

    setContent('')
    setLoading(false)
    // realtime will update the list automatically
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId)
    await supabase.from('proposal_comments').delete().eq('id', commentId)
    setDeletingId(null)
    // realtime will update the list automatically
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <h2 className="flex items-center gap-2 font-semibold text-white mb-4">
        <MessageCircle size={16} />
        Discussion ({comments.length})
      </h2>

      <div className="space-y-3 mb-5">
        {comments.length === 0 && (
          <p className="text-zinc-600 text-sm">Pas encore de commentaires. Sois le premier !</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="group flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
              {((c.profiles as any)?.name ?? '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-zinc-200">
                  {(c.profiles as any)?.name ?? 'Inconnu'}
                </span>
                <span className="text-xs text-zinc-600">
                  {format(new Date(c.created_at), 'd MMM, HH:mm', { locale: fr })}
                </span>
              </div>
              <p className="text-sm text-zinc-300 mt-0.5 break-words">{c.content}</p>
            </div>
            {c.user_id === userId && (
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all disabled:opacity-50"
              >
                {deletingId === c.id
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Trash2 size={14} />
                }
              </button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center justify-center w-9 h-9 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 rounded-xl transition-colors"
        >
          {loading
            ? <Loader2 size={15} className="animate-spin text-black" />
            : <Send size={15} className="text-black" />
          }
        </button>
      </form>
    </div>
  )
}
