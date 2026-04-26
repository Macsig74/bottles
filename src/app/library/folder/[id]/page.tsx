import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LibraryBrowser } from '@/components/library/LibraryBrowser'
import { FolderOpen } from 'lucide-react'

async function getBreadcrumb(
  supabase: Awaited<ReturnType<typeof createClient>>,
  folderId: string
): Promise<{ id: string; name: string }[]> {
  const crumbs: { id: string; name: string }[] = []
  let currentId: string | null = folderId

  while (currentId) {
    const { data } = await supabase
      .from('library_folders')
      .select('id, name, parent_id')
      .eq('id', currentId)
      .single()
    if (!data) break
    crumbs.unshift({ id: data.id, name: data.name })
    currentId = data.parent_id
  }
  return crumbs
}

export default async function FolderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const { data: folder } = await supabase
    .from('library_folders')
    .select('*')
    .eq('id', id)
    .single()

  if (!folder) notFound()

  const { data: subFolders } = await supabase
    .from('library_folders')
    .select('*, profiles(name)')
    .eq('parent_id', id)
    .order('name', { ascending: true })

  const { data: files } = await supabase
    .from('library_files')
    .select('*, profiles(name)')
    .eq('folder_id', id)
    .order('created_at', { ascending: false })

  const breadcrumb = await getBreadcrumb(supabase, id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <FolderOpen size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{folder.name}</h1>
          <p className="text-zinc-400 text-sm">Bibliothèque</p>
        </div>
      </div>

      <LibraryBrowser
        userId={user.id}
        isAdmin={profile?.is_admin ?? false}
        initialFolders={subFolders ?? []}
        initialFiles={files ?? []}
        currentFolderId={id}
        breadcrumb={breadcrumb}
      />
    </div>
  )
}
