'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CandidateResults } from '@/components/candidate/candidate-results'
import { FileUpload } from '@/components/screening/file-upload'
import {
  useQuickAnalyze,
  useUploadCandidateResume,
  useResumeStatus
} from '@/lib/screening-hooks'
import { useResumeSSE } from '@/lib/use-sse'
import Loader from '@/components/shared/loader'
import { toast } from 'sonner'
import type { QuickAnalyzeResponse } from '@/lib/screening-api'
import { ProtectedRoute } from '@/components/auth/protected-route'

function CandidatePageContent () {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState<QuickAnalyzeResponse | null>(null)
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null)

  const quickAnalyze = useQuickAnalyze()
  const uploadResume = useUploadCandidateResume()
  const { data: resumeStatus } = useResumeStatus(uploadedResumeId)
  useResumeSSE(uploadedResumeId) // Real-time updates via SSE

  const handleQuickAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.error('Please enter both resume and job description')
      return
    }

    try {
      const response = await quickAnalyze.mutateAsync({
        resumeText,
        jobDescription
      })
      setResult(response)
      toast.success('Analysis complete!')
    } catch (error) {
      toast.error('Analysis failed. Please try again.')
      console.error(error)
    }
  }

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return

    try {
      const { resumeId } = await uploadResume.mutateAsync(files[0])
      setUploadedResumeId(resumeId)
      toast.success('Resume uploaded! Processing...')
    } catch (error) {
      toast.error('Failed to upload resume')
      console.error(error)
    }
  }

  return (
    <div className='container mx-auto py-8 px-4 max-w-4xl'>
      {/* Header */}
      <div className='mb-8'>
        <Link
          href='/'
          className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Home
        </Link>
        <h1 className='text-3xl font-bold'>Resume Match Checker</h1>
        <p className='text-muted-foreground mt-1'>
          See how well your resume matches a job description and get improvement
          tips
        </p>
      </div>

      {result ? (
        <CandidateResults result={result} onBack={() => setResult(null)} />
      ) : (
        /* Input View */
        <Tabs defaultValue='paste' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='paste'>Paste Resume</TabsTrigger>
            <TabsTrigger value='upload'>Upload PDF</TabsTrigger>
          </TabsList>

          <TabsContent value='paste' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Your Resume</CardTitle>
                <CardDescription>Paste your resume text below</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder='Paste your resume content here...

Example:
John Doe
Software Engineer

Experience:
- Senior Developer at TechCorp (2020-Present)
- Built scalable React applications
- Led team of 5 engineers

Skills: React, TypeScript, Node.js, AWS...'
                  className='min-h-[250px]'
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Paste the job description you want to match against
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder='Paste the job description here...

Example:
We are looking for a Senior Frontend Developer with:
- 5+ years of React experience
- Strong TypeScript skills
- Experience with cloud platforms (AWS/GCP)
- Team leadership experience...'
                  className='min-h-[200px]'
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                />
              </CardContent>
            </Card>

            <Button
              size='lg'
              className='w-full'
              onClick={handleQuickAnalyze}
              disabled={
                quickAnalyze.isPending ||
                !resumeText.trim() ||
                !jobDescription.trim()
              }
            >
              {quickAnalyze.isPending ? (
                <>
                  <Loader className='mr-2' />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className='mr-2 h-5 w-5' />
                  Analyze My Resume
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value='upload' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
                <CardDescription>
                  Upload a PDF file for more accurate analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFilesSelected={handleFileUpload}
                  isUploading={uploadResume.isPending}
                  multiple={false}
                  maxFiles={1}
                />

                {uploadedResumeId && resumeStatus && (
                  <div className='mt-4 p-4 rounded-lg bg-muted'>
                    <div className='flex items-center gap-2'>
                      {resumeStatus.status === 'parsed' ||
                      resumeStatus.status === 'analyzed' ? (
                        <CheckCircle className='h-5 w-5 text-green-500' />
                      ) : resumeStatus.status === 'failed' ? (
                        <AlertCircle className='h-5 w-5 text-red-500' />
                      ) : (
                        <Loader />
                      )}
                      <span className='font-medium'>
                        Status: {resumeStatus.status}
                      </span>
                    </div>
                    {resumeStatus.parsedData?.name && (
                      <p className='text-sm text-muted-foreground mt-2'>
                        Detected: {resumeStatus.parsedData.name}
                        {resumeStatus.parsedData.skills && (
                          <>
                            {' '}
                            • {resumeStatus.parsedData.skills.length} skills
                            found
                          </>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {(resumeStatus?.status === 'parsed' ||
              resumeStatus?.status === 'analyzed') && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                    <CardDescription>
                      Paste the job description you want to match against
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder='Paste the job description here...'
                      className='min-h-[200px]'
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                    />
                  </CardContent>
                </Card>

                <Button
                  size='lg'
                  className='w-full'
                  disabled={!jobDescription.trim()}
                >
                  <Sparkles className='mr-2 h-5 w-5' />
                  Run Full Analysis
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default function CandidatePage () {
  return (
    <ProtectedRoute requiredRole='candidate'>
      <CandidatePageContent />
    </ProtectedRoute>
  )
}
