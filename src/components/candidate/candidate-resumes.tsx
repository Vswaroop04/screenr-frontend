'use client'

import { useState } from 'react'
import {
  useCandidateResumes,
  useCandidateResumeDownload,
  useCandidateUploadResume
} from '@/lib/screening-hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  FileText,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react'
import { FileUpload } from '@/components/screening/file-upload'
import { toast } from 'sonner'
import Loader from '@/components/shared/loader'
import type { CandidateResumeItem, CandidateAnalysisItem } from '@/lib/screening-api'

function getStatusBadge (status: string) {
  switch (status) {
    case 'analyzed':
      return <Badge variant='success'>Analyzed</Badge>
    case 'parsed':
      return <Badge variant='secondary'>Parsed</Badge>
    case 'parsing':
    case 'analyzing':
    case 'uploaded':
      return (
        <Badge variant='outline'>
          <Loader className='w-3 h-3 mr-1' />
          Processing
        </Badge>
      )
    case 'failed':
      return <Badge variant='destructive'>Failed</Badge>
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
}

function getRecommendationBadge (rec?: string) {
  switch (rec) {
    case 'strong_yes':
      return (
        <Badge variant='success'>
          <ThumbsUp className='w-3 h-3 mr-1' /> Strong Yes
        </Badge>
      )
    case 'yes':
      return (
        <Badge variant='success'>
          <ThumbsUp className='w-3 h-3 mr-1' /> Yes
        </Badge>
      )
    case 'maybe':
      return (
        <Badge variant='outline'>
          <Minus className='w-3 h-3 mr-1' /> Maybe
        </Badge>
      )
    case 'no':
      return (
        <Badge variant='destructive'>
          <ThumbsDown className='w-3 h-3 mr-1' /> No
        </Badge>
      )
    case 'strong_no':
      return (
        <Badge variant='destructive'>
          <ThumbsDown className='w-3 h-3 mr-1' /> Strong No
        </Badge>
      )
    default:
      return null
  }
}

function ScoreBar ({
  label,
  score,
  weight
}: {
  label: string
  score?: number
  weight?: string
}) {
  if (score == null) return null
  const color =
    score >= 80
      ? 'bg-green-500'
      : score >= 60
        ? 'bg-yellow-500'
        : score >= 40
          ? 'bg-orange-500'
          : 'bg-red-500'

  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between text-sm'>
        <span className='text-muted-foreground'>
          {label}
          {weight && (
            <span className='text-xs ml-1 opacity-60'>({weight})</span>
          )}
        </span>
        <span className='font-medium'>{Math.round(score)}%</span>
      </div>
      <div className='h-2 rounded-full bg-muted overflow-hidden'>
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  )
}

