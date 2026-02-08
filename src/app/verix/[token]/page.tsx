'use client'

import { use, useState, useEffect, useRef } from 'react'
import { CheckCircle, Clock, AlertTriangle, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { verixPublicAPI, type VerixPublicView } from '@/lib/screening-api'

interface PageProps {
  params: Promise<{ token: string }>
}

export default function VerixPage ({ params }: PageProps) {
  const { token } = use(params)
  const [data, setData] = useState<VerixPublicView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [startTimes, setStartTimes] = useState<Record<string, number>>({})
  const pageLoadTime = useRef(Date.now())

  useEffect(() => {
    async function fetchQuestions () {
      try {
        const result = await verixPublicAPI.getQuestions(token)
        setData(result)
        // Initialize start times for each question
        const now = Date.now()
        const times: Record<string, number> = {}
        for (const q of result.questions) {
          times[q.id] = now
        }
        setStartTimes(times)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load questions'
        )
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [token])

  const handleSubmit = async () => {
    if (!data) return

    // Validate required questions
    const unanswered = data.questions.filter(
      q => q.required && (!answers[q.id] || answers[q.id].trim().length === 0)
    )
    if (unanswered.length > 0) {
      setError('Please answer all required questions before submitting.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const now = Date.now()
      const formattedAnswers = data.questions
        .filter(q => answers[q.id]?.trim())
        .map(q => ({
          questionId: q.id,
          answer: answers[q.id].trim(),
          responseTimeSeconds: Math.round(
            (now - (startTimes[q.id] || pageLoadTime.current)) / 1000
          )
        }))

      await verixPublicAPI.submitAnswers(token, formattedAnswers)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answers')
    } finally {
      setSubmitting(false)
    }
  }

  const getTimeRemaining = () => {
    if (!data?.expiresAt) return null
    const diff = new Date(data.expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-[#0f0f0f] flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin text-emerald-500 mx-auto mb-4' />
          <p className='text-zinc-400'>Loading verification questions...</p>
        </div>
      </div>
    )
  }

  // Error state (no data)
  if (!data) {
    return (
      <div className='min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4'>
        <Card className='max-w-md w-full bg-zinc-900 border-zinc-800'>
          <CardContent className='pt-6 text-center'>
            <AlertTriangle className='h-12 w-12 text-amber-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-zinc-100 mb-2'>
              Unable to Load Questions
            </h2>
            <p className='text-zinc-400'>
              {error || 'This verification link may be expired or invalid.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (submitted) {
    return (
      <div className='min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4'>
        <Card className='max-w-md w-full bg-zinc-900 border-zinc-800'>
          <CardContent className='pt-6 text-center'>
            <div className='w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4'>
              <CheckCircle className='h-8 w-8 text-emerald-500' />
            </div>
            <h2 className='text-xl font-semibold text-zinc-100 mb-2'>
              Responses Submitted
            </h2>
            <p className='text-zinc-400'>
              Thank you for your responses! Our team will review them as part of
              your application. You can close this page now.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const timeRemaining = getTimeRemaining()
  const answeredCount = data.questions.filter(q => answers[q.id]?.trim()).length

  return (
    <div className='min-h-screen bg-[#0f0f0f]'>
      {/* Header */}
      <div className='bg-gradient-to-r from-emerald-600 to-emerald-700 py-6'>
        <div className='max-w-2xl mx-auto px-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-white flex items-center gap-2'>
                <CheckCircle className='h-6 w-6' />
                Verix Verification
              </h1>
              {data.jobTitle && (
                <p className='text-emerald-100 mt-1'>
                  Application for{' '}
                  <span className='font-medium'>{data.jobTitle}</span>
                </p>
              )}
            </div>
            {timeRemaining && (
              <div className='flex items-center gap-1.5 text-emerald-100 text-sm'>
                <Clock className='h-4 w-4' />
                {timeRemaining}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-2xl mx-auto px-4 py-8'>
        {/* Greeting */}
        <Card className='mb-6 bg-zinc-900 border-zinc-800'>
          <CardContent className='pt-6'>
            <p className='text-zinc-300'>
              {data.candidateName ? (
                <>
                  Hi{' '}
                  <span className='font-medium text-zinc-100'>
                    {data.candidateName}
                  </span>
                  ,
                </>
              ) : (
                <>Hi,</>
              )}{' '}
              we&apos;d like to learn more about your experience. Please answer
              the following {data.questions.length} question
              {data.questions.length > 1 ? 's' : ''} to help us better
              understand your qualifications.
            </p>
            <p className='text-zinc-500 text-sm mt-3'>
              Your responses will be considered as part of your application
              analysis.
            </p>
          </CardContent>
        </Card>

        {/* Error banner */}
        {error && (
          <div className='mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm'>
            {error}
          </div>
        )}

        {/* Questions */}
        <div className='space-y-6'>
          {data.questions
            .sort((a, b) => a.position - b.position)
            .map((question, index) => (
              <Card key={question.id} className='bg-zinc-900 border-zinc-800'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-base text-zinc-100'>
                      <span className='text-zinc-500 mr-2'>Q{index + 1}.</span>
                      {question.text}
                    </CardTitle>
                  </div>
                  {question.required && (
                    <div className='mt-2'>
                      <Badge
                        variant='outline'
                        className='bg-red-500/10 text-red-400 border-red-500/20'
                      >
                        Required
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Label htmlFor={question.id} className='sr-only'>
                    Your answer
                  </Label>
                  <Textarea
                    id={question.id}
                    placeholder='Type your answer here...'
                    value={answers[question.id] || ''}
                    onChange={e =>
                      setAnswers(prev => ({
                        ...prev,
                        [question.id]: e.target.value
                      }))
                    }
                    className='min-h-[120px] bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-y'
                  />
                  <div className='flex justify-end mt-1.5'>
                    <span className='text-xs text-zinc-600'>
                      {(answers[question.id] || '').length} characters
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Submit */}
        <div className='mt-8 flex items-center justify-between'>
          <p className='text-sm text-zinc-500'>
            {answeredCount} of {data.questions.length} answered
          </p>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className='bg-emerald-600 hover:bg-emerald-700 text-white'
            size='lg'
          >
            {submitting ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Submitting...
              </>
            ) : (
              <>
                <Send className='h-4 w-4 mr-2' />
                Submit Responses
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
