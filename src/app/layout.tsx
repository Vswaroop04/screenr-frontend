import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { env } from '@/lib/env'

export default async function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const queryClient = new QueryClient()

  return (
    <html lang={locale}>
      <body>
        <QueryClientProvider client={queryClient}>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
          <Toaster richColors position='bottom-right' />
          <ReactQueryDevtools initialIsOpen={env.NEXT_PUBLIC_ENVIRONMENT === 'local'} />
        </QueryClientProvider>
      </body>
    </html>
  )
}
