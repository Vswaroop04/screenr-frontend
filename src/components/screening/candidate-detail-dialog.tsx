'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScoreCircle, ScoreDisplay, TrustBadge, ScoreBreakdown } from './score-display'
import type { Candidate } from '@/lib/screening-api'
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  CheckCircle,
  XCircle,
  Lightbulb,
  BookOpen,
  FileText,
  Shield,
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

interface CandidateDetailDialogProps {
  candidate: Candidate | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CandidateDetailDialog ({
  candidate,
  open,
  onOpenChange
}: CandidateDetailDialogProps) {
  if (!candidate) return null

  const isProcessed = candidate.overallScore !== undefined

  const getRecommendationVariant = (rec?: string) => {
    switch (rec) {
      case 'strong_yes':
      case 'yes':
        return 'success' as const
      case 'maybe':
        return 'warning' as const
      case 'no':
      case 'strong_no':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  const getRecommendationLabel = (rec?: string) => {
    switch (rec) {
      case 'strong_yes':
        return 'Strong Yes'
      case 'yes':
        return 'Yes'
      case 'maybe':
        return 'Maybe'
      case 'no':
        return 'No'
      case 'strong_no':
        return 'Strong No'
      default:
        return 'Pending'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <DialogTitle className='text-xl flex items-center gap-2'>
                <User className='h-5 w-5' />
                {candidate.candidateName || 'Unknown Candidate'}
              </DialogTitle>
              <DialogDescription className='flex items-center gap-4 mt-1'>
                {candidate.candidateEmail && (
                  <span className='flex items-center gap-1'>
                    <Mail className='h-3 w-3' />
                    {candidate.candidateEmail}
                  </span>
                )}
                {candidate.parsedLocation &&
                  (candidate.parsedLocation.city ||
                    candidate.parsedLocation.country) && (
                    <span className='flex items-center gap-1'>
                      <MapPin className='h-3 w-3' />
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
                  <span className='flex items-center gap-1'>
                    <Briefcase className='h-3 w-3' />
                    {candidate.totalYearsExperience} years exp
                  </span>
                )}
              </DialogDescription>
            </div>
            {isProcessed && (
              <div className='flex items-center gap-3 shrink-0'>
                {candidate.trustScore !== undefined && (
                  <TrustBadge
                    score={candidate.trustScore}
                    flags={candidate.trustFlags}
                  />
                )}
                <ScoreCircle
                  score={Math.round(candidate.overallScore!)}
                  size={80}
                  label='Overall'
                />
              </div>
            )}
          </div>
        </DialogHeader>

        {!isProcessed ? (
          <div className='text-center py-8 text-muted-foreground'>
            <FileText className='h-8 w-8 mx-auto mb-2' />
            <p>This candidate has not been analyzed yet.</p>
            <p className='text-sm'>
              Status: <Badge variant='outline'>{candidate.status}</Badge>
            </p>
          </div>
        ) : (
          <div className='space-y-6 mt-2'>
            {/* Recommendation & Rank */}
            <div className='flex items-center gap-3 flex-wrap'>
              <Badge
                variant={getRecommendationVariant(candidate.recommendation)}
                className='text-sm px-3 py-1'
              >
                {getRecommendationLabel(candidate.recommendation)}
              </Badge>
              {candidate.rankPosition && (
                <span className='text-sm text-muted-foreground'>
                  Rank #{candidate.rankPosition}
                </span>
              )}
              {candidate.percentile && (
                <span className='text-sm text-muted-foreground'>
                  Top {Math.max(1, 100 - candidate.percentile + 1)}%
                </span>
              )}
            </div>

            {/* Score Breakdown */}
            <div>
              <h3 className='text-sm font-semibold mb-3 flex items-center gap-2'>
                <Target className='h-4 w-4' />
                Score Breakdown
              </h3>
              <ScoreBreakdown
                scores={{
                  skillsScore: candidate.skillsScore || 0,
                  experienceScore: candidate.experienceScore || 0,
                  educationScore: candidate.educationScore || 0,
                  projectScore: candidate.projectScore || 0,
                  trustScore: candidate.trustScore || 0
                }}
              />
            </div>

            {/* Skill Match */}
            {candidate.skillMatch && (
              <div>
                <h3 className='text-sm font-semibold mb-2 flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4' />
                  Skill Match ({candidate.skillMatch.matchPercentage}%)
                </h3>
                <div className='space-y-2'>
                  {candidate.skillMatch.matched.length > 0 && (
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>
                        Matched Skills
                      </p>
                      <div className='flex flex-wrap gap-1'>
                        {candidate.skillMatch.matched.map((s, i) => (
                          <Badge
                            key={i}
                            variant='secondary'
                            className='text-xs bg-green-500/10 text-green-700'
                          >
                            {s.skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {candidate.skillMatch.missing.length > 0 && (
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>
                        Missing Skills
                      </p>
                      <div className='flex flex-wrap gap-1'>
                        {candidate.skillMatch.missing.map((s, i) => (
                          <Badge
                            key={i}
                            variant='outline'
                            className='text-xs text-red-600'
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {candidate.skillMatch.partial.length > 0 && (
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>
                        Partial Matches
                      </p>
                      <div className='flex flex-wrap gap-1'>
                        {candidate.skillMatch.partial.map((s, i) => (
                          <Badge
                            key={i}
                            variant='outline'
                            className='text-xs text-yellow-600'
                          >
                            {s.skill}
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
                <div>
                  <h3 className='text-sm font-semibold mb-2 flex items-center gap-2 text-green-700'>
                    <TrendingUp className='h-4 w-4' />
                    Strengths
                  </h3>
                  <ul className='space-y-1'>
                    {candidate.strengths.map((s, i) => (
                      <li
                        key={i}
                        className='text-xs flex items-start gap-1.5'
                      >
                        <span className='text-green-500 mt-0.5'>+</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {candidate.concerns && candidate.concerns.length > 0 && (
                <div>
                  <h3 className='text-sm font-semibold mb-2 flex items-center gap-2 text-amber-700'>
                    <AlertTriangle className='h-4 w-4' />
                    Concerns
                  </h3>
                  <ul className='space-y-1'>
                    {candidate.concerns.map((c, i) => (
                      <li
                        key={i}
                        className='text-xs flex items-start gap-1.5'
                      >
                        <span className='text-amber-500 mt-0.5'>-</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Explanation */}
            {candidate.explanation && (
              <div>
                <h3 className='text-sm font-semibold mb-2 flex items-center gap-2'>
                  <Lightbulb className='h-4 w-4' />
                  Ranking Explanation
                </h3>
                <div className='space-y-1'>
                  {candidate.explanation.whyRankedHigh?.map((reason, i) => (
                    <div
                      key={`high-${i}`}
                      className='text-xs flex items-start gap-1.5 text-green-600'
                    >
                      <span className='mt-0.5'>+</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                  {candidate.explanation.whyRankedLower?.map((reason, i) => (
                    <div
                      key={`low-${i}`}
                      className='text-xs flex items-start gap-1.5 text-amber-600'
                    >
                      <span className='mt-0.5'>-</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Answers */}
            {candidate.customAnswers && candidate.customAnswers.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold mb-2 flex items-center gap-2'>
                  <FileText className='h-4 w-4' />
                  Custom Questions
                </h3>
                <div className='space-y-2'>
                  {candidate.customAnswers.map((ca, i) => (
                    <div
                      key={i}
                      className='text-xs border rounded-md p-2 space-y-1'
                    >
                      <div className='flex items-start gap-1.5'>
                        <span
                          className={
                            ca.satisfied ? 'text-green-500' : 'text-red-500'
                          }
                        >
                          {ca.satisfied ? (
                            <CheckCircle className='h-3.5 w-3.5' />
                          ) : (
                            <XCircle className='h-3.5 w-3.5' />
                          )}
                        </span>
                        <span className='font-medium'>{ca.question}</span>
                      </div>
                      <p className='text-muted-foreground pl-5'>{ca.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Predicted Roles */}
            {candidate.predictedRoles &&
              candidate.predictedRoles.length > 0 && (
                <div>
                  <h3 className='text-sm font-semibold mb-2 flex items-center gap-2'>
                    <Briefcase className='h-4 w-4' />
                    Predicted Roles
                  </h3>
                  <div className='flex flex-wrap gap-1.5'>
                    {candidate.predictedRoles.map((role, i) => (
                      <Badge key={i} variant='secondary' className='text-xs'>
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {/* Trust Flags */}
            {candidate.trustFlags && candidate.trustFlags.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold mb-2 flex items-center gap-2'>
                  <Shield className='h-4 w-4' />
                  Trust Signals
                </h3>
                <div className='flex flex-wrap gap-1.5'>
                  {candidate.trustFlags.map((flag, i) => (
                    <Badge key={i} variant='outline' className='text-xs'>
                      {flag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
