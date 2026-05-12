'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { User, CheckCircle2, XCircle, Clock, Pin, Pencil, Trash2, Loader2, X, Check } from 'lucide-react'

type Vote = { user_id: string; can_attend: boolean; profiles: { name: string } | null }
type Session = {
  id: string
  proposed_date: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  proposed_by: string | null
  profiles: { name: string } | null
  session_votes: Vote[]
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'en attente',
  confirmed: 'confirmée',
  cancelled: 'annulée',
}

export function SessionCard({
  session,
  userId,
  isAdmin,
}: {
  session: Session
  userId: string
  isAdmin: boolean
}) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [dateDisplay, setDateDisplay] = useState<{ label: string; time: string } | null>(null)

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const d = new Date(session.proposed_date)
    setDateDisplay({
      label: format(d, 'EEEE d MMMM', { locale: fr }),
      time: format(d, 'HH:mm'),
    })
  }, [session.proposed_date])

  const myVote = session.session_votes?.find(v => v.user_id === userId)
  const isPast = new Date(session.proposed_date) < new Date()
  const iCantGo = myVote?.can_attend === false
  const isConfirmed = session.status === 'confirmed'
  const canEditDelete = isAdmin || session.proposed_by === userId

  function openEdit() {
    const d = new Date(session.proposed_date)
    setEditDate(format(d, 'yyyy-MM-dd'))
    setEditTime(format(d, 'HH:mm'))
    setEditNotes(session.notes ?? '')
    setEditError('')
    setIsEditing(true)
  }

  async function handleSaveEdit() {
    if (!editDate || !editTime) { setEditError('Date et heure obligatoires.'); return }
    const newDate = new Date(`${editDate}T${editTime}:00`)
    if (isNaN(newDate.getTime())) { setEditError('Date invalide.'); return }
    setEditLoading(true)
    setEditError('')
    const { error } = await supabase
      .from('rehearsal_sessions')
      .update({ proposed_date: newDate.toISOString(), notes: editNotes.trim() || null })
      .eq('id', session.id)
    setEditLoading(false)
    if (error) { setEditError(error.message); return }
    setIsEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    setDeleteLoading(true)
    await supabase.from('rehearsal_sessions').delete().eq('id', session.id)
    router.refresh()
  }

  async function vote(canAttend: boolean) {
    setLoading(true)
    if (myVote !== undefined) {
      if (myVote.can_attend === canAttend) {
        await supabase.from('session_votes').delete()
          .eq('session_id', session.id).eq('user_id', userId)
      } else {
        await supabase.from('session_votes').update({ can_attend: canAttend })
          .eq('session_id', session.id).eq('user_id', userId)
      }
    } else {
      await supabase.from('session_votes').insert({
        session_id: session.id, user_id: userId, can_attend: canAttend,
      })
    }
    router.refresh()
    setLoading(false)
  }

  async function toggleConfirm() {
    setConfirming(true)
    const newStatus = session.status === 'confirmed' ? 'pending' : 'confirmed'
    await supabase.from('rehearsal_sessions').update({ status: newStatus }).eq('id', session.id)
    router.refresh()
    setConfirming(false)
  }

  // Edit modal
  if (isEditing) {
    return (
      <div className="rounded-2xl p-5 border bg-zinc-900 border-amber-500/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Modifier la répétition</h3>
          <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-zinc-400 mb-1">Date</label>
              <input
                type="date"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="w-28">
              <label className="block text-xs text-zinc-400 mb-1">Heure</label>
              <input
                type="time"
                value={editTime}
                onChange={e => setEditTime(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Notes</label>
            <input
              type="text"
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              placeholder="Notes (optionnel)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          {editError && <p className="text-red-400 text-xs">{editError}</p>}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={editLoading}
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-zinc-900 text-sm font-semibold py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {editLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Delete confirm
  if (confirmDelete) {
    return (
      <div className="rounded-2xl p-5 border bg-zinc-900 border-red-500/40">
        <p className="text-sm text-white mb-1 font-semibold">Supprimer cette répétition ?</p>
        <p className="text-xs text-zinc-400 mb-4">
          {dateDisplay?.label} à {dateDisplay?.time} — cette action est irréversible.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmDelete(false)}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="flex-1 bg-red-500 hover:bg-red-400 text-white text-sm font-semibold py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Supprimer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl p-5 border transition-all ${
      isConfirmed
        ? 'bg-emerald-950/40 border-emerald-700'
        : isPast
        ? 'bg-zinc-900 border-zinc-800 opacity-50'
        : iCantGo
        ? 'bg-zinc-900 border-zinc-800 opacity-60'
        : 'bg-zinc-900 border-zinc-700'
    }`}>
      {isConfirmed && (
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-3">
          <Pin size={12} />
          Prochaine répétition officielle
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left: date + meta */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-lg font-bold capitalize ${iCantGo ? 'line-through text-zinc-500' : 'text-white'}`}>
              {dateDisplay?.label ?? '…'}
            </span>
            {!isConfirmed && (
              <span className="text-xs text-zinc-500">{STATUS_LABELS[session.status]}</span>
            )}
          </div>
          <div className={`font-semibold ${iCantGo ? 'text-zinc-600 line-through' : 'text-amber-400'}`}>
            {dateDisplay?.time ?? '…'}
          </div>
          {session.profiles && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1.5">
              <User size={11} />
              Proposé par {session.profiles.name}
            </div>
          )}
          {session.notes && (
            <p className="mt-2 text-sm text-zinc-400 italic">{session.notes}</p>
          )}
        </div>

        {/* Right: avatars + buttons */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Voter avatars */}
          {session.session_votes?.length > 0 && (
            <div className="flex -space-x-1.5">
              {session.session_votes.map(vote => {
                const name = vote.profiles?.name ?? '?'
                const initial = name.charAt(0).toUpperCase()
                return (
                  <div
                    key={vote.user_id}
                    title={`${name} : ${vote.can_attend ? 'présent' : 'absent'}`}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-zinc-900 select-none ${
                      vote.can_attend
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {initial}
                  </div>
                )
              })}
            </div>
          )}

          {/* Vote buttons */}
          {!isPast && (
            <div className="flex gap-2">
              <button
                onClick={() => vote(true)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  myVote?.can_attend === true
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-emerald-900 hover:text-emerald-300'
                }`}
              >
                <CheckCircle2 size={14} />
                Oui
              </button>
              <button
                onClick={() => vote(false)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  myVote?.can_attend === false
                    ? 'bg-red-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-red-900 hover:text-red-300'
                }`}
              >
                <XCircle size={14} />
                Non
              </button>
            </div>
          )}

          {isPast && (
            <div className="flex items-center gap-1 text-xs text-zinc-600">
              <Clock size={12} /> Passé
            </div>
          )}

          {/* Admin confirm button */}
          {isAdmin && !isPast && (
            <button
              onClick={toggleConfirm}
              disabled={confirming}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                isConfirmed
                  ? 'bg-emerald-700 text-emerald-100 hover:bg-zinc-800 hover:text-zinc-300'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-emerald-900 hover:text-emerald-300'
              }`}
            >
              <Pin size={12} />
              {isConfirmed ? 'Retirer' : 'Confirmer'}
            </button>
          )}

          {/* Edit / Delete */}
          {canEditDelete && (
            <div className="flex items-center gap-1">
              <button
                onClick={openEdit}
                className="p-1.5 text-zinc-600 hover:text-amber-400 transition-colors rounded-lg"
                title="Modifier"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors rounded-lg"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
