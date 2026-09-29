import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  )
}