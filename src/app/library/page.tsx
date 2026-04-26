import { createClient } from '@/lib/supabase/server'
import { FolderOpen } from 'lucide-react'
import { LibraryBrowser } from '@/components/library/LibraryBrowser'

export default async function LibraryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, name')
    .eq('id', user.id)
    .single()

  const { data: folders } = await supabase
    .from('library_folders')
    .select('*, profiles(name)')
    .is('parent_id', null)
    .order('name', { ascending: true })

  const { data: files } = await supabase
    .from('library_files')
    .select('*, profiles(name)')
    .is('folder_id', null)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <FolderOpen size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Bibliothèque</h1>
          <p className="text-zinc-400 text-sm">Vidéos, docs et fichiers partagés</p>
        </div>
      </div>

      <LibraryBrowser
        userId={user.id}
        isAdmin={profile?.is_admin ?? false}
        initialFolders={folders ?? []}
        initialFiles={files ?? []}
        currentFolderId={null}
        breadcrumb={[]}
      />
    </div>
  )
}
