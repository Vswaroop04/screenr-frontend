'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Copy, CheckCircle2, Mail, ExternalLink, Calendar, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { Job } from '@/lib/screening-api'

interface ShareJobLinkDialogProps {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareJobLinkDialog({
  job,
  open,
  onOpenChange
}: ShareJobLinkDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!job || !job.hasApplicationForm || !job.formLink) {
    return null
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(job.formLink!)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Application for ${job.title}`)
    const body = encodeURIComponent(
      `Hi,\n\nWe're hiring for the position of ${job.title}${
        job.company ? ` at ${job.company}` : ''
      }.\n\nPlease apply using this link:\n${job.formLink}\n\nBest regards`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  const getFormStatusColor = () => {
    switch (job.formStatus) {
      case 'open':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'closed':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
      case 'expired':
        return 'bg-red-500/10 text-red-700 dark:text-red-400'
      default:
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Share Application Link</DialogTitle>
          <DialogDescription>
            Share this link with candidates to collect applications for {job.title}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Job Info */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>{job.title}</h3>
              <Badge className={getFormStatusColor()}>
                {job.formStatus === 'open' ? '🟢 Open' : job.formStatus === 'closed' ? '⚪ Closed' : '🔴 Expired'}
              </Badge>
            </div>
            {job.company && (
              <p className='text-sm text-muted-foreground'>{job.company}</p>
            )}
          </div>

          {/* Stats */}
          <div className='grid grid-cols-3 gap-4'>
            <div className='flex flex-col items-center p-3 bg-muted rounded-lg'>
              <Users className='h-5 w-5 text-muted-foreground mb-1' />
              <p className='text-2xl font-bold'>{job.formSubmissionCount || 0}</p>
              <p className='text-xs text-muted-foreground'>Submissions</p>
            </div>
            <div className='flex flex-col items-center p-3 bg-muted rounded-lg'>
              <Users className='h-5 w-5 text-muted-foreground mb-1' />
              <p className='text-2xl font-bold'>{job.resumeCount}</p>
              <p className='text-xs text-muted-foreground'>Total Resumes</p>
            </div>
            {job.formExpiresAt && (
              <div className='flex flex-col items-center p-3 bg-muted rounded-lg'>
                <Calendar className='h-5 w-5 text-muted-foreground mb-1' />
                <p className='text-xs font-semibold'>
                  {new Date(job.formExpiresAt).toLocaleDateString()}
                </p>
                <p className='text-xs text-muted-foreground'>Expires</p>
              </div>
            )}
          </div>

          {/* Link Display */}
          <div className='space-y-2'>
            <Label>Application Link</Label>
            <div className='flex gap-2'>
              <Input
                readOnly
                value={job.formLink}
                className='font-mono text-sm'
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant='outline'
                size='icon'
                onClick={handleCopyLink}
                title='Copy link'
              >
                {copied ? (
                  <CheckCircle2 className='h-4 w-4 text-green-500' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={() => window.open(job.formLink, '_blank')}
                title='Open link'
              >
                <ExternalLink className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Share Actions */}
          <div className='space-y-3'>
            <Label>Share via</Label>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={handleEmailShare}
              >
                <Mail className='mr-2 h-4 w-4' />
                Email
              </Button>
              <Button
                variant='outline'
                className='flex-1'
                onClick={handleCopyLink}
              >
                <Copy className='mr-2 h-4 w-4' />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className='p-4 bg-muted/50 rounded-lg space-y-2'>
            <p className='text-sm font-medium'>📋 How to use this link:</p>
            <ul className='text-sm text-muted-foreground space-y-1 list-disc list-inside'>
              <li>Share this link with potential candidates via email, social media, or job boards</li>
              <li>Candidates will fill out the application form and upload their resume</li>
              <li>All submissions will appear in your candidate dashboard</li>
              {job.formExpiresAt && (
                <li>The form will automatically close on {new Date(job.formExpiresAt).toLocaleDateString()}</li>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
