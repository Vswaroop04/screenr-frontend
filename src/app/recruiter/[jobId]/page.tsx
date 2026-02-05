'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Play,
  Upload,
  RefreshCw,
  Users,
  CheckCircle,
  Shield,
  Settings,
  Download,
  Lock,
  Search,
  ArrowUpDown,
  LayoutGrid,
  List,
  RotateCcw,
  Star,
  FolderPlus,
  CheckSquare,
  Square,
  X,
  Eye,
  Mail
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { FileUpload } from '@/components/screening/file-upload'
import { CandidateCard } from '@/components/screening/candidate-card'
import { CandidateDetailDialog } from '@/components/screening/candidate-detail-dialog'
import {
  useJob,
  useJobCandidates,
  useUploadResumes,
  useAnalyzeJobResumes,
  useUpdateJobPreferences,
  useRecomputeRanking,
  useReprocessResume,
  useToggleShortlist,
  useBulkShortlist,
  useAssignGroup
} from '@/lib/screening-hooks'
import { exportCandidatesToCSV } from '@/lib/csv-export'
import { useJobSSE } from '@/lib/use-sse'
import type {
  ScoringWeights,
  CustomPreferences,
  Candidate
} from '@/lib/screening-api'
import Loader from '@/components/shared/loader'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { RecruiterLayout } from '@/components/layout/recruiter-layout'
import { toast } from 'sonner'

interface PageProps {
  params: Promise<{ jobId: string }>
}

type SortField = 'name' | 'score' | 'experience' | 'status'
type SortOrder = 'asc' | 'desc'

export default function JobDetailPage ({ params }: PageProps) {
  return (
    <ProtectedRoute requiredRole='recruiter'>
      <RecruiterLayout>
        <JobDetailContent params={params} />
      </RecruiterLayout>
    </ProtectedRoute>
  )
}

