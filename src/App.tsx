import { useTranslation } from 'react-i18next'

export default function App() {
  const { i18n } = useTranslation()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: 'white',
        padding: '40px',
        fontFamily: 'Arial',
        textAlign: 'center',
      }}
    >
      <h1>🎮 CoinGameDz</h1>
      <p>React يعمل ✅</p>
      <p>اللغة الحالية: {i18n.language}</p>
    </div>
  )
}
