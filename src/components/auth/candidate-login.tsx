'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendOtp, verifyOtp } from '@/lib/auth-api'
import { useAuthStore } from '@/lib/auth-store'
import { toast } from 'sonner'
import { Loader2, Mail, KeyRound } from 'lucide-react'

export function CandidateLogin () {
  const router = useRouter()
  const setAuth = useAuthStore(state => state.setAuth)

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await sendOtp({
        email,
        type: 'login',
        role: 'candidate'
      })

      if (result.success) {
        toast.success(result.message)
        setStep('otp')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
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
        type: 'login'
      })

      if (result.success && result.token && result.user) {
        setAuth(result.user, result.token)
        toast.success('Login successful!')
        router.push('/candidate')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to verify OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email first')
      return
    }

    setLoading(true)

    try {
      const result = await sendOtp({
        email,
        type: 'signup',
        role: 'candidate'
      })

      if (result.success) {
        toast.success(result.message)
        setStep('otp')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full max-w-md space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold'>Candidate Login</h1>
        <p className='text-muted-foreground'>
          {step === 'email'
            ? 'Enter your email to receive a verification code'
            : 'Enter the 6-digit code sent to your email'}
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className='space-y-4'>
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
            ) : (
              'Continue with Email'
            )}
          </Button>

          <div className='text-center text-sm'>
            <span className='text-muted-foreground'>
              Don&apos;t have an account?{' '}
            </span>
            <Button
              type='button'
              variant='link'
              className='p-0 h-auto font-semibold'
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                handleSignup()
              }}
              disabled={loading || !email}
            >
              Sign up
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='otp'>Verification Code</Label>
            <div className='relative'>
              <KeyRound className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                id='otp'
                type='text'
                placeholder='000000'
                value={otp}
                onChange={e =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                required
                maxLength={6}
                className='pl-10 text-center text-2xl tracking-widest'
              />
            </div>
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
            ) : (
              'Verify & Login'
            )}
          </Button>

          <div className='text-center text-sm'>
            <Button
              type='button'
              variant='link'
              className='p-0 h-auto'
              onClick={() => setStep('email')}
              disabled={loading}
            >
              ← Back to email
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
