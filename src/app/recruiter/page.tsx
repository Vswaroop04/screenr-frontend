'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Briefcase,
  Users,
  Clock,
  ArrowRight,
  Search,
  Edit,
  Trash2,
  Link2,
  Copy,
  CheckCircle2
} from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { recruiterAPI, type Job } from '@/lib/screening-api'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import Loader from '@/components/shared/loader'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { RecruiterLayout } from '@/components/layout/recruiter-layout'
import { EnhancedJobForm } from '@/components/recruiter/enhanced-job-form'
import { ShareJobLinkDialog } from '@/components/recruiter/share-job-link-dialog'

function RecruiterDashboardContent () {
  const { data: jobsData, isLoading } = useJobs()
  const createJob = useCreateJob()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null)
  const [shareJobDialogOpen, setShareJobDialogOpen] = useState(false)
  const [sharingJob, setSharingJob] = useState<Job | null>(null)

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setIsEditDialogOpen(true)
  }

  const handleUpdateJob = async (formData: any) => {
    if (!editingJob) return

    try {
      await recruiterAPI.updateJob(editingJob.id, {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        requiredSkills: formData.skills,
        preferredSkills: formData.niceToHaveSkills
      })

      toast.success('Job updated successfully')
      setIsEditDialogOpen(false)
      setEditingJob(null)
      // Refetch jobs
      window.location.reload()
    } catch (error) {
      console.error('Failed to update job:', error)
      toast.error('Failed to update job')
    }
  }

  const handleDeleteJob = async () => {
    if (!deletingJobId) return

    setIsDeleting(true)
    try {
      await recruiterAPI.archiveJob(deletingJobId)
      toast.success('Job archived successfully')
      setDeletingJobId(null)
      // Refetch jobs
      window.location.reload()
    } catch (error) {
      console.error('Failed to archive job:', error)
      toast.error('Failed to archive job')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyFormLink = (job: Job) => {
    if (!job.formLink) return

    navigator.clipboard.writeText(job.formLink)
    setCopiedJobId(job.id)
    toast.success('Application link copied to clipboard!')
    setTimeout(() => setCopiedJobId(null), 2000)
  }

  const handleOpenShareDialog = (job: Job) => {
    setSharingJob(job)
    setShareJobDialogOpen(true)
  }

  const handleCreateJob = async (formData: any) => {
    try {
      // Transform enhanced form data to match API expectations
      const jobData: any = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        description: formData.description,
        // User-provided skills (these will be used for AI analysis)
        requiredSkills: formData.skills || [],
        preferredSkills: formData.niceToHaveSkills || [],
        // Job metadata for better AI analysis context
        jobMetadata: {
          locationType: formData.locationType,
          employmentType: formData.employmentType,
          experienceLevel: formData.experienceLevel,
          department: formData.department,
          salaryMin: formData.salaryMin
            ? parseInt(formData.salaryMin)
            : undefined,
          salaryMax: formData.salaryMax
            ? parseInt(formData.salaryMax)
            : undefined,
          salaryCurrency: formData.salaryCurrency,
          responsibilities: formData.responsibilities || [],
          requirements: formData.requirements || []
        }
      }

      // Always create application form with screening questions
      const hasQuestions =
        formData.formQuestions && formData.formQuestions.length > 0
      if (hasQuestions) {
        jobData.createApplicationForm = true
        jobData.formQuestions = formData.formQuestions
        jobData.formSettings = {
          requireEmail: formData.formRequireEmail,
          requirePhone: formData.formRequirePhone,
          requireName: formData.formRequireName,
          allowAnonymous: formData.formAllowAnonymous,
          customMessage: formData.formCustomMessage || undefined,
          acknowledgmentEmailSubject:
            formData.formAcknowledgmentSubject || undefined,
          acknowledgmentEmailBody: formData.formAcknowledgmentBody || undefined,
          maxSubmissions: formData.formMaxSubmissions
            ? parseInt(formData.formMaxSubmissions)
            : undefined,
          autoExpireOnMaxSubmissions: formData.formAutoExpire
        }
        if (formData.formExpiresAt) {
          jobData.formExpiresAt = new Date(formData.formExpiresAt).toISOString()
        }
      }

      await createJob.mutateAsync(jobData)
      toast.success('Job created successfully!')
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error('Failed to create job:', error)
      // Extract error message from API response
      const errorMessage = error?.message || 'Failed to create job'
      // Check for plan limit errors
      if (
        errorMessage.includes('limit') ||
        errorMessage.includes('upgrade') ||
        errorMessage.includes('plan')
      ) {
        toast.error(errorMessage, {
          description: 'Upgrade your plan to create more jobs',
          duration: 5000
        })
      } else {
        toast.error(errorMessage)
      }
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

  const allJobs = jobsData?.jobs || []

  // Filter jobs based on search query and exclude archived
  const jobs = allJobs.filter(job => {
    if (job.status === 'archived') return false
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      job.title.toLowerCase().includes(query) ||
      job.company?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query) ||
      job.requiredSkills?.some(skill => skill.toLowerCase().includes(query))
    )
  })

  return (
    <div className='container mx-auto py-8 px-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Jobs</h1>
          <p className='text-muted-foreground mt-1'>
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
          <DialogContent className='max-w-[1400px] max-h-[90vh] w-[98vw]'>
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

      {/* Search Bar */}
      {allJobs.length > 0 && (
        <div className='mb-6'>
          <div className='relative max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search jobs by title, company, location, or skills...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>
      )}

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
              className='hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-lg tracking-tight group-hover:text-primary transition-colors'>
                      {job.title}
                    </CardTitle>
                    {job.company && (
                      <CardDescription className='mt-0.5'>
                        {job.company}
                      </CardDescription>
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
                <div className='flex gap-4 flex-wrap'>
                  <div className='flex items-center gap-1.5 text-sm'>
                    <div className='p-1 rounded bg-blue-500/10'>
                      <Users className='h-3 w-3 text-blue-500' />
                    </div>
                    <span>{job.resumeCount} resumes</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-sm'>
                    <div className='p-1 rounded bg-emerald-500/10'>
                      <Clock className='h-3 w-3 text-emerald-500' />
                    </div>
                    <span>{job.processedCount} processed</span>
                  </div>
                  {job.hasApplicationForm && (
                    <div className='flex items-center gap-1.5 text-sm'>
                      <div className='p-1 rounded bg-violet-500/10'>
                        <Link2 className='h-3 w-3 text-violet-500' />
                      </div>
                      <span>{job.formSubmissionCount || 0} submissions</span>
                    </div>
                  )}
                </div>

                {/* Application Form Status */}
                {job.hasApplicationForm && (
                  <div className='flex items-center gap-2 p-2 bg-primary/10 rounded-md'>
                    <Link2 className='h-4 w-4 text-primary' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-medium text-primary'>
                        Application Form Active
                      </p>
                      {job.formExpiresAt && (
                        <p className='text-xs text-muted-foreground'>
                          Expires:{' '}
                          {new Date(job.formExpiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className='flex gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 px-2'
                        onClick={e => {
                          e.stopPropagation()
                          handleCopyFormLink(job)
                        }}
                        title='Copy application link'
                      >
                        {copiedJobId === job.id ? (
                          <CheckCircle2 className='h-4 w-4 text-green-500' />
                        ) : (
                          <Copy className='h-4 w-4' />
                        )}
                      </Button>
                      <Button
                        variant='default'
                        size='sm'
                        className='h-8 text-xs'
                        onClick={e => {
                          e.stopPropagation()
                          handleOpenShareDialog(job)
                        }}
                      >
                        Share
                      </Button>
                    </div>
                  </div>
                )}

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

                <div className='flex gap-2 pt-1'>
                  <Button
                    asChild
                    variant='outline'
                    className='flex-1 group/btn'
                  >
                    <Link href={`/recruiter/${job.id}`}>
                      View Candidates
                      <ArrowRight className='ml-2 h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform' />
                    </Link>
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => handleEditJob(job)}
                    title='Edit job'
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setDeletingJobId(job.id)}
                    title='Archive job'
                  >
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-[1400px] max-h-[90vh] w-[98vw]'>
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Update job details, skills, and requirements
            </DialogDescription>
          </DialogHeader>
          {editingJob && (
            <EnhancedJobForm
              onSubmit={handleUpdateJob}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingJob(null)
              }}
              isLoading={false}
              isEditing={true}
              initialData={{
                title: editingJob.title,
                company: editingJob.company || '',
                location: editingJob.location || '',
                description: editingJob.description,
                skills: editingJob.requiredSkills || [],
                niceToHaveSkills: editingJob.preferredSkills || [],
                department: '',
                locationType: 'remote',
                employmentType: 'full-time',
                experienceLevel: 'mid',
                salaryMin: '',
                salaryMax: '',
                salaryCurrency: 'USD',
                responsibilities: [],
                requirements: []
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingJobId}
        onOpenChange={() => setDeletingJobId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the job and hide it from your active jobs list.
              The job and all candidate data will be preserved and can be
              restored later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJob}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleting ? 'Archiving...' : 'Archive Job'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Job Link Dialog */}
      <ShareJobLinkDialog
        job={sharingJob}
        open={shareJobDialogOpen}
        onOpenChange={setShareJobDialogOpen}
      />
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
