import Header from '../components/common/Header'

export default function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: 'white',
      }}
    >
      <Header />

      <div
        style={{
          padding: '30px',
          textAlign: 'center',
        }}
      >
        <h1>🎮 CoinGameDz</h1>
        <h2>Home + Header TEST ✅</h2>
        <p>اختبار الواجهة</p>
      </div>
    </div>
  )
}
