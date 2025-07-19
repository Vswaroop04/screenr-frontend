'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage () {
  const t = useTranslations('HomePage')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight font-sans">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
        <Button asChild>
          <Link href="/assesments">{t('assesmentsLink')}</Link>
        </Button>
      </div>
    </main>
  )
}
