'use client'

import { useState } from 'react'
import {
  Search,
  Bot,
  Clock,
  AlertTriangle,
  CheckCircle,
  Mail,
  MessageSquare,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useVerixConversations } from '@/lib/screening-hooks'
import { VerixDetailDialog } from './verix-detail-dialog'
import Loader from '@/components/shared/loader'

interface VerixInboxProps {
  jobId: string
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    color: 'text-zinc-400',
    bg: 'bg-zinc-500/10 border-zinc-500/20',
    icon: <Clock className='h-3.5 w-3.5' />
  },
  questions_sent: {
    label: 'Sent',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    icon: <Mail className='h-3.5 w-3.5' />
  },
  awaiting_response: {
    label: 'Awaiting',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    icon: <Clock className='h-3.5 w-3.5' />
  },
  responded: {
    label: 'Responded',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    icon: <MessageSquare className='h-3.5 w-3.5' />
  },
  verified: {
    label: 'Verified',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    icon: <CheckCircle className='h-3.5 w-3.5' />
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    icon: <CheckCircle className='h-3.5 w-3.5' />
  },
  expired: {
    label: 'Expired',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    icon: <AlertTriangle className='h-3.5 w-3.5' />
  },
  failed: {
    label: 'Failed',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    icon: <AlertTriangle className='h-3.5 w-3.5' />
  }
}

