'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Briefcase, Users, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useJobs, useCreateJob } from '@/lib/screening-hooks'
import Loader from '@/components/shared/loader'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { RecruiterLayout } from '@/components/layout/recruiter-layout'
import { EnhancedJobForm } from '@/components/recruiter/enhanced-job-form'

function RecruiterDashboardContent () {
  const { data: jobsData, isLoading } = useJobs()
  const createJob = useCreateJob()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreateJob = async (formData: any) => {
    try {
      // Transform enhanced form data to match API expectations
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description
        // Add additional fields as needed by your API
      }
      await createJob.mutateAsync(jobData)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to create job:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant='success'>Active</Badge>
      case 'processing':
        return <Badge variant='warning'>Processing</Badge>
      case 'completed':
        return <Badge variant='secondary'>Completed</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader />
      </div>
    )
  }

  const jobs = jobsData?.jobs || []

  return (
    <div className='container mx-auto py-8 px-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Jobs</h1>
          <p className='text-muted-foreground'>
            Create jobs and screen candidates with AI
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              New Job
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-4xl max-h-[90vh]'>
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Fill in the details to create a comprehensive job posting
              </DialogDescription>
            </DialogHeader>
            <EnhancedJobForm
              onSubmit={handleCreateJob}
              onCancel={() => setIsDialogOpen(false)}
              isLoading={createJob.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <Briefcase className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No jobs yet</h3>
            <p className='text-muted-foreground text-center mb-4'>
              Create your first job to start screening candidates
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Create Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {jobs.map(job => (
            <Card
              key={job.id}
              className='hover:border-primary transition-colors'
            >
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-lg'>{job.title}</CardTitle>
                    {job.company && (
                      <CardDescription>{job.company}</CardDescription>
                    )}
                  </div>
                  {getStatusBadge(job.status)}
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {job.location && (
                  <p className='text-sm text-muted-foreground'>
                    {job.location}
                  </p>
                )}

                {/* Stats */}
                <div className='flex gap-4'>
                  <div className='flex items-center gap-1 text-sm'>
                    <Users className='h-4 w-4 text-muted-foreground' />
                    <span>{job.resumeCount} resumes</span>
                  </div>
                  <div className='flex items-center gap-1 text-sm'>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                    <span>{job.processedCount} processed</span>
                  </div>
                </div>

                {/* Skills */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className='flex flex-wrap gap-1'>
                    {job.requiredSkills.slice(0, 5).map((skill, i) => (
                      <Badge key={i} variant='secondary' className='text-xs'>
                        {skill}
                      </Badge>
                    ))}
                    {job.requiredSkills.length > 5 && (
                      <Badge variant='outline' className='text-xs'>
                        +{job.requiredSkills.length - 5}
                      </Badge>
                    )}
                  </div>
                )}

                <Button asChild variant='outline' className='w-full'>
                  <Link href={`/recruiter/${job.id}`}>
                    View Candidates
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RecruiterDashboard () {
  return (
    <ProtectedRoute requiredRole='recruiter'>
      <RecruiterLayout>
        <RecruiterDashboardContent />
      </RecruiterLayout>
    </ProtectedRoute>
  )
}