function JobDetailContent ({ params }: PageProps) {
  const { jobId } = use(params)
  const { data: job, isLoading: jobLoading } = useJob(jobId)
  const { data: candidatesData, isLoading: candidatesLoading } =
    useJobCandidates(jobId)
  useJobSSE(jobId)
  const uploadResumes = useUploadResumes(jobId)
  const analyzeResumes = useAnalyzeJobResumes(jobId)
  const updatePreferences = useUpdateJobPreferences(jobId)
  const recomputeRanking = useRecomputeRanking(jobId)
  const reprocessResume = useReprocessResume(jobId)
  const toggleShortlist = useToggleShortlist(jobId)
  const bulkShortlist = useBulkShortlist(jobId)
  const assignGroup = useAssignGroup(jobId)

  const [activeTab, setActiveTab] = useState('candidates')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(
    new Set()
  )
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [filterShortlisted, setFilterShortlisted] = useState(false)
  const [filterGroup, setFilterGroup] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  )
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const [weights, setWeights] = useState<ScoringWeights>({
    skills: 0.4,
    experience: 0.25,
    trust: 0.2,
    education: 0.1,
    projects: 0.05
  })
  const [questions, setQuestions] = useState<CustomPreferences['questions']>([])
  const [preferences, setPreferences] = useState<string[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [newQuestionWeight, setNewQuestionWeight] = useState<
    'critical' | 'important' | 'nice_to_have'
  >('important')
  const [newPreference, setNewPreference] = useState('')

  const handleUpload = async (files: File[]) => {
    try {
      const results = await uploadResumes.mutateAsync(files)
      toast.success(`Uploaded ${results.length} resume(s)`)
    } catch {
      toast.error('Failed to upload resumes')
    }
  }

  const handleAnalyze = async () => {
    try {
      const result = await analyzeResumes.mutateAsync()
      toast.success(`Queued ${result.queued} resume(s) for analysis`)
    } catch {
      toast.error('Failed to start analysis')
    }
  }

  const handleReprocess = async (resumeId: string) => {
    try {
      await reprocessResume.mutateAsync(resumeId)
      toast.success('Resume queued for reprocessing')
    } catch {
      toast.error('Failed to reprocess resume')
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleToggleSelect = (resumeId: string) => {
    setSelectedCandidates(prev => {
      const next = new Set(prev)
      if (next.has(resumeId)) {
        next.delete(resumeId)
      } else {
        next.add(resumeId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedCandidates.size === sortedCandidates?.length) {
      setSelectedCandidates(new Set())
    } else {
      setSelectedCandidates(
        new Set(sortedCandidates?.map(c => c.resumeId) || [])
      )
    }
  }

  const handleToggleShortlist = async (resumeId: string, current: boolean) => {
    try {
      await toggleShortlist.mutateAsync({ resumeId, isShortlisted: !current })
    } catch {
      toast.error('Failed to update shortlist')
    }
  }

  const handleBulkShortlist = async () => {
    if (selectedCandidates.size === 0) return
    try {
      await bulkShortlist.mutateAsync({
        resumeIds: Array.from(selectedCandidates),
        isShortlisted: true
      })
      setSelectedCandidates(new Set())
      toast.success(`Shortlisted ${selectedCandidates.size} candidate(s)`)
    } catch {
      toast.error('Failed to shortlist candidates')
    }
  }

  const handleAssignGroup = async () => {
    if (selectedCandidates.size === 0 || !groupName.trim()) return
    try {
      await assignGroup.mutateAsync({
        resumeIds: Array.from(selectedCandidates),
        groupName: groupName.trim()
      })
      setSelectedCandidates(new Set())
      setGroupName('')
      setShowGroupDialog(false)
      toast.success(
        `Assigned ${
          selectedCandidates.size
        } candidate(s) to "${groupName.trim()}"`
      )
    } catch {
      toast.error('Failed to assign group')
    }
  }

  if (jobLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader />
      </div>
    )
  }

  if (!job) {
    return (
      <div className='container mx-auto py-8 px-4'>
        <p>Job not found</p>
      </div>
    )
  }

  const candidates = candidatesData?.candidates || []
  const processedCount = candidates.filter(
    c => c.overallScore !== undefined
  ).length

  // Collect unique group names
  const allGroups = Array.from(
    new Set(candidates.filter(c => c.groupName).map(c => c.groupName!))
  )
  const shortlistedCount = candidates.filter(c => c.isShortlisted).length

  // Filter candidates by search, shortlist, and group
  const filteredCandidates = candidates.filter(c => {
    if (filterShortlisted && !c.isShortlisted) return false
    if (filterGroup && c.groupName !== filterGroup) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (c.candidateName || '').toLowerCase().includes(q) ||
      (c.candidateEmail || '').toLowerCase().includes(q) ||
      (c.fileName || '').toLowerCase().includes(q) ||
      (c.predictedRoles || []).some(r => r.toLowerCase().includes(q))
    )
  })

  // Sort filtered candidates
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case 'name':
        comparison = (a.candidateName || '').localeCompare(
          b.candidateName || ''
        )
        break
      case 'score':
        comparison = (a.overallScore || 0) - (b.overallScore || 0)
        break
      case 'experience':
        comparison =
          (a.totalYearsExperience || 0) - (b.totalYearsExperience || 0)
        break
      case 'status':
        comparison = (a.status || '').localeCompare(b.status || '')
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  // Split candidates by recommendation (for card view)
  const strongMatches = sortedCandidates.filter(
    c => c.recommendation === 'strong_yes' || c.recommendation === 'yes'
  )
  const maybeMatches = sortedCandidates.filter(
    c => c.recommendation === 'maybe'
  )
  const weakMatches = sortedCandidates.filter(
    c => c.recommendation === 'no' || c.recommendation === 'strong_no'
  )
  const pending = sortedCandidates.filter(c => c.overallScore === undefined)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-semibold'
    if (score >= 60) return 'text-blue-600 font-semibold'
    if (score >= 40) return 'text-orange-600 font-semibold'
    return 'text-red-600 font-semibold'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'analyzed':
        return <Badge variant='success'>Analyzed</Badge>
      case 'parsed':
        return <Badge variant='secondary'>Parsed</Badge>
      case 'parsing':
      case 'analyzing':
        return <Badge variant='warning'>Processing</Badge>
      case 'failed':
        return <Badge variant='destructive'>Failed</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      {/* Header */}
      <div className='mb-6'>
        <Link
          href='/recruiter'
          className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Jobs
        </Link>
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>{job.title}</h1>
            <div className='flex items-center gap-2 mt-1'>
              {job.company && (
                <span className='text-muted-foreground'>{job.company}</span>
              )}
              {job.location && (
                <>
                  <span className='text-muted-foreground'>•</span>
                  <span className='text-muted-foreground'>{job.location}</span>
                </>
              )}
            </div>
          </div>
          <div className='flex gap-2'>
            {candidates.length > 0 && (
              <Button
                variant='default'
                onClick={() => setActiveTab('upload')}
                size='sm'
              >
                <Upload className='mr-2 h-4 w-4' />
                Upload More
              </Button>
            )}
            <Button
              variant='outline'
              onClick={async () => {
                try {
                  await recomputeRanking.mutateAsync(undefined)
                  toast.success('Re-ranking queued for all candidates')
                } catch {
                  toast.error('Failed to re-rank')
                }
              }}
              disabled={recomputeRanking.isPending || processedCount === 0}
              size='sm'
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  recomputeRanking.isPending ? 'animate-spin' : ''
                }`}
              />
              Re-rank All
            </Button>
            <Button
              variant='outline'
              onClick={() => exportCandidatesToCSV(candidates, job.title)}
              disabled={candidates.length === 0}
              size='sm'
            >
              <Download className='mr-2 h-4 w-4' />
              CSV
            </Button>
            <Button
              variant='outline'
              onClick={handleAnalyze}
              disabled={analyzeResumes.isPending || candidates.length === 0}
            >
              {analyzeResumes.isPending ? (
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Play className='mr-2 h-4 w-4' />
              )}
              Analyze All
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-4 mb-6'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Users className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='text-2xl font-bold'>{candidates.length}</p>
                <p className='text-sm text-muted-foreground'>Total Resumes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-500' />
              <div>
                <p className='text-2xl font-bold'>{processedCount}</p>
                <p className='text-sm text-muted-foreground'>Analyzed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Badge variant='success' className='h-5'>
                {strongMatches.length}
              </Badge>
              <div>
                <p className='text-sm text-muted-foreground'>Strong Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-blue-500' />
              <div>
                <p className='text-2xl font-bold'>
                  {processedCount > 0
                    ? Math.round(
                        candidates
                          .filter(c => c.trustScore !== undefined)
                          .reduce((sum, c) => sum + (c.trustScore || 0), 0) /
                          Math.max(
                            1,
                            candidates.filter(c => c.trustScore !== undefined)
                              .length
                          )
                      )
                    : '—'}
                </p>
                <p className='text-sm text-muted-foreground'>Avg Trust Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Required Skills */}
      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <Card className='mb-6'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Required Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {job.requiredSkills.map((skill, i) => (
                <Badge key={i} variant='secondary'>
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList>
          <TabsTrigger value='candidates'>Candidates</TabsTrigger>
          <TabsTrigger value='analytics' disabled>
            <Lock className='mr-1.5 h-4 w-4' />
            Analytics (Locked)
          </TabsTrigger>
          <TabsTrigger value='upload'>Upload Resumes</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
          <TabsTrigger value='jd'>Job Description</TabsTrigger>
        </TabsList>

        <TabsContent value='candidates' className='space-y-4'>
          {/* Search, Filters, and View Toggle */}
          <div className='flex items-center justify-between gap-4'>
            <div className='relative flex-1 max-w-md'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by name, email, or role...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant={filterShortlisted ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterShortlisted(!filterShortlisted)}
              >
                <Star
                  className={`h-4 w-4 mr-1 ${
                    filterShortlisted ? 'fill-current' : ''
                  }`}
                />
                Shortlisted ({shortlistedCount})
              </Button>
              {allGroups.length > 0 && (
                <select
                  value={filterGroup || ''}
                  onChange={e => setFilterGroup(e.target.value || null)}
                  className='border rounded px-2 py-1.5 text-sm bg-background'
                >
                  <option value=''>All Groups</option>
                  {allGroups.map(g => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              )}
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('card')}
              >
                <LayoutGrid className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('table')}
              >
                <List className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedCandidates.size > 0 && (
            <div className='flex items-center gap-3 p-3 bg-muted rounded-lg'>
              <span className='text-sm font-medium'>
                {selectedCandidates.size} selected
              </span>
              <Button
                size='sm'
                variant='default'
                onClick={async () => {
                  try {
                    const selectedIds = Array.from(selectedCandidates)
                    await recomputeRanking.mutateAsync(selectedIds)
                    toast.success(
                      `Re-ranking queued for ${selectedIds.length} candidate(s)`
                    )
                  } catch {
                    toast.error('Failed to re-rank selected candidates')
                  }
                }}
                disabled={recomputeRanking.isPending}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 mr-1 ${
                    recomputeRanking.isPending ? 'animate-spin' : ''
                  }`}
                />
                Rank Selected
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={handleBulkShortlist}
                disabled={bulkShortlist.isPending}
              >
                <Star className='h-3.5 w-3.5 mr-1' />
                Shortlist
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => setShowGroupDialog(true)}
              >
                <FolderPlus className='h-3.5 w-3.5 mr-1' />
                Assign Group
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => setSelectedCandidates(new Set())}
              >
                <X className='h-3.5 w-3.5 mr-1' />
                Clear
              </Button>
            </div>
          )}

          {/* Group Assignment Dialog */}
          {showGroupDialog && (
            <div className='flex items-center gap-3 p-3 border rounded-lg bg-background'>
              <Input
                placeholder='Group name (e.g., Round 2, Technical Interview)'
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                className='max-w-sm'
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAssignGroup()
                }}
              />
              {allGroups.length > 0 && (
                <div className='flex gap-1'>
                  {allGroups.map(g => (
                    <Button
                      key={g}
                      variant='outline'
                      size='sm'
                      onClick={() => setGroupName(g)}
                    >
                      {g}
                    </Button>
                  ))}
                </div>
              )}
              <Button
                size='sm'
                onClick={handleAssignGroup}
                disabled={!groupName.trim() || assignGroup.isPending}
              >
                Assign
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => {
                  setShowGroupDialog(false)
                  setGroupName('')
                }}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Processing Progress Indicator */}
          {(() => {
            const processingCandidates = candidates.filter(
              c =>
                c.status === 'uploaded' ||
                c.status === 'parsing' ||
                c.status === 'analyzing'
            )
            const totalCandidates = candidates.length
            const completedCandidates = candidates.filter(
              c => c.status === 'analyzed' || c.status === 'parsed'
            ).length
            const failedCandidates = candidates.filter(
              c => c.status === 'failed'
            ).length
            const progressPercent =
              totalCandidates > 0
                ? Math.round((completedCandidates / totalCandidates) * 100)
                : 0

            if (processingCandidates.length > 0) {
              return (
                <Card className='mb-4 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30'>
                  <CardContent className='py-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        <RefreshCw className='h-4 w-4 animate-spin text-blue-600' />
                        <span className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                          Processing resumes...
                        </span>
                      </div>
                      <span className='text-sm text-blue-700 dark:text-blue-300'>
                        {completedCandidates} of {totalCandidates} completed (
                        {progressPercent}%)
                        {failedCandidates > 0 && (
                          <span className='text-red-600 ml-2'>
                            • {failedCandidates} failed
                          </span>
                        )}
                      </span>
                    </div>
                    <div className='w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className='mt-2 text-xs text-blue-600 dark:text-blue-400'>
                      Currently processing:{' '}
                      {processingCandidates
                        .slice(0, 3)
                        .map(c => c.candidateName || c.fileName)
                        .join(', ')}
                      {processingCandidates.length > 3 &&
                        ` and ${processingCandidates.length - 3} more`}
                    </div>
                  </CardContent>
                </Card>
              )
            }
            return null
          })()}

          {candidatesLoading ? (
            <div className='flex justify-center py-8'>
              <Loader />
            </div>
          ) : candidates.length === 0 ? (
            <Card className='border-dashed'>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <Upload className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>No resumes yet</h3>
                <p className='text-muted-foreground text-center mb-4'>
                  Upload resumes to start screening candidates
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  <Upload className='mr-2 h-4 w-4' />
                  Upload Resumes
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'table' ? (
            /* Table View */
            <Card>
              <CardContent className='pt-6'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-10'>
                        <button onClick={handleSelectAll} className='p-1'>
                          {selectedCandidates.size ===
                            sortedCandidates.length &&
                          sortedCandidates.length > 0 ? (
                            <CheckSquare className='h-4 w-4' />
                          ) : (
                            <Square className='h-4 w-4 text-muted-foreground' />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className='w-10'></TableHead>
                      <TableHead>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleSort('name')}
                          className='flex items-center gap-1'
                        >
                          Name
                          <ArrowUpDown className='h-3 w-3' />
                        </Button>
                      </TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleSort('score')}
                          className='flex items-center gap-1'
                        >
                          Score
                          <ArrowUpDown className='h-3 w-3' />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleSort('experience')}
                          className='flex items-center gap-1'
                        >
                          Experience
                          <ArrowUpDown className='h-3 w-3' />
                        </Button>
                      </TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleSort('status')}
                          className='flex items-center gap-1'
                        >
                          Status
                          <ArrowUpDown className='h-3 w-3' />
                        </Button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCandidates.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={11}
                          className='text-center py-8 text-muted-foreground'
                        >
                          No candidates match your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedCandidates.map(candidate => (
                        <TableRow
                          key={candidate.resumeId}
                          className={`cursor-pointer hover:bg-muted/30 ${
                            selectedCandidates.has(candidate.resumeId)
                              ? 'bg-muted/50'
                              : ''
                          }`}
                          onClick={() => {
                            setSelectedCandidate(candidate)
                            setDetailDialogOpen(true)
                          }}
                        >
                          <TableCell>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleToggleSelect(candidate.resumeId)
                              }}
                              className='p-1'
                            >
                              {selectedCandidates.has(candidate.resumeId) ? (
                                <CheckSquare className='h-4 w-4' />
                              ) : (
                                <Square className='h-4 w-4 text-muted-foreground' />
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleToggleShortlist(
                                  candidate.resumeId,
                                  !!candidate.isShortlisted
                                )
                              }}
                              className='p-1 hover:scale-110 transition-transform'
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  candidate.isShortlisted
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className='font-medium'>
                              {candidate.candidateName || 'Unknown'}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              {candidate.fileName}
                            </div>
                          </TableCell>
                          <TableCell className='text-sm'>
                            {candidate.candidateEmail || '—'}
                          </TableCell>
                          <TableCell>
                            {candidate.overallScore !== undefined ? (
                              <span
                                className={getScoreColor(
                                  candidate.overallScore
                                )}
                              >
                                {Math.round(candidate.overallScore)}%
                              </span>
                            ) : (
                              <span className='text-muted-foreground'>—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {candidate.totalYearsExperience !== undefined
                              ? `${candidate.totalYearsExperience} yrs`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {candidate.recommendation ? (
                              <Badge
                                variant={
                                  candidate.recommendation === 'strong_yes' ||
                                  candidate.recommendation === 'yes'
                                    ? 'success'
                                    : candidate.recommendation === 'maybe'
                                    ? 'warning'
                                    : 'destructive'
                                }
                              >
                                {candidate.recommendation.replace('_', ' ')}
                              </Badge>
                            ) : (
                              <span className='text-muted-foreground'>—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {candidate.groupName ? (
                              <Badge variant='outline'>
                                {candidate.groupName}
                              </Badge>
                            ) : (
                              <span className='text-muted-foreground'>—</span>
                            )}
                          </TableCell>
                          <TableCell className='text-xs text-muted-foreground'>
                            {candidate.uploadedAt
                              ? new Date(candidate.uploadedAt).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }
                                )
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(candidate.status)}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-1'>
                              {candidate.status === 'failed' ? (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleReprocess(candidate.resumeId)
                                  }}
                                  disabled={reprocessResume.isPending}
                                >
                                  <RotateCcw className='h-3 w-3 mr-1' />
                                  Reprocess
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={async e => {
                                      e.stopPropagation()
                                      try {
                                        const { downloadUrl } = await import('@/lib/screening-api').then(m => m.recruiterAPI.getResumeDownloadUrl(candidate.resumeId))
                                        window.open(downloadUrl, '_blank')
                                      } catch {
                                        toast.error('Failed to load resume')
                                      }
                                    }}
                                    title='View Resume'
                                  >
                                    <Eye className='h-4 w-4' />
                                  </Button>
                                  {candidate.candidateEmail && (
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={e => {
                                        e.stopPropagation()
                                        window.location.href = `mailto:${candidate.candidateEmail}`
                                      }}
                                      title='Contact'
                                    >
                                      <Mail className='h-4 w-4' />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            /* Card View */
            <>
              {strongMatches.length > 0 && (
                <div>
                  <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                    <Badge variant='success'>Strong Matches</Badge>
                    <span className='text-muted-foreground font-normal'>
                      ({strongMatches.length})
                    </span>
                  </h3>
                  <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {strongMatches.map((candidate, i) => (
                      <CandidateCard
                        key={candidate.resumeId}
                        candidate={candidate}
                        rank={i + 1}
                        onClick={() => {
                          setSelectedCandidate(candidate)
                          setDetailDialogOpen(true)
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {maybeMatches.length > 0 && (
                <div>
                  <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                    <Badge variant='warning'>Maybe</Badge>
                    <span className='text-muted-foreground font-normal'>
                      ({maybeMatches.length})
                    </span>
                  </h3>
                  <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {maybeMatches.map(candidate => (
                      <CandidateCard
                        key={candidate.resumeId}
                        candidate={candidate}
                        onClick={() => {
                          setSelectedCandidate(candidate)
                          setDetailDialogOpen(true)
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {weakMatches.length > 0 && (
                <div>
                  <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                    <Badge variant='destructive'>Not Recommended</Badge>
                    <span className='text-muted-foreground font-normal'>
                      ({weakMatches.length})
                    </span>
                  </h3>
                  <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {weakMatches.map(candidate => (
                      <CandidateCard
                        key={candidate.resumeId}
                        candidate={candidate}
                        onClick={() => {
                          setSelectedCandidate(candidate)
                          setDetailDialogOpen(true)
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pending.length > 0 && (
                <div>
                  <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                    <Badge variant='outline'>Pending Analysis</Badge>
                    <span className='text-muted-foreground font-normal'>
                      ({pending.length})
                    </span>
                  </h3>
                  <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {pending.map(candidate => (
                      <div key={candidate.resumeId}>
                        <CandidateCard
                          candidate={candidate}
                          onClick={() => {
                            setSelectedCandidate(candidate)
                            setDetailDialogOpen(true)
                          }}
                        />
                        {candidate.status === 'failed' && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='mt-2 w-full'
                            onClick={() => handleReprocess(candidate.resumeId)}
                            disabled={reprocessResume.isPending}
                          >
                            <RotateCcw className='h-3 w-3 mr-1' />
                            Reprocess
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value='analytics'>
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <Lock className='h-12 w-12 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Analytics Locked</h3>
              <p className='text-muted-foreground text-center'>
                Analytics features are coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='upload'>
          <Card>
            <CardHeader>
              <CardTitle>Upload Resumes</CardTitle>
              <CardDescription>
                Upload PDF or DOC files. They will be automatically parsed and
                queued for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesSelected={handleUpload}
                isUploading={uploadResumes.isPending}
                maxFiles={100}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='space-y-4'>
          {/* Scoring Weights */}
          <Card>
            <CardHeader>
              <CardTitle>Scoring Weights</CardTitle>
              <CardDescription>
                Adjust how each dimension contributes to the overall score.
                Weights must sum to 100%.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex gap-2 mb-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setWeights({
                      skills: 0.4,
                      experience: 0.25,
                      trust: 0.2,
                      education: 0.1,
                      projects: 0.05
                    })
                  }
                >
                  Default
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setWeights({
                      skills: 0.3,
                      experience: 0.3,
                      trust: 0.25,
                      education: 0.05,
                      projects: 0.1
                    })
                  }
                >
                  Senior
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setWeights({
                      skills: 0.45,
                      experience: 0.1,
                      trust: 0.15,
                      education: 0.2,
                      projects: 0.1
                    })
                  }
                >
                  Junior
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setWeights({
                      skills: 0.35,
                      experience: 0.05,
                      trust: 0.1,
                      education: 0.35,
                      projects: 0.15
                    })
                  }
                >
                  Internship
                </Button>
              </div>
              {(
                [
                  'skills',
                  'experience',
                  'trust',
                  'education',
                  'projects'
                ] as const
              ).map(key => (
                <div key={key} className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <Label className='capitalize'>{key}</Label>
                    <span className='text-sm text-muted-foreground'>
                      {Math.round(weights[key] * 100)}%
                    </span>
                  </div>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={Math.round(weights[key] * 100)}
                    onChange={e => {
                      const val = parseInt(e.target.value) / 100
                      setWeights(prev => ({ ...prev, [key]: val }))
                    }}
                    className='w-full'
                  />
                </div>
              ))}
              <p
                className={`text-sm ${
                  Math.abs(
                    Object.values(weights).reduce((a, b) => a + b, 0) - 1
                  ) > 0.01
                    ? 'text-red-500'
                    : 'text-muted-foreground'
                }`}
              >
                Total:{' '}
                {Math.round(
                  Object.values(weights).reduce((a, b) => a + b, 0) * 100
                )}
                %
                {Math.abs(
                  Object.values(weights).reduce((a, b) => a + b, 0) - 1
                ) > 0.01 && ' (must equal 100%)'}
              </p>
            </CardContent>
          </Card>

          {/* Custom Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Screening Questions</CardTitle>
              <CardDescription>
                Add questions the AI will evaluate from resumes.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {questions.map((q, i) => (
                <div key={i} className='flex items-center gap-2'>
                  <Badge variant='outline' className='shrink-0'>
                    {q.weight}
                  </Badge>
                  <span className='text-sm flex-1'>{q.question}</span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      setQuestions(prev => prev.filter((_, j) => j !== i))
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className='flex gap-2'>
                <Input
                  placeholder='e.g., Does candidate have leadership experience?'
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  className='flex-1'
                />
                <select
                  value={newQuestionWeight}
                  onChange={e => setNewQuestionWeight(e.target.value as any)}
                  className='border rounded px-2 text-sm'
                >
                  <option value='critical'>Critical</option>
                  <option value='important'>Important</option>
                  <option value='nice_to_have'>Nice to Have</option>
                </select>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    if (newQuestion.trim()) {
                      setQuestions(prev => [
                        ...prev,
                        {
                          question: newQuestion.trim(),
                          weight: newQuestionWeight
                        }
                      ])
                      setNewQuestion('')
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Preferences</CardTitle>
              <CardDescription>
                Add preferences the AI should consider when analyzing resumes.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {preferences.map((pref, i) => (
                <div key={i} className='flex items-center gap-2'>
                  <span className='text-sm flex-1'>{pref}</span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      setPreferences(prev => prev.filter((_, j) => j !== i))
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className='flex gap-2'>
                <Input
                  placeholder='e.g., Prefer candidates with remote work experience'
                  value={newPreference}
                  onChange={e => setNewPreference(e.target.value)}
                  className='flex-1'
                />
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    if (newPreference.trim()) {
                      setPreferences(prev => [...prev, newPreference.trim()])
                      setNewPreference('')
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save & Re-rank */}
          <div className='flex gap-2'>
            <Button
              onClick={async () => {
                try {
                  await updatePreferences.mutateAsync({
                    scoringWeights: weights,
                    customPreferences:
                      questions.length > 0 || preferences.length > 0
                        ? { questions, preferences }
                        : undefined
                  })
                  toast.success('Preferences saved')
                } catch {
                  toast.error('Failed to save preferences')
                }
              }}
              disabled={
                updatePreferences.isPending ||
                Math.abs(
                  Object.values(weights).reduce((a, b) => a + b, 0) - 1
                ) > 0.01
              }
            >
              {updatePreferences.isPending ? (
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Settings className='mr-2 h-4 w-4' />
              )}
              Save Preferences
            </Button>
            <Button
              variant='outline'
              onClick={async () => {
                try {
                  await updatePreferences.mutateAsync({
                    scoringWeights: weights,
                    customPreferences:
                      questions.length > 0 || preferences.length > 0
                        ? { questions, preferences }
                        : undefined
                  })
                  await recomputeRanking.mutateAsync(undefined)
                  toast.success('Saved & re-ranking queued')
                } catch {
                  toast.error('Failed')
                }
              }}
              disabled={
                updatePreferences.isPending ||
                recomputeRanking.isPending ||
                processedCount === 0
              }
            >
              Save & Re-rank
            </Button>
          </div>
        </TabsContent>

        <TabsContent value='jd'>
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='prose prose-sm max-w-none dark:prose-invert'>
                <pre className='whitespace-pre-wrap font-sans text-sm'>
                  {job.description}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Candidate Detail Dialog */}
      <CandidateDetailDialog
        candidate={selectedCandidate}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  )
}
