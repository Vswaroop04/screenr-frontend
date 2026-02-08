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
  MessageSquare,
  Shield,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
import type { VerixQuestionResponse } from '@/lib/screening-api'
import { toast } from 'sonner'
import Loader from '@/components/shared/loader'

interface VerixDetailDialogProps {
  conversationId: string | null
  jobId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: {
    label: 'Pending',
    color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  },
  questions_sent: {
    label: 'Questions Sent',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  awaiting_response: {
    label: 'Awaiting Response',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  },
  responded: {
    label: 'Responded',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  },
  verified: {
    label: 'Verified',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  expired: {
    label: 'Expired',
    color: 'bg-red-500/10 text-red-400 border-red-500/20'
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-500/10 text-red-400 border-red-500/20'
  }
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

  const statusConfig =
    STATUS_CONFIG[conversation?.status || 'pending'] || STATUS_CONFIG.pending

  const getTrustColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getAIVerdictBadge = (verdict?: string) => {
    switch (verdict) {
      case 'human':
        return (
          <Badge
            variant='outline'
            className='bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1 text-[10px]'
          >
            <User className='h-3 w-3' />
            Human
          </Badge>
        )
      case 'ai_assisted':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-500/10 text-yellow-400 border-yellow-500/20 flex items-center gap-1 text-[10px]'
          >
            <Sparkles className='h-3 w-3' />
            AI-Assisted
          </Badge>
        )
      case 'ai_generated':
        return (
          <Badge
            variant='outline'
            className='bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1 text-[10px]'
          >
            <Sparkles className='h-3 w-3' />
            AI-Generated
          </Badge>
        )
      default:
        return null
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'created':
        return <MessageSquare className='h-3.5 w-3.5 text-violet-400' />
      case 'email_sent':
        return <Mail className='h-3.5 w-3.5 text-blue-400' />
      case 'viewed':
        return <Eye className='h-3.5 w-3.5 text-yellow-400' />
      case 'submitted':
        return <Send className='h-3.5 w-3.5 text-orange-400' />
      case 'verified':
        return <CheckCircle className='h-3.5 w-3.5 text-purple-400' />
      case 'reanalyzed':
        return <RefreshCw className='h-3.5 w-3.5 text-emerald-400' />
      default:
        return <Clock className='h-3.5 w-3.5 text-zinc-500' />
    }
  }

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'created':
        return 'Conversation created'
      case 'email_sent':
        return 'Verification email sent'
      case 'viewed':
        return 'Candidate opened the form'
      case 'submitted':
        return 'Candidate submitted responses'
      case 'verified':
        return 'Responses verified by AI'
      case 'reanalyzed':
        return 'Re-analyzed by agent'
      default:
        return eventType.replace(/_/g, ' ')
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
      <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-950 border-zinc-800 p-0'>
        {isLoading || !conversation ? (
          <div className='flex items-center justify-center py-16'>
            <Loader />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className='sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-6 py-4'>
              <DialogHeader>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center shrink-0'>
                    <Bot className='h-5 w-5 text-violet-400' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <DialogTitle className='text-base text-zinc-100'>
                        {conversation.candidateName || 'Unknown Candidate'}
                      </DialogTitle>
                      <Badge
                        variant='outline'
                        className={`${statusConfig.color} text-[10px]`}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <p className='text-xs text-zinc-500 mt-0.5'>
                      {conversation.candidateEmail}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              {/* Score pills */}
              {(conversation.trustScore != null ||
                conversation.skillsScore != null) && (
                <div className='flex gap-3 mt-3'>
                  {conversation.trustScore != null && (
                    <div className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800'>
                      <Shield className='h-3.5 w-3.5 text-zinc-500' />
                      <span className='text-xs text-zinc-500'>Trust</span>
                      <span
                        className={`text-sm font-semibold ${getTrustColor(
                          conversation.trustScore
                        )}`}
                      >
                        {Math.round(conversation.trustScore)}
                      </span>
                    </div>
                  )}
                  {conversation.skillsScore != null && (
                    <div className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800'>
                      <Sparkles className='h-3.5 w-3.5 text-zinc-500' />
                      <span className='text-xs text-zinc-500'>Skills</span>
                      <span className='text-sm font-semibold text-zinc-200'>
                        {Math.round(conversation.skillsScore)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className='px-6 py-4 space-y-6'>
              {/* Issues */}
              {conversation.issues.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-[10px] text-zinc-500 uppercase tracking-wider font-medium'>
                    Flagged Issues
                  </p>
                  <div className='space-y-1.5'>
                    {conversation.issues.map((issue, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg border ${
                          issue.severity === 'high'
                            ? 'bg-red-500/5 border-red-500/15'
                            : issue.severity === 'medium'
                            ? 'bg-yellow-500/5 border-yellow-500/15'
                            : 'bg-zinc-900 border-zinc-800'
                        }`}
                      >
                        <AlertTriangle
                          className={`h-3.5 w-3.5 shrink-0 ${
                            issue.severity === 'high'
                              ? 'text-red-400'
                              : issue.severity === 'medium'
                              ? 'text-yellow-400'
                              : 'text-zinc-500'
                          }`}
                        />
                        <span className='text-zinc-300 text-sm'>
                          {issue.detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation — Chat-style Q&A */}
              <div className='space-y-2'>
                <p className='text-[10px] text-zinc-500 uppercase tracking-wider font-medium'>
                  Conversation
                </p>
                <div className='space-y-3'>
                  {conversation.questions
                    .sort((a, b) => a.position - b.position)
                    .map((q, i) => (
                      <ChatBubbleQA
                        key={q.id}
                        question={q}
                        index={i}
                        getAIVerdictBadge={getAIVerdictBadge}
                      />
                    ))}
                </div>
              </div>

              {/* Timeline */}
              <div className='space-y-2'>
                <p className='text-[10px] text-zinc-500 uppercase tracking-wider font-medium'>
                  Activity Timeline
                </p>
                <div className='relative'>
                  {/* Vertical line */}
                  <div className='absolute left-[11px] top-2 bottom-2 w-px bg-zinc-800' />
                  <div className='space-y-0'>
                    {conversation.events.map(event => (
                      <div
                        key={event.id}
                        className='flex items-center gap-3 py-2 relative'
                      >
                        <div className='w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center z-10'>
                          {getEventIcon(event.eventType)}
                        </div>
                        <span className='text-sm text-zinc-300 flex-1'>
                          {getEventLabel(event.eventType)}
                        </span>
                        <span className='text-xs text-zinc-600'>
                          {formatDate(event.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Retry Button */}
              {(conversation.status === 'failed' ||
                conversation.status === 'expired') && (
                <Button
                  onClick={handleRetry}
                  disabled={retryMutation.isPending}
                  variant='outline'
                  className='w-full border-zinc-800 hover:bg-zinc-900'
                >
                  {retryMutation.isPending ? (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  ) : (
                    <RefreshCw className='h-4 w-4 mr-2' />
                  )}
                  Retry Engagement
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ChatBubbleQA ({
  question,
  getAIVerdictBadge
}: {
  question: VerixQuestionResponse
  index: number
  getAIVerdictBadge: (verdict?: string) => React.ReactNode
}) {
  const resp = question.response
  const breakdown = resp?.qualityBreakdown

  return (
    <div className='space-y-2'>
      {/* Agent question bubble */}
      <div className='flex gap-2.5'>
        <div className='w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/15 flex items-center justify-center shrink-0 mt-0.5'>
          <Bot className='h-3.5 w-3.5 text-violet-400' />
        </div>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-1'>
            <span className='text-[10px] font-medium text-violet-400'>
              Verix Agent
            </span>
            {question.required && (
              <Badge
                variant='outline'
                className='text-[9px] bg-red-500/10 text-red-400 border-red-500/20 px-1.5 py-0'
              >
                Required
              </Badge>
            )}
          </div>
          <div className='bg-zinc-900 border border-zinc-800 rounded-xl rounded-tl-sm px-3.5 py-2.5'>
            <p className='text-sm text-zinc-200'>{question.text}</p>
          </div>
        </div>
      </div>

      {/* Candidate response bubble */}
      {resp ? (
        <div className='flex gap-2.5 justify-end'>
          <div className='flex-1 max-w-[90%]'>
            <div className='flex items-center gap-2 mb-1 justify-end'>
              <span className='text-[10px] font-medium text-zinc-500'>
                Candidate
              </span>
              {getAIVerdictBadge(resp.aiDetectionResult?.verdict)}
            </div>
            <div className='bg-violet-500/8 border border-violet-500/10 rounded-xl rounded-tr-sm px-3.5 py-2.5'>
              <p className='text-sm text-zinc-300 whitespace-pre-wrap'>
                {resp.answer}
              </p>
            </div>

            {/* Quality metrics below response */}
            {(resp.qualityScore != null || breakdown) && (
              <div className='mt-2 space-y-2'>
                {resp.qualityScore != null && (
                  <div className='flex items-center gap-2'>
                    <span className='text-[10px] text-zinc-600'>Quality</span>
                    <div className='flex-1 max-w-[120px]'>
                      <Progress
                        value={resp.qualityScore}
                        className='h-1 bg-zinc-800'
                      />
                    </div>
                    <span className='text-[10px] font-medium text-zinc-400'>
                      {Math.round(resp.qualityScore)}
                    </span>
                    {resp.aiDetectionScore != null && (
                      <span className='text-[10px] text-zinc-600 ml-2'>
                        AI: {(resp.aiDetectionScore * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                )}
                {breakdown && (
                  <div className='grid grid-cols-4 gap-2'>
                    {(
                      [
                        'depth',
                        'specificity',
                        'relevance',
                        'technical'
                      ] as const
                    ).map(dim => (
                      <div key={dim} className='text-center'>
                        <div className='text-[10px] text-zinc-600 capitalize mb-0.5'>
                          {dim}
                        </div>
                        <div className='text-xs font-medium text-zinc-400'>
                          {breakdown[dim]}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className='w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5'>
            <User className='h-3.5 w-3.5 text-zinc-400' />
          </div>
        </div>
      ) : (
        <div className='flex gap-2.5 justify-end'>
          <div className='bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl px-3.5 py-2.5'>
            <p className='text-xs text-zinc-600 italic flex items-center gap-1.5'>
              <Clock className='h-3 w-3' />
              Awaiting response...
            </p>
          </div>
          <div className='w-7 h-7 rounded-lg bg-zinc-800/50 border border-zinc-800 border-dashed flex items-center justify-center shrink-0 mt-0.5'>
            <User className='h-3.5 w-3.5 text-zinc-600' />
          </div>
        </div>
      )}
    </div>
  )
}
