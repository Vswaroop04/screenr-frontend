'use client'

import { useState } from 'react'
import {
  Search,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useVerixConversations } from '@/lib/screening-hooks'
import { VerixDetailDialog } from './verix-detail-dialog'
import Loader from '@/components/shared/loader'

interface VerixInboxProps {
  jobId: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: <Clock className='h-3 w-3' /> },
  questions_sent: { label: 'Sent', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Mail className='h-3 w-3' /> },
  awaiting_response: { label: 'Awaiting', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: <Clock className='h-3 w-3' /> },
  responded: { label: 'Responded', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: <MessageSquare className='h-3 w-3' /> },
  verified: { label: 'Verified', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: <CheckCircle className='h-3 w-3' /> },
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle className='h-3 w-3' /> },
  expired: { label: 'Expired', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <AlertTriangle className='h-3 w-3' /> },
  failed: { label: 'Failed', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <AlertTriangle className='h-3 w-3' /> },
}

export function VerixInbox ({ jobId }: VerixInboxProps) {
  const { data, isLoading } = useVerixConversations(jobId)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
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

  // Filter
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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
    return (
      <Badge variant='outline' className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <Card className='bg-zinc-900/50 border-zinc-800'>
        <CardContent className='py-12 text-center'>
          <MessageSquare className='h-12 w-12 text-zinc-600 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-zinc-300 mb-2'>No Verix Engagements Yet</h3>
          <p className='text-zinc-500 max-w-md mx-auto'>
            Verix automatically reaches out to candidates with low trust scores or missing skills after analysis completes. Engagements will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Summary cards
  const activeCount = (statusBreakdown.awaiting_response || 0) + (statusBreakdown.questions_sent || 0)
  const respondedCount = (statusBreakdown.responded || 0) + (statusBreakdown.verified || 0)
  const completedCount = statusBreakdown.completed || 0

  return (
    <div className='space-y-4'>
      {/* Status Summary */}
      <div className='grid grid-cols-4 gap-3'>
        <Card className='bg-zinc-900/50 border-zinc-800'>
          <CardContent className='py-4 px-4'>
            <p className='text-xs text-zinc-500 uppercase tracking-wider'>Total</p>
            <p className='text-2xl font-bold text-zinc-100'>{conversations.length}</p>
          </CardContent>
        </Card>
        <Card className='bg-zinc-900/50 border-zinc-800'>
          <CardContent className='py-4 px-4'>
            <p className='text-xs text-yellow-500 uppercase tracking-wider'>Awaiting</p>
            <p className='text-2xl font-bold text-zinc-100'>{activeCount}</p>
          </CardContent>
        </Card>
        <Card className='bg-zinc-900/50 border-zinc-800'>
          <CardContent className='py-4 px-4'>
            <p className='text-xs text-orange-500 uppercase tracking-wider'>Responded</p>
            <p className='text-2xl font-bold text-zinc-100'>{respondedCount}</p>
          </CardContent>
        </Card>
        <Card className='bg-zinc-900/50 border-zinc-800'>
          <CardContent className='py-4 px-4'>
            <p className='text-xs text-emerald-500 uppercase tracking-wider'>Completed</p>
            <p className='text-2xl font-bold text-zinc-100'>{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search by name or email...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Table */}
      <Card className='bg-zinc-900/50 border-zinc-800'>
        <Table>
          <TableHeader>
            <TableRow className='border-zinc-800 hover:bg-transparent'>
              <TableHead className='text-zinc-400'>Candidate</TableHead>
              <TableHead className='text-zinc-400'>Status</TableHead>
              <TableHead className='text-zinc-400'>Issues</TableHead>
              <TableHead className='text-zinc-400'>Trust</TableHead>
              <TableHead className='text-zinc-400'>Questions</TableHead>
              <TableHead className='text-zinc-400'>Date</TableHead>
              <TableHead className='text-zinc-400 w-10'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(conv => (
              <TableRow
                key={conv.id}
                className='border-zinc-800 cursor-pointer hover:bg-zinc-800/50'
                onClick={() => {
                  setSelectedConversationId(conv.id)
                  setDetailOpen(true)
                }}
              >
                <TableCell>
                  <div>
                    <p className='font-medium text-zinc-200'>{conv.candidateName || 'Unknown'}</p>
                    <p className='text-xs text-zinc-500'>{conv.candidateEmail}</p>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(conv.status)}</TableCell>
                <TableCell>
                  <span className='text-zinc-300'>{conv.issueCount}</span>
                </TableCell>
                <TableCell>
                  {conv.trustScore != null ? (
                    <span className={conv.trustScore < 40 ? 'text-red-400' : 'text-zinc-300'}>
                      {Math.round(conv.trustScore)}
                    </span>
                  ) : (
                    <span className='text-zinc-600'>-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className='text-zinc-300'>{conv.questionCount}</span>
                </TableCell>
                <TableCell>
                  <span className='text-zinc-400 text-sm'>
                    {formatDate(conv.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <Eye className='h-4 w-4 text-zinc-500' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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
