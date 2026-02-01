'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Star,
  StarOff,
  Users,
  Download,
  Mail,
  Eye
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface Candidate {
  id: string
  name: string
  email: string
  score: number
  skills: string[]
  experience: string
  appliedDate: string
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected'
  isShortlisted: boolean
  group?: string
}

type SortField = 'name' | 'score' | 'appliedDate'
type SortOrder = 'asc' | 'desc'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export function CandidateTableView () {
  const { data: candidatesData, isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/candidates`)
      if (!response.ok) throw new Error('Failed to fetch candidates')
      return response.json()
    }
  })

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(
    new Set()
  )
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [showGroupDialog, setShowGroupDialog] = useState(false)

  useEffect(() => {
    if (candidatesData?.candidates) {
      const mapped = candidatesData.candidates.map((c: any) => ({
        id: c.resumeId,
        name: c.candidateName || 'Unknown',
        email: c.candidateEmail || '',
        score: c.overallScore || 0,
        skills: c.skillMatch?.matched?.map((s: any) => s.skill) || [],
        experience: c.totalYearsExperience
          ? `${c.totalYearsExperience} years`
          : 'N/A',
        appliedDate: c.processedAt || new Date().toISOString(),
        status: c.status === 'parsed' ? 'reviewed' : 'new',
        isShortlisted: false
      }))
      setCandidates(mapped)
    }
  }, [candidatesData])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleToggleShortlist = (candidateId: string) => {
    setCandidates(
      candidates.map(c =>
        c.id === candidateId ? { ...c, isShortlisted: !c.isShortlisted } : c
      )
    )
  }

  const handleSelectCandidate = (candidateId: string) => {
    const newSelected = new Set(selectedCandidates)
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId)
    } else {
      newSelected.add(candidateId)
    }
    setSelectedCandidates(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set())
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map(c => c.id)))
    }
  }

  const handleBulkShortlist = () => {
    setCandidates(
      candidates.map(c =>
        selectedCandidates.has(c.id) ? { ...c, isShortlisted: true } : c
      )
    )
    setSelectedCandidates(new Set())
  }

  const handleCreateGroup = (groupName: string) => {
    setCandidates(
      candidates.map(c =>
        selectedCandidates.has(c.id) ? { ...c, group: groupName } : c
      )
    )
    setSelectedCandidates(new Set())
    setShowGroupDialog(false)
  }

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(c.status)
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === 'score') {
        comparison = a.score - b.score
      } else if (sortField === 'appliedDate') {
        comparison =
          new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const getStatusBadge = (status: Candidate['status']) => {
    const variants = {
      new: 'default',
      reviewed: 'secondary',
      shortlisted: 'success',
      rejected: 'destructive'
    } as const
    return <Badge variant={variants[status] as any}>{status}</Badge>
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 font-semibold'
    if (score >= 75) return 'text-blue-600 font-semibold'
    if (score >= 60) return 'text-orange-600 font-semibold'
    return 'text-red-600 font-semibold'
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-muted-foreground'>Loading candidates...</div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold'>Candidates</h2>
          <p className='text-muted-foreground'>
            Manage and review all candidates across your jobs
          </p>
        </div>
        {selectedCandidates.size > 0 && (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>
              {selectedCandidates.size} selected
            </span>
            <Button variant='outline' size='sm' onClick={handleBulkShortlist}>
              <Star className='h-4 w-4 mr-2' />
              Shortlist
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowGroupDialog(true)}
            >
              <Users className='h-4 w-4 mr-2' />
              Create Group
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4 flex-1'>
              <div className='relative flex-1 max-w-md'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search by name, email, or skills...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <Filter className='h-4 w-4 mr-2' />
                    Filter
                    {statusFilter.length > 0 && (
                      <Badge variant='secondary' className='ml-2'>
                        {statusFilter.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {['new', 'reviewed', 'shortlisted', 'rejected'].map(
                    status => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={statusFilter.includes(status)}
                        onCheckedChange={checked => {
                          setStatusFilter(
                            checked
                              ? [...statusFilter, status]
                              : statusFilter.filter(s => s !== status)
                          )
                        }}
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm'>
                <Download className='h-4 w-4 mr-2' />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'>
                  <Checkbox
                    checked={
                      filteredCandidates.length > 0 &&
                      selectedCandidates.size === filteredCandidates.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className='w-12'></TableHead>
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
                <TableHead>Skills</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleSort('appliedDate')}
                    className='flex items-center gap-1'
                  >
                    Applied
                    <ArrowUpDown className='h-3 w-3' />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className='w-12'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className='text-center py-8 text-muted-foreground'
                  >
                    No candidates found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map(candidate => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCandidates.has(candidate.id)}
                        onCheckedChange={() =>
                          handleSelectCandidate(candidate.id)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleToggleShortlist(candidate.id)}
                      >
                        {candidate.isShortlisted ? (
                          <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                        ) : (
                          <StarOff className='h-4 w-4 text-muted-foreground' />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className='font-medium'>{candidate.name}</div>
                        <div className='text-sm text-muted-foreground'>
                          {candidate.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={getScoreColor(candidate.score)}>
                        {candidate.score}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {candidate.skills.slice(0, 3).map((skill, i) => (
                          <Badge
                            key={i}
                            variant='secondary'
                            className='text-xs'
                          >
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 3 && (
                          <Badge variant='outline' className='text-xs'>
                            +{candidate.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{candidate.experience}</TableCell>
                    <TableCell>
                      {new Date(candidate.appliedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                    <TableCell>
                      {candidate.group && (
                        <Badge variant='outline' className='text-xs'>
                          <Users className='h-3 w-3 mr-1' />
                          {candidate.group}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem>
                            <Eye className='h-4 w-4 mr-2' />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className='h-4 w-4 mr-2' />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleShortlist(candidate.id)}
                          >
                            {candidate.isShortlisted ? (
                              <>
                                <StarOff className='h-4 w-4 mr-2' />
                                Remove from Shortlist
                              </>
                            ) : (
                              <>
                                <Star className='h-4 w-4 mr-2' />
                                Add to Shortlist
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Simple Group Creation Dialog */}
      {showGroupDialog && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle>Create Group</CardTitle>
              <CardDescription>
                Create a group for {selectedCandidates.size} selected candidates
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Input
                placeholder='Enter group name...'
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    handleCreateGroup(e.currentTarget.value)
                  }
                }}
              />
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setShowGroupDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={e => {
                    const input = e.currentTarget.parentElement
                      ?.previousElementSibling as HTMLInputElement
                    if (input?.value) {
                      handleCreateGroup(input.value)
                    }
                  }}
                >
                  Create Group
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