export function VerixInbox ({ jobId }: VerixInboxProps) {
  const { data, isLoading } = useVerixConversations(jobId)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [detailOpen, setDetailOpen] = useState(false)

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader />
      </div>
    )
  }

  const conversations = data?.conversations || []
  const statusBreakdown = data?.statusBreakdown || {}

  const filtered = conversations.filter(c => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (c.candidateName || '').toLowerCase().includes(q) ||
      c.candidateEmail.toLowerCase().includes(q)
    )
  })

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getTrustColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <Card className='bg-zinc-900/50 border-zinc-800 overflow-hidden'>
        <CardContent className='py-16 text-center relative'>
          <div className='absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none' />
          <div className='relative'>
            <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-5'>
              <Bot className='h-8 w-8 text-violet-400' />
            </div>
            <h3 className='text-lg font-semibold text-zinc-200 mb-2'>
              Verix Agent
            </h3>
            <p className='text-zinc-500 max-w-sm mx-auto text-sm leading-relaxed'>
              The AI verification agent automatically reaches out to candidates
              with low trust scores or flagged issues. Conversations will appear
              here once analysis completes.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeCount =
    (statusBreakdown.awaiting_response || 0) +
    (statusBreakdown.questions_sent || 0)
  const respondedCount =
    (statusBreakdown.responded || 0) + (statusBreakdown.verified || 0)
  const completedCount = statusBreakdown.completed || 0

  return (
    <div className='space-y-5'>
      {/* Agent Header */}
      <div className='flex items-center gap-3 mb-1'>
        <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center'>
          <Bot className='h-5 w-5 text-violet-400' />
        </div>
        <div>
          <h3 className='text-base font-semibold text-zinc-100 flex items-center gap-2'>
            Verix Agent
            <Badge
              variant='outline'
              className='bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] font-medium'
            >
              AI
            </Badge>
          </h3>
          <p className='text-xs text-zinc-500'>
            Automated candidate verification & follow-up
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className='grid grid-cols-4 gap-3'>
        <Card className='bg-zinc-900/50 border-zinc-800 overflow-hidden relative'>
          <div className='absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent' />
          <CardContent className='py-3.5 px-4 relative'>
            <div className='flex items-center gap-2 mb-1'>
              <Zap className='h-3.5 w-3.5 text-violet-400' />
              <p className='text-[10px] text-zinc-500 uppercase tracking-wider font-medium'>
                Total
              </p>
            </div>
            <p className='text-2xl font-bold text-zinc-100'>
              {conversations.length}
            </p>
          </CardContent>
        </Card>
        <Card className='bg-zinc-900/50 border-zinc-800'>
          <CardContent className='py-3.5 px-4'>
            <div className='flex items-center gap-2 mb-1'>
              <Clock className='h-3.5 w-3.5 text-yellow-400' />
              <p className='text-[10px] text-yellow-500 uppercase tracking-wider font-medium'>
                Awaiting
              </p>
            </div>
            <p className='text-2xl font-bold text-zinc-100'>{activeCount}</p>
          </CardContent>
        </Card>
        <Card className='bg-zinc-900/50 border-zinc-800'>
          <CardContent className='py-3.5 px-4'>
            <div className='flex items-center gap-2 mb-1'>
              <MessageSquare className='h-3.5 w-3.5 text-orange-400' />
              <p className='text-[10px] text-orange-500 uppercase tracking-wider font-medium'>
                Responded
              </p>
            </div>
            <p className='text-2xl font-bold text-zinc-100'>{respondedCount}</p>
          </CardContent>
        </Card>
        <Card className='bg-zinc-900/50 border-zinc-800'>
          <CardContent className='py-3.5 px-4'>
            <div className='flex items-center gap-2 mb-1'>
              <CheckCircle className='h-3.5 w-3.5 text-emerald-400' />
              <p className='text-[10px] text-emerald-500 uppercase tracking-wider font-medium'>
                Completed
              </p>
            </div>
            <p className='text-2xl font-bold text-zinc-100'>{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500' />
        <Input
          placeholder='Search candidates...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='pl-10 bg-zinc-900/50 border-zinc-800'
        />
      </div>

      {/* Conversation Cards */}
      <div className='space-y-2'>
        {filtered.map(conv => {
          const config = STATUS_CONFIG[conv.status] || STATUS_CONFIG.pending
          return (
            <Card
              key={conv.id}
              className='bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group'
              onClick={() => {
                setSelectedConversationId(conv.id)
                setDetailOpen(true)
              }}
            >
              <CardContent className='py-3.5 px-4'>
                <div className='flex items-center gap-4'>
                  {/* Agent avatar */}
                  <div className='w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/15 to-blue-500/15 border border-violet-500/10 flex items-center justify-center shrink-0'>
                    <Bot className='h-4.5 w-4.5 text-violet-400' />
                  </div>

                  {/* Candidate info */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <p className='font-medium text-sm text-zinc-200 truncate'>
                        {conv.candidateName || 'Unknown'}
                      </p>
                      <Badge
                        variant='outline'
                        className={`${config.bg} ${config.color} flex items-center gap-1 text-[10px] shrink-0`}
                      >
                        {config.icon}
                        {config.label}
                      </Badge>
                    </div>
                    <p className='text-xs text-zinc-500 truncate mt-0.5'>
                      {conv.candidateEmail}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className='flex items-center gap-5 shrink-0'>
                    {/* Trust Score */}
                    {conv.trustScore != null && (
                      <div className='text-center'>
                        <div className='flex items-center gap-1.5'>
                          <Shield className='h-3 w-3 text-zinc-500' />
                          <span
                            className={`text-sm font-semibold ${getTrustColor(
                              conv.trustScore
                            )}`}
                          >
                            {Math.round(conv.trustScore)}
                          </span>
                        </div>
                        <div className='w-12 mt-1'>
                          <Progress
                            value={conv.trustScore}
                            className='h-1 bg-zinc-800'
                          />
                        </div>
                      </div>
                    )}

                    {/* Issues */}
                    {conv.issueCount > 0 && (
                      <div className='text-center'>
                        <div className='flex items-center gap-1'>
                          <AlertTriangle className='h-3 w-3 text-yellow-500' />
                          <span className='text-sm font-medium text-zinc-300'>
                            {conv.issueCount}
                          </span>
                        </div>
                        <p className='text-[10px] text-zinc-600'>issues</p>
                      </div>
                    )}

                    {/* Questions */}
                    <div className='text-center'>
                      <span className='text-sm font-medium text-zinc-300'>
                        {conv.questionCount}
                      </span>
                      <p className='text-[10px] text-zinc-600'>Q&A</p>
                    </div>

                    {/* Time */}
                    <span className='text-xs text-zinc-600 w-14 text-right'>
                      {formatDate(conv.createdAt)}
                    </span>

                    {/* Arrow */}
                    <ArrowRight className='h-4 w-4 text-zinc-700 group-hover:text-zinc-400 transition-colors' />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detail Dialog */}
      <VerixDetailDialog
        conversationId={selectedConversationId}
        jobId={jobId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
