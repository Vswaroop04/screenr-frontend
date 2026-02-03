'use client'

import { useState } from 'react'
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
import type { Candidate } from '@/lib/screening-api'
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
  ExternalLink
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
    low: { bg: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Low' },
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
    badge
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())

  const recConfig = getRecommendationConfig(candidate.recommendation)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0'>
        {/* Header */}
        <div className='border-b bg-gradient-to-r from-primary/5 to-primary/10 p-6'>
          <DialogHeader>
            <div className='flex items-start justify-between gap-6'>
              <div className='flex-1'>
                <DialogTitle className='text-2xl flex items-center gap-3'>
                  <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center'>
                    <User className='h-6 w-6 text-primary' />
                  </div>
                  <div>
                    <span>{candidate.candidateName || 'Unknown Candidate'}</span>
                    {candidate.rankPosition && (
                      <Badge variant='secondary' className='ml-3'>
                        Rank #{candidate.rankPosition}
                      </Badge>
                    )}
                  </div>
                </DialogTitle>
                <DialogDescription className='flex flex-wrap items-center gap-4 mt-3 ml-15'>
                  {candidate.candidateEmail && (
                    <span className='flex items-center gap-1.5 text-sm'>
                      <Mail className='h-4 w-4' />
                      {candidate.candidateEmail}
                    </span>
                  )}
                  {candidate.parsedLocation &&
                    (candidate.parsedLocation.city ||
                      candidate.parsedLocation.country) && (
                      <span className='flex items-center gap-1.5 text-sm'>
                        <MapPin className='h-4 w-4' />
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
                      <Briefcase className='h-4 w-4' />
                      {candidate.totalYearsExperience} years experience
                    </span>
                  )}
                </DialogDescription>
              </div>
              {isProcessed && (
                <div className='flex items-center gap-4'>
                  <Badge className={cn('text-sm px-4 py-2', recConfig.className)}>
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
                    {candidate.scoreConfidence.dataSourceCount !== 1 ? 's' : ''}{' '}
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
                  <TabsTrigger value='overview' className='data-[state=active]:bg-muted'>
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value='skills' className='data-[state=active]:bg-muted'>
                    Skills Analysis
                  </TabsTrigger>
                  <TabsTrigger value='experience' className='data-[state=active]:bg-muted'>
                    Experience
                  </TabsTrigger>
                  <TabsTrigger value='insights' className='data-[state=active]:bg-muted'>
                    AI Insights
                  </TabsTrigger>
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
                            {candidate.explanation.whyRankedLower.map((r, i) => (
                              <div
                                key={i}
                                className='text-sm text-amber-700 flex items-start gap-2'
                              >
                                <span className='mt-0.5'>-</span>
                                <span>{r}</span>
                              </div>
                            ))}
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
                                {sf.lastUsed} ·{' '}
                                {sf.source.replace(/_/g, ' ')}
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
                            <Badge key={i} variant='secondary' className='px-3 py-1'>
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
                              value={candidate.resumeQualityScore.impactEvidence}
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
                                <span className='font-medium'>{ca.question}</span>
                              </div>
                              <p className='text-sm text-muted-foreground pl-7'>
                                {ca.answer}
                              </p>
                            </div>
                          ))}
                        </div>
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
              </div>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
