'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Music2, CalendarDays, ListMusic, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/', label: 'Accueil', icon: Music2 },
    { href: '/rehearsals', label: 'Répétitions', icon: CalendarDays },
    { href: '/playlist', label: 'Playlist', icon: ListMusic },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800 h-16">
      <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white tracking-tight">
            {/* Logo placeholder — replace with <Image> */}
            <div className="w-7 h-7 rounded bg-zinc-700 shrink-0" />
            The Bottles
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
      {/* Mobile nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors ${
              pathname === href ? 'text-amber-400' : 'text-zinc-500'
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
