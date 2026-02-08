'use client'

import {
  User,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Shield,
  ChevronDown,
  ChevronUp,
  Eye,
  Bot,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScoreCircle, ScoreDisplay, TrustBadge } from './score-display'
import { useResumeDownloadUrl } from '@/lib/screening-hooks'
import type { Candidate } from '@/lib/screening-api'

interface CandidateCardProps {
  candidate: Candidate
  rank?: number
  onClick?: () => void
}

export function CandidateCard ({
  candidate,
  rank,
  onClick
}: CandidateCardProps) {
  const [showExplanation, setShowExplanation] = useState(false)
  const downloadUrl = useResumeDownloadUrl()

  const getRecommendationBadge = (rec?: string) => {
    switch (rec) {
      case 'strong_yes':
        return <Badge variant='success'>Strong Yes</Badge>
      case 'yes':
        return <Badge variant='success'>Yes</Badge>
      case 'maybe':
        return <Badge variant='warning'>Maybe</Badge>
      case 'no':
        return <Badge variant='destructive'>No</Badge>
      case 'strong_no':
        return <Badge variant='destructive'>Strong No</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzed':
        return <CheckCircle className='h-4 w-4 text-green-500' />
      case 'analyzing':
      case 'parsing':
        return <Clock className='h-4 w-4 text-yellow-500 animate-pulse' />
      case 'failed':
        return <XCircle className='h-4 w-4 text-red-500' />
      default:
        return <AlertCircle className='h-4 w-4 text-muted-foreground' />
    }
  }

  const isProcessed = candidate.overallScore !== undefined

  return (
    <Card
      className={cn(
        'transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
        isProcessed && candidate.overallScore! >= 80 && 'border-emerald-500/20',
        isProcessed &&
          candidate.overallScore! >= 60 &&
          candidate.overallScore! < 80 &&
          'border-blue-500/15',
        onClick && 'hover:border-primary/40'
      )}
      onClick={onClick}
    >
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            {(candidate.rankPosition || rank) && (
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shrink-0',
                  (candidate.rankPosition || rank)! <= 3
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm shadow-amber-500/30'
                    : (candidate.rankPosition || rank)! <= 10
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/20'
                    : 'bg-gradient-to-br from-zinc-500 to-zinc-600'
                )}
              >
                {candidate.rankPosition || rank}
              </div>
            )}
            <div>
              <div className='flex items-center gap-2'>
                <span className='font-semibold tracking-tight'>
                  {candidate.candidateName || 'Unknown Candidate'}
                </span>
                {getStatusIcon(candidate.status)}
              </div>
              {candidate.candidateEmail && (
                <div className='flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5'>
                  <Mail className='h-3 w-3' />
                  {candidate.candidateEmail}
                </div>
              )}
              {candidate.rankPosition && candidate.percentile && (
                <div className='text-[11px] text-muted-foreground mt-0.5'>
                  Ranked #{candidate.rankPosition} · Top{' '}
                  {100 - candidate.percentile + 1}%
                </div>
              )}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {isProcessed && candidate.trustScore !== undefined && (
              <TrustBadge
                score={candidate.trustScore}
                flags={candidate.trustFlags}
              />
            )}
            {isProcessed && (
              <ScoreCircle score={candidate.overallScore!} size={60} />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-3'>
        {/* File name + View PDF */}
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <FileText className='h-4 w-4 flex-shrink-0' />
          <span className='truncate flex-1'>{candidate.fileName}</span>
          <Button
            variant='ghost'
            size='sm'
            className='h-6 px-2 text-xs'
            onClick={e => {
              e.stopPropagation()
              downloadUrl.mutate(candidate.resumeId)
            }}
            disabled={downloadUrl.isPending}
          >
            <Eye className='h-3 w-3 mr-1' />
            PDF
          </Button>
        </div>

        {isProcessed ? (
          <>
            {/* Recommendation badge */}
            <div className='flex items-center gap-2'>
              {getRecommendationBadge(candidate.recommendation)}
            </div>

            {/* Score breakdown - 5 columns */}
            <div className='grid grid-cols-5 gap-2'>
              <ScoreDisplay
                score={candidate.skillsScore || 0}
                label='Skills'
                size='sm'
                showProgress={false}
              />
              <ScoreDisplay
                score={candidate.experienceScore || 0}
                label='Exp'
                size='sm'
                showProgress={false}
              />
              <ScoreDisplay
                score={candidate.educationScore || 0}
                label='Edu'
                size='sm'
                showProgress={false}
              />
              <ScoreDisplay
                score={candidate.projectScore || 0}
                label='Projects'
                size='sm'
                showProgress={false}
              />
              <ScoreDisplay
                score={candidate.trustScore || 0}
                label='Trust'
                size='sm'
                showProgress={false}
              />
            </div>

            {/* Strengths */}
            {candidate.strengths && candidate.strengths.length > 0 && (
              <div>
                <p className='text-xs font-medium text-muted-foreground mb-1'>
                  Top Strengths
                </p>
                <div className='flex flex-wrap gap-1'>
                  {candidate.strengths.slice(0, 2).map((strength, i) => (
                    <Badge key={i} variant='secondary' className='text-xs'>
                      {strength.length > 30
                        ? strength.slice(0, 30) + '...'
                        : strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Concerns */}
            {candidate.concerns && candidate.concerns.length > 0 && (
              <div>
                <p className='text-xs font-medium text-muted-foreground mb-1'>
                  Concerns
                </p>
                <div className='flex flex-wrap gap-1'>
                  {candidate.concerns.slice(0, 2).map((concern, i) => (
                    <Badge
                      key={i}
                      variant='outline'
                      className='text-xs text-orange-600'
                    >
                      {concern.length > 30
                        ? concern.slice(0, 30) + '...'
                        : concern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation (collapsible) */}
            {candidate.explanation && (
              <div>
                <button
                  className='flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground'
                  onClick={e => {
                    e.stopPropagation()
                    setShowExplanation(!showExplanation)
                  }}
                >
                  {showExplanation ? (
                    <ChevronUp className='h-3 w-3' />
                  ) : (
                    <ChevronDown className='h-3 w-3' />
                  )}
                  Why this ranking?
                </button>
                {showExplanation && (
                  <div className='mt-1 space-y-1 text-xs'>
                    {candidate.explanation.whyRankedHigh?.map((reason, i) => (
                      <div
                        key={i}
                        className='flex items-start gap-1 text-green-600'
                      >
                        <span>+</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                    {candidate.explanation.whyRankedLower?.map((reason, i) => (
                      <div
                        key={i}
                        className='flex items-start gap-1 text-amber-600'
                      >
                        <span>-</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Verix Engagement Status */}
            {candidate.verixStatus && (
              <div
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs',
                  candidate.verixStatus === 'completed' &&
                    'bg-emerald-500/10 border border-emerald-500/20',
                  candidate.verixStatus === 'verified' &&
                    'bg-purple-500/10 border border-purple-500/20',
                  (candidate.verixStatus === 'awaiting_response' ||
                    candidate.verixStatus === 'questions_sent') &&
                    'bg-yellow-500/10 border border-yellow-500/20',
                  candidate.verixStatus === 'responded' &&
                    'bg-orange-500/10 border border-orange-500/20',
                  (candidate.verixStatus === 'failed' ||
                    candidate.verixStatus === 'expired') &&
                    'bg-red-500/10 border border-red-500/20',
                  candidate.verixStatus === 'pending' &&
                    'bg-zinc-500/10 border border-zinc-500/20'
                )}
              >
                <Bot
                  className={cn(
                    'h-3.5 w-3.5',
                    candidate.verixStatus === 'completed' && 'text-emerald-500',
                    candidate.verixStatus === 'verified' && 'text-purple-500',
                    (candidate.verixStatus === 'awaiting_response' ||
                      candidate.verixStatus === 'questions_sent') &&
                      'text-yellow-500',
                    candidate.verixStatus === 'responded' && 'text-orange-500',
                    (candidate.verixStatus === 'failed' ||
                      candidate.verixStatus === 'expired') &&
                      'text-red-500',
                    candidate.verixStatus === 'pending' && 'text-zinc-500'
                  )}
                />
                <span className='font-medium'>
                  {candidate.verixStatus === 'questions_sent' &&
                    'Verix — Awaiting reply'}
                  {candidate.verixStatus === 'awaiting_response' &&
                    'Verix — Awaiting reply'}
                  {candidate.verixStatus === 'responded' &&
                    'Verix — Re-reviewing'}
                  {candidate.verixStatus === 'verified' && 'Verix — Verified'}
                  {candidate.verixStatus === 'completed' &&
                    'Verix — Re-analyzed'}
                  {candidate.verixStatus === 'pending' && 'Verix — Queued'}
                  {candidate.verixStatus === 'failed' && 'Verix — Failed'}
                  {candidate.verixStatus === 'expired' && 'Verix — Expired'}
                </span>
                {candidate.verixStatus === 'completed' &&
                  candidate.verixPreTrustScore != null &&
                  candidate.verixPostTrustScore != null && (
                    <span className='ml-auto flex items-center gap-0.5'>
                      {candidate.verixPostTrustScore >
                      candidate.verixPreTrustScore ? (
                        <>
                          <ArrowUp className='h-3 w-3 text-emerald-500' />
                          <span className='text-emerald-500 font-semibold'>
                            +
                            {Math.round(
                              candidate.verixPostTrustScore -
                                candidate.verixPreTrustScore
                            )}
                          </span>
                        </>
                      ) : candidate.verixPostTrustScore <
                        candidate.verixPreTrustScore ? (
                        <>
                          <ArrowDown className='h-3 w-3 text-red-500' />
                          <span className='text-red-500 font-semibold'>
                            {Math.round(
                              candidate.verixPostTrustScore -
                                candidate.verixPreTrustScore
                            )}
                          </span>
                        </>
                      ) : (
                        <span className='text-zinc-400'>±0</span>
                      )}
                    </span>
                  )}
              </div>
            )}

            {/* Custom answers */}
            {candidate.customAnswers && candidate.customAnswers.length > 0 && (
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Custom Questions
                  </p>
                  {candidate.customAnswers.some(ca => ca.satisfied) && (
                    <span className='text-[10px] font-medium text-emerald-500'>
                      Verix improved score
                    </span>
                  )}
                </div>
                <div className='space-y-1'>
                  {candidate.customAnswers.map((ca, i) => (
                    <div key={i} className='flex items-start gap-1 text-xs'>
                      <span
                        className={
                          ca.satisfied ? 'text-green-500' : 'text-red-500'
                        }
                      >
                        {ca.satisfied ? '✓' : '✗'}
                      </span>
                      <span className='text-muted-foreground truncate'>
                        {ca.question}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center justify-center py-4 gap-2'>
            {candidate.status === 'failed' ? (
              <span className='text-sm text-red-500'>Processing failed</span>
            ) : (
              <>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Clock className='h-4 w-4 animate-pulse text-yellow-500' />
                  <span>
                    {candidate.status === 'uploaded' &&
                      'Queued for processing...'}
                    {candidate.status === 'parsing' && 'Parsing resume...'}
                    {candidate.status === 'parsed' &&
                      'Resume parsed, ready for analysis'}
                    {candidate.status === 'analyzing' &&
                      'AI analyzing skills & fit...'}
                  </span>
                </div>
                <div className='w-full bg-muted rounded-full h-1.5 overflow-hidden'>
                  <div
                    className='h-full bg-primary rounded-full transition-all duration-500 ease-out'
                    style={{
                      width:
                        candidate.status === 'uploaded'
                          ? '10%'
                          : candidate.status === 'parsing'
                          ? '35%'
                          : candidate.status === 'parsed'
                          ? '55%'
                          : candidate.status === 'analyzing'
                          ? '80%'
                          : '0%'
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
