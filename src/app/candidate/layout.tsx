'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { CandidateLayout } from '@/components/layout/candidate-layout'

export default function CandidateRootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole='candidate'>
      <CandidateLayout>{children}</CandidateLayout>
    </ProtectedRoute>
  )
}
