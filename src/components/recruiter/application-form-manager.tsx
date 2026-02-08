'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  Loader2,
  Link as LinkIcon,
  Sparkles,
  Calendar,
  Edit,
  AlertTriangle,
  Clock,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useApplicationForm,
  useCreateApplicationForm,
  useGenerateQuestions,
  useJob
} from '@/lib/screening-hooks'
import { toast } from 'sonner'

interface ApplicationFormManagerProps {
  jobId: string
}

interface FormQuestion {
  question: string
  weight: 'critical' | 'important' | 'nice_to_have'
}

const WEIGHT_CONFIG = {
  critical: {
    label: 'Critical (Required)',
    color: 'bg-red-500/10 text-red-400 border-red-500/20'
  },
  important: {
    label: 'Important',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  },
  nice_to_have: {
    label: 'Nice to Have',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  }
}

export function ApplicationFormManager ({ jobId }: ApplicationFormManagerProps) {
  const { data: formData, isLoading } = useApplicationForm(jobId)
  const { data: job } = useJob(jobId)
  const createFormMutation = useCreateApplicationForm(jobId)
  const generateQuestionsMutation = useGenerateQuestions()

  const [isEditing, setIsEditing] = useState(false)
  const [questions, setQuestions] = useState<FormQuestion[]>([])
  const [customMessage, setCustomMessage] = useState('')
  const [requireEmail, setRequireEmail] = useState(true)
  const [requirePhone, setRequirePhone] = useState(false)
  const [requireName, setRequireName] = useState(true)
  const [formLink, setFormLink] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [copied, setCopied] = useState(false)

  const hasExistingForm = !!formData?.hasForm

  // Determine form status
  const isExpired = formData?.expiresAt
    ? new Date(formData.expiresAt) < new Date()
    : false

  // Update form state when data loads
  useEffect(() => {
    if (formData) {
      if (formData.questions) setQuestions(formData.questions)
      if (formData.formLink) setFormLink(formData.formLink)
      if (formData.formSettings) {
        setCustomMessage(formData.formSettings.customMessage || '')
        setRequireEmail(formData.formSettings.requireEmail !== false)
        setRequirePhone(formData.formSettings.requirePhone === true)
        setRequireName(formData.formSettings.requireName !== false)
      }
      if (formData.expiresAt) {
        setExpiresAt(formData.expiresAt.split('T')[0])
      }
    }
  }, [formData])

  // Auto-enter edit mode if no form exists
  useEffect(() => {
    if (!isLoading && !hasExistingForm) {
      setIsEditing(true)
    }
  }, [isLoading, hasExistingForm])

  const handleGenerateQuestions = async () => {
    if (!job?.description || job.description.trim().length < 50) {
      toast.error(
        'Job description must be at least 50 characters to generate questions'
      )
      return
    }

    try {
      const result = await generateQuestionsMutation.mutateAsync(
        job.description
      )
      setQuestions(
        result.questions.map(q => ({
          question: q.question,
          weight: q.weight
        }))
      )
      toast.success(`Generated ${result.questions.length} questions using AI`)
    } catch {
      toast.error('Failed to generate questions')
    }
  }

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', weight: 'important' }])
  }

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleUpdateQuestion = (
    index: number,
    field: keyof FormQuestion,
    value: string
  ) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const handleSave = async () => {
    const validQuestions = questions.filter(q => q.question.trim().length > 0)
    if (validQuestions.length === 0) {
      toast.error('Add at least one question to create the form')
      return
    }

    try {
      const result = await createFormMutation.mutateAsync({
        questions: validQuestions,
        formSettings: {
          requireEmail,
          requirePhone,
          requireName,
          customMessage: customMessage.trim() || undefined
        },
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined
      })

      setFormLink(result.formLink)
      setIsEditing(false)
      toast.success(
        hasExistingForm
          ? 'Application form updated!'
          : 'Application form created!'
      )
    } catch {
      toast.error('Failed to save application form')
    }
  }

  const handleCopyLink = () => {
    if (formLink) {
      navigator.clipboard.writeText(formLink)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-6 w-6 animate-spin text-zinc-500' />
      </div>
    )
  }

  // ── Read-only view when form exists and not editing ──
  if (hasExistingForm && !isEditing) {
    return (
      <div className='space-y-6'>
        {/* Form Status Banner */}
        <Card
          className={
            isExpired
              ? 'bg-yellow-500/5 border-yellow-500/20'
              : 'bg-emerald-500/5 border-emerald-500/20'
          }
        >
          <CardContent className='py-4'>
            <div className='flex items-center gap-3'>
              {isExpired ? (
                <AlertTriangle className='h-5 w-5 text-yellow-400 shrink-0' />
              ) : (
                <LinkIcon className='h-5 w-5 text-emerald-400 shrink-0' />
              )}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <p className='text-sm font-medium text-zinc-200'>
                    Application Form
                  </p>
                  {isExpired ? (
                    <Badge
                      variant='outline'
                      className='bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    >
                      Expired
                    </Badge>
                  ) : (
                    <Badge
                      variant='outline'
                      className='bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    >
                      Active
                    </Badge>
                  )}
                </div>
                {formLink && (
                  <p className='text-sm font-mono text-zinc-400 truncate'>
                    {formLink}
                  </p>
                )}
              </div>
              <div className='flex gap-2 shrink-0'>
                {formLink && (
                  <Button onClick={handleCopyLink} variant='outline' size='sm'>
                    {copied ? (
                      <>
                        <CheckCircle className='h-4 w-4 mr-2' />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className='h-4 w-4 mr-2' />
                        Copy Link
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={() => setIsEditing(true)}
                  variant='outline'
                  size='sm'
                >
                  <Edit className='h-4 w-4 mr-2' />
                  Edit Form
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Info Summary */}
        <div className='grid grid-cols-3 gap-4'>
          <Card className='bg-zinc-900/50 border-zinc-800'>
            <CardContent className='py-4 px-4'>
              <div className='flex items-center gap-2 mb-1'>
                <Users className='h-4 w-4 text-zinc-500' />
                <p className='text-xs text-zinc-500 uppercase tracking-wider'>
                  Submissions
                </p>
              </div>
              <p className='text-2xl font-bold text-zinc-100'>
                {formData?.submissionCount ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className='bg-zinc-900/50 border-zinc-800'>
            <CardContent className='py-4 px-4'>
              <div className='flex items-center gap-2 mb-1'>
                <Calendar className='h-4 w-4 text-zinc-500' />
                <p className='text-xs text-zinc-500 uppercase tracking-wider'>
                  Expires
                </p>
              </div>
              <p className='text-lg font-medium text-zinc-100'>
                {formData?.expiresAt
                  ? new Date(formData.expiresAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'No expiry'}
              </p>
            </CardContent>
          </Card>
          <Card className='bg-zinc-900/50 border-zinc-800'>
            <CardContent className='py-4 px-4'>
              <div className='flex items-center gap-2 mb-1'>
                <Clock className='h-4 w-4 text-zinc-500' />
                <p className='text-xs text-zinc-500 uppercase tracking-wider'>
                  Questions
                </p>
              </div>
              <p className='text-2xl font-bold text-zinc-100'>
                {formData?.questions?.length ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expired notice with re-enable prompt */}
        {isExpired && (
          <Card className='bg-yellow-500/5 border-yellow-500/20'>
            <CardContent className='py-4'>
              <div className='flex items-center gap-3'>
                <AlertTriangle className='h-5 w-5 text-yellow-400 shrink-0' />
                <div className='flex-1'>
                  <p className='text-sm font-medium text-yellow-300'>
                    This form has expired
                  </p>
                  <p className='text-xs text-zinc-400 mt-0.5'>
                    Candidates can no longer submit applications. Click "Edit
                    Form" to set a new expiry date and re-enable it.
                  </p>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  size='sm'
                  className='bg-yellow-600 hover:bg-yellow-700 text-white shrink-0'
                >
                  Re-enable Form
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions read-only list */}
        <Card className='bg-zinc-900/50 border-zinc-800'>
          <CardHeader>
            <CardTitle className='text-lg'>Screening Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <p className='text-sm text-zinc-500 text-center py-4'>
                No questions configured
              </p>
            ) : (
              <div className='space-y-3'>
                {questions.map((q, index) => (
                  <div
                    key={index}
                    className='flex items-start gap-3 p-3 border border-zinc-800 rounded-lg bg-zinc-950'
                  >
                    <span className='text-xs text-zinc-600 font-mono mt-0.5'>
                      {index + 1}.
                    </span>
                    <div className='flex-1'>
                      <p className='text-sm text-zinc-200'>{q.question}</p>
                      <Badge
                        variant='outline'
                        className={`mt-2 ${WEIGHT_CONFIG[q.weight].color}`}
                      >
                        {WEIGHT_CONFIG[q.weight].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings read-only */}
        <Card className='bg-zinc-900/50 border-zinc-800'>
          <CardHeader>
            <CardTitle className='text-lg'>Form Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-3'>
              {requireEmail && (
                <Badge variant='secondary'>Email Required</Badge>
              )}
              {requireName && <Badge variant='secondary'>Name Required</Badge>}
              {requirePhone && (
                <Badge variant='secondary'>Phone Required</Badge>
              )}
            </div>
            {customMessage && (
              <div className='mt-4'>
                <p className='text-xs text-zinc-500 mb-1'>Welcome Message</p>
                <p className='text-sm text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-800'>
                  {customMessage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Edit / Create mode ──
  return (
    <div className='space-y-6'>
      {/* Header */}
      {hasExistingForm && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-zinc-400'>
            Editing application form — changes will be saved when you click
            Save.
          </p>
          <Button variant='ghost' size='sm' onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Link display (if exists) */}
      {formLink && (
        <Card className='bg-emerald-500/5 border-emerald-500/20'>
          <CardContent className='py-4'>
            <div className='flex items-center gap-3'>
              <LinkIcon className='h-5 w-5 text-emerald-400' />
              <div className='flex-1'>
                <p className='text-sm text-zinc-400 mb-1'>
                  Application Form Link
                </p>
                <p className='text-sm font-mono text-zinc-300 truncate'>
                  {formLink}
                </p>
              </div>
              <Button
                onClick={handleCopyLink}
                variant='outline'
                size='sm'
                className='shrink-0'
              >
                {copied ? (
                  <>
                    <CheckCircle className='h-4 w-4 mr-2' />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className='h-4 w-4 mr-2' />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form settings */}
      <Card className='bg-zinc-900/50 border-zinc-800'>
        <CardHeader>
          <CardTitle className='text-lg'>Form Settings</CardTitle>
          <CardDescription>
            Configure what information to collect from candidates
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Expiry Date */}
          <div className='space-y-2'>
            <Label
              htmlFor='expiresAt'
              className='text-sm text-zinc-300 flex items-center gap-2'
            >
              <Calendar className='h-4 w-4' />
              Form Expiry Date
            </Label>
            <Input
              id='expiresAt'
              type='date'
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className='max-w-xs bg-zinc-950 border-zinc-700 text-zinc-100'
            />
            <p className='text-xs text-zinc-500'>
              Leave empty for no expiration.{' '}
              {isExpired && 'Set a future date to re-enable the form.'}
            </p>
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='requireEmail'
                checked={requireEmail}
                onCheckedChange={checked => setRequireEmail(checked === true)}
              />
              <Label
                htmlFor='requireEmail'
                className='text-sm text-zinc-300 cursor-pointer'
              >
                Require Email (recommended)
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='requireName'
                checked={requireName}
                onCheckedChange={checked => setRequireName(checked === true)}
              />
              <Label
                htmlFor='requireName'
                className='text-sm text-zinc-300 cursor-pointer'
              >
                Require Full Name
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='requirePhone'
                checked={requirePhone}
                onCheckedChange={checked => setRequirePhone(checked === true)}
              />
              <Label
                htmlFor='requirePhone'
                className='text-sm text-zinc-300 cursor-pointer'
              >
                Require Phone Number
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor='customMessage' className='text-sm text-zinc-300'>
              Custom Message (Optional)
            </Label>
            <Textarea
              id='customMessage'
              placeholder='Add a personalized message that candidates will see...'
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              className='mt-2 bg-zinc-950 border-zinc-700 text-zinc-100'
              rows={3}
            />
            <p className='text-xs text-zinc-500 mt-1'>
              This message will be displayed at the top of the application form
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card className='bg-zinc-900/50 border-zinc-800'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-lg'>Screening Questions</CardTitle>
              <CardDescription>
                Ask candidates custom questions before they upload their resume
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                onClick={handleGenerateQuestions}
                disabled={
                  generateQuestionsMutation.isPending || !job?.description
                }
                variant='outline'
                size='sm'
                className='bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
              >
                {generateQuestionsMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className='h-4 w-4 mr-2' />
                    AI Generate
                  </>
                )}
              </Button>
              <Button onClick={handleAddQuestion} variant='outline' size='sm'>
                <Plus className='h-4 w-4 mr-2' />
                Add Question
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className='text-center py-8 text-zinc-500'>
              <p>No questions added yet.</p>
              <p className='text-sm mt-1'>
                Click "Add Question" or "AI Generate" to get started.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {questions.map((q, index) => (
                <div
                  key={index}
                  className='p-4 border border-zinc-800 rounded-lg bg-zinc-950 space-y-3'
                >
                  <div className='flex items-start justify-between'>
                    <Label className='text-sm text-zinc-400'>
                      Question {index + 1}
                    </Label>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className={WEIGHT_CONFIG[q.weight].color}
                      >
                        {WEIGHT_CONFIG[q.weight].label}
                      </Badge>
                      <Button
                        onClick={() => handleRemoveQuestion(index)}
                        variant='ghost'
                        size='sm'
                        className='h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>

                  <Textarea
                    placeholder='Enter your question...'
                    value={q.question}
                    onChange={e =>
                      handleUpdateQuestion(index, 'question', e.target.value)
                    }
                    className='bg-zinc-900 border-zinc-700 text-zinc-100'
                    rows={2}
                  />

                  <div className='flex items-center gap-2'>
                    <Label className='text-xs text-zinc-500 w-20'>
                      Importance:
                    </Label>
                    <Select
                      value={q.weight}
                      onValueChange={value =>
                        handleUpdateQuestion(
                          index,
                          'weight',
                          value as 'critical' | 'important' | 'nice_to_have'
                        )
                      }
                    >
                      <SelectTrigger className='w-[200px] bg-zinc-900 border-zinc-700'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='critical'>
                          Critical (Required)
                        </SelectItem>
                        <SelectItem value='important'>Important</SelectItem>
                        <SelectItem value='nice_to_have'>
                          Nice to Have
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save button */}
      <div className='flex justify-end gap-2'>
        {hasExistingForm && (
          <Button
            variant='outline'
            size='lg'
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={
            createFormMutation.isPending ||
            questions.filter(q => q.question.trim()).length === 0
          }
          size='lg'
          className='bg-emerald-600 hover:bg-emerald-700 text-white'
        >
          {createFormMutation.isPending ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className='h-4 w-4 mr-2' />
              {hasExistingForm ? 'Update Form' : 'Create Application Form'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
