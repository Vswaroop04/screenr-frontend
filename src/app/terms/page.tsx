import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export default function TermsPage() {
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
          <h1 className='mb-8 text-4xl font-bold'>Terms of Service</h1>
          <p className='mb-4 text-sm text-muted-foreground'>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className='prose prose-invert max-w-none space-y-8'>
            <section>
              <h2 className='text-2xl font-semibold mb-4'>1. Acceptance of Terms</h2>
              <p className='text-muted-foreground'>
                By accessing or using Screenr&apos;s services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>2. Description of Service</h2>
              <p className='text-muted-foreground'>
                Screenr provides an AI-powered developer verification and resume screening platform. Our services include resume analysis, skill verification, candidate ranking, and hiring analytics tools for recruiters and self-verification tools for candidates.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>3. User Accounts</h2>
              <p className='text-muted-foreground mb-4'>To use our services, you must:</p>
              <ul className='list-disc pl-6 text-muted-foreground space-y-2'>
                <li>Be at least 18 years old</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>4. Acceptable Use</h2>
              <p className='text-muted-foreground mb-4'>You agree not to:</p>
              <ul className='list-disc pl-6 text-muted-foreground space-y-2'>
                <li>Use the service for any illegal purpose</li>
                <li>Upload false or misleading information</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Scrape or collect data without permission</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>5. Intellectual Property</h2>
              <p className='text-muted-foreground'>
                All content, features, and functionality of the Screenr platform are owned by Screenr and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without prior written consent.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>6. User Content</h2>
              <p className='text-muted-foreground'>
                You retain ownership of any content you upload to Screenr (such as resumes and job descriptions). By uploading content, you grant us a license to use, process, and analyze that content to provide our services. You are responsible for ensuring you have the right to upload any content.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>7. AI Analysis Disclaimer</h2>
              <p className='text-muted-foreground'>
                Our AI-powered analysis is provided as a tool to assist in hiring decisions. While we strive for accuracy, the results should not be the sole basis for employment decisions. Users should conduct their own due diligence and comply with all applicable employment laws.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>8. Limitation of Liability</h2>
              <p className='text-muted-foreground'>
                To the maximum extent permitted by law, Screenr shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>9. Termination</h2>
              <p className='text-muted-foreground'>
                We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>10. Changes to Terms</h2>
              <p className='text-muted-foreground'>
                We reserve the right to modify these terms at any time. We will provide notice of significant changes by posting the new Terms on this page. Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>11. Governing Law</h2>
              <p className='text-muted-foreground'>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Screenr operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>12. Contact Us</h2>
              <p className='text-muted-foreground'>
                If you have any questions about these Terms, please contact us at{' '}
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
