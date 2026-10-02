export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 pt-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">Rewards Mini App</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight">DzCoinEren</h1>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-400">
        DZE
      </div>
    </header>
  )
}