// app/assesment/[id]/page.tsx
// Dynamic route for displaying a single assessment/test detail

import { notFound } from 'next/navigation'
import client from '@/lib/client'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  params: {
    id: string
  }
}

export default async function AssesmentPage ({ params }: PageProps) {
  const { id } = params
  const t = await getTranslations('AssesmentsPage')

  try {
    const test = await client.main.getTestById(id)

    if (!test) {
      return notFound()
    }

    return (
      <div className='container mx-auto  space-y-6 p-4'>
        <Button asChild variant='outline' size='sm'>
          <Link href='/assesments'>{t('back', { default: 'Back' })}</Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{test.title}</CardTitle>
            {test.description && (
              <CardDescription>{test.description}</CardDescription>
            )}
          </CardHeader>

          <CardContent>
            <CardDescription>
              Need to implement monaco editor here ...... :
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    )
  } catch (err) {
    console.error(err)
    return notFound()
  }
}
