import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-background'>
      <header className='border-b border-border/50 bg-background/80 backdrop-blur-xl'>
        <nav className='container mx-auto flex h-16 items-center px-4 lg:px-8'>
          <Link href='/'>
            <Logo size='md' />
          </Link>
        </nav>
      </header>

      <main className='container mx-auto px-4 py-16 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <h1 className='mb-8 text-4xl font-bold'>Privacy Policy</h1>
          <p className='mb-4 text-sm text-muted-foreground'>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className='prose prose-invert max-w-none space-y-8'>
            <section>
              <h2 className='text-2xl font-semibold mb-4'>1. Introduction</h2>
              <p className='text-muted-foreground'>
                Screenr (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered developer verification platform.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>2. Information We Collect</h2>
              <p className='text-muted-foreground mb-4'>We collect information you provide directly to us, including:</p>
              <ul className='list-disc pl-6 text-muted-foreground space-y-2'>
                <li>Account information (name, email address, password)</li>
                <li>Profile information (resume data, skills, experience)</li>
                <li>Job posting information (for recruiters)</li>
                <li>Communication data when you contact us</li>
              </ul>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>3. How We Use Your Information</h2>
              <p className='text-muted-foreground mb-4'>We use the information we collect to:</p>
              <ul className='list-disc pl-6 text-muted-foreground space-y-2'>
                <li>Provide, maintain, and improve our services</li>
                <li>Process and analyze resumes using AI technology</li>
                <li>Match candidates with job opportunities</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
              </ul>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>4. Data Sharing</h2>
              <p className='text-muted-foreground'>
                We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf, such as cloud hosting and analytics. All third parties are required to maintain the confidentiality of your information.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>5. Data Security</h2>
              <p className='text-muted-foreground'>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>6. Your Rights</h2>
              <p className='text-muted-foreground mb-4'>You have the right to:</p>
              <ul className='list-disc pl-6 text-muted-foreground space-y-2'>
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>7. Cookies</h2>
              <p className='text-muted-foreground'>
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>8. Changes to This Policy</h2>
              <p className='text-muted-foreground'>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>9. Contact Us</h2>
              <p className='text-muted-foreground'>
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href='mailto:product@screenr.co' className='text-primary hover:underline'>
                  product@screenr.co
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className='border-t border-border py-8'>
        <div className='container mx-auto px-4 text-center text-sm text-muted-foreground'>
          &copy; {new Date().getFullYear()} Screenr. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
