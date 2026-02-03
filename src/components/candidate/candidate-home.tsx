'use client'

import { useAuthStore } from '@/lib/auth-store'
import { useCandidateProfile, useCandidateResumes } from '@/lib/screening-hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  FileText,
  BarChart3,
  Sparkles,
  Upload,
  Star,
  Clock,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/shared/loader'

function getStatusBadge (status: string) {
  switch (status) {
    case 'analyzed':
      return <Badge variant='success'>Analyzed</Badge>
    case 'parsed':
      return <Badge variant='secondary'>Parsed</Badge>
    case 'parsing':
    case 'analyzing':
    case 'uploaded':
      return <Badge variant='outline'>Processing</Badge>
    case 'failed':
      return <Badge variant='destructive'>Failed</Badge>
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
}

export function CandidateHome () {
  const router = useRouter()
  const user = useAuthStore(state => state.user)
  const { data: profile, isLoading: profileLoading } = useCandidateProfile()
  const { data: resumesData, isLoading: resumesLoading } =
    useCandidateResumes()

  const isLoading = profileLoading || resumesLoading
  const resumes = resumesData?.resumes || []
  const recentResumes = resumes.slice(0, 3)
  const hasResumes = resumes.length > 0

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {/* Welcome */}
      <div>
        <h1 className='text-3xl font-bold'>
          Welcome back,{' '}
          {user?.fullName || user?.email?.split('@')[0] || 'Candidate'}
        </h1>
        <p className='text-muted-foreground mt-1'>
          Here&apos;s an overview of your resume analyses
        </p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center'>
                <FileText className='w-5 h-5 text-blue-500' />
              </div>
              <div>
                <p className='text-2xl font-bold'>
                  {profile?.totalResumes || 0}
                </p>
                <p className='text-xs text-muted-foreground'>Resumes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center'>
                <BarChart3 className='w-5 h-5 text-purple-500' />
              </div>
              <div>
                <p className='text-2xl font-bold'>
                  {profile?.totalAnalyses || 0}
                </p>
                <p className='text-xs text-muted-foreground'>Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center'>
                <Star className='w-5 h-5 text-green-500' />
              </div>
              <div>
                <p className='text-2xl font-bold'>
                  {profile?.averageScore
                    ? `${Math.round(profile.averageScore)}%`
                    : '--'}
                </p>
                <p className='text-xs text-muted-foreground'>Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center'>
                <Sparkles className='w-5 h-5 text-orange-500' />
              </div>
              <div>
                <p className='text-2xl font-bold'>
                  {profile?.topSkills?.length || 0}
                </p>
                <p className='text-xs text-muted-foreground'>Skills</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Skills */}
      {profile?.topSkills && profile.topSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Your Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {profile.topSkills.map(skill => (
                <Badge key={skill} variant='secondary' className='text-sm'>
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions + Recent Resumes */}
      <div className='grid lg:grid-cols-3 gap-6'>
        {/* Quick Actions */}
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'>Quick Actions</h2>
          <Card
            className='cursor-pointer hover:shadow-md transition-shadow'
            onClick={() => router.push('/candidate/resumes')}
          >
            <CardContent className='pt-6 flex items-center gap-4'>
              <div className='w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0'>
                <Upload className='w-5 h-5 text-blue-500' />
              </div>
              <div className='flex-1'>
                <p className='font-medium'>Upload Resume</p>
                <p className='text-sm text-muted-foreground'>
                  Add a new resume for analysis
                </p>
              </div>
              <ArrowRight className='w-4 h-4 text-muted-foreground' />
            </CardContent>
          </Card>

          <Card
            className='cursor-pointer hover:shadow-md transition-shadow'
            onClick={() => router.push('/candidate')}
          >
            <CardContent className='pt-6 flex items-center gap-4'>
              <div className='w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0'>
                <Sparkles className='w-5 h-5 text-purple-500' />
              </div>
              <div className='flex-1'>
                <p className='font-medium'>Match Checker</p>
                <p className='text-sm text-muted-foreground'>
                  Quick match against a job description
                </p>
              </div>
              <ArrowRight className='w-4 h-4 text-muted-foreground' />
            </CardContent>
          </Card>
        </div>

        {/* Recent Resumes */}
        <div className='lg:col-span-2 space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Recent Resumes</h2>
            {hasResumes && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => router.push('/candidate/resumes')}
              >
                View All <ArrowRight className='w-4 h-4 ml-1' />
              </Button>
            )}
          </div>

          {!hasResumes ? (
            <Card>
              <CardContent className='pt-6 text-center py-12'>
                <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='font-semibold mb-2'>No resumes yet</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Upload your first resume to get AI-powered analysis
                </p>
                <Button onClick={() => router.push('/candidate/resumes')}>
                  <Upload className='w-4 h-4 mr-2' />
                  Upload Resume
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-3'>
              {recentResumes.map(resume => {
                const latestAnalysis = resume.analyses?.[0]
                return (
                  <Card
                    key={resume.resumeId}
                    className='cursor-pointer hover:shadow-md transition-shadow'
                    onClick={() => router.push('/candidate/resumes')}
                  >
                    <CardContent className='pt-4 pb-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3 min-w-0'>
                          <FileText className='w-5 h-5 text-muted-foreground flex-shrink-0' />
                          <div className='min-w-0'>
                            <p className='font-medium truncate'>
                              {resume.fileName}
                            </p>
                            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                              <Clock className='w-3 h-3' />
                              {new Date(resume.createdAt).toLocaleDateString()}
                              {resume.candidateName && (
                                <span>
                                  {' '}
                                  &middot; {resume.candidateName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-3 flex-shrink-0'>
                          {latestAnalysis?.overallScore != null && (
                            <span
                              className={`text-lg font-bold ${
                                latestAnalysis.overallScore >= 80
                                  ? 'text-green-500'
                                  : latestAnalysis.overallScore >= 60
                                    ? 'text-yellow-500'
                                    : 'text-red-500'
                              }`}
                            >
                              {Math.round(latestAnalysis.overallScore)}%
                            </span>
                          )}
                          {getStatusBadge(resume.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
