'use client'

import { useState } from 'react'
import {
  useCandidateResumes,
  useCandidateResumeDownload,
  useCandidateUploadResume,
  useAnalyzeResume
} from '@/lib/screening-hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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
  Minus,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Lightbulb,
  BookOpen,
  AlertTriangle
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
      return <Badge variant='secondary'>Ready to Analyze</Badge>
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
        <Badge variant='success' className='text-sm px-3 py-1'>
          <ThumbsUp className='w-3 h-3 mr-1' /> Strong Match
        </Badge>
      )
    case 'yes':
      return (
        <Badge variant='success' className='text-sm px-3 py-1'>
          <ThumbsUp className='w-3 h-3 mr-1' /> Good Match
        </Badge>
      )
    case 'maybe':
      return (
        <Badge variant='outline' className='text-sm px-3 py-1'>
          <Minus className='w-3 h-3 mr-1' /> Partial Match
        </Badge>
      )
    case 'no':
      return (
        <Badge variant='destructive' className='text-sm px-3 py-1'>
          <ThumbsDown className='w-3 h-3 mr-1' /> Weak Match
        </Badge>
      )
    case 'strong_no':
      return (
        <Badge variant='destructive' className='text-sm px-3 py-1'>
          <ThumbsDown className='w-3 h-3 mr-1' /> Not a Match
        </Badge>
      )
    default:
      return null
  }
}

