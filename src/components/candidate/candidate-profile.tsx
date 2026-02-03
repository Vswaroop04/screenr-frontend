'use client'

import { useAuthStore } from '@/lib/auth-store'
import { useCandidateProfile } from '@/lib/screening-hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Mail,
  User,
  FileText,
  BarChart3,
  Star,
  Clock,
  LogOut
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/shared/loader'

export function CandidateProfile () {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { data: profile, isLoading } = useCandidateProfile()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='space-y-6 max-w-3xl'>
      <div>
        <h1 className='text-2xl font-bold'>Profile</h1>
        <p className='text-muted-foreground text-sm'>
          Your account information and stats
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Account</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center'>
              <span className='text-xl font-bold text-primary'>
                {(
                  user?.fullName?.[0] ||
                  user?.email?.[0] ||
                  'C'
                ).toUpperCase()}
              </span>
            </div>
            <div>
              <p className='font-semibold text-lg'>
                {user?.fullName || 'Candidate'}
              </p>
              <p className='text-sm text-muted-foreground flex items-center gap-1'>
                <Mail className='w-3 h-3' />
                {user?.email}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <User className='w-4 h-4' />
            <span>
              Role:{' '}
              <span className='capitalize font-medium text-foreground'>
                {user?.role || 'candidate'}
              </span>
            </span>
          </div>

          {user?.createdAt && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Clock className='w-4 h-4' />
              <span>
                Member since{' '}
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2'>
                <FileText className='w-5 h-5 text-blue-500' />
              </div>
              <p className='text-2xl font-bold'>
                {profile?.totalResumes || 0}
              </p>
              <p className='text-xs text-muted-foreground'>Resumes</p>
            </div>
            <div className='text-center'>
              <div className='w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-2'>
                <BarChart3 className='w-5 h-5 text-purple-500' />
              </div>
              <p className='text-2xl font-bold'>
                {profile?.totalAnalyses || 0}
              </p>
              <p className='text-xs text-muted-foreground'>Analyses</p>
            </div>
            <div className='text-center'>
              <div className='w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2'>
                <Star className='w-5 h-5 text-green-500' />
              </div>
              <p className='text-2xl font-bold'>
                {profile?.averageScore
                  ? `${Math.round(profile.averageScore)}%`
                  : '--'}
              </p>
              <p className='text-xs text-muted-foreground'>Avg Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Skills */}
      {profile?.topSkills && profile.topSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {profile.topSkills.map(skill => (
                <Badge key={skill} variant='secondary'>
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Activity */}
      {profile?.lastActivity && (
        <div className='text-sm text-muted-foreground flex items-center gap-2'>
          <Clock className='w-4 h-4' />
          Last activity:{' '}
          {new Date(profile.lastActivity).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )}

      {/* Logout */}
      <div className='pt-4 border-t'>
        <Button variant='destructive' onClick={handleLogout}>
          <LogOut className='w-4 h-4 mr-2' />
          Logout
        </Button>
      </div>
    </div>
  )
}
