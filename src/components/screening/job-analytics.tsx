'use client'

import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Candidate } from '@/lib/screening-api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import {
  Users,
  TrendingUp,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Star
} from 'lucide-react'

interface JobAnalyticsProps {
  candidates: Candidate[]
  jobTitle: string
}

const COLORS = {
  green: '#10b981',
  blue: '#3b82f6',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  pink: '#ec4899',
  zinc: '#71717a'
}

export function JobAnalytics ({ candidates }: JobAnalyticsProps) {
  const stats = useMemo(() => {
    const analyzed = candidates.filter(c => c.overallScore !== undefined)
    const scores = analyzed.map(c => c.overallScore!)
    const avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0
    const minScore = scores.length > 0 ? Math.min(...scores) : 0

    // Recommendation breakdown
    const recCounts: Record<string, number> = {
      strong_yes: 0,
      yes: 0,
      maybe: 0,
      no: 0,
      strong_no: 0
    }
    analyzed.forEach(c => {
      if (c.recommendation && recCounts[c.recommendation] !== undefined) {
        recCounts[c.recommendation]++
      }
    })

    // Score distribution (buckets of 10)
    const scoreBuckets = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${i * 10 + 9}`,
      count: 0
    }))
    scores.forEach(s => {
      const idx = Math.min(Math.floor(s / 10), 9)
      scoreBuckets[idx].count++
    })

    // Experience distribution
    const expBuckets: Record<string, number> = {
      '0-1 yrs': 0,
      '2-3 yrs': 0,
      '4-5 yrs': 0,
      '6-8 yrs': 0,
      '9+ yrs': 0
    }
    analyzed.forEach(c => {
      const y = c.totalYearsExperience ?? 0
      if (y <= 1) expBuckets['0-1 yrs']++
      else if (y <= 3) expBuckets['2-3 yrs']++
      else if (y <= 5) expBuckets['4-5 yrs']++
      else if (y <= 8) expBuckets['6-8 yrs']++
      else expBuckets['9+ yrs']++
    })

    // Status breakdown
    const statusCounts: Record<string, number> = {}
    candidates.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1
    })

    // Score breakdown radar
    const avgSkills =
      analyzed.length > 0
        ? analyzed.reduce((s, c) => s + (c.skillsScore || 0), 0) /
          analyzed.length
        : 0
    const avgExp =
      analyzed.length > 0
        ? analyzed.reduce((s, c) => s + (c.experienceScore || 0), 0) /
          analyzed.length
        : 0
    const avgEdu =
      analyzed.length > 0
        ? analyzed.reduce((s, c) => s + (c.educationScore || 0), 0) /
          analyzed.length
        : 0
    const avgProj =
      analyzed.length > 0
        ? analyzed.reduce((s, c) => s + (c.projectScore || 0), 0) /
          analyzed.length
        : 0
    const avgTrust =
      analyzed.length > 0
        ? analyzed.reduce((s, c) => s + (c.trustScore || 0), 0) /
          analyzed.length
        : 0

    // Uploads over time
    const uploadsByDate: Record<string, number> = {}
    candidates.forEach(c => {
      if (c.uploadedAt) {
        const date = new Date(c.uploadedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        })
        uploadsByDate[date] = (uploadsByDate[date] || 0) + 1
      }
    })

    // Shortlisted count
    const shortlisted = candidates.filter(c => c.isShortlisted).length

    // Verix engagement stats
    const verixEngaged = candidates.filter(c => c.verixStatus).length
    const verixResponded = candidates.filter(
      c =>
        c.verixStatus === 'responded' ||
        c.verixStatus === 'verified' ||
        c.verixStatus === 'completed'
    ).length

    // Top skills (from skillMatch data)
    const skillFreq: Record<string, number> = {}
    analyzed.forEach(c => {
      if (c.skillMatch?.matched) {
        c.skillMatch.matched.forEach(m => {
          skillFreq[m.skill] = (skillFreq[m.skill] || 0) + 1
        })
      }
    })
    const topSkills = Object.entries(skillFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({
        skill,
        count,
        pct: Math.round((count / analyzed.length) * 100)
      }))

    return {
      total: candidates.length,
      analyzed: analyzed.length,
      avgScore: Math.round(avgScore),
      maxScore: Math.round(maxScore),
      minScore: Math.round(minScore),
      recCounts,
      scoreBuckets,
      expBuckets: Object.entries(expBuckets).map(([range, count]) => ({
        range,
        count
      })),
      statusCounts: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      })),
      radarData: [
        { subject: 'Skills', score: Math.round(avgSkills) },
        { subject: 'Experience', score: Math.round(avgExp) },
        { subject: 'Education', score: Math.round(avgEdu) },
        { subject: 'Projects', score: Math.round(avgProj) },
        { subject: 'Trust', score: Math.round(avgTrust) }
      ],
      uploadTimeline: Object.entries(uploadsByDate).map(([date, count]) => ({
        date,
        count
      })),
      shortlisted,
      verixEngaged,
      verixResponded,
      topSkills
    }
  }, [candidates])

  const recPieData = [
    { name: 'Strong Yes', value: stats.recCounts.strong_yes, color: '#059669' },
    { name: 'Yes', value: stats.recCounts.yes, color: COLORS.green },
    { name: 'Maybe', value: stats.recCounts.maybe, color: COLORS.amber },
    { name: 'No', value: stats.recCounts.no, color: COLORS.red },
    { name: 'Strong No', value: stats.recCounts.strong_no, color: '#991b1b' }
  ].filter(d => d.value > 0)

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <BarChart3 className='h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>No Data Yet</h3>
          <p className='text-muted-foreground text-center'>
            Upload and analyze candidates to see analytics.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Summary Stats Row */}
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
        <StatCard icon={Users} label='Total Candidates' value={stats.total} />
        <StatCard
          icon={CheckCircle}
          label='Analyzed'
          value={stats.analyzed}
          color='text-green-500'
        />
        <StatCard
          icon={TrendingUp}
          label='Avg Score'
          value={stats.avgScore}
          suffix='/100'
          color='text-blue-500'
        />
        <StatCard
          icon={Award}
          label='Top Score'
          value={stats.maxScore}
          suffix='/100'
          color='text-purple-500'
        />
        <StatCard
          icon={Star}
          label='Shortlisted'
          value={stats.shortlisted}
          color='text-amber-500'
        />
        <StatCard
          icon={Target}
          label='Verix Engaged'
          value={stats.verixEngaged}
          color='text-violet-500'
        />
      </div>

      {/* Charts Row 1 */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Score Distribution */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Score Distribution
            </CardTitle>
            <CardDescription>
              How candidates score across the range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[240px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={stats.scoreBuckets}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='hsl(var(--border))'
                  />
                  <XAxis
                    dataKey='range'
                    tick={{
                      fontSize: 11,
                      fill: 'hsl(var(--muted-foreground))'
                    }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: 'hsl(var(--muted-foreground))'
                    }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar
                    dataKey='count'
                    fill={COLORS.blue}
                    radius={[4, 4, 0, 0]}
                    name='Candidates'
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation Breakdown */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Recommendations
            </CardTitle>
            <CardDescription>AI recommendation distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[240px] flex items-center'>
              {recPieData.length > 0 ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={recPieData}
                      cx='50%'
                      cy='50%'
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey='value'
                      label={({ name, value }) => `${name} (${value})`}
                    >
                      {recPieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className='text-sm text-muted-foreground text-center w-full'>
                  No recommendations yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Experience Distribution */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Experience Levels
            </CardTitle>
            <CardDescription>Years of experience breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[240px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={stats.expBuckets}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='hsl(var(--border))'
                  />
                  <XAxis
                    dataKey='range'
                    tick={{
                      fontSize: 11,
                      fill: 'hsl(var(--muted-foreground))'
                    }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: 'hsl(var(--muted-foreground))'
                    }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar
                    dataKey='count'
                    fill={COLORS.purple}
                    radius={[4, 4, 0, 0]}
                    name='Candidates'
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Average Scores Radar */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Score Breakdown
            </CardTitle>
            <CardDescription>Mean scores across all dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[240px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <RadarChart
                  data={stats.radarData}
                  cx='50%'
                  cy='50%'
                  outerRadius={80}
                >
                  <PolarGrid stroke='hsl(var(--border))' />
                  <PolarAngleAxis
                    dataKey='subject'
                    tick={{
                      fontSize: 11,
                      fill: 'hsl(var(--muted-foreground))'
                    }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Radar
                    name='Score'
                    dataKey='score'
                    stroke={COLORS.cyan}
                    fill={COLORS.cyan}
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Uploads Over Time */}
        {stats.uploadTimeline.length > 1 && (
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Applications Over Time
              </CardTitle>
              <CardDescription>When candidates were uploaded</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[240px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart
                    data={stats.uploadTimeline}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id='colorUploads'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor={COLORS.green}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset='95%'
                          stopColor={COLORS.green}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='hsl(var(--border))'
                    />
                    <XAxis
                      dataKey='date'
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))'
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))'
                      }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area
                      type='monotone'
                      dataKey='count'
                      stroke={COLORS.green}
                      fill='url(#colorUploads)'
                      strokeWidth={2}
                      name='Uploads'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Skills */}
        {stats.topSkills.length > 0 && (
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Top Matched Skills
              </CardTitle>
              <CardDescription>
                Most common skills among candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[240px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={stats.topSkills}
                    layout='vertical'
                    margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='hsl(var(--border))'
                    />
                    <XAxis
                      type='number'
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))'
                      }}
                    />
                    <YAxis
                      dataKey='skill'
                      type='category'
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))'
                      }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={value => [`${value} candidates`, 'Matched']}
                    />
                    <Bar
                      dataKey='count'
                      fill={COLORS.cyan}
                      radius={[0, 4, 4, 0]}
                      name='Candidates'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pipeline & Processing Summary */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Processing Status */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Processing Pipeline
            </CardTitle>
            <CardDescription>Current status of all candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {stats.statusCounts.map(({ status, count }) => (
                <div key={status} className='flex items-center gap-3'>
                  <div className='flex items-center gap-2 w-24'>
                    {status === 'analyzed' && (
                      <CheckCircle className='h-4 w-4 text-green-500' />
                    )}
                    {status === 'parsed' && (
                      <Clock className='h-4 w-4 text-blue-500' />
                    )}
                    {(status === 'parsing' || status === 'analyzing') && (
                      <Clock className='h-4 w-4 text-amber-500' />
                    )}
                    {status === 'failed' && (
                      <XCircle className='h-4 w-4 text-red-500' />
                    )}
                    {status === 'uploaded' && (
                      <AlertTriangle className='h-4 w-4 text-zinc-500' />
                    )}
                    <span className='text-sm capitalize'>{status}</span>
                  </div>
                  <div className='flex-1 bg-muted rounded-full h-2.5'>
                    <div
                      className='h-2.5 rounded-full transition-all'
                      style={{
                        width: `${(count / stats.total) * 100}%`,
                        backgroundColor:
                          status === 'analyzed'
                            ? COLORS.green
                            : status === 'parsed'
                            ? COLORS.blue
                            : status === 'failed'
                            ? COLORS.red
                            : COLORS.amber
                      }}
                    />
                  </div>
                  <span className='text-sm font-medium w-12 text-right'>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Quick Insights
            </CardTitle>
            <CardDescription>
              Key takeaways from the candidate pool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {stats.analyzed > 0 && (
                <>
                  <InsightRow
                    label='Score Range'
                    value={`${stats.minScore} – ${stats.maxScore}`}
                    detail={`Average: ${stats.avgScore}`}
                  />
                  <InsightRow
                    label='Strong Candidates'
                    value={`${
                      stats.recCounts.strong_yes + stats.recCounts.yes
                    }`}
                    detail={`${Math.round(
                      ((stats.recCounts.strong_yes + stats.recCounts.yes) /
                        stats.analyzed) *
                        100
                    )}% of analyzed`}
                    positive
                  />
                  <InsightRow
                    label='Needs Review'
                    value={`${stats.recCounts.maybe}`}
                    detail={`${Math.round(
                      (stats.recCounts.maybe / stats.analyzed) * 100
                    )}% maybe`}
                  />
                  <InsightRow
                    label='Not Recommended'
                    value={`${stats.recCounts.no + stats.recCounts.strong_no}`}
                    detail={`${Math.round(
                      ((stats.recCounts.no + stats.recCounts.strong_no) /
                        stats.analyzed) *
                        100
                    )}% rejected`}
                    negative
                  />
                  {stats.shortlisted > 0 && (
                    <InsightRow
                      label='Shortlisted'
                      value={`${stats.shortlisted}`}
                      detail={`${Math.round(
                        (stats.shortlisted / stats.total) * 100
                      )}% of total`}
                      positive
                    />
                  )}
                  {stats.verixEngaged > 0 && (
                    <InsightRow
                      label='Verix Verified'
                      value={`${stats.verixResponded}/${stats.verixEngaged}`}
                      detail={`${Math.round(
                        (stats.verixResponded / stats.verixEngaged) * 100
                      )}% response rate`}
                    />
                  )}
                </>
              )}
              {stats.analyzed === 0 && (
                <p className='text-sm text-muted-foreground py-4 text-center'>
                  Run analysis to see insights
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard ({
  icon: Icon,
  label,
  value,
  suffix,
  color
}: {
  icon: React.ElementType
  label: string
  value: number
  suffix?: string
  color?: string
}) {
  return (
    <Card>
      <CardContent className='pt-4 pb-3 px-4'>
        <div className='flex items-center gap-2 mb-1'>
          <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
          <span className='text-xs text-muted-foreground'>{label}</span>
        </div>
        <p className='text-2xl font-bold'>
          {value}
          {suffix && (
            <span className='text-sm font-normal text-muted-foreground'>
              {suffix}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  )
}

function InsightRow ({
  label,
  value,
  detail,
  positive,
  negative
}: {
  label: string
  value: string
  detail: string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <div className='flex items-center justify-between py-1.5 border-b border-border/50 last:border-0'>
      <div>
        <span className='text-sm font-medium'>{label}</span>
        <span className='text-xs text-muted-foreground ml-2'>{detail}</span>
      </div>
      <Badge
        variant='outline'
        className={
          positive
            ? 'bg-green-500/10 text-green-600 border-green-500/20'
            : negative
            ? 'bg-red-500/10 text-red-600 border-red-500/20'
            : ''
        }
      >
        {value}
      </Badge>
    </div>
  )
}
