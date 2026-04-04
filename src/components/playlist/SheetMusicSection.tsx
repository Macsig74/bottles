'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, FileText, Trash2, Eye, Plus, X } from 'lucide-react'

type SheetMusicItem = {
  id: string
  instrument: string
  file_url: string
  file_name: string
  uploaded_by: string | null
  profiles: { name: string } | null
}

export function SheetMusicSection({
  songId,
  sheetMusicList,
  userId,
}: {
  songId: string
  sheetMusicList: SheetMusicItem[]
  userId: string
}) {
  const supabase = createClient()
  const router = useRouter()

  const [showUpload, setShowUpload] = useState(false)
  const [instrument, setInstrument] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [viewer, setViewer] = useState<SheetMusicItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Group by instrument
  const grouped: Record<string, SheetMusicItem[]> = {}
  for (const sm of sheetMusicList) {
    if (!grouped[sm.instrument]) grouped[sm.instrument] = []
    grouped[sm.instrument].push(sm)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !instrument.trim()) return
    setUploading(true)
    setError('')

    const ext = file.name.split('.').pop()
    const filePath = `${userId}/${songId}/${instrument.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('sheet-music')
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('sheet-music')
      .getPublicUrl(filePath)

    const { error: dbError } = await supabase.from('sheet_music').insert({
      song_id: songId,
      instrument: instrument.trim(),
      file_url: publicUrl,
      file_name: file.name,
      uploaded_by: userId,
    })

    if (dbError) {
      setError(dbError.message)
    } else {
      setShowUpload(false)
      setInstrument('')
      setFile(null)
      router.refresh()
    }
    setUploading(false)
  }

  async function handleDelete(item: SheetMusicItem) {
    setDeletingId(item.id)
    // Extract path from URL
    const url = new URL(item.file_url)
    const pathParts = url.pathname.split('/object/public/sheet-music/')
    if (pathParts[1]) {
      await supabase.storage.from('sheet-music').remove([pathParts[1]])
    }
    await supabase.from('sheet_music').delete().eq('id', item.id)
    setDeletingId(null)
    router.refresh()
  }

  const commonInstruments = ['Guitar', 'Bass', 'Drums', 'Piano', 'Vocals', 'Keys', 'Saxophone', 'Trumpet', 'Violin']

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Partitions</h2>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={14} />
          Ajouter une partition
        </button>
      </div>

      {showUpload && (
        <form
          onSubmit={handleUpload}
          className="bg-zinc-900 rounded-2xl p-5 border border-zinc-700 mb-5 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Instrument *</label>
            <input
              type="text"
              value={instrument}
              onChange={e => setInstrument(e.target.value)}
              placeholder="e.g. Guitar, Bass, Drums…"
              list="instruments"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <datalist id="instruments">
              {commonInstruments.map(i => <option key={i} value={i} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Fichier * (PDF ou image)</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              required
              className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-400 file:text-zinc-900 hover:file:bg-amber-300 file:cursor-pointer"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              <Upload size={14} />
              {uploading ? 'Envoi…' : 'Envoyer'}
            </button>
            <button
              type="button"
              onClick={() => { setShowUpload(false); setError('') }}
              className="text-sm text-zinc-400 hover:text-white px-4 py-2 rounded-xl transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(grouped).map(([inst, items]) => (
            <div key={inst} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-800/50">
                <span className="font-semibold text-white">{inst}</span>
              </div>
              <ul className="divide-y divide-zinc-800">
                {items.map(item => (
                  <li key={item.id} className="flex items-center justify-between px-5 py-3 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={16} className="text-amber-400 shrink-0" />
                      <span className="text-sm text-zinc-300 truncate">{item.file_name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setViewer(viewer?.id === item.id ? null : item)}
                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      >
                        <Eye size={13} />
                        Voir
                      </button>
                      {item.uploaded_by === userId && (
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-zinc-600 border border-dashed border-zinc-800 rounded-2xl">
          <p>Aucune partition pour l'instant.</p>
          <p className="text-sm mt-1">Cliquez sur "Ajouter une partition" pour en déposer une.</p>
        </div>
      )}

      {/* Inline viewer */}
      {viewer && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <div>
              <span className="font-semibold text-white">{viewer.file_name}</span>
              <span className="text-zinc-400 text-sm ml-2">— {viewer.instrument}</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={viewer.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-amber-400 hover:underline"
              >
                Ouvrir dans un onglet
              </a>
              <button
                onClick={() => setViewer(null)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {viewer.file_url.endsWith('.pdf') || viewer.file_name.endsWith('.pdf') ? (
              <iframe
                src={viewer.file_url}
                className="w-full h-full"
                title={viewer.file_name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={viewer.file_url}
                  alt={viewer.file_name}
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
