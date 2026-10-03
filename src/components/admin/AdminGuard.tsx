import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface AdminGuardProps {
  children: ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setIsAdmin(false)
          return
        }

        const { data: admin, error } = await supabase
          .from('admin_users')
          .select('id')
          .eq('auth_user_id', user.id)
          .eq('is_active', true)
          .maybeSingle()

        if (error) {
          console.error('[DzCoinEren] Admin check failed', error)
          setIsAdmin(false)
          return
        }

        setIsAdmin(!!admin)
      } catch (error) {
        console.error('[DzCoinEren] Admin authentication check failed', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    void checkAdmin()
  }, [])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Checking admin access...</div>
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
