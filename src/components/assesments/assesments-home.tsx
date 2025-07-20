// components/assesments/assesments-home.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import client from '@/lib/client'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Loader from '@/components/shared/loader'
import { useTranslations } from 'next-intl'

const fetchTests = async () => {
  const response = await client.main.listTests({})
  return response.tests
}

export default function AssesmentsHome () {
  const {
    data: tests,
    isLoading,
    isError
  } = useQuery<Awaited<ReturnType<typeof fetchTests>>>({
    queryKey: ['tests'],
    queryFn: fetchTests
  })
  const t = useTranslations('AssesmentsPage')
  if (isLoading) return <Loader />
  if (isError) return <p className="text-destructive">{t('error')}</p>

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold font-sans">{t('title')}</h1>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tests?.map((test: Awaited<ReturnType<typeof fetchTests>>[number]) => (
          
          <Card key={test.id} className="flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle>{test.title}</CardTitle>
                {test.description && (
                  <CardDescription>{test.description}</CardDescription>
                )}
              </CardHeader>
            </div>
            <CardFooter className="justify-end">
              <Button asChild size="sm">
                <Link href={`/assesment/${test.id}`}>{t('run')}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
