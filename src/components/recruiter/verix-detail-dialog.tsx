'use client'

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Eye,
  Send,
  RefreshCw,
  Bot,
  User,
  Loader2,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  useVerixConversationDetail,
  useRetryVerixConversation
} from '@/lib/screening-hooks'
import type { VerixQuestionResponse, VerixEventItem } from '@/lib/screening-api'
import { toast } from 'sonner'
import Loader from '@/components/shared/loader'

interface VerixDetailDialogProps {
  conversationId: string | null
  jobId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  questions_sent: { label: 'Questions Sent', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  awaiting_response: { label: 'Awaiting Response', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  responded: { label: 'Responded', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  verified: { label: 'Verified', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  expired: { label: 'Expired', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  failed: { label: 'Failed', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

export function VerixDetailDialog ({
  conversationId,
  jobId,
  open,
  onOpenChange
}: VerixDetailDialogProps) {
  const { data: conversation, isLoading } = useVerixConversationDetail(
    open ? conversationId : null
  )
  const retryMutation = useRetryVerixConversation(jobId)

  const handleRetry = async () => {
    if (!conversationId) return
    try {
      await retryMutation.mutateAsync(conversationId)
      toast.success('Engagement retry queued')
    } catch {
      toast.error('Failed to retry engagement')
    }
  }

  const statusConfig = STATUS_CONFIG[conversation?.status || 'pending'] || STATUS_CONFIG.pending

  const getAIVerdictBadge = (verdict?: string) => {
    switch (verdict) {
      case 'human':
        return (
          <Badge variant='outline' className='bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1'>
            <User className='h-3 w-3' />
            Human
          </Badge>
        )
      case 'ai_assisted':
        return (
          <Badge variant='outline' className='bg-yellow-500/10 text-yellow-400 border-yellow-500/20 flex items-center gap-1'>
            <Bot className='h-3 w-3' />
            AI-Assisted
          </Badge>
        )
      case 'ai_generated':
        return (
          <Badge variant='outline' className='bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1'>
            <Bot className='h-3 w-3' />
            AI-Generated
          </Badge>
        )
      default:
        return null
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'created': return <MessageSquare className='h-3.5 w-3.5 text-zinc-400' />
      case 'email_sent': return <Mail className='h-3.5 w-3.5 text-blue-400' />
      case 'viewed': return <Eye className='h-3.5 w-3.5 text-yellow-400' />
      case 'submitted': return <Send className='h-3.5 w-3.5 text-orange-400' />
      case 'verified': return <CheckCircle className='h-3.5 w-3.5 text-purple-400' />
      case 'reanalyzed': return <RefreshCw className='h-3.5 w-3.5 text-emerald-400' />
      default: return <Clock className='h-3.5 w-3.5 text-zinc-400' />
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border-zinc-800'>
        {isLoading || !conversation ? (
          <div className='flex items-center justify-center py-12'>
            <Loader />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <DialogTitle className='text-xl text-zinc-100'>
                    {conversation.candidateName || 'Unknown Candidate'}
                  </DialogTitle>
                  <p className='text-sm text-zinc-500 mt-1'>{conversation.candidateEmail}</p>
                </div>
                <Badge variant='outline' className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </div>
            </DialogHeader>

            {/* Scores Snapshot */}
            {(conversation.trustScore != null || conversation.skillsScore != null) && (
              <div className='flex gap-4 mt-2'>
                {conversation.trustScore != null && (
                  <div className='text-sm'>
                    <span className='text-zinc-500'>Trust: </span>
                    <span className={conversation.trustScore < 40 ? 'text-red-400 font-medium' : 'text-zinc-300 font-medium'}>
                      {Math.round(conversation.trustScore)}
                    </span>
                  </div>
                )}
                {conversation.skillsScore != null && (
                  <div className='text-sm'>
                    <span className='text-zinc-500'>Skills: </span>
                    <span className='text-zinc-300 font-medium'>{Math.round(conversation.skillsScore)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Issues */}
            {conversation.issues.length > 0 && (
              <div className='mt-4'>
                <h4 className='text-sm font-medium text-zinc-400 mb-2'>Issues Detected</h4>
                <div className='space-y-1.5'>
                  {conversation.issues.map((issue, i) => (
                    <div
                      key={i}
                      className='flex items-center gap-2 text-sm'
                    >
                      <AlertTriangle className={`h-3.5 w-3.5 ${
                        issue.severity === 'high' ? 'text-red-400' :
                        issue.severity === 'medium' ? 'text-yellow-400' : 'text-zinc-400'
                      }`} />
                      <span className='text-zinc-300'>{issue.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className='bg-zinc-800 my-2' />

            {/* Questions & Answers */}
            <div>
              <h4 className='text-sm font-medium text-zinc-400 mb-3'>Questions & Responses</h4>
              <div className='space-y-4'>
                {conversation.questions
                  .sort((a, b) => a.position - b.position)
                  .map((q, i) => (
                    <QuestionCard key={q.id} question={q} index={i} getAIVerdictBadge={getAIVerdictBadge} />
                  ))}
              </div>
            </div>

            <Separator className='bg-zinc-800 my-2' />

            {/* Event Timeline */}
            <div>
              <h4 className='text-sm font-medium text-zinc-400 mb-3'>Timeline</h4>
              <div className='space-y-2'>
                {conversation.events.map(event => (
                  <div key={event.id} className='flex items-center gap-3 text-sm'>
                    {getEventIcon(event.eventType)}
                    <span className='text-zinc-300 capitalize'>
                      {event.eventType.replace(/_/g, ' ')}
                    </span>
                    <span className='text-zinc-600 ml-auto text-xs'>
                      {formatDate(event.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Retry Button */}
            {(conversation.status === 'failed' || conversation.status === 'expired') && (
              <>
                <Separator className='bg-zinc-800 my-2' />
                <Button
                  onClick={handleRetry}
                  disabled={retryMutation.isPending}
                  variant='outline'
                  className='w-full'
                >
                  {retryMutation.isPending ? (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  ) : (
                    <RefreshCw className='h-4 w-4 mr-2' />
                  )}
                  Retry Engagement
                </Button>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function QuestionCard ({
  question,
  index,
  getAIVerdictBadge
}: {
  question: VerixQuestionResponse
  index: number
  getAIVerdictBadge: (verdict?: string) => React.ReactNode
}) {
  const resp = question.response
  const breakdown = resp?.qualityBreakdown

  return (
    <Card className='bg-zinc-950 border-zinc-800'>
      <CardHeader className='pb-2 pt-4 px-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm text-zinc-200'>
            <span className='text-zinc-500 mr-1.5'>Q{index + 1}.</span>
            {question.text}
          </CardTitle>
          <Badge variant='outline' className='text-xs capitalize bg-zinc-800 text-zinc-400 border-zinc-700'>
            {question.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        {resp ? (
          <div className='space-y-3'>
            {/* Answer */}
            <div className='bg-zinc-900 rounded-lg p-3 border border-zinc-800'>
              <p className='text-sm text-zinc-300 whitespace-pre-wrap'>{resp.answer}</p>
            </div>

            {/* Scores row */}
            <div className='flex items-center gap-3 flex-wrap'>
              {getAIVerdictBadge(resp.aiDetectionResult?.verdict)}
              {resp.qualityScore != null && (
                <Badge variant='outline' className='bg-zinc-800 text-zinc-300 border-zinc-700'>
                  Quality: {Math.round(resp.qualityScore)}/100
                </Badge>
              )}
              {resp.aiDetectionScore != null && (
                <span className='text-xs text-zinc-500'>
                  AI Score: {(resp.aiDetectionScore * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {/* Quality Breakdown Bars */}
            {breakdown && (
              <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-xs'>
                {(['depth', 'specificity', 'relevance', 'technical'] as const).map(dim => (
                  <div key={dim} className='space-y-1'>
                    <div className='flex justify-between text-zinc-500'>
                      <span className='capitalize'>{dim}</span>
                      <span>{breakdown[dim]}</span>
                    </div>
                    <Progress
                      value={breakdown[dim]}
                      className='h-1.5 bg-zinc-800'
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className='text-sm text-zinc-600 italic'>No response yet</p>
        )}
      </CardContent>
    </Card>
  )
}
