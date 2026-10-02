import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import { useUserStore } from '../store/userStore'

export default function Profile() {
  const user = useUserStore(s => s.user)

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24">
      <Header />

      <section className="px-4 pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-400">Profile</p>
        <h1 className="mt-2 text-3xl font-black">Profile</h1>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-5">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500 text-2xl font-black text-slate-950">
                {(user?.username || 'D').charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold">
                {user?.username || 'Telegram user'}
              </h2>
              <p className="text-sm text-slate-500">
                Level {user?.level ?? 1}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-950 p-4">
              <p className="text-xs text-slate-500">Balance</p>
              <p className="mt-1 text-xl font-black">
                {Number(user?.points ?? 0).toLocaleString()} DZE
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-4">
              <p className="text-xs text-slate-500">Referrals</p>
              <p className="mt-1 text-xl font-black">
                {user?.referralCount ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-slate-950 p-4">
            <p className="text-xs text-slate-500">Referral code</p>
            <p className="mt-1 font-bold tracking-wider">
              {user?.referralCode || 'DZE-XXXXXX'}
            </p>
          </div>
        </div>
      </section>

      <BottomNavigation />
    </main>
  )
}
