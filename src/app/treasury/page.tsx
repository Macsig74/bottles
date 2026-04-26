import { createClient } from '@/lib/supabase/server'
import { Wallet } from 'lucide-react'
import { TreasuryClient } from '@/components/treasury/TreasuryClient'

export default async function TreasuryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, name')
    .eq('id', user.id)
    .single()

  const { data: transactions } = await supabase
    .from('treasury_transactions')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false })

  const balance = (transactions ?? []).reduce((sum, t) => {
    if (t.type === 'income' || t.type === 'adjustment') return sum + Number(t.amount)
    return sum - Number(t.amount)
  }, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Wallet size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Trésorerie</h1>
          <p className="text-zinc-400 text-sm">Finances des Bottles</p>
        </div>
      </div>

      <TreasuryClient
        userId={user.id}
        isAdmin={profile?.is_admin ?? false}
        initialTransactions={transactions ?? []}
        initialBalance={balance}
      />
    </div>
  )
}
