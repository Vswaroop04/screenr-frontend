'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScoreCircle, TrustBadge } from './score-display'
import type { Candidate, VerixConversationDetail } from '@/lib/screening-api'
import { verixRecruiterAPI } from '@/lib/screening-api'
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  CheckCircle,
  XCircle,
  FileText,
  Shield,
  Target,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Zap,
  BarChart3,
  Clock,
  ArrowRightLeft,
  Info,
  Activity,
  GraduationCap,
  Code,
  Award,
  ExternalLink,
  Bot,
  Loader2,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CandidateDetailDialogProps {
  candidate: Candidate | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Collapsible section component
function CollapsibleSection ({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  badge
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string | number
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className='border rounded-xl bg-card'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center gap-3 p-4 text-sm font-medium hover:bg-muted/50 transition-colors rounded-xl'
      >
        <div className='p-2 rounded-lg bg-primary/10'>
          <Icon className='h-4 w-4 text-primary' />
        </div>
        <span className='flex-1 text-left'>{title}</span>
        {badge !== undefined && (
          <Badge variant='secondary' className='mr-2'>
            {badge}
          </Badge>
        )}
        {isOpen ? (
          <ChevronDown className='h-4 w-4 text-muted-foreground' />
        ) : (
          <ChevronRight className='h-4 w-4 text-muted-foreground' />
        )}
      </button>
      {isOpen && (
        <div className='px-4 pb-4 border-t pt-4 bg-muted/20'>{children}</div>
      )}
    </div>
  )
}

// Confidence badge
function ConfidenceBadge ({
  level
}: {
  level: 'high' | 'medium' | 'low' | 'none'
}) {
  const config = {
    high: { bg: 'bg-green-100 text-green-800 border-green-200', label: 'High' },
    medium: {
      bg: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Medium'
    },
    low: {
      bg: 'bg-orange-100 text-orange-800 border-orange-200',
      label: 'Low'
    },
    none: { bg: 'bg-red-100 text-red-800 border-red-200', label: 'None' }
  }
  const c = config[level]
  return (
    <span
      className={cn(
        'text-[10px] px-2 py-0.5 rounded-full font-medium border',
        c.bg
      )}
    >
      {c.label}
    </span>
  )
}

// Score card component
function ScoreCard ({
  label,
  score,
  weight,
  icon: Icon
}: {
  label: string
  score: number
  weight: number
  icon: React.ElementType
}) {
  const color =
    score >= 80
      ? 'text-green-600'
      : score >= 60
      ? 'text-blue-600'
      : score >= 40
      ? 'text-amber-600'
      : 'text-red-600'
  const bgColor =
    score >= 80
      ? 'bg-green-500'
      : score >= 60
      ? 'bg-blue-500'
      : score >= 40
      ? 'bg-amber-500'
      : 'bg-red-500'

  return (
    <div className='bg-card border rounded-xl p-4 space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>{label}</span>
        </div>
        <span className='text-xs text-muted-foreground'>{weight}%</span>
      </div>
      <div className='flex items-center gap-3'>
        <div className='flex-1'>
          <Progress value={score} className='h-2' />
        </div>
        <span className={cn('text-lg font-bold', color)}>{score}%</span>
      </div>
    </div>
  )
}

// Progress bar helper
function MiniBar ({
  value,
  max = 100,
  color
}: {
  value: number
  max?: number
  color?: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  const barColor =
    color ||
    (pct >= 80
      ? 'bg-green-500'
      : pct >= 60
      ? 'bg-blue-500'
      : pct >= 40
      ? 'bg-amber-500'
      : 'bg-red-500')
  return (
    <div className='h-2 w-full bg-secondary rounded-full overflow-hidden'>
      <div
        className={cn('h-full rounded-full transition-all', barColor)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function CandidateDetailDialog ({
  candidate,
  open,
  onOpenChange
}: CandidateDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [verixDetail, setVerixDetail] =
    useState<VerixConversationDetail | null>(null)
  const [verixLoading, setVerixLoading] = useState(false)

  useEffect(() => {
    if (open && candidate?.verixConversationId) {
      setVerixLoading(true)
      verixRecruiterAPI
        .getConversationDetail(candidate.verixConversationId)
        .then(setVerixDetail)
        .catch(() => setVerixDetail(null))
        .finally(() => setVerixLoading(false))
    } else {
      setVerixDetail(null)
    }
  }, [open, candidate?.verixConversationId])

  if (!candidate) return null

  const isProcessed = candidate.overallScore !== undefined

  const getRecommendationConfig = (rec?: string) => {
    switch (rec) {
      case 'strong_yes':
        return {
          variant: 'default' as const,
          label: 'Strong Yes',
          className: 'bg-green-600 hover:bg-green-700'
        }
      case 'yes':
        return {
          variant: 'default' as const,
          label: 'Yes',
          className: 'bg-green-500 hover:bg-green-600'
        }
      case 'maybe':
        return {
          variant: 'default' as const,
          label: 'Maybe',
          className: 'bg-amber-500 hover:bg-amber-600'
        }
      case 'no':
        return {
          variant: 'default' as const,
          label: 'No',
          className: 'bg-red-500 hover:bg-red-600'
        }
      case 'strong_no':
        return {
          variant: 'default' as const,
          label: 'Strong No',
          className: 'bg-red-600 hover:bg-red-700'
        }
      default:
        return { variant: 'outline' as const, label: 'Pending', className: '' }
    }
  }

  const formatBadge = (badge: string) =>
    badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const recConfig = getRecommendationConfig(candidate.recommendation)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0'>
        {/* Header */}
        <div className='border-b bg-gradient-to-r from-muted/60 via-muted/30 to-transparent p-6'>
          <DialogHeader>
            <div className='flex items-start justify-between gap-6'>
              <div className='flex-1'>
                <DialogTitle className='text-2xl flex items-center gap-4'>
                  <div className='h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm'>
                    <span className='text-lg font-bold text-primary'>
                      {(candidate.candidateName || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className='tracking-tight'>
                      {candidate.candidateName || 'Unknown Candidate'}
                    </span>
                    {candidate.rankPosition && (
                      <Badge
                        variant='outline'
                        className='ml-3 text-xs font-medium'
                      >
                        #{candidate.rankPosition}
                        {candidate.percentile && (
                          <span className='text-muted-foreground ml-1'>
                            · Top {100 - candidate.percentile + 1}%
                          </span>
                        )}
                      </Badge>
                    )}
                  </div>
                </DialogTitle>
                <DialogDescription className='flex flex-wrap items-center gap-4 mt-3 ml-16'>
                  {candidate.candidateEmail && (
                    <span className='flex items-center gap-1.5 text-sm'>
                      <Mail className='h-3.5 w-3.5' />
                      {candidate.candidateEmail}
                    </span>
                  )}
                  {candidate.parsedLocation &&
                    (candidate.parsedLocation.city ||
                      candidate.parsedLocation.country) && (
                      <span className='flex items-center gap-1.5 text-sm'>
                        <MapPin className='h-3.5 w-3.5' />
                        {[
                          candidate.parsedLocation.city,
                          candidate.parsedLocation.state,
                          candidate.parsedLocation.country
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    )}
                  {candidate.totalYearsExperience !== undefined && (
                    <span className='flex items-center gap-1.5 text-sm'>
                      <Briefcase className='h-3.5 w-3.5' />
                      {candidate.totalYearsExperience} years experience
                    </span>
                  )}
                </DialogDescription>
              </div>
              {isProcessed && (
                <div className='flex items-center gap-3'>
                  <Badge
                    className={cn(
                      'text-sm px-4 py-2 shadow-sm',
                      recConfig.className
                    )}
                  >
                    {recConfig.label}
                  </Badge>
                  <ScoreCircle
                    score={Math.round(candidate.overallScore!)}
                    size={90}
                    label='Score'
                  />
                </div>
              )}
            </div>
          </DialogHeader>
        </div>

        {!isProcessed ? (
          <div className='flex-1 flex flex-col items-center justify-center py-16 text-muted-foreground'>
            <FileText className='h-16 w-16 mb-4' />
            <p className='text-lg font-medium'>Not Analyzed Yet</p>
            <p className='text-sm'>
              Status: <Badge variant='outline'>{candidate.status}</Badge>
            </p>
          </div>
        ) : (
          <>
            {/* Trust Badges Bar */}
            {candidate.trustBadges && candidate.trustBadges.length > 0 && (
              <div className='border-b px-6 py-3 bg-blue-50/50 flex items-center gap-2 flex-wrap'>
                <Shield className='h-4 w-4 text-blue-600' />
                <span className='text-xs font-medium text-blue-700 mr-2'>
                  Verified:
                </span>
                {candidate.trustBadges.map((badge, i) => (
                  <Badge
                    key={i}
                    variant='outline'
                    className='text-[10px] bg-white text-blue-700 border-blue-200'
                  >
                    {formatBadge(badge)}
                  </Badge>
                ))}
              </div>
            )}

            {/* Score Confidence Banner */}
            {candidate.scoreConfidence && (
              <div
                className={cn(
                  'px-6 py-3 text-sm flex items-center gap-3 border-b',
                  candidate.scoreConfidence.level === 'high'
                    ? 'bg-green-50 text-green-800'
                    : candidate.scoreConfidence.level === 'medium'
                    ? 'bg-yellow-50 text-yellow-800'
                    : 'bg-orange-50 text-orange-800'
                )}
              >
                <Info className='h-4 w-4 shrink-0' />
                <div className='flex-1'>
                  <span className='font-medium'>
                    {candidate.scoreConfidence.level === 'high'
                      ? 'High Confidence Analysis'
                      : candidate.scoreConfidence.level === 'medium'
                      ? 'Moderate Confidence'
                      : 'Limited Data Available'}
                  </span>
                  <span className='mx-2'>·</span>
                  <span className='text-xs opacity-80'>
                    {candidate.scoreConfidence.dataSourceCount} data source
                    {candidate.scoreConfidence.dataSourceCount !== 1
                      ? 's'
                      : ''}{' '}
                    analyzed
                  </span>
                </div>
                {candidate.scoreConfidence.improvementCta && (
                  <span className='text-xs font-medium'>
                    {candidate.scoreConfidence.improvementCta}
                  </span>
                )}
              </div>
            )}

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='flex-1 flex flex-col overflow-hidden'
            >
              <div className='border-b px-6'>
                <TabsList className='h-12 bg-transparent'>
                  <TabsTrigger
                    value='overview'
                    className='data-[state=active]:bg-muted'
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value='skills'
                    className='data-[state=active]:bg-muted'
                  >
                    Skills Analysis
                  </TabsTrigger>
                  <TabsTrigger
                    value='experience'
                    className='data-[state=active]:bg-muted'
                  >
                    Experience
                  </TabsTrigger>
                  <TabsTrigger
                    value='insights'
                    className='data-[state=active]:bg-muted'
                  >
                    AI Insights
                  </TabsTrigger>
                  {candidate.verixConversationId && (
                    <TabsTrigger
                      value='verix'
                      className='data-[state=active]:bg-muted'
                    >
                      <Bot className='h-3.5 w-3.5 mr-1.5' />
                      Verix
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <div className='flex-1 overflow-y-auto p-6'>
                {/* Overview Tab */}
                <TabsContent value='overview' className='mt-0 space-y-6'>
                  {/* Score Cards Grid */}
                  <div className='grid grid-cols-5 gap-4'>
                    <ScoreCard
                      label='Skills'
                      score={candidate.skillsScore || 0}
                      weight={40}
                      icon={Code}
                    />
                    <ScoreCard
                      label='Experience'
                      score={candidate.experienceScore || 0}
                      weight={25}
                      icon={Briefcase}
                    />
                    <ScoreCard
                      label='Education'
                      score={candidate.educationScore || 0}
                      weight={10}
                      icon={GraduationCap}
                    />
                    <ScoreCard
                      label='Projects'
                      score={candidate.projectScore || 0}
                      weight={5}
                      icon={Target}
                    />
                    <ScoreCard
                      label='Trust'
                      score={candidate.trustScore || 0}
                      weight={20}
                      icon={Shield}
                    />
                  </div>

                  {/* Skill Match */}
                  {candidate.skillMatch && (
                    <div className='border rounded-xl p-5 space-y-4'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold flex items-center gap-2'>
                          <CheckCircle className='h-5 w-5 text-green-600' />
                          Skill Match
                        </h3>
                        <Badge variant='secondary' className='text-lg px-3'>
                          {candidate.skillMatch.matchPercentage}%
                        </Badge>
                      </div>
                      <div className='grid grid-cols-3 gap-4'>
                        {candidate.skillMatch.matched.length > 0 && (
                          <div className='space-y-2'>
                            <p className='text-xs font-medium text-green-700'>
                              Matched ({candidate.skillMatch.matched.length})
                            </p>
                            <div className='flex flex-wrap gap-1.5'>
                              {candidate.skillMatch.matched.map((s, i) => (
                                <Badge
                                  key={i}
                                  variant='secondary'
                                  className='text-xs bg-green-100 text-green-800 border-green-200'
                                >
                                  {s.skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {candidate.skillMatch.partial.length > 0 && (
                          <div className='space-y-2'>
                            <p className='text-xs font-medium text-amber-700'>
                              Partial ({candidate.skillMatch.partial.length})
                            </p>
                            <div className='flex flex-wrap gap-1.5'>
                              {candidate.skillMatch.partial.map((s, i) => (
                                <Badge
                                  key={i}
                                  variant='outline'
                                  className='text-xs text-amber-700 border-amber-300'
                                >
                                  {s.skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {candidate.skillMatch.missing.length > 0 && (
                          <div className='space-y-2'>
                            <p className='text-xs font-medium text-red-700'>
                              Missing ({candidate.skillMatch.missing.length})
                            </p>
                            <div className='flex flex-wrap gap-1.5'>
                              {candidate.skillMatch.missing.map((s, i) => (
                                <Badge
                                  key={i}
                                  variant='outline'
                                  className='text-xs text-red-600 border-red-300'
                                >
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Strengths & Concerns */}
                  <div className='grid grid-cols-2 gap-4'>
                    {candidate.strengths && candidate.strengths.length > 0 && (
                      <div className='border rounded-xl p-5 space-y-3'>
                        <h3 className='font-semibold flex items-center gap-2 text-green-700'>
                          <TrendingUp className='h-5 w-5' />
                          Strengths
                        </h3>
                        <ul className='space-y-2'>
                          {candidate.strengths.map((s, i) => (
                            <li
                              key={i}
                              className='text-sm flex items-start gap-2'
                            >
                              <span className='text-green-500 mt-1'>+</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {candidate.concerns && candidate.concerns.length > 0 && (
                      <div className='border rounded-xl p-5 space-y-3'>
                        <h3 className='font-semibold flex items-center gap-2 text-amber-700'>
                          <AlertTriangle className='h-5 w-5' />
                          Concerns
                        </h3>
                        <ul className='space-y-2'>
                          {candidate.concerns.map((c, i) => (
                            <li
                              key={i}
                              className='text-sm flex items-start gap-2'
                            >
                              <span className='text-amber-500 mt-1'>-</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Ranking Explanation */}
                  {candidate.explanation && (
                    <div className='border rounded-xl p-5 space-y-3'>
                      <h3 className='font-semibold flex items-center gap-2'>
                        <Info className='h-5 w-5 text-blue-600' />
                        Ranking Explanation
                      </h3>
                      <div className='grid grid-cols-2 gap-4'>
                        {candidate.explanation.whyRankedHigh?.length > 0 && (
                          <div className='space-y-2'>
                            {candidate.explanation.whyRankedHigh.map((r, i) => (
                              <div
                                key={i}
                                className='text-sm text-green-700 flex items-start gap-2'
                              >
                                <span className='mt-0.5'>+</span>
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {candidate.explanation.whyRankedLower?.length > 0 && (
                          <div className='space-y-2'>
                            {candidate.explanation.whyRankedLower.map(
                              (r, i) => (
                                <div
                                  key={i}
                                  className='text-sm text-amber-700 flex items-start gap-2'
                                >
                                  <span className='mt-0.5'>-</span>
                                  <span>{r}</span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent value='skills' className='mt-0 space-y-4'>
                  {/* Skill Analysis with Confidence */}
                  {candidate.skillConfidence &&
                  candidate.skillConfidence.length > 0 ? (
                    <div className='border rounded-xl p-5 space-y-4'>
                      <h3 className='font-semibold flex items-center gap-2'>
                        <Zap className='h-5 w-5 text-primary' />
                        Skill Confidence Analysis
                      </h3>
                      <div className='space-y-3'>
                        {candidate.skillConfidence.map((sc, i) => (
                          <div
                            key={i}
                            className='flex items-start gap-3 p-3 bg-muted/50 rounded-lg'
                          >
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 flex-wrap'>
                                <span className='font-medium'>{sc.skill}</span>
                                <ConfidenceBadge level={sc.confidence} />
                                {sc.verifiedByGithub && (
                                  <Badge
                                    variant='outline'
                                    className='text-[10px] bg-purple-50 text-purple-700 border-purple-200'
                                  >
                                    GitHub Verified
                                  </Badge>
                                )}
                                {sc.lastUsed && (
                                  <span className='text-xs text-muted-foreground'>
                                    Last used: {sc.lastUsed}
                                  </span>
                                )}
                              </div>
                              {sc.evidence.length > 0 && (
                                <div className='mt-1 text-sm text-muted-foreground'>
                                  {sc.evidence.slice(0, 2).join(' · ')}
                                </div>
                              )}
                            </div>
                            <Badge variant='secondary'>
                              {sc.sourceCount} source
                              {sc.sourceCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className='border rounded-xl p-5 text-center text-muted-foreground'>
                      <Zap className='h-8 w-8 mx-auto mb-2 opacity-50' />
                      <p>No detailed skill analysis available</p>
                    </div>
                  )}

                  {/* Transferable Skills */}
                  {candidate.transferableSkills &&
                    candidate.transferableSkills.length > 0 && (
                      <CollapsibleSection
                        title='Transferable Skills'
                        icon={ArrowRightLeft}
                        badge={candidate.transferableSkills.length}
                      >
                        <div className='space-y-3'>
                          {candidate.transferableSkills.map((ts, i) => (
                            <div
                              key={i}
                              className='bg-card border rounded-lg p-3 space-y-2'
                            >
                              <div className='flex items-center gap-2'>
                                <Badge
                                  variant='outline'
                                  className='text-red-600 border-red-300'
                                >
                                  Missing: {ts.missingSkill}
                                </Badge>
                                <ConfidenceBadge
                                  level={
                                    ts.transferability === 'high'
                                      ? 'high'
                                      : ts.transferability === 'medium'
                                      ? 'medium'
                                      : 'low'
                                  }
                                />
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                {ts.reasoning}
                              </p>
                              <div className='flex flex-wrap gap-1'>
                                {ts.adjacentSkills.map((as_, j) => (
                                  <Badge
                                    key={j}
                                    variant='secondary'
                                    className='text-xs'
                                  >
                                    {as_}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                  {/* Skill Freshness */}
                  {candidate.skillFreshness &&
                    candidate.skillFreshness.length > 0 && (
                      <CollapsibleSection
                        title='Skill Freshness'
                        icon={Clock}
                        badge={candidate.skillFreshness.length}
                      >
                        <div className='grid grid-cols-3 gap-3'>
                          {candidate.skillFreshness.map((sf, i) => (
                            <div
                              key={i}
                              className='bg-card border rounded-lg p-3'
                            >
                              <div className='font-medium text-sm'>
                                {sf.skill}
                              </div>
                              <div className='text-xs text-muted-foreground mt-1'>
                                {sf.lastUsed} · {sf.source.replace(/_/g, ' ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value='experience' className='mt-0 space-y-4'>
                  {/* Role-Fit Scores */}
                  {candidate.roleFitScores &&
                    candidate.roleFitScores.length > 0 && (
                      <div className='border rounded-xl p-5 space-y-4'>
                        <h3 className='font-semibold flex items-center gap-2'>
                          <BarChart3 className='h-5 w-5 text-primary' />
                          Role-Fit Analysis
                        </h3>
                        <div className='space-y-4'>
                          {candidate.roleFitScores.map((rf, i) => (
                            <div key={i} className='bg-muted/50 rounded-lg p-4'>
                              <div className='flex items-center justify-between mb-2'>
                                <span className='font-medium'>{rf.role}</span>
                                <span className='text-xl font-bold'>
                                  {rf.fitPercentage}%
                                </span>
                              </div>
                              <MiniBar value={rf.fitPercentage} />
                              <div className='grid grid-cols-2 gap-4 mt-3'>
                                {rf.topStrengths.length > 0 && (
                                  <div className='space-y-1'>
                                    {rf.topStrengths.map((s, j) => (
                                      <div
                                        key={j}
                                        className='text-sm text-green-600 flex items-start gap-1'
                                      >
                                        <span>+</span>
                                        <span>{s}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {rf.topBlockers.length > 0 && (
                                  <div className='space-y-1'>
                                    {rf.topBlockers.map((b, j) => (
                                      <div
                                        key={j}
                                        className='text-sm text-red-600 flex items-start gap-1'
                                      >
                                        <span>-</span>
                                        <span>{b}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Experience Quality */}
                  {candidate.experienceQuality && (
                    <div className='border rounded-xl p-5 space-y-4'>
                      <h3 className='font-semibold flex items-center gap-2'>
                        <Activity className='h-5 w-5 text-primary' />
                        Experience Quality
                      </h3>
                      <div className='grid grid-cols-4 gap-4'>
                        <div className='bg-muted/50 rounded-lg p-4 text-center'>
                          <div className='text-2xl font-bold'>
                            {candidate.experienceQuality.totalYears}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            Total Years
                          </div>
                        </div>
                        <div className='bg-muted/50 rounded-lg p-4 text-center'>
                          <div className='text-2xl font-bold'>
                            {candidate.experienceQuality.projectsPerYear.toFixed(
                              1
                            )}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            Projects/Year
                          </div>
                        </div>
                        <div className='bg-muted/50 rounded-lg p-4 text-center'>
                          <div className='text-2xl font-bold'>
                            {candidate.experienceQuality.continuityScore}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            Continuity
                          </div>
                        </div>
                        <div className='bg-muted/50 rounded-lg p-4 text-center'>
                          <div className='text-2xl font-bold'>
                            {candidate.experienceQuality.longestTenureMonths}mo
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            Longest Tenure
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-4 pt-2'>
                        {candidate.experienceQuality.hasProductionExposure && (
                          <Badge className='bg-green-100 text-green-800 border-green-200'>
                            Production Exposure
                          </Badge>
                        )}
                        <span className='text-sm text-muted-foreground'>
                          Avg tenure:{' '}
                          {candidate.experienceQuality.averageTenureMonths}{' '}
                          months
                        </span>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {candidate.experienceQuality.summary}
                      </p>
                    </div>
                  )}

                  {/* Predicted Roles */}
                  {(!candidate.roleFitScores ||
                    candidate.roleFitScores.length === 0) &&
                    candidate.predictedRoles &&
                    candidate.predictedRoles.length > 0 && (
                      <div className='border rounded-xl p-5 space-y-3'>
                        <h3 className='font-semibold flex items-center gap-2'>
                          <Briefcase className='h-5 w-5 text-primary' />
                          Predicted Roles
                        </h3>
                        <div className='flex flex-wrap gap-2'>
                          {candidate.predictedRoles.map((role, i) => (
                            <Badge
                              key={i}
                              variant='secondary'
                              className='px-3 py-1'
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value='insights' className='mt-0 space-y-4'>
                  {/* Resume Quality */}
                  {candidate.resumeQualityScore && (
                    <div className='border rounded-xl p-5 space-y-4'>
                      <h3 className='font-semibold flex items-center gap-2'>
                        <FileText className='h-5 w-5 text-primary' />
                        Resume Quality Analysis
                      </h3>
                      <div className='flex items-center gap-4'>
                        <div className='text-3xl font-bold'>
                          {candidate.resumeQualityScore.overall}
                        </div>
                        <div className='text-muted-foreground text-sm'>
                          / 100 overall quality
                        </div>
                      </div>
                      <MiniBar value={candidate.resumeQualityScore.overall} />
                      <div className='grid grid-cols-3 gap-4 pt-2'>
                        <div className='space-y-1'>
                          <div className='text-xs text-muted-foreground'>
                            Clarity
                          </div>
                          <div className='flex items-center gap-2'>
                            <MiniBar
                              value={candidate.resumeQualityScore.clarity}
                            />
                            <span className='text-sm font-medium'>
                              {candidate.resumeQualityScore.clarity}
                            </span>
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <div className='text-xs text-muted-foreground'>
                            Impact Evidence
                          </div>
                          <div className='flex items-center gap-2'>
                            <MiniBar
                              value={
                                candidate.resumeQualityScore.impactEvidence
                              }
                            />
                            <span className='text-sm font-medium'>
                              {candidate.resumeQualityScore.impactEvidence}
                            </span>
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <div className='text-xs text-muted-foreground'>
                            Consistency
                          </div>
                          <div className='flex items-center gap-2'>
                            <MiniBar
                              value={candidate.resumeQualityScore.consistency}
                            />
                            <span className='text-sm font-medium'>
                              {candidate.resumeQualityScore.consistency}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-3 pt-2'>
                        <span className='text-sm text-muted-foreground'>
                          Overclaim Risk:
                        </span>
                        <Badge
                          variant='outline'
                          className={cn(
                            candidate.resumeQualityScore.overclaimRisk === 'low'
                              ? 'text-green-600 border-green-300 bg-green-50'
                              : candidate.resumeQualityScore.overclaimRisk ===
                                'medium'
                              ? 'text-amber-600 border-amber-300 bg-amber-50'
                              : 'text-red-600 border-red-300 bg-red-50'
                          )}
                        >
                          {candidate.resumeQualityScore.overclaimRisk}
                        </Badge>
                      </div>
                      {candidate.resumeQualityScore.details.length > 0 && (
                        <div className='text-sm text-muted-foreground space-y-1 pt-2 border-t'>
                          {candidate.resumeQualityScore.details.map((d, i) => (
                            <div key={i}>· {d}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom Answers */}
                  {candidate.customAnswers &&
                    candidate.customAnswers.length > 0 && (
                      <div className='border rounded-xl p-5 space-y-4'>
                        <h3 className='font-semibold flex items-center gap-2'>
                          <Award className='h-5 w-5 text-primary' />
                          Custom Screening Questions
                        </h3>
                        {(() => {
                          const satisfiedCount =
                            candidate.customAnswers!.filter(
                              ca => ca.satisfied
                            ).length
                          const totalCount = candidate.customAnswers!.length
                          return satisfiedCount > 0 ? (
                            <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20'>
                              <CheckCircle className='h-4 w-4 text-emerald-500' />
                              <span className='text-sm text-emerald-600 dark:text-emerald-400'>
                                Verix improved score — {satisfiedCount}/
                                {totalCount} screening criteria satisfied
                              </span>
                            </div>
                          ) : null
                        })()}
                        <div className='space-y-3'>
                          {candidate.customAnswers.map((ca, i) => (
                            <div
                              key={i}
                              className='bg-muted/50 rounded-lg p-4 space-y-2'
                            >
                              <div className='flex items-start gap-2'>
                                {ca.satisfied ? (
                                  <CheckCircle className='h-5 w-5 text-green-500 mt-0.5' />
                                ) : (
                                  <XCircle className='h-5 w-5 text-red-500 mt-0.5' />
                                )}
                                <span className='font-medium'>
                                  {ca.question}
                                </span>
                              </div>
                              <p className='text-sm text-muted-foreground pl-7'>
                                {ca.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Verix Analysis Section */}
                  {candidate.verixStatus && (
                    <div className='border rounded-xl p-5 space-y-4'>
                      <h3 className='font-semibold flex items-center gap-2'>
                        <Bot className='h-5 w-5 text-violet-500' />
                        Verix Agent Analysis
                        <Badge
                          variant='outline'
                          className={cn(
                            'text-[10px] ml-auto',
                            candidate.verixStatus === 'completed' &&
                              'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                            candidate.verixStatus === 'verified' &&
                              'bg-purple-500/10 text-purple-500 border-purple-500/20',
                            (candidate.verixStatus === 'awaiting_response' ||
                              candidate.verixStatus === 'questions_sent') &&
                              'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                            candidate.verixStatus === 'responded' &&
                              'bg-orange-500/10 text-orange-500 border-orange-500/20',
                            (candidate.verixStatus === 'failed' ||
                              candidate.verixStatus === 'expired') &&
                              'bg-red-500/10 text-red-500 border-red-500/20',
                            candidate.verixStatus === 'pending' &&
                              'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                          )}
                        >
                          {candidate.verixStatus === 'questions_sent' &&
                            'Awaiting Reply'}
                          {candidate.verixStatus === 'awaiting_response' &&
                            'Awaiting Reply'}
                          {candidate.verixStatus === 'responded' &&
                            'Re-reviewing'}
                          {candidate.verixStatus === 'verified' && 'Verified'}
                          {candidate.verixStatus === 'completed' &&
                            'Re-analyzed'}
                          {candidate.verixStatus === 'pending' && 'Queued'}
                          {candidate.verixStatus === 'failed' && 'Failed'}
                          {candidate.verixStatus === 'expired' && 'Expired'}
                        </Badge>
                      </h3>

                      {/* Score comparison - only show when completed with pre/post data */}
                      {candidate.verixStatus === 'completed' &&
                        (candidate.verixPreTrustScore != null ||
                          candidate.verixPreScore != null) && (
                          <div className='grid grid-cols-2 gap-3'>
                            {candidate.verixPreTrustScore != null &&
                              candidate.verixPostTrustScore != null && (
                                <div className='bg-muted/50 rounded-lg p-3 space-y-1.5'>
                                  <p className='text-xs font-medium text-muted-foreground'>
                                    Trust Score
                                  </p>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-sm text-muted-foreground'>
                                      {Math.round(candidate.verixPreTrustScore)}
                                    </span>
                                    <ArrowRightLeft className='h-3 w-3 text-muted-foreground' />
                                    <span className='text-sm font-semibold'>
                                      {Math.round(
                                        candidate.verixPostTrustScore
                                      )}
                                    </span>
                                    {candidate.verixPostTrustScore !==
                                      candidate.verixPreTrustScore && (
                                      <Badge
                                        variant='outline'
                                        className={cn(
                                          'text-[10px] ml-auto',
                                          candidate.verixPostTrustScore >
                                            candidate.verixPreTrustScore
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                        )}
                                      >
                                        {candidate.verixPostTrustScore >
                                        candidate.verixPreTrustScore
                                          ? '+'
                                          : ''}
                                        {Math.round(
                                          candidate.verixPostTrustScore -
                                            candidate.verixPreTrustScore
                                        )}
                                      </Badge>
                                    )}
                                  </div>
                                  <Progress
                                    value={candidate.verixPostTrustScore}
                                    className='h-1.5'
                                  />
                                </div>
                              )}
                            {candidate.verixPreScore != null &&
                              candidate.verixPostScore != null && (
                                <div className='bg-muted/50 rounded-lg p-3 space-y-1.5'>
                                  <p className='text-xs font-medium text-muted-foreground'>
                                    Skills Score
                                  </p>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-sm text-muted-foreground'>
                                      {Math.round(candidate.verixPreScore)}
                                    </span>
                                    <ArrowRightLeft className='h-3 w-3 text-muted-foreground' />
                                    <span className='text-sm font-semibold'>
                                      {Math.round(candidate.verixPostScore)}
                                    </span>
                                    {candidate.verixPostScore !==
                                      candidate.verixPreScore && (
                                      <Badge
                                        variant='outline'
                                        className={cn(
                                          'text-[10px] ml-auto',
                                          candidate.verixPostScore >
                                            candidate.verixPreScore
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                        )}
                                      >
                                        {candidate.verixPostScore >
                                        candidate.verixPreScore
                                          ? '+'
                                          : ''}
                                        {Math.round(
                                          candidate.verixPostScore -
                                            candidate.verixPreScore
                                        )}
                                      </Badge>
                                    )}
                                  </div>
                                  <Progress
                                    value={candidate.verixPostScore}
                                    className='h-1.5'
                                  />
                                </div>
                              )}
                          </div>
                        )}

                      {/* Waiting states */}
                      {(candidate.verixStatus === 'questions_sent' ||
                        candidate.verixStatus === 'awaiting_response') && (
                        <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10'>
                          <Clock className='h-4 w-4 text-yellow-500 animate-pulse' />
                          <span className='text-sm text-muted-foreground'>
                            Verix sent verification questions. Waiting for
                            candidate to respond...
                          </span>
                        </div>
                      )}
                      {candidate.verixStatus === 'responded' && (
                        <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/5 border border-orange-500/10'>
                          <Activity className='h-4 w-4 text-orange-500 animate-pulse' />
                          <span className='text-sm text-muted-foreground'>
                            Candidate responded. Verix is re-reviewing and
                            scoring the answers...
                          </span>
                        </div>
                      )}

                      {/* Verix Conversation Q&A */}
                      {verixLoading && (
                        <div className='flex items-center gap-2 py-3'>
                          <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                          <span className='text-sm text-muted-foreground'>
                            Loading conversation...
                          </span>
                        </div>
                      )}
                      {verixDetail && verixDetail.questions.length > 0 && (
                        <div className='space-y-3'>
                          <h4 className='text-sm font-medium flex items-center gap-2'>
                            <MessageSquare className='h-4 w-4 text-muted-foreground' />
                            Verix Questions & Responses
                          </h4>
                          <div className='space-y-3'>
                            {verixDetail.questions
                              .sort((a, b) => a.position - b.position)
                              .map((q, i) => (
                                <div
                                  key={q.id}
                                  className='bg-muted/30 rounded-lg p-3 space-y-2'
                                >
                                  <div className='flex items-start gap-2'>
                                    <span className='text-xs font-semibold text-muted-foreground shrink-0 mt-0.5'>
                                      Q{i + 1}.
                                    </span>
                                    <div className='flex-1'>
                                      <p className='text-sm font-medium'>
                                        {q.text}
                                      </p>
                                      {q.required && (
                                        <Badge
                                          variant='outline'
                                          className='text-[9px] mt-1 bg-red-500/10 text-red-400 border-red-500/20'
                                        >
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {q.response ? (
                                    <div className='ml-6 space-y-1.5'>
                                      <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                                        {q.response.answer}
                                      </p>
                                      <div className='flex items-center gap-3 flex-wrap'>
                                        {q.response.qualityScore != null && (
                                          <span className='text-[10px] text-muted-foreground'>
                                            Quality:{' '}
                                            <span
                                              className={cn(
                                                'font-medium',
                                                q.response.qualityScore >= 70
                                                  ? 'text-green-600'
                                                  : q.response.qualityScore >=
                                                    40
                                                  ? 'text-amber-600'
                                                  : 'text-red-600'
                                              )}
                                            >
                                              {q.response.qualityScore}%
                                            </span>
                                          </span>
                                        )}
                                        {q.response.aiDetectionResult && (
                                          <Badge
                                            variant='outline'
                                            className={cn(
                                              'text-[9px]',
                                              q.response.aiDetectionResult
                                                .verdict === 'human'
                                                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                                : q.response.aiDetectionResult
                                                    .verdict === 'ai_assisted'
                                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                : 'bg-red-500/10 text-red-600 border-red-500/20'
                                            )}
                                          >
                                            {q.response.aiDetectionResult
                                              .verdict === 'human'
                                              ? 'Human'
                                              : q.response.aiDetectionResult
                                                  .verdict === 'ai_assisted'
                                              ? 'AI Assisted'
                                              : 'AI Generated'}
                                          </Badge>
                                        )}
                                        {q.response.responseTimeSeconds !=
                                          null && (
                                          <span className='text-[10px] text-muted-foreground'>
                                            {q.response.responseTimeSeconds < 60
                                              ? `${q.response.responseTimeSeconds}s`
                                              : `${Math.floor(
                                                  q.response
                                                    .responseTimeSeconds / 60
                                                )}m ${
                                                  q.response
                                                    .responseTimeSeconds % 60
                                                }s`}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className='ml-6 text-sm text-muted-foreground italic'>
                                      No response yet
                                    </p>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legacy Verix Score Improvement (for candidates without new verix fields) */}
                  {!candidate.verixStatus &&
                    candidate.trustFlags?.includes('verix_verified') && (
                      <div className='flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20'>
                        <Shield className='h-5 w-5 text-emerald-500' />
                        <span className='text-sm font-medium text-emerald-600 dark:text-emerald-400'>
                          Verix improved score — candidate responded to
                          verification questions
                        </span>
                      </div>
                    )}

                  {/* Trust Signals */}
                  {candidate.trustFlags && candidate.trustFlags.length > 0 && (
                    <div className='border rounded-xl p-5 space-y-3'>
                      <h3 className='font-semibold flex items-center gap-2'>
                        <Shield className='h-5 w-5 text-primary' />
                        Trust Signals
                      </h3>
                      <div className='flex flex-wrap gap-2'>
                        {candidate.trustFlags.map((flag, i) => (
                          <Badge key={i} variant='outline'>
                            {formatBadge(flag)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Verix Tab */}
                <TabsContent value='verix' className='mt-0 space-y-6'>
                  {verixLoading && (
                    <div className='flex items-center justify-center py-12'>
                      <Loader2 className='h-6 w-6 animate-spin text-violet-500 mr-3' />
                      <span className='text-muted-foreground'>
                        Loading Verix conversation...
                      </span>
                    </div>
                  )}

                  {!verixLoading && candidate.verixStatus && (
                    <>
                      {/* Status Header */}
                      <div className='flex items-center gap-3 p-4 border rounded-xl bg-muted/30'>
                        <div className='p-2.5 rounded-lg bg-violet-500/10'>
                          <Bot className='h-5 w-5 text-violet-500' />
                        </div>
                        <div className='flex-1'>
                          <p className='font-medium'>Verix Agent Engagement</p>
                          <p className='text-sm text-muted-foreground'>
                            {candidate.verixStatus === 'questions_sent' ||
                            candidate.verixStatus === 'awaiting_response'
                              ? 'Verix sent verification questions. Waiting for candidate to respond.'
                              : candidate.verixStatus === 'responded'
                              ? 'Candidate has responded. Verix is re-reviewing the answers.'
                              : candidate.verixStatus === 'verified'
                              ? 'Verix has verified the candidate responses.'
                              : candidate.verixStatus === 'completed'
                              ? 'Verix completed re-analysis with candidate responses.'
                              : candidate.verixStatus === 'pending'
                              ? 'Verix engagement is queued.'
                              : candidate.verixStatus === 'failed'
                              ? 'Verix engagement failed.'
                              : candidate.verixStatus === 'expired'
                              ? 'Verification link has expired.'
                              : 'Verix is processing.'}
                          </p>
                        </div>
                        <Badge
                          variant='outline'
                          className={cn(
                            'text-xs',
                            (candidate.verixStatus === 'completed' ||
                              candidate.verixStatus === 'verified') &&
                              'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                            (candidate.verixStatus === 'awaiting_response' ||
                              candidate.verixStatus === 'questions_sent') &&
                              'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
                            candidate.verixStatus === 'responded' &&
                              'bg-blue-500/10 text-blue-600 border-blue-500/20',
                            (candidate.verixStatus === 'failed' ||
                              candidate.verixStatus === 'expired') &&
                              'bg-red-500/10 text-red-600 border-red-500/20',
                            candidate.verixStatus === 'pending' &&
                              'bg-zinc-500/10 text-zinc-600 border-zinc-500/20'
                          )}
                        >
                          {candidate.verixStatus === 'questions_sent'
                            ? 'Awaiting Reply'
                            : candidate.verixStatus === 'awaiting_response'
                            ? 'Awaiting Reply'
                            : candidate.verixStatus === 'responded'
                            ? 'Re-reviewing'
                            : candidate.verixStatus === 'verified'
                            ? 'Verified'
                            : candidate.verixStatus === 'completed'
                            ? 'Re-analyzed'
                            : candidate.verixStatus === 'pending'
                            ? 'Queued'
                            : candidate.verixStatus === 'failed'
                            ? 'Failed'
                            : candidate.verixStatus === 'expired'
                            ? 'Expired'
                            : candidate.verixStatus}
                        </Badge>
                      </div>

                      {/* Score Comparison */}
                      {candidate.verixStatus === 'completed' &&
                        (candidate.verixPreTrustScore != null ||
                          candidate.verixPreScore != null) && (
                          <div className='border rounded-xl p-4 space-y-3'>
                            <h4 className='text-sm font-medium flex items-center gap-2'>
                              <TrendingUp className='h-4 w-4 text-muted-foreground' />
                              Score Impact
                            </h4>
                            <div className='grid grid-cols-2 gap-3'>
                              {candidate.verixPreTrustScore != null &&
                                candidate.verixPostTrustScore != null && (
                                  <div className='bg-muted/50 rounded-lg p-3 space-y-1.5'>
                                    <p className='text-xs font-medium text-muted-foreground'>
                                      Trust Score
                                    </p>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-sm text-muted-foreground'>
                                        {Math.round(
                                          candidate.verixPreTrustScore
                                        )}
                                      </span>
                                      <ArrowRightLeft className='h-3 w-3 text-muted-foreground' />
                                      <span className='text-sm font-semibold'>
                                        {Math.round(
                                          candidate.verixPostTrustScore
                                        )}
                                      </span>
                                      {candidate.verixPostTrustScore !==
                                        candidate.verixPreTrustScore && (
                                        <Badge
                                          variant='outline'
                                          className={cn(
                                            'text-[10px] ml-auto',
                                            candidate.verixPostTrustScore >
                                              candidate.verixPreTrustScore
                                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                                          )}
                                        >
                                          {candidate.verixPostTrustScore >
                                          candidate.verixPreTrustScore
                                            ? '+'
                                            : ''}
                                          {Math.round(
                                            candidate.verixPostTrustScore -
                                              candidate.verixPreTrustScore
                                          )}
                                        </Badge>
                                      )}
                                    </div>
                                    <Progress
                                      value={candidate.verixPostTrustScore}
                                      className='h-1.5'
                                    />
                                  </div>
                                )}
                              {candidate.verixPreScore != null &&
                                candidate.verixPostScore != null && (
                                  <div className='bg-muted/50 rounded-lg p-3 space-y-1.5'>
                                    <p className='text-xs font-medium text-muted-foreground'>
                                      Skills Score
                                    </p>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-sm text-muted-foreground'>
                                        {Math.round(candidate.verixPreScore)}
                                      </span>
                                      <ArrowRightLeft className='h-3 w-3 text-muted-foreground' />
                                      <span className='text-sm font-semibold'>
                                        {Math.round(candidate.verixPostScore)}
                                      </span>
                                      {candidate.verixPostScore !==
                                        candidate.verixPreScore && (
                                        <Badge
                                          variant='outline'
                                          className={cn(
                                            'text-[10px] ml-auto',
                                            candidate.verixPostScore >
                                              candidate.verixPreScore
                                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                                          )}
                                        >
                                          {candidate.verixPostScore >
                                          candidate.verixPreScore
                                            ? '+'
                                            : ''}
                                          {Math.round(
                                            candidate.verixPostScore -
                                              candidate.verixPreScore
                                          )}
                                        </Badge>
                                      )}
                                    </div>
                                    <Progress
                                      value={candidate.verixPostScore}
                                      className='h-1.5'
                                    />
                                  </div>
                                )}
                            </div>
                          </div>
                        )}

                      {/* Issues Identified */}
                      {verixDetail &&
                        verixDetail.issues &&
                        verixDetail.issues.length > 0 && (
                          <div className='border rounded-xl p-4 space-y-3'>
                            <h4 className='text-sm font-medium flex items-center gap-2'>
                              <AlertTriangle className='h-4 w-4 text-amber-500' />
                              Issues Identified
                            </h4>
                            <div className='space-y-2'>
                              {verixDetail.issues.map((issue, i) => (
                                <div
                                  key={i}
                                  className='flex items-start gap-2 text-sm'
                                >
                                  <Badge
                                    variant='outline'
                                    className={cn(
                                      'text-[10px] shrink-0 mt-0.5',
                                      issue.severity === 'high'
                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                        : issue.severity === 'medium'
                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                    )}
                                  >
                                    {issue.severity}
                                  </Badge>
                                  <span className='text-muted-foreground'>
                                    {issue.detail}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Conversation - Chat Style */}
                      {verixDetail && verixDetail.questions.length > 0 && (
                        <div className='border rounded-xl p-4 space-y-4'>
                          <h4 className='text-sm font-medium flex items-center gap-2'>
                            <MessageSquare className='h-4 w-4 text-muted-foreground' />
                            Conversation
                            <span className='text-xs text-muted-foreground ml-auto'>
                              {
                                verixDetail.questions.filter(q => q.response)
                                  .length
                              }
                              /{verixDetail.questions.length} answered
                            </span>
                          </h4>
                          <div className='space-y-4'>
                            {verixDetail.questions
                              .sort((a, b) => a.position - b.position)
                              .map((q, i) => (
                                <div key={q.id} className='space-y-2'>
                                  {/* Verix question bubble */}
                                  <div className='flex gap-2.5'>
                                    <div className='w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/15 flex items-center justify-center shrink-0 mt-0.5'>
                                      <Bot className='h-3.5 w-3.5 text-violet-400' />
                                    </div>
                                    <div className='flex-1'>
                                      <div className='flex items-center gap-2 mb-1'>
                                        <span className='text-[10px] font-medium text-violet-500'>
                                          Verix Agent
                                        </span>
                                        <span className='text-[10px] text-muted-foreground'>
                                          Q{i + 1}
                                        </span>
                                        {q.required && (
                                          <Badge
                                            variant='outline'
                                            className='text-[9px] bg-red-500/10 text-red-400 border-red-500/20 px-1.5 py-0'
                                          >
                                            Required
                                          </Badge>
                                        )}
                                      </div>
                                      <div className='bg-muted/60 border rounded-xl rounded-tl-sm px-3.5 py-2.5'>
                                        <p className='text-sm'>{q.text}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Candidate response bubble */}
                                  {q.response ? (
                                    <div className='flex gap-2.5 justify-end'>
                                      <div className='flex-1 max-w-[90%]'>
                                        <div className='flex items-center gap-2 mb-1 justify-end'>
                                          <span className='text-[10px] font-medium text-muted-foreground'>
                                            {candidate.candidateName ||
                                              'Candidate'}
                                          </span>
                                          {q.response.aiDetectionResult && (
                                            <Badge
                                              variant='outline'
                                              className={cn(
                                                'text-[9px]',
                                                q.response.aiDetectionResult
                                                  .verdict === 'human'
                                                  ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                                  : q.response.aiDetectionResult
                                                      .verdict === 'ai_assisted'
                                                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                  : 'bg-red-500/10 text-red-600 border-red-500/20'
                                              )}
                                            >
                                              {q.response.aiDetectionResult
                                                .verdict === 'human'
                                                ? 'Human'
                                                : q.response.aiDetectionResult
                                                    .verdict === 'ai_assisted'
                                                ? 'AI Assisted'
                                                : 'AI Generated'}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className='bg-violet-500/5 border border-violet-500/10 rounded-xl rounded-tr-sm px-3.5 py-2.5'>
                                          <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                                            {q.response.answer}
                                          </p>
                                        </div>
                                        {/* Metrics */}
                                        <div className='flex items-center gap-3 mt-1.5 px-1 flex-wrap'>
                                          {q.response.qualityScore != null && (
                                            <span className='text-[10px] text-muted-foreground'>
                                              Quality:{' '}
                                              <span
                                                className={cn(
                                                  'font-medium',
                                                  q.response.qualityScore >= 70
                                                    ? 'text-green-600'
                                                    : q.response.qualityScore >=
                                                      40
                                                    ? 'text-amber-600'
                                                    : 'text-red-600'
                                                )}
                                              >
                                                {q.response.qualityScore}%
                                              </span>
                                            </span>
                                          )}
                                          {q.response.responseTimeSeconds !=
                                            null && (
                                            <span className='text-[10px] text-muted-foreground'>
                                              {q.response.responseTimeSeconds <
                                              60
                                                ? `${q.response.responseTimeSeconds}s`
                                                : `${Math.floor(
                                                    q.response
                                                      .responseTimeSeconds / 60
                                                  )}m ${
                                                    q.response
                                                      .responseTimeSeconds % 60
                                                  }s`}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className='flex justify-end'>
                                      <p className='text-xs text-muted-foreground italic px-3'>
                                        Awaiting response...
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      {verixDetail &&
                        verixDetail.events &&
                        verixDetail.events.length > 0 && (
                          <div className='border rounded-xl p-4 space-y-3'>
                            <h4 className='text-sm font-medium flex items-center gap-2'>
                              <Clock className='h-4 w-4 text-muted-foreground' />
                              Timeline
                            </h4>
                            <div className='space-y-2'>
                              {verixDetail.events.map(event => (
                                <div
                                  key={event.id}
                                  className='flex items-center gap-3 text-sm'
                                >
                                  <div className='w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0' />
                                  <span className='text-muted-foreground capitalize'>
                                    {event.eventType.replace(/_/g, ' ')}
                                  </span>
                                  <span className='text-xs text-muted-foreground ml-auto'>
                                    {new Date(event.createdAt).toLocaleString(
                                      undefined,
                                      {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
