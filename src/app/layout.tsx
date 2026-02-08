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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  }
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider>
          <ClientProviders>{children}</ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
