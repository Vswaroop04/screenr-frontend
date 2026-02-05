import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ArrowRight, Target, Users, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-background'>
      <header className='border-b border-border/50 bg-background/80 backdrop-blur-xl'>
        <nav className='container mx-auto flex h-16 items-center justify-between px-4 lg:px-8'>
          <Link href='/'>
            <Logo size='md' />
          </Link>
          <Button variant='default' size='sm' asChild>
            <Link href='/auth/recruiter/signup'>Get Started</Link>
          </Button>
        </nav>
      </header>

      <main>
        <section className='py-20 lg:py-32'>
          <div className='container mx-auto px-4 lg:px-8'>
            <div className='mx-auto max-w-3xl text-center'>
              <h1 className='mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl'>
                About <span className='text-gradient'>Screenr</span>
              </h1>
              <p className='text-xl text-muted-foreground'>
                We&apos;re on a mission to make technical hiring more trustworthy, efficient, and fair for everyone.
              </p>
            </div>
          </div>
        </section>

        <section className='py-16 bg-muted/30'>
          <div className='container mx-auto px-4 lg:px-8'>
            <div className='mx-auto max-w-3xl'>
              <h2 className='mb-8 text-3xl font-bold'>Our Story</h2>
              <div className='space-y-6 text-muted-foreground'>
                <p>
                  Screenr was born from a simple observation: traditional resume screening doesn&apos;t work for technical roles. Keywords don&apos;t capture real skills, and inflated resumes waste everyone&apos;s time.
                </p>
                <p>
                  We built Screenr to change that. By leveraging AI to analyze real developer activity across platforms like GitHub, LinkedIn, and coding portfolios, we help recruiters make informed decisions based on verified skills, not just claims.
                </p>
                <p>
                  For candidates, we provide a way to stand out by verifying their abilities before they even apply. It&apos;s a win-win: better matches, faster hiring, and more confidence for everyone involved.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className='py-20'>
          <div className='container mx-auto px-4 lg:px-8'>
            <div className='mx-auto max-w-4xl'>
              <h2 className='mb-12 text-center text-3xl font-bold'>Our Values</h2>
              <div className='grid gap-8 sm:grid-cols-3'>
                <div className='text-center'>
                  <div className='mb-4 mx-auto inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10'>
                    <Target className='h-7 w-7 text-primary' />
                  </div>
                  <h3 className='mb-2 text-xl font-semibold'>Accuracy</h3>
                  <p className='text-sm text-muted-foreground'>
                    We prioritize precision in our AI analysis to deliver reliable, actionable insights.
                  </p>
                </div>
                <div className='text-center'>
                  <div className='mb-4 mx-auto inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10'>
                    <Users className='h-7 w-7 text-primary' />
                  </div>
                  <h3 className='mb-2 text-xl font-semibold'>Fairness</h3>
                  <p className='text-sm text-muted-foreground'>
                    We believe in giving every candidate a fair chance by focusing on skills, not bias.
                  </p>
                </div>
                <div className='text-center'>
                  <div className='mb-4 mx-auto inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10'>
                    <Zap className='h-7 w-7 text-primary' />
                  </div>
                  <h3 className='mb-2 text-xl font-semibold'>Efficiency</h3>
                  <p className='text-sm text-muted-foreground'>
                    We help teams save time by automating the tedious parts of technical screening.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='py-20 bg-muted/30'>
          <div className='container mx-auto px-4 lg:px-8'>
            <div className='mx-auto max-w-2xl text-center'>
              <h2 className='mb-6 text-3xl font-bold'>Ready to get started?</h2>
              <p className='mb-8 text-muted-foreground'>
                Join thousands of companies and developers who trust Screenr for better technical hiring.
              </p>
              <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
                <Button variant='hero' size='lg' asChild>
                  <Link href='/recruiter'>
                    Start Screening
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                </Button>
                <Button variant='heroOutline' size='lg' asChild>
                  <Link href='/candidate'>I&apos;m a Candidate</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='border-t border-border py-8'>
        <div className='container mx-auto px-4 text-center text-sm text-muted-foreground'>
          &copy; {new Date().getFullYear()} Screenr. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
