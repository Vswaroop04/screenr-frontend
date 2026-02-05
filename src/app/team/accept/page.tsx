'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Users } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { teamAPI } from '@/lib/screening-api'
import { toast } from 'sonner'

function AcceptInvitationFallback() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4'>
            <Loader2 className='h-16 w-16 animate-spin text-primary' />
          </div>
          <CardTitle className='text-2xl'>Loading...</CardTitle>
          <CardDescription>Please wait...</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { user, isAuthenticated } = useAuthStore()

  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'login_required'
  >('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid invitation link. No token provided.')
      return
    }

    if (!isAuthenticated || !user?.id) {
      setStatus('login_required')
      setMessage(
        'You need to log in or create an account to accept this invitation. Make sure you use the same email the invitation was sent to.'
      )
      return
    }

    const acceptInvitation = async () => {
      try {
        const result = await teamAPI.acceptInvitation(token, user.id)
        if (result.success) {
          setStatus('success')
          setMessage('You have successfully joined the team!')
          toast.success('Welcome to the team!')
          setTimeout(() => {
            router.push('/recruiter/home')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Failed to accept invitation.')
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to accept invitation. It may have expired or already been used.'
        setStatus('error')
        setMessage(errorMessage)
        toast.error(errorMessage)
      }
    }

    acceptInvitation()
  }, [token, isAuthenticated, user, router])

  const handleLogin = () => {
    const returnUrl = `/team/accept?token=${token}`
    router.push(
      `/auth/recruiter/login?returnUrl=${encodeURIComponent(returnUrl)}`
    )
  }

  const handleSignup = () => {
    router.push('/auth/recruiter/signup')
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4'>
            {status === 'loading' && (
              <Loader2 className='h-16 w-16 animate-spin text-primary' />
            )}
            {status === 'success' && (
              <CheckCircle className='h-16 w-16 text-green-500' />
            )}
            {status === 'error' && (
              <XCircle className='h-16 w-16 text-destructive' />
            )}
            {status === 'login_required' && (
              <Users className='h-16 w-16 text-primary' />
            )}
          </div>
          <CardTitle className='text-2xl'>
            {status === 'loading' && 'Accepting Invitation...'}
            {status === 'success' && 'Invitation Accepted!'}
            {status === 'error' && 'Invitation Error'}
            {status === 'login_required' && 'Join the Team'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait...'}
            {status === 'success' && message}
            {status === 'error' && message}
            {status === 'login_required' && message}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col items-center space-y-4'>
          {status === 'success' && (
            <p className='text-sm text-muted-foreground'>
              Redirecting to dashboard...
            </p>
          )}
          {status === 'login_required' && (
            <div className='flex flex-col gap-3 w-full'>
              <Button onClick={handleLogin} className='w-full'>
                Log In to Accept
              </Button>
              <Button
                variant='outline'
                onClick={handleSignup}
                className='w-full'
              >
                Create an Account
              </Button>
              <p className='text-xs text-muted-foreground text-center'>
                If you don&apos;t have an account yet, sign up with the same
                email the invitation was sent to.
              </p>
            </div>
          )}
          {status === 'error' && (
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => router.push('/')}>
                Go Home
              </Button>
              <Button onClick={handleLogin}>Login</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<AcceptInvitationFallback />}>
      <AcceptInvitationContent />
    </Suspense>
  )
}
