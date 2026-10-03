import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { useUserStore } from '../store/userStore'
import { getPointTransactions, PointTransaction } from '../services/transactionService'

export default function History() {
  const { t } = useTranslation()
  const user = useUserStore(s => s.user)
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        setError('')
        setLoading(true)
        setTransactions(await getPointTransactions(String(user.id)))
      } catch (e) {
        setError(e instanceof Error ? e.message : t('history.error'))
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [user?.id, t])

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24">
      <Header />
      <section className="px-4 pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-400">{t('history.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-black">{t('history.title')}</h1>
        <p className="mt-2 text-sm text-slate-400">{t('history.subtitle')}</p>

        <div className="mt-6 space-y-3">
          {loading && (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 text-sm text-slate-400">
              {t('history.loading')}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 text-sm text-slate-400">
              {t('history.empty')}
            </div>
          )}

          {!loading && !error && transactions.map(transaction => (
            <article
              key={transaction.id}
              className="rounded-2xl border border-white/10 bg-slate-900 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold">{transaction.description || transaction.type}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(transaction.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="shrink-0 font-black text-emerald-400">
                  +{transaction.amount.toLocaleString()} {t('history.points')}
                </p>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {transaction.source || transaction.type}
              </p>
            </article>
          ))}
        </div>
      </section>
      <BottomNavigation />
    </main>
  )
}
