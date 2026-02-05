'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return

    if (isAuthenticated && user) {
      // Redirect authenticated users to their dashboard
      const dashboardPath =
        user.role === 'recruiter' ? '/recruiter/home' : '/candidate/home'
      router.replace(dashboardPath)
    } else {
      // Redirect non-authenticated users to login
      router.replace('/login')
    }
  }, [isAuthenticated, user, router, hasHydrated])

  // Show loading while determining redirect
  return (
    <main className='flex min-h-screen items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </main>
  )
}
