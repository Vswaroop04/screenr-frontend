'use client'

import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  FileText,
  BarChart3
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { RecruiterLayout } from '@/components/layout/recruiter-layout'
import { dashboardAPI } from '@/lib/screening-api'

function RecruiterHomeContent () {
  const router = useRouter()
  const user = useAuthStore(state => state.user)

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getStats(),
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const stats = [
    {
      label: 'Active Jobs',
      value: statsData?.activeJobs?.toString() || '0',
      icon: Briefcase,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Total Candidates',
      value: statsData?.totalCandidates?.toString() || '0',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Verified Candidates',
      value: statsData?.verifiedCandidates?.toString() || '0',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Pending Reviews',
      value: statsData?.pendingReviews?.toString() || '0',
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    }
  ]

  const firstName =
    user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-muted/20 to-background'>
      <div className='container mx-auto px-4 py-12 max-w-7xl'>
        <div className='space-y-8'>
          {/* Personalized Greeting */}
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <h1 className='text-4xl font-bold'>Hi, {firstName}! 👋</h1>
              <p className='text-xl text-muted-foreground'>
                Here&apos;s what&apos;s happening with your recruitment pipeline
              </p>
            </div>
            <Button size='lg' onClick={() => router.push('/recruiter')}>
              <Plus className='w-5 h-5 mr-2' />
              Create New Job
            </Button>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {stats.map(stat => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className='bg-card border rounded-xl p-6 space-y-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]'
                >
                  <div className='flex items-center justify-between'>
                    <div
                      className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}
                    >
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {stat.label}
                    </p>
                    <p className='text-3xl font-bold mt-1'>{stat.value}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className='grid lg:grid-cols-2 gap-6'>
            <div className='bg-card border rounded-xl p-8 space-y-6'>
              <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-semibold'>Quick Actions</h2>
              </div>

              <div className='space-y-3'>
                <Button
                  variant='outline'
                  className='w-full justify-start h-auto py-4 px-6'
                  onClick={() => router.push('/recruiter')}
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
                      <Plus className='w-5 h-5 text-primary' />
                    </div>
                    <div className='text-left'>
                      <p className='font-semibold'>Create Job Posting</p>
                      <p className='text-sm text-muted-foreground'>
                        Post a new job and start receiving candidates
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  variant='outline'
                  className='w-full justify-start h-auto py-4 px-6'
                  onClick={() => router.push('/recruiter')}
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center'>
                      <FileText className='w-5 h-5 text-blue-500' />
                    </div>
                    <div className='text-left'>
                      <p className='font-semibold'>Review Candidates</p>
                      <p className='text-sm text-muted-foreground'>
                        View and analyze candidate profiles
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  variant='outline'
                  className='w-full justify-start h-auto py-4 px-6'
                  onClick={() => router.push('/recruiter')}
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center'>
                      <BarChart3 className='w-5 h-5 text-purple-500' />
                    </div>
                    <div className='text-left'>
                      <p className='font-semibold'>View Analytics</p>
                      <p className='text-sm text-muted-foreground'>
                        Analyze recruitment metrics and insights
                      </p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            <div className='bg-card border rounded-xl p-8 space-y-6'>
              <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-semibold'>Getting Started</h2>
              </div>

              <div className='space-y-4'>
                <div className='flex items-start gap-4 p-4 rounded-lg bg-muted/50'>
                  <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold flex-shrink-0'>
                    1
                  </div>
                  <div>
                    <h3 className='font-semibold'>Create Your First Job</h3>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Post a job description and let our AI extract required
                      skills and qualifications
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4 p-4 rounded-lg bg-muted/50'>
                  <div className='w-8 h-8 rounded-full bg-primary/50 flex items-center justify-center text-white font-semibold flex-shrink-0'>
                    2
                  </div>
                  <div>
                    <h3 className='font-semibold'>
                      Receive Verified Candidates
                    </h3>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Candidates apply and get their skills verified through AI
                      analysis
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4 p-4 rounded-lg bg-muted/50'>
                  <div className='w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-white font-semibold flex-shrink-0'>
                    3
                  </div>
                  <div>
                    <h3 className='font-semibold'>Review & Shortlist</h3>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Use our analytics to identify the best-fit candidates with
                      verified skills
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border rounded-xl p-8'>
            <div className='flex items-center justify-between'>
              <div className='space-y-2'>
                <h2 className='text-2xl font-bold'>
                  Ready to find verified talent?
                </h2>
                <p className='text-muted-foreground'>
                  Create your first job posting and start receiving AI-verified
                  candidates
                </p>
              </div>
              <Button size='lg' onClick={() => router.push('/recruiter')}>
                <Plus className='w-5 h-5 mr-2' />
                Create Job
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RecruiterHome () {
  return (
    <RecruiterLayout>
      <RecruiterHomeContent />
    </RecruiterLayout>
  )
}
