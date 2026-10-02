import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function TestPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center',
        fontFamily: 'Arial',
      }}
    >
      <h1>🎮 CoinGameDz</h1>
      <h2>التطبيق يعمل ✅</h2>
      <p>Router يعمل بنجاح</p>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestPage />} />
      </Routes>
    </Router>
  )
}
