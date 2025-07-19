// components/client-providers.tsx
'use client'

import { Toaster } from 'sonner'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { env } from '@/lib/env'
import Providers from '@/components/client-providers/query-client'

export function ClientProviders ({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
      <Toaster richColors position='bottom-right' />
      <ReactQueryDevtools
        initialIsOpen={env.NEXT_PUBLIC_ENVIRONMENT === 'local'}
      />
    </Providers>
  )
}
