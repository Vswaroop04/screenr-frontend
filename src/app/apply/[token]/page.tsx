'use client'

import { use, useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Loader2, Send, Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  applicationPublicAPI,
  type PublicApplicationForm,
  uploadFileToS3,
} from '@/lib/screening-api'

interface PageProps {
  params: Promise<{ token: string }>
}

type Step = 'form' | 'otp' | 'upload' | 'success'

export default function ApplyPage({ params }: PageProps) {
  const { token } = use(params)
  const [step, setStep] = useState<Step>('form')
  const [data, setData] = useState<PublicApplicationForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // OTP state
  const [otp, setOtp] = useState('')
  const [submissionId, setSubmissionId] = useState('')
  const [verifying, setVerifying] = useState(false)

  // Upload state
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeId, setResumeId] = useState('')
  const [uploadUrl, setUploadUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function fetchForm() {
      try {
        const result = await applicationPublicAPI.getForm(token)
        setData(result)
        if (result.isExpired) {
          setError('This application form has expired')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application form')
      } finally {
        setLoading(false)
      }
    }
    fetchForm()
  }, [token])

  const handleSubmitForm = async () => {
    if (!data) return

    // Validate required fields
    if (data.requireEmail && !email.trim()) {
      setError('Email is required')
      return
    }
    if (data.requireName && !fullName.trim()) {
      setError('Full name is required')
      return
    }
    if (data.requirePhone && !phone.trim()) {
      setError('Phone number is required')
      return
    }

    // Validate critical questions
    const unansweredCritical = data.questions.filter(
      q => q.required && (!answers[q.question] || answers[q.question].trim().length === 0)
    )
    if (unansweredCritical.length > 0) {
      setError('Please answer all required questions')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const questionResponses = data.questions
        .filter(q => answers[q.question]?.trim())
        .map(q => ({
          question: q.question,
          answer: answers[q.question].trim(),
          weight: q.weight,
        }))

      const result = await applicationPublicAPI.submitApplication({
        token,
        email: email.trim(),
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        questionResponses,
      })

      setSubmissionId(result.submissionId)
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code')
      return
    }

    setVerifying(true)
    setError(null)

    try {
      const result = await applicationPublicAPI.verifyEmail(submissionId, otp.trim())
      if (result.verified) {
        setResumeId(result.resumeId || '')
        setUploadUrl(result.uploadUrl || '')
        setStep('upload')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code')
    } finally {
      setVerifying(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setResumeFile(file)
      setError(null)
    }
  }

  const handleUploadResume = async () => {
    if (!resumeFile || !uploadUrl || !resumeId) return

    setUploading(true)
    setError(null)

    try {
      // Upload to S3
      await uploadFileToS3(uploadUrl, resumeFile)

      // Confirm upload
      await applicationPublicAPI.confirmUpload(
        submissionId,
        resumeId,
        resumeFile.name,
        resumeFile.size
      )

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  const getWeightBadgeColor = (weight: string) => {
    switch (weight) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'important':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'nice_to_have':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-[#0f0f0f] flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin text-blue-500 mx-auto mb-4' />
          <p className='text-zinc-400'>Loading application form...</p>
        </div>
      </div>
    )
  }

  // Error state (no data)
  if (!data || error === 'This application form has expired') {
    return (
      <div className='min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4'>
        <Card className='max-w-md w-full bg-zinc-900 border-zinc-800'>
          <CardContent className='pt-6 text-center'>
            <AlertTriangle className='h-12 w-12 text-amber-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-zinc-100 mb-2'>
              Unable to Load Application
            </h2>
            <p className='text-zinc-400'>
              {error || 'This application link may be expired or invalid.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (step === 'success') {
    return (
      <div className='min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4'>
        <Card className='max-w-md w-full bg-zinc-900 border-zinc-800'>
          <CardContent className='pt-6 text-center'>
            <div className='w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4'>
              <CheckCircle className='h-8 w-8 text-emerald-500' />
            </div>
            <h2 className='text-xl font-semibold text-zinc-100 mb-2'>
              Application Submitted!
            </h2>
            <p className='text-zinc-400'>
              Thank you for applying to <span className='font-medium text-zinc-300'>{data.jobTitle}</span>.
              We'll analyze your resume and get back to you soon.
            </p>
            <p className='text-sm text-zinc-500 mt-4'>
              You can close this page now.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#0f0f0f]'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600 to-blue-700 py-8'>
        <div className='max-w-2xl mx-auto px-4'>
          <div className='flex items-start gap-3'>
            <div className='w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0'>
              <FileText className='h-6 w-6 text-white' />
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-1'>
                {data.company && (
                  <span className='text-blue-200 text-sm font-medium'>{data.company}</span>
                )}
              </div>
              <h1 className='text-2xl font-bold text-white mb-2'>
                {data.jobTitle}
              </h1>
              <p className='text-blue-100 text-sm'>
                Complete this application to be considered for this position
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-2xl mx-auto px-4 py-8'>
        {/* Step indicator */}
        <div className='flex items-center justify-center gap-2 mb-8'>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            step === 'form' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'
          }`}>
            1. Form
          </div>
          <div className='h-px w-8 bg-zinc-700' />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            step === 'otp' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'
          }`}>
            2. Verify
          </div>
          <div className='h-px w-8 bg-zinc-700' />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            step === 'upload' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'
          }`}>
            3. Upload
          </div>
        </div>

        {/* Error banner */}
        {error && step !== 'success' && (
          <div className='mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm'>
            {error}
          </div>
        )}

        {/* Step: Form */}
        {step === 'form' && (
          <div className='space-y-6'>
            {/* Job Description */}
            <Card className='bg-zinc-900 border-zinc-800'>
              <CardHeader>
                <CardTitle className='text-base'>About This Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='prose prose-invert prose-sm max-w-none'>
                  <p className='text-zinc-300 whitespace-pre-wrap leading-relaxed'>
                    {data.description}
                  </p>
                </div>
                {data.validUntil && !data.isExpired && (
                  <div className='mt-4 pt-4 border-t border-zinc-800'>
                    <p className='text-xs text-zinc-500'>
                      Applications close: {new Date(data.validUntil).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom message */}
            {data.customMessage && (
              <Card className='bg-blue-500/5 border-blue-500/20'>
                <CardContent className='pt-6'>
                  <p className='text-zinc-300 whitespace-pre-wrap'>{data.customMessage}</p>
                </CardContent>
              </Card>
            )}

            {/* Section divider */}
            <div className='flex items-center gap-3 py-2'>
              <div className='h-px flex-1 bg-zinc-800' />
              <span className='text-sm font-medium text-zinc-500'>Application Form</span>
              <div className='h-px flex-1 bg-zinc-800' />
            </div>

            {/* Contact info */}
            <Card className='bg-zinc-900 border-zinc-800'>
              <CardHeader>
                <CardTitle className='text-base'>Contact Information</CardTitle>
                <CardDescription className='text-zinc-500'>
                  We'll use this to get in touch with you about your application
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {data.requireEmail && (
                  <div>
                    <Label htmlFor='email' className='text-sm text-zinc-300'>
                      Email Address <span className='text-red-400'>*</span>
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      placeholder='your.email@example.com'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='mt-2 bg-zinc-950 border-zinc-700 text-zinc-100'
                    />
                  </div>
                )}
                {data.requireName && (
                  <div>
                    <Label htmlFor='fullName' className='text-sm text-zinc-300'>
                      Full Name <span className='text-red-400'>*</span>
                    </Label>
                    <Input
                      id='fullName'
                      placeholder='John Doe'
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className='mt-2 bg-zinc-950 border-zinc-700 text-zinc-100'
                    />
                  </div>
                )}
                {data.requirePhone && (
                  <div>
                    <Label htmlFor='phone' className='text-sm text-zinc-300'>
                      Phone Number <span className='text-red-400'>*</span>
                    </Label>
                    <Input
                      id='phone'
                      type='tel'
                      placeholder='+1 (555) 123-4567'
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className='mt-2 bg-zinc-950 border-zinc-700 text-zinc-100'
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Questions */}
            {data.questions.length > 0 && (
              <div className='space-y-4'>
                {data.questions
                  .sort((a, b) => {
                    if (a.required && !b.required) return -1
                    if (!a.required && b.required) return 1
                    return 0
                  })
                  .map((question, index) => (
                    <Card key={index} className='bg-zinc-900 border-zinc-800'>
                      <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between'>
                          <CardTitle className='text-base text-zinc-100'>
                            <span className='text-zinc-500 mr-2'>Q{index + 1}.</span>
                            {question.question}
                          </CardTitle>
                          {question.required && (
                            <Badge variant='outline' className='bg-red-500/10 text-red-400 border-red-500/20 shrink-0 ml-2'>
                              Required
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder='Type your answer here...'
                          value={answers[question.question] || ''}
                          onChange={(e) =>
                            setAnswers(prev => ({
                              ...prev,
                              [question.question]: e.target.value
                            }))
                          }
                          className='min-h-[100px] bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600'
                        />
                        <div className='flex justify-end mt-1.5'>
                          <span className='text-xs text-zinc-600'>
                            {(answers[question.question] || '').length} characters
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}

            {/* Submit */}
            <div className='flex justify-end'>
              <Button
                onClick={handleSubmitForm}
                disabled={submitting}
                size='lg'
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                {submitting ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className='h-4 w-4 mr-2' />
                    Continue to Verification
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step: OTP */}
        {step === 'otp' && (
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardHeader>
              <CardTitle>Verify Your Email</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-zinc-400'>
                We've sent a 6-digit verification code to <span className='font-medium text-zinc-300'>{email}</span>.
                Please check your inbox and enter the code below.
              </p>

              <div>
                <Label htmlFor='otp' className='text-sm text-zinc-300'>
                  Verification Code
                </Label>
                <Input
                  id='otp'
                  placeholder='123456'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className='mt-2 bg-zinc-950 border-zinc-700 text-zinc-100 text-center text-2xl tracking-widest font-mono'
                  maxLength={6}
                />
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={verifying || otp.length !== 6}
                className='w-full bg-blue-600 hover:bg-blue-700'
              >
                {verifying ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className='h-4 w-4 mr-2' />
                    Verify Email
                  </>
                )}
              </Button>

              <p className='text-xs text-zinc-500 text-center'>
                Code expires in 15 minutes
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step: Upload */}
        {step === 'upload' && (
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-zinc-400'>
                Please upload your resume in PDF format (max 10MB).
              </p>

              <div>
                <Label
                  htmlFor='resume'
                  className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors'
                >
                  {resumeFile ? (
                    <div className='text-center'>
                      <FileText className='h-8 w-8 text-emerald-500 mx-auto mb-2' />
                      <p className='text-sm text-zinc-300'>{resumeFile.name}</p>
                      <p className='text-xs text-zinc-500 mt-1'>
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className='text-center'>
                      <Upload className='h-8 w-8 text-zinc-500 mx-auto mb-2' />
                      <p className='text-sm text-zinc-400'>Click to upload resume</p>
                      <p className='text-xs text-zinc-600 mt-1'>PDF only, max 10MB</p>
                    </div>
                  )}
                </Label>
                <input
                  id='resume'
                  type='file'
                  accept='application/pdf'
                  onChange={handleFileSelect}
                  className='hidden'
                />
              </div>

              <Button
                onClick={handleUploadResume}
                disabled={!resumeFile || uploading}
                className='w-full bg-emerald-600 hover:bg-emerald-700'
              >
                {uploading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4 mr-2' />
                    Submit Application
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
