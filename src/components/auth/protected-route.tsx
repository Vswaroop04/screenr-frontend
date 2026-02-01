'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'candidate' | 'recruiter' | 'admin'
  redirectTo?: string
}

export function ProtectedRoute ({
  children,
  requiredRole,
  redirectTo
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      const defaultRedirect =
        requiredRole === 'recruiter'
          ? '/auth/recruiter/login'
          : '/auth/candidate'
      router.push(redirectTo || defaultRedirect)
      return
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push('/')
    }
  }, [isAuthenticated, user, requiredRole, redirectTo, router, hasHydrated])

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <h1 className='text-2xl font-bold'>Access Denied</h1>
          <p className='text-muted-foreground'>
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
