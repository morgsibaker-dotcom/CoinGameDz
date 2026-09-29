import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

const HomePage = lazy(() => import('./pages/Home'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

export default App