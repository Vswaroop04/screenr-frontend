'use client'

import dynamic from 'next/dynamic'
import { useQuery } from '@tanstack/react-query'
import client from '@/lib/client'
import Loader from '@/components/shared/loader'
import React from 'react'

const ReactPlayground = dynamic(() => import('./react/playground'), {
  ssr: false
})

const VuePlayground = dynamic(() => import('./vue/playground'), {
  ssr: false
})

interface Props {
  id: string
}

export default function AssesmentPlayground ({ id }: Props) {
  const {
    data: test,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['test', id],
    queryFn: () => client.main.getTestById(id)
  })

  if (isLoading) return <Loader />
  if (isError || !test) {
    return <p className='text-destructive'>Failed to load test</p>
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-bold'>{test.title}</h2>
        {test.description && (
          <p className='text-muted-foreground'>{test.description}</p>
        )}
      </div>
      {test.framework === 'react' && (
        <ReactPlayground
          starterCode={test.starterCode ?? ''}
          testCode={test.solutionCode ?? ''}
        />
      )}
      {test.framework === 'vue' && (
        <VuePlayground
          starterCode={test.starterCode ?? ''}
          testCode={test.solutionCode ?? ''}
        />
      )}
    </div>
  )
}
