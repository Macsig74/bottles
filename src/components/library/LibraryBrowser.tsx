'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  FolderPlus, Upload, Folder, Loader2, Trash2,
  FileVideo, FileText, FileImage, File, X, ChevronRight, Home, Search
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface FolderRow {
  id: string
  name: string
  created_by: string
  created_at: string
  profiles: { name: string } | null
}

interface FileRow {
  id: string
  name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_by: string
  created_at: string
  profiles: { name: string } | null
}

interface Crumb {
  id: string
  name: string
}

interface Props {
  userId: string
  isAdmin: boolean
  initialFolders: FolderRow[]
  initialFiles: FileRow[]
  currentFolderId: string | null
  breadcrumb: Crumb[]
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('video/')) return <FileVideo size={18} className="text-purple-400" />
  if (type.startsWith('image/')) return <FileImage size={18} className="text-blue-400" />
  if (type === 'application/pdf') return <FileText size={18} className="text-red-400" />
  return <File size={18} className="text-zinc-400" />
}

export function LibraryBrowser({ userId, isAdmin, initialFolders, initialFiles, currentFolderId, breadcrumb }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [folders, setFolders] = useState<FolderRow[]>(initialFolders)
  const [files, setFiles] = useState<FileRow[]>(initialFiles)

  const [newFolderName, setNewFolderName] = useState('')
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [creatingFolder, setCreatingFolder] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<FileRow | null>(null)
  const [query, setQuery] = useState('')

  const filteredFolders = query.trim()
    ? folders.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    : folders
  const filteredFiles = query.trim()
    ? files.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    : files

  async function createFolder() {
    if (!newFolderName.trim()) return
    setCreatingFolder(true)

    const { data, error } = await supabase
      .from('library_folders')
      .insert({
        name: newFolderName.trim(),
        parent_id: currentFolderId,
        created_by: userId,
      })
      .select('*, profiles(name)')
      .single()

    setCreatingFolder(false)
    if (error || !data) return
    setFolders(prev => [...prev, data as FolderRow].sort((a, b) => a.name.localeCompare(b.name)))
    setNewFolderName('')
    setShowFolderInput(false)
  }

  async function deleteFolder(folderId: string) {
    setDeletingId(folderId)
    await supabase.from('library_folders').delete().eq('id', folderId)
    setFolders(prev => prev.filter(f => f.id !== folderId))
    setDeletingId(null)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files
    if (!selected || selected.length === 0) return

    setUploading(true)
    const newFiles: FileRow[] = []

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i]
      setUploadProgress(`Upload ${i + 1}/${selected.length} : ${file.name}`)

      const ext = file.name.split('.').pop()
      const path = `library/${userId}/${Date.now()}-${i}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('library')
        .upload(path, file, { upsert: false })

      if (uploadError) continue

      const { data: { publicUrl } } = supabase.storage
        .from('library')
        .getPublicUrl(path)

      const { data: fileRow } = await supabase
        .from('library_files')
        .insert({
          name: file.name,
          folder_id: currentFolderId,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: userId,
        })
        .select('*, profiles(name)')
        .single()

      if (fileRow) newFiles.push(fileRow as FileRow)
    }

    setFiles(prev => [...newFiles, ...prev])
    setUploading(false)
    setUploadProgress('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function deleteFile(file: FileRow) {
    setDeletingId(file.id)
    // Extract storage path from URL
    const url = new URL(file.file_url)
    const pathMatch = url.pathname.match(/\/object\/public\/library\/(.+)/)
    if (pathMatch) {
      await supabase.storage.from('library').remove([pathMatch[1]])
    }
    await supabase.from('library_files').delete().eq('id', file.id)
    setFiles(prev => prev.filter(f => f.id !== file.id))
    setDeletingId(null)
  }

  const canDelete = (ownerId: string) => isAdmin || ownerId === userId

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm mb-5 flex-wrap">
        <Link href="/library" className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors">
          <Home size={14} /> Bibliothèque
        </Link>
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.id} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-zinc-600" />
            {i < breadcrumb.length - 1 ? (
              <Link href={`/library/folder/${crumb.id}`} className="text-zinc-400 hover:text-white transition-colors">
                {crumb.name}
              </Link>
            ) : (
              <span className="text-white font-medium">{crumb.name}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setShowFolderInput(v => !v)}
          className="flex items-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-xl transition-colors"
        >
          <FolderPlus size={15} />
          <span className="hidden sm:inline">Nouveau </span>Dossier
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 text-sm bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold px-3 py-2 rounded-xl transition-colors"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {uploading ? uploadProgress || 'Upload...' : <><span className="hidden sm:inline">Ajouter un </span>Fichier</>}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher un fichier ou dossier…"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* New folder input */}
      {showFolderInput && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createFolder()}
            placeholder="Nom du dossier"
            autoFocus
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            onClick={createFolder}
            disabled={creatingFolder || !newFolderName.trim()}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm px-3 py-2 rounded-xl transition-colors"
          >
            {creatingFolder ? <Loader2 size={14} className="animate-spin" /> : 'Créer'}
          </button>
          <button
            onClick={() => { setShowFolderInput(false); setNewFolderName('') }}
            className="text-zinc-500 hover:text-white px-2 rounded-xl transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredFolders.length === 0 && filteredFiles.length === 0 && (
        <div className="text-center py-16 text-zinc-600">
          <FolderPlus size={40} className="mx-auto mb-3 opacity-30" />
          <p>{query.trim() ? `Aucun résultat pour « ${query} »` : 'Ce dossier est vide.'}</p>
        </div>
      )}

      {/* Folders */}
      {filteredFolders.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Dossiers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredFolders.map(f => (
              <div key={f.id} className="group relative">
                <Link
                  href={`/library/folder/${f.id}`}
                  className="flex flex-col items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 transition-colors"
                >
                  <Folder size={32} className="text-amber-400" />
                  <span className="text-sm text-white font-medium text-center truncate w-full text-center">{f.name}</span>
                  <span className="text-xs text-zinc-500">{(f.profiles as any)?.name}</span>
                </Link>
                {canDelete(f.created_by) && (
                  <button
                    onClick={() => deleteFolder(f.id)}
                    disabled={deletingId === f.id}
                    className="absolute top-2 right-2 text-zinc-500 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-400 transition-all disabled:opacity-50"
                  >
                    {deletingId === f.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {filteredFiles.length > 0 && (
        <div>
          <h2 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Fichiers</h2>
          <div className="space-y-1.5">
            {filteredFiles.map(f => (
              <div
                key={f.id}
                className="group flex items-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl px-4 py-3 transition-colors"
              >
                <FileIcon type={f.file_type} />
                <button
                  onClick={() => setPreviewFile(f)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="text-sm text-white truncate">{f.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {formatSize(f.file_size)} · {(f.profiles as any)?.name} · {format(new Date(f.created_at), 'd MMM yyyy', { locale: fr })}
                  </div>
                </button>
                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-zinc-500 hover:text-amber-400 transition-colors px-2"
                  onClick={e => e.stopPropagation()}
                >
                  Ouvrir
                </a>
                {canDelete(f.uploaded_by) && (
                  <button
                    onClick={() => deleteFile(f)}
                    disabled={deletingId === f.id}
                    className="shrink-0 text-zinc-500 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-400 transition-all disabled:opacity-50"
                  >
                    {deletingId === f.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden max-w-3xl w-full max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <span className="text-sm font-medium text-white truncate">{previewFile.name}</span>
              <button onClick={() => setPreviewFile(null)} className="text-zinc-400 hover:text-white transition-colors ml-3">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              {previewFile.file_type.startsWith('image/') && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewFile.file_url} alt={previewFile.name} className="max-w-full max-h-full object-contain rounded-lg" />
              )}
              {previewFile.file_type.startsWith('video/') && (
                <video controls className="max-w-full max-h-full rounded-lg">
                  <source src={previewFile.file_url} type={previewFile.file_type} />
                </video>
              )}
              {previewFile.file_type === 'application/pdf' && (
                <iframe src={previewFile.file_url} className="w-full h-96 rounded-lg" title={previewFile.name} />
              )}
              {!previewFile.file_type.startsWith('image/') && !previewFile.file_type.startsWith('video/') && previewFile.file_type !== 'application/pdf' && (
                <div className="text-center text-zinc-400 py-8">
                  <File size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="mb-3">Aperçu non disponible pour ce type de fichier.</p>
                  <a href={previewFile.file_url} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 text-sm">
                    Télécharger le fichier
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
