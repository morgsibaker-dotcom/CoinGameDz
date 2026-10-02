import { useTranslation } from 'react-i18next'
import LanguageSelector from './LanguageSelector'

export default function Header() {
  const { t } = useTranslation()

  return (
    <header className="flex items-center justify-between border-b border-white/10 px-4 py-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
          DzCoinEren
        </p>
        <p className="mt-1 text-sm font-semibold text-white">
          {t('app.title')}
        </p>
      </div>

      <LanguageSelector />
    </header>
  )
}
