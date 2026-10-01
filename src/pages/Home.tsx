export default function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: '#ffffff',
        padding: '30px 20px',
        fontFamily: 'Arial',
        textAlign: 'center',
      }}
    >
      <h1>🎮 CoinGameDz</h1>

      <div style={{ marginTop: '30px' }}>
        <h2>واجهة اللعبة الرئيسية</h2>
        <p>Home يعمل بنجاح ✅</p>
      </div>

      <button
        style={{
          marginTop: '30px',
          padding: '15px 30px',
          borderRadius: '12px',
          border: 'none',
          background: '#22c55e',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        🎮 العب واربح
      </button>
    </div>
  )
}