function ScoreBar ({
  label,
  score,
  icon: Icon
}: {
  label: string
  score?: number
  icon?: React.ElementType
}) {
  if (score == null) return null
  const color =
    score >= 80
      ? 'bg-green-500'
      : score >= 60
        ? 'bg-blue-500'
        : score >= 40
          ? 'bg-amber-500'
          : 'bg-red-500'

  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between text-sm'>
        <span className='text-muted-foreground flex items-center gap-1.5'>
          {Icon && <Icon className='w-3.5 h-3.5' />}
          {label}
        </span>
        <span className='font-semibold'>{Math.round(score)}%</span>
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
  const [expanded, setExpanded] = useState(true)

  return (
    <div className='border rounded-xl p-5 space-y-4 bg-card'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            {analysis.status === 'completed' ? (
              <CheckCircle2 className='w-5 h-5 text-green-500' />
            ) : analysis.status === 'failed' ? (
              <XCircle className='w-5 h-5 text-red-500' />
            ) : (
              <AlertCircle className='w-5 h-5 text-yellow-500' />
            )}
            <span className='font-semibold'>
              {analysis.jobTitle || 'Job Analysis'}
            </span>
          </div>
          <p className='text-xs text-muted-foreground'>
            Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {getRecommendationBadge(analysis.recommendation)}
          {analysis.overallScore != null && (
            <div className='text-center'>
              <span
                className={`text-3xl font-bold ${
                  analysis.overallScore >= 80
                    ? 'text-green-500'
                    : analysis.overallScore >= 60
                      ? 'text-blue-500'
                      : analysis.overallScore >= 40
                        ? 'text-amber-500'
                        : 'text-red-500'
                }`}
              >
                {Math.round(analysis.overallScore)}%
              </span>
              <p className='text-xs text-muted-foreground'>Match Score</p>
            </div>
          )}
        </div>
      </div>

      {/* Score breakdown */}
      {analysis.overallScore != null && (
        <div className='grid sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg'>
          <ScoreBar label='Skills Match' score={analysis.skillsScore} icon={Target} />
          <ScoreBar label='Experience' score={analysis.experienceScore} icon={TrendingUp} />
          <ScoreBar label='Education' score={analysis.educationScore} icon={BookOpen} />
          <ScoreBar label='Trust Score' score={analysis.trustScore} icon={CheckCircle2} />
        </div>
      )}

      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-semibold text-green-600 flex items-center gap-2'>
            <ThumbsUp className='w-4 h-4' />
            Your Strengths
          </h4>
          <ul className='space-y-1.5 pl-1'>
            {analysis.strengths.map((s, i) => (
              <li key={i} className='text-sm flex gap-2'>
                <span className='text-green-500 flex-shrink-0'>✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What to Improve */}
      {analysis.concerns && analysis.concerns.length > 0 && (
        <div className='space-y-2 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800'>
          <h4 className='text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2'>
            <Lightbulb className='w-4 h-4' />
            What You Can Improve
          </h4>
          <ul className='space-y-2'>
            {analysis.concerns.map((c, i) => (
              <li key={i} className='text-sm flex gap-2'>
                <span className='text-amber-600 flex-shrink-0 mt-0.5'>→</span>
                <span className='text-amber-800 dark:text-amber-300'>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function AnalyzeDialog ({
  open,
  onOpenChange,
  resumeId,
  resumeName,
  onAnalysisStarted
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  resumeId: string
  resumeName: string
  onAnalysisStarted?: () => void
}) {
  const [jobDescription, setJobDescription] = useState('')
  const analyzeResume = useAnalyzeResume()

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description')
      return
    }

    try {
      await analyzeResume.mutateAsync({
        resumeId,
        jobDescription: jobDescription.trim()
      })
      toast.success('Analysis started! Results will appear shortly.')
      onOpenChange(false)
      setJobDescription('')
      onAnalysisStarted?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start analysis'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Sparkles className='w-5 h-5 text-primary' />
            Analyze Resume Against Job
          </DialogTitle>
          <DialogDescription>
            Paste the job description you're applying for. We'll analyze how well your resume matches and give you tips to improve.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='p-3 bg-muted rounded-lg flex items-center gap-3'>
            <FileText className='w-5 h-5 text-muted-foreground' />
            <div>
              <p className='text-sm font-medium'>Resume</p>
              <p className='text-xs text-muted-foreground'>{resumeName}</p>
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Job Description</label>
            <Textarea
              placeholder='Paste the full job description here...

Example:
- Job title and company
- Required skills and qualifications
- Years of experience needed
- Responsibilities
- Nice-to-have skills'
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              className='min-h-[200px] resize-none'
            />
            <p className='text-xs text-muted-foreground'>
              Tip: The more detailed the job description, the better the analysis
            </p>
          </div>

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={analyzeResume.isPending || !jobDescription.trim()}
            >
              {analyzeResume.isPending ? (
                <>
                  <Loader className='w-4 h-4 mr-2' />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className='w-4 h-4 mr-2' />
                  Analyze Match
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ResumeCard ({ resume, onRefetch }: { resume: CandidateResumeItem; onRefetch: () => void }) {
  const [expanded, setExpanded] = useState(resume.analyses && resume.analyses.length > 0)
  const [analyzeOpen, setAnalyzeOpen] = useState(false)
  const download = useCandidateResumeDownload()
  const hasAnalyses = resume.analyses && resume.analyses.length > 0
  const canAnalyze = resume.status === 'parsed' || resume.status === 'analyzed'

  const handleAnalysisStarted = () => {
    // Start polling for results
    const pollInterval = setInterval(() => {
      onRefetch()
    }, 3000)
    // Stop polling after 60 seconds
    setTimeout(() => clearInterval(pollInterval), 60000)
  }

  return (
    <>
      <Card>
        <CardContent className='pt-5 pb-5'>
          {/* Resume header row */}
          <div className='flex items-start justify-between gap-4'>
            <div className='flex items-start gap-3 min-w-0 flex-1'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <FileText className='w-5 h-5 text-primary' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='font-semibold truncate'>{resume.fileName}</p>
                <div className='flex items-center gap-2 text-xs text-muted-foreground flex-wrap mt-1'>
                  <span className='flex items-center gap-1'>
                    <Clock className='w-3 h-3' />
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </span>
                  {resume.candidateName && (
                    <span>• {resume.candidateName}</span>
                  )}
                  {resume.totalYearsExperience != null && (
                    <span>• {resume.totalYearsExperience} yrs exp</span>
                  )}
                </div>
                {/* Skills preview */}
                {resume.skills && resume.skills.length > 0 && (
                  <div className='mt-2 flex flex-wrap gap-1'>
                    {resume.skills.slice(0, 5).map(skill => (
                      <Badge
                        key={skill}
                        variant='secondary'
                        className='text-xs'
                      >
                        {skill}
                      </Badge>
                    ))}
                    {resume.skills.length > 5 && (
                      <Badge variant='outline' className='text-xs'>
                        +{resume.skills.length - 5}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2 flex-shrink-0'>
              {getStatusBadge(resume.status)}
              {canAnalyze && (
                <Button
                  size='sm'
                  onClick={() => setAnalyzeOpen(true)}
                >
                  <Sparkles className='w-4 h-4 mr-1' />
                  Analyze
                </Button>
              )}
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
            </div>
          </div>

          {/* Error message */}
          {resume.errorMessage && (
            <div className='mt-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2'>
              <AlertTriangle className='w-4 h-4 mt-0.5 flex-shrink-0' />
              {resume.errorMessage}
            </div>
          )}

          {/* Analyses section */}
          {hasAnalyses && (
            <div className='mt-4'>
              <button
                onClick={() => setExpanded(!expanded)}
                className='flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
              >
                {expanded ? (
                  <ChevronUp className='w-4 h-4' />
                ) : (
                  <ChevronDown className='w-4 h-4' />
                )}
                {resume.analyses.length} Job Analysis{resume.analyses.length !== 1 ? 'es' : ''}
              </button>

              {expanded && (
                <div className='mt-4 space-y-4'>
                  {resume.analyses.map(analysis => (
                    <AnalysisCard key={analysis.analysisId} analysis={analysis} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CTA for resumes without analyses */}
          {canAnalyze && !hasAnalyses && (
            <div className='mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20'>
              <div className='flex items-start gap-3'>
                <Lightbulb className='w-5 h-5 text-primary mt-0.5' />
                <div className='flex-1'>
                  <p className='font-medium text-sm'>Ready for analysis!</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Click "Analyze" and paste a job description to see how well you match and get personalized improvement tips.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AnalyzeDialog
        open={analyzeOpen}
        onOpenChange={setAnalyzeOpen}
        resumeId={resume.resumeId}
        resumeName={resume.fileName}
        onAnalysisStarted={handleAnalysisStarted}
      />
    </>
  )
}

export function CandidateResumes () {
  const [showUpload, setShowUpload] = useState(false)
  const [newResumeId, setNewResumeId] = useState<string | null>(null)
  const [newResumeName, setNewResumeName] = useState<string>('')
  const [showAnalyzePrompt, setShowAnalyzePrompt] = useState(false)
  const { data, isLoading, refetch } = useCandidateResumes()
  const upload = useCandidateUploadResume()

  const resumes = data?.resumes || []

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return

    try {
      const result = await upload.mutateAsync(files[0])
      toast.success('Resume uploaded successfully!')
      setShowUpload(false)
      setNewResumeId(result.resumeId)
      setNewResumeName(result.fileName)
      // Wait for parsing then prompt for analysis
      setTimeout(() => {
        refetch()
        setShowAnalyzePrompt(true)
      }, 2000)
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
            Upload your resume and analyze it against job descriptions
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
            <CardTitle className='text-lg'>Upload Your Resume</CardTitle>
            <CardDescription>
              Upload your resume (PDF or DOC), then analyze it against any job description to see your match score and get improvement tips.
            </CardDescription>
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
            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
              <FileText className='w-8 h-8 text-primary' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>No resumes yet</h3>
            <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
              Upload your resume to get started. Then analyze it against any job description to see how well you match and get personalized tips.
            </p>
            <Button onClick={() => setShowUpload(true)} size='lg'>
              <Upload className='w-4 h-4 mr-2' />
              Upload Your Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {resumes.map(resume => (
            <ResumeCard key={resume.resumeId} resume={resume} onRefetch={refetch} />
          ))}
        </div>
      )}

      {/* Analyze prompt after upload */}
      {newResumeId && (
        <AnalyzeDialog
          open={showAnalyzePrompt}
          onOpenChange={(open) => {
            setShowAnalyzePrompt(open)
            if (!open) {
              setNewResumeId(null)
              setNewResumeName('')
            }
          }}
          resumeId={newResumeId}
          resumeName={newResumeName}
          onAnalysisStarted={() => {
            setNewResumeId(null)
            setNewResumeName('')
            // Start polling
            const pollInterval = setInterval(() => refetch(), 3000)
            setTimeout(() => clearInterval(pollInterval), 60000)
          }}
        />
      )}

      {/* How it works section */}
      {resumes.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid sm:grid-cols-3 gap-6'>
              <div className='text-center'>
                <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <span className='font-bold text-primary'>1</span>
                </div>
                <h4 className='font-medium mb-1'>Upload Resume</h4>
                <p className='text-sm text-muted-foreground'>
                  Upload your resume in PDF or DOC format
                </p>
              </div>
              <div className='text-center'>
                <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <span className='font-bold text-primary'>2</span>
                </div>
                <h4 className='font-medium mb-1'>Paste Job Description</h4>
                <p className='text-sm text-muted-foreground'>
                  Copy a job description you're interested in
                </p>
              </div>
              <div className='text-center'>
                <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <span className='font-bold text-primary'>3</span>
                </div>
                <h4 className='font-medium mb-1'>Get Insights</h4>
                <p className='text-sm text-muted-foreground'>
                  See your match score and how to improve
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
