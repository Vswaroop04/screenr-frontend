'use client'

import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Briefcase, User, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <Link href='/' className='inline-block mb-8'>
            <Logo size='lg' />
          </Link>
          <h1 className='text-2xl font-bold text-foreground'>Welcome to Screenr</h1>
          <p className='mt-2 text-muted-foreground'>
            Choose how you want to continue
          </p>
        </div>

        <div className='space-y-4'>
          <Link href='/auth/recruiter/login' className='block'>
            <div className='group glass-card p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all cursor-pointer'>
              <div className='flex items-center gap-4'>
                <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <Briefcase className='h-6 w-6 text-primary' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-foreground group-hover:text-primary transition-colors'>
                    I'm a Recruiter
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Screen and verify developer candidates
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
              </div>
            </div>
          </Link>

          <Link href='/auth/candidate' className='block'>
            <div className='group glass-card p-6 rounded-xl border border-border/50 hover:border-accent/50 transition-all cursor-pointer'>
              <div className='flex items-center gap-4'>
                <div className='h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center'>
                  <User className='h-6 w-6 text-accent' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-foreground group-hover:text-accent transition-colors'>
                    I'm a Candidate
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Verify your resume and prove your skills
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors' />
              </div>
            </div>
          </Link>
        </div>

        <div className='text-center text-sm text-muted-foreground'>
          <p>
            Don't have an account?{' '}
            <Link href='/auth/recruiter/signup' className='text-primary hover:underline'>
              Sign up as recruiter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
