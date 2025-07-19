// app/home/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import client from '@/lib/client'
import AssesmentsHome from '@/components/assesments/assesments-home'

const fetchTests = async () => {
  const response = await client.main.listTests({})
  return response.tests
}

export default async function HomePage () {
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
      queryKey: ['tests'],
      queryFn: fetchTests
    })

    const dehydratedState = dehydrate(queryClient)

    return (
      <HydrationBoundary state={dehydratedState}>
        <AssesmentsHome />
      </HydrationBoundary>
    )
}
