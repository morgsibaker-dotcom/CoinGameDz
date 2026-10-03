import { useTranslation } from 'react-i18next'
import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { useUserStore } from '../store/userStore'
import i18n, { applyLanguage, supportedLanguages } from '../i18n/config'

export default function Profile() {
  const { t } = useTranslation()
  const user = useUserStore(s => s.user)

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24">
      <Header />
      <section className="px-4 pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-400">{t('profile.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-black">{t('profile.title')}</h1>
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-5">
          <div className="flex items-center gap-4">
            {user?.avatar ? <img src={user.avatar} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500 text-2xl font-black text-slate-950">{(user?.username || 'D').charAt(0).toUpperCase()}</div>}
            <div>
              <h2 className="text-xl font-bold">{user?.username || t('profile.telegramUser')}</h2>
              <p className="text-sm text-slate-500">{t('profile.level', { level: user?.level ?? 1 })}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-950 p-4"><p className="text-xs text-slate-500">{t('profile.balance')}</p><p className="mt-1 text-xl font-black">{Number(user?.points ?? user?.points_balance ?? 0).toLocaleString()} DZD</p></div>
            <div className="rounded-2xl bg-slate-950 p-4"><p className="text-xs text-slate-500">{t('profile.referrals')}</p><p className="mt-1 text-xl font-black">{user?.referralCount ?? 0}</p></div>
          </div>
          <div className="mt-3 rounded-2xl bg-slate-950 p-4"><p className="text-xs text-slate-500">{t('profile.code')}</p><p className="mt-1 font-bold tracking-wider">{user?.referralCode || 'REF-XXXXXX'}</p></div>
          <div className="mt-3 rounded-2xl bg-slate-950 p-4">
            <p className="text-xs text-slate-500">{t('profile.language')}</p>
            <select
              value={i18n.language}
              onChange={(event) => applyLanguage(event.target.value)}
              className="mt-2 w-full rounded-xl bg-slate-800 px-3 py-3 text-sm outline-none"
              aria-label={t('profile.language')}
            >
              {supportedLanguages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
      <BottomNavigation />
    </main>
  )
}
