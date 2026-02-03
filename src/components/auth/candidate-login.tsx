'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendOtp, verifyOtp } from '@/lib/auth-api'
import { useAuthStore } from '@/lib/auth-store'
import { toast } from 'sonner'
import { Loader2, Mail, User } from 'lucide-react'
import { OtpInput } from '@/components/ui/otp-input'

type AuthMode = 'login' | 'signup'
type Step = 'form' | 'otp'

export function CandidateLogin () {
  const router = useRouter()
  const setAuth = useAuthStore(state => state.setAuth)

  const [mode, setMode] = useState<AuthMode>('login')
  const [step, setStep] = useState<Step>('form')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await sendOtp({
        email,
        type: mode,
        role: 'candidate'
      })

      if (result.success) {
        toast.success(result.message)
        setStep('otp')
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await verifyOtp({
        email,
        otp,
        type: mode,
        ...(mode === 'signup' && fullName.trim() ? { fullName: fullName.trim() } : {})
      })

      if (result.success && result.token && result.user) {
        setAuth(result.user, result.token)
        toast.success(mode === 'signup' ? 'Account created successfully!' : 'Login successful!')
        router.push('/candidate')
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to verify OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setStep('form')
    setOtp('')
  }

  return (
    <div className='w-full max-w-md space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold'>
          {mode === 'login' ? 'Candidate Login' : 'Candidate Sign Up'}
        </h1>
        <p className='text-muted-foreground'>
          {step === 'form'
            ? mode === 'login'
              ? 'Enter your email to receive a verification code'
              : 'Create your account to get started'
            : 'Enter the 6-digit code sent to your email'}
        </p>
      </div>

      {step === 'form' ? (
        <form onSubmit={handleSendOtp} className='space-y-4'>
          {mode === 'signup' && (
            <div className='space-y-2'>
              <Label htmlFor='fullName'>Full Name</Label>
              <div className='relative'>
                <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  id='fullName'
                  type='text'
                  placeholder='John Doe'
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className='pl-10'
                />
              </div>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <div className='relative'>
              <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className='pl-10'
              />
            </div>
          </div>

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending...
              </>
            ) : mode === 'login' ? (
              'Continue with Email'
            ) : (
              'Create Account'
            )}
          </Button>

          <div className='text-center text-sm'>
            {mode === 'login' ? (
              <>
                <span className='text-muted-foreground'>
                  Don&apos;t have an account?{' '}
                </span>
                <Button
                  type='button'
                  variant='link'
                  className='p-0 h-auto font-semibold'
                  onClick={() => switchMode('signup')}
                  disabled={loading}
                >
                  Sign up
                </Button>
              </>
            ) : (
              <>
                <span className='text-muted-foreground'>
                  Already have an account?{' '}
                </span>
                <Button
                  type='button'
                  variant='link'
                  className='p-0 h-auto font-semibold'
                  onClick={() => switchMode('login')}
                  disabled={loading}
                >
                  Log in
                </Button>
              </>
            )}
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className='space-y-4'>
          <div className='space-y-3'>
            <Label>Verification Code</Label>
            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={loading}
            />
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verifying...
              </>
            ) : mode === 'signup' ? (
              'Verify & Create Account'
            ) : (
              'Verify & Login'
            )}
          </Button>

          <div className='text-center text-sm'>
            <Button
              type='button'
              variant='link'
              className='p-0 h-auto'
              onClick={() => setStep('form')}
              disabled={loading}
            >
              &larr; Back
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
