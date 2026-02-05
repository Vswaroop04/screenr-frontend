'use client'

import { useEffect } from 'react'

export default function PricingPage() {
  useEffect(() => {
    // Redirect to landing page pricing
    window.location.href = 'https://screenr.co/pricing'
  }, [])

  return (
    <main className='flex min-h-screen items-center justify-center'>
      <p className='text-muted-foreground'>Redirecting to pricing...</p>
    </main>
  )
}
