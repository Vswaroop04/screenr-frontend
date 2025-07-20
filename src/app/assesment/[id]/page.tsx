// app/assesment/[id]/page.tsx
// Dynamic route for displaying a single assessment/test detail

import client from '@/lib/client'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import AssesmentPlayground from '@/components/assesments/assesment-playground'


interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AssesmentPage ({ params }: PageProps) {
  const { id } = await params
  const t = await getTranslations('AssesmentsPage')

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['test', id],
    queryFn: () => client.main.getTestById(id)
  })
  const dehydratedState = dehydrate(queryClient)

  return (
    <div className='container mx-auto space-y-6 p-4'>
      <Button asChild variant='outline' size='sm'>
        <Link href='/assesments'>{t('back', { default: 'Back' })}</Link>
      </Button>

      <HydrationBoundary state={dehydratedState}>
        <AssesmentPlayground id={id} />
      </HydrationBoundary>
    </div>
  )
}