function AnalysisCard ({ analysis }: { analysis: CandidateAnalysisItem }) {
  return (
    <div className='border rounded-lg p-4 space-y-4 bg-muted/30'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {analysis.status === 'completed' ? (
            <CheckCircle2 className='w-4 h-4 text-green-500' />
          ) : analysis.status === 'failed' ? (
            <XCircle className='w-4 h-4 text-red-500' />
          ) : (
            <AlertCircle className='w-4 h-4 text-yellow-500' />
          )}
          <span className='text-sm font-medium'>
            Analysis &middot;{' '}
            {new Date(analysis.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          {getRecommendationBadge(analysis.recommendation)}
          {analysis.overallScore != null && (
            <span
              className={`text-xl font-bold ${
                analysis.overallScore >= 80
                  ? 'text-green-500'
                  : analysis.overallScore >= 60
                    ? 'text-yellow-500'
                    : 'text-red-500'
              }`}
            >
              {Math.round(analysis.overallScore)}%
            </span>
          )}
        </div>
      </div>

      {/* Score breakdown */}
      {analysis.overallScore != null && (
        <div className='grid sm:grid-cols-2 gap-3'>
          <div className='space-y-2'>
            <ScoreBar label='Skills' score={analysis.skillsScore} weight='40%' />
            <ScoreBar
              label='Experience'
              score={analysis.experienceScore}
              weight='25%'
            />
            <ScoreBar label='Trust' score={analysis.trustScore} weight='20%' />
          </div>
          <div className='space-y-2'>
            <ScoreBar
              label='Education'
              score={analysis.educationScore}
              weight='10%'
            />
            <ScoreBar
              label='Projects'
              score={analysis.projectScore}
              weight='5%'
            />
          </div>
        </div>
      )}

      {/* Strengths & Concerns */}
      <div className='grid sm:grid-cols-2 gap-4'>
        {analysis.strengths && analysis.strengths.length > 0 && (
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-green-500'>Strengths</h4>
            <ul className='space-y-1'>
              {analysis.strengths.map((s, i) => (
                <li key={i} className='text-sm text-muted-foreground flex gap-2'>
                  <span className='text-green-500 flex-shrink-0'>+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.concerns && analysis.concerns.length > 0 && (
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-orange-500'>Concerns</h4>
            <ul className='space-y-1'>
              {analysis.concerns.map((c, i) => (
                <li key={i} className='text-sm text-muted-foreground flex gap-2'>
                  <span className='text-orange-500 flex-shrink-0'>-</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function ResumeCard ({ resume }: { resume: CandidateResumeItem }) {
  const [expanded, setExpanded] = useState(false)
  const download = useCandidateResumeDownload()
  const hasAnalyses = resume.analyses && resume.analyses.length > 0

  return (
    <Card>
      <CardContent className='pt-4 pb-4'>
        {/* Resume header row */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3 min-w-0 flex-1'>
            <FileText className='w-5 h-5 text-muted-foreground flex-shrink-0' />
            <div className='min-w-0'>
              <p className='font-medium truncate'>{resume.fileName}</p>
              <div className='flex items-center gap-2 text-xs text-muted-foreground flex-wrap'>
                <span className='flex items-center gap-1'>
                  <Clock className='w-3 h-3' />
                  {new Date(resume.createdAt).toLocaleDateString()}
                </span>
                {resume.candidateName && (
                  <span>&middot; {resume.candidateName}</span>
                )}
                {resume.skills && resume.skills.length > 0 && (
                  <span>&middot; {resume.skills.length} skills</span>
                )}
                {resume.totalYearsExperience != null && (
                  <span>
                    &middot; {resume.totalYearsExperience} yrs exp
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 flex-shrink-0'>
            {getStatusBadge(resume.status)}
            <Button
              variant='ghost'
              size='icon'
              onClick={() =>
                download.mutate(resume.resumeId, {
                  onError: () => toast.error('Failed to download resume')
                })
              }
              title='Download'
            >
              <Download className='w-4 h-4' />
            </Button>
            {hasAnalyses && (
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className='w-4 h-4' />
                ) : (
                  <ChevronDown className='w-4 h-4' />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Error message */}
        {resume.errorMessage && (
          <div className='mt-3 p-3 rounded bg-destructive/10 text-destructive text-sm'>
            {resume.errorMessage}
          </div>
        )}

        {/* Expanded analyses */}
        {expanded && hasAnalyses && (
          <div className='mt-4 space-y-3'>
            {resume.analyses.map(analysis => (
              <AnalysisCard key={analysis.analysisId} analysis={analysis} />
            ))}
          </div>
        )}

        {/* Skills preview when not expanded */}
        {!expanded && resume.skills && resume.skills.length > 0 && (
          <div className='mt-3 flex flex-wrap gap-1'>
            {resume.skills.slice(0, 8).map(skill => (
              <Badge
                key={skill}
                variant='secondary'
                className='text-xs'
              >
                {skill}
              </Badge>
            ))}
            {resume.skills.length > 8 && (
              <Badge variant='outline' className='text-xs'>
                +{resume.skills.length - 8} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function CandidateResumes () {
  const [showUpload, setShowUpload] = useState(false)
  const { data, isLoading } = useCandidateResumes()
  const upload = useCandidateUploadResume()

  const resumes = data?.resumes || []

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return

    try {
      await upload.mutateAsync(files[0])
      toast.success('Resume uploaded successfully!')
      setShowUpload(false)
    } catch {
      toast.error('Failed to upload resume')
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>My Resumes</h1>
          <p className='text-muted-foreground text-sm'>
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)}>
          <Upload className='w-4 h-4 mr-2' />
          Upload Resume
        </Button>
      </div>

      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Upload New Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFilesSelected={handleUpload}
              isUploading={upload.isPending}
              multiple={false}
              maxFiles={1}
            />
          </CardContent>
        </Card>
      )}

      {resumes.length === 0 ? (
        <Card>
          <CardContent className='pt-6 text-center py-16'>
            <FileText className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No resumes yet</h3>
            <p className='text-muted-foreground mb-6'>
              Upload your first resume to get started with AI-powered analysis
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Upload className='w-4 h-4 mr-2' />
              Upload Your Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-3'>
          {resumes.map(resume => (
            <ResumeCard key={resume.resumeId} resume={resume} />
          ))}
        </div>
      )}
    </div>
  )
}
