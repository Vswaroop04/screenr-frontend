// app/layout.tsx (Server Component)
import { getLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { ClientProviders } from '@/components/client-providers/' // <-- wrap QueryClientProvider here
import './globals.css'

export default async function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <ClientProviders>{children}</ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
