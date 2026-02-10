'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  X,
  Plus,
  Sparkles,
  Lightbulb,
  Link2,
  Calendar,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { useGenerateQuestions } from '@/lib/screening-hooks'

interface JobFormData {
  title: string
  company: string
  location: string
  locationType: string
  employmentType: string
  experienceLevel: string
  salaryMin: string
  salaryMax: string
  salaryCurrency: string
  description: string
  responsibilities: string[]
  requirements: string[]
  skills: string[]
  niceToHaveSkills: string[]
  department: string
  // Application form fields
  createApplicationForm: boolean
  formExpiresAt: string
  formRequireEmail: boolean
  formRequirePhone: boolean
  formRequireName: boolean
  formAllowAnonymous: boolean
  formCustomMessage: string
  formAcknowledgmentSubject: string
  formAcknowledgmentBody: string
  formMaxSubmissions: string
  formAutoExpire: boolean
  formQuestions: Array<{
    question: string
    weight: 'critical' | 'important' | 'nice_to_have'
  }>
}

const COMMON_JOB_TITLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Software Engineer',
  'Senior Software Engineer',
  'Lead Software Engineer',
  'DevOps Engineer',
  'Data Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Mobile Developer',
  'UI/UX Designer',
  'Product Manager',
  'Engineering Manager',
  'QA Engineer',
  'Site Reliability Engineer'
]

const COMMON_DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Data Science',
  'DevOps',
  'Quality Assurance',
  'Research & Development',
  'IT',
  'Security',
  'Platform'
]

const COMMON_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'Go',
  'C++',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Git',
  'REST API',
  'GraphQL',
  'Next.js',
  'Vue.js',
  'Angular',
  'Express.js',
  'Django',
  'Flask',
  'Spring Boot',
  'TensorFlow',
  'PyTorch',
  'React Native',
  'Flutter',
  'Tailwind CSS',
  'HTML',
  'CSS',
  'SQL',
  'NoSQL',
  'Microservices',
  'CI/CD',
  'Agile',
  'Scrum'
]

const SKILL_RECOMMENDATIONS: Record<string, string[]> = {
  frontend: [
    'React',
    'TypeScript',
    'JavaScript',
    'HTML',
    'CSS',
    'Next.js',
    'Vue.js',
    'Angular',
    'Tailwind CSS',
    'Redux'
  ],
  backend: [
    'Node.js',
    'Python',
    'Java',
    'Go',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'Docker',
    'Kubernetes',
    'AWS'
  ],
  fullstack: [
    'React',
    'Node.js',
    'TypeScript',
    'PostgreSQL',
    'MongoDB',
    'Docker',
    'AWS',
    'Git',
    'REST API',
    'GraphQL'
  ],
  mobile: [
    'React Native',
    'Flutter',
    'Swift',
    'Kotlin',
    'iOS',
    'Android',
    'Firebase',
    'Redux',
    'TypeScript'
  ],
  devops: [
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'GCP',
    'Jenkins',
    'GitLab CI',
    'Terraform',
    'Ansible',
    'Prometheus'
  ],
  data: [
    'Python',
    'SQL',
    'Pandas',
    'NumPy',
    'TensorFlow',
    'PyTorch',
    'Spark',
    'Hadoop',
    'Tableau',
    'Power BI'
  ],
  ml: [
    'Python',
    'TensorFlow',
    'PyTorch',
    'scikit-learn',
    'Keras',
    'NLP',
    'Computer Vision',
    'MLOps',
    'AWS SageMaker'
  ]
}

interface EnhancedJobFormProps {
  onSubmit: (data: JobFormData) => void
  onCancel: () => void
  isLoading?: boolean
  initialData?: Partial<JobFormData>
  isEditing?: boolean
}

export function EnhancedJobForm ({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  isEditing = false
}: EnhancedJobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    title: initialData?.title || '',
    company: initialData?.company || '',
    location: initialData?.location || '',
    locationType: initialData?.locationType || 'remote',
    employmentType: initialData?.employmentType || 'full-time',
    experienceLevel: initialData?.experienceLevel || 'mid',
    salaryMin: initialData?.salaryMin || '',
    salaryMax: initialData?.salaryMax || '',
    salaryCurrency: initialData?.salaryCurrency || 'USD',
    description: initialData?.description || '',
    responsibilities: initialData?.responsibilities || [],
    requirements: initialData?.requirements || [],
    skills: initialData?.skills || [],
    niceToHaveSkills: initialData?.niceToHaveSkills || [],
    department: initialData?.department || '',
    // Application form defaults
    createApplicationForm: false,
    formExpiresAt: '',
    formRequireEmail: true,
    formRequirePhone: false,
    formRequireName: true,
    formAllowAnonymous: false,
    formCustomMessage: '',
    formAcknowledgmentSubject: 'Thank you for your application',
    formAcknowledgmentBody:
      'We have received your application and will review it shortly. We will be in touch if your profile matches our requirements.',
    formMaxSubmissions: '',
    formAutoExpire: false,
    formQuestions: []
  })

  const [currentResponsibility, setCurrentResponsibility] = useState('')
  const [currentRequirement, setCurrentRequirement] = useState('')
  const [currentSkill, setCurrentSkill] = useState('')
  const [currentNiceToHave, setCurrentNiceToHave] = useState('')
  const [showSkillRecommendations, setShowSkillRecommendations] =
    useState(false)
  const [showTitleDropdown, setShowTitleDropdown] = useState(false)
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false)
  const [showSkillDropdown, setShowSkillDropdown] = useState(false)
  const [currentFormQuestion, setCurrentFormQuestion] = useState('')
  const [currentQuestionWeight, setCurrentQuestionWeight] = useState<
    'critical' | 'important' | 'nice_to_have'
  >('important')
  const generateQuestionsMutation = useGenerateQuestions()

  const handleGenerateAIQuestions = async () => {
    const description = formData.description?.trim()
    if (!description || description.length < 50) {
      toast.error(
        'Please add a job description (at least 50 characters) to generate AI questions'
      )
      return
    }

    try {
      const result = await generateQuestionsMutation.mutateAsync(description)
      const newQuestions = result.questions.map(q => ({
        question: q.question,
        weight: q.weight
      }))
      setFormData({
        ...formData,
        formQuestions: [...formData.formQuestions, ...newQuestions]
      })
      toast.success(`Generated ${result.questions.length} questions using AI`)
    } catch {
      toast.error('Failed to generate questions')
    }
  }

  const getSkillRecommendations = (): string[] => {
    const title = formData.title.toLowerCase()
    let recommendations: string[] = []

    Object.entries(SKILL_RECOMMENDATIONS).forEach(([key, skills]) => {
      if (title.includes(key)) {
        recommendations = [...recommendations, ...skills]
      }
    })

    // Remove duplicates and already added skills
    return [...new Set(recommendations)].filter(
      skill =>
        !formData.skills.includes(skill) &&
        !formData.niceToHaveSkills.includes(skill)
    )
  }

  const handleAddItem = (
    value: string,
    field: keyof JobFormData,
    setter: (value: string) => void
  ) => {
    if (!value.trim()) return

    const currentArray = formData[field] as string[]
    if (currentArray.includes(value.trim())) {
      toast.error('This item already exists')
      return
    }

    setFormData({
      ...formData,
      [field]: [...currentArray, value.trim()]
    })
    setter('')
  }

  const handleRemoveItem = (index: number, field: keyof JobFormData) => {
    const currentArray = formData[field] as string[]
    setFormData({
      ...formData,
      [field]: currentArray.filter((_, i) => i !== index)
    })
  }

  const handleAddRecommendedSkill = (skill: string) => {
    if (formData.skills.includes(skill)) return
    setFormData({
      ...formData,
      skills: [...formData.skills, skill]
    })
    toast.success(`Added ${skill}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.skills.length === 0) {
      toast.error('Please add at least one required skill')
      return
    }

    onSubmit(formData)
  }

  const recommendedSkills = getSkillRecommendations()

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-6 max-h-[70vh] overflow-y-auto pr-2'
    >
      {/* Basic Information */}
      <div className='space-y-4'>
        <h3 className='font-semibold text-lg'>Basic Information</h3>

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2 relative'>
            <Label htmlFor='title'>Job Title *</Label>
            <Input
              id='title'
              placeholder='e.g., Senior Frontend Developer'
              value={formData.title}
              onChange={e => {
                setFormData({ ...formData, title: e.target.value })
                setShowTitleDropdown(true)
              }}
              onFocus={() => setShowTitleDropdown(true)}
              onBlur={() => setTimeout(() => setShowTitleDropdown(false), 200)}
              required
            />
            {showTitleDropdown && (
              <div className='absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto'>
                {COMMON_JOB_TITLES.filter(
                  title =>
                    !formData.title ||
                    title.toLowerCase().includes(formData.title.toLowerCase())
                ).map(title => (
                  <div
                    key={title}
                    className='px-3 py-2 hover:bg-accent cursor-pointer text-sm'
                    onMouseDown={() => {
                      setFormData({ ...formData, title })
                      setShowTitleDropdown(false)
                    }}
                  >
                    {title}
                  </div>
                ))}
                {formData.title &&
                  !COMMON_JOB_TITLES.some(title =>
                    title.toLowerCase().includes(formData.title.toLowerCase())
                  ) && (
                    <div className='px-3 py-2 text-sm text-muted-foreground italic'>
                      Press Enter to add &quot;{formData.title}&quot;
                    </div>
                  )}
              </div>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='company'>Company</Label>
            <Input
              id='company'
              placeholder='e.g., Acme Inc.'
              value={formData.company}
              onChange={e =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          <div className='space-y-2'>
            <Label htmlFor='location'>Location</Label>
            <Input
              id='location'
              placeholder='e.g., San Francisco, CA'
              value={formData.location}
              onChange={e =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='locationType'>Location Type</Label>
            <Select
              value={formData.locationType}
              onValueChange={value =>
                setFormData({ ...formData, locationType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='remote'>Remote</SelectItem>
                <SelectItem value='hybrid'>Hybrid</SelectItem>
                <SelectItem value='onsite'>On-site</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='employmentType'>Employment Type</Label>
            <Select
              value={formData.employmentType}
              onValueChange={value =>
                setFormData({ ...formData, employmentType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='full-time'>Full-time</SelectItem>
                <SelectItem value='part-time'>Part-time</SelectItem>
                <SelectItem value='contract'>Contract</SelectItem>
                <SelectItem value='internship'>Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='experienceLevel'>Experience Level</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={value =>
                setFormData({ ...formData, experienceLevel: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='entry'>Entry Level (0-2 years)</SelectItem>
                <SelectItem value='mid'>Mid Level (2-5 years)</SelectItem>
                <SelectItem value='senior'>Senior (5-10 years)</SelectItem>
                <SelectItem value='lead'>Lead/Principal (10+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2 relative'>
            <Label htmlFor='department'>Department</Label>
            <Input
              id='department'
              placeholder='e.g., Engineering, Product'
              value={formData.department}
              onChange={e => {
                setFormData({ ...formData, department: e.target.value })
                setShowDepartmentDropdown(true)
              }}
              onFocus={() => setShowDepartmentDropdown(true)}
              onBlur={() =>
                setTimeout(() => setShowDepartmentDropdown(false), 200)
              }
            />
            {showDepartmentDropdown && (
              <div className='absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto'>
                {COMMON_DEPARTMENTS.filter(
                  dept =>
                    !formData.department ||
                    dept
                      .toLowerCase()
                      .includes(formData.department.toLowerCase())
                ).map(dept => (
                  <div
                    key={dept}
                    className='px-3 py-2 hover:bg-accent cursor-pointer text-sm'
                    onMouseDown={() => {
                      setFormData({ ...formData, department: dept })
                      setShowDepartmentDropdown(false)
                    }}
                  >
                    {dept}
                  </div>
                ))}
                {formData.department &&
                  !COMMON_DEPARTMENTS.some(dept =>
                    dept
                      .toLowerCase()
                      .includes(formData.department.toLowerCase())
                  ) && (
                    <div className='px-3 py-2 text-sm text-muted-foreground italic'>
                      Press Enter to add &quot;{formData.department}&quot;
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compensation */}
      <div className='space-y-4'>
        <h3 className='font-semibold text-lg'>Compensation</h3>
        <div className='grid gap-4 md:grid-cols-3'>
          <div className='space-y-2'>
            <Label htmlFor='salaryMin'>Min Salary</Label>
            <Input
              id='salaryMin'
              type='number'
              placeholder='80000'
              value={formData.salaryMin}
              onChange={e =>
                setFormData({ ...formData, salaryMin: e.target.value })
              }
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='salaryMax'>Max Salary</Label>
            <Input
              id='salaryMax'
              type='number'
              placeholder='120000'
              value={formData.salaryMax}
              onChange={e =>
                setFormData({ ...formData, salaryMax: e.target.value })
              }
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='currency'>Currency</Label>
            <Select
              value={formData.salaryCurrency}
              onValueChange={value =>
                setFormData({ ...formData, salaryCurrency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='USD'>USD ($)</SelectItem>
                <SelectItem value='EUR'>EUR (€)</SelectItem>
                <SelectItem value='GBP'>GBP (£)</SelectItem>
                <SelectItem value='INR'>INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className='space-y-2'>
        <Label htmlFor='description'>Job Description *</Label>
        <Textarea
          id='description'
          placeholder='Describe the role, team, and what makes this opportunity exciting...'
          className='min-h-[120px]'
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      {/* Responsibilities */}
      <div className='space-y-3'>
        <Label>Responsibilities</Label>
        <div className='flex gap-2'>
          <Input
            placeholder='Add a responsibility and press Enter'
            value={currentResponsibility}
            onChange={e => setCurrentResponsibility(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddItem(
                  currentResponsibility,
                  'responsibilities',
                  setCurrentResponsibility
                )
              }
            }}
          />
          <Button
            type='button'
            size='sm'
            onClick={() =>
              handleAddItem(
                currentResponsibility,
                'responsibilities',
                setCurrentResponsibility
              )
            }
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
        <div className='flex flex-wrap gap-2'>
          {formData.responsibilities.map((item, index) => (
            <Badge key={index} variant='secondary' className='pl-3 pr-1'>
              {item}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-auto p-1 ml-1'
                onClick={() => handleRemoveItem(index, 'responsibilities')}
              >
                <X className='h-3 w-3' />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className='space-y-3'>
        <Label>Requirements</Label>
        <div className='flex gap-2'>
          <Input
            placeholder='Add a requirement and press Enter'
            value={currentRequirement}
            onChange={e => setCurrentRequirement(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddItem(
                  currentRequirement,
                  'requirements',
                  setCurrentRequirement
                )
              }
            }}
          />
          <Button
            type='button'
            size='sm'
            onClick={() =>
              handleAddItem(
                currentRequirement,
                'requirements',
                setCurrentRequirement
              )
            }
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
        <div className='flex flex-wrap gap-2'>
          {formData.requirements.map((item, index) => (
            <Badge key={index} variant='secondary' className='pl-3 pr-1'>
              {item}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-auto p-1 ml-1'
                onClick={() => handleRemoveItem(index, 'requirements')}
              >
                <X className='h-3 w-3' />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Required Skills */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label>Required Skills *</Label>
          {recommendedSkills.length > 0 && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() =>
                setShowSkillRecommendations(!showSkillRecommendations)
              }
            >
              <Lightbulb className='h-4 w-4 mr-2' />
              {showSkillRecommendations ? 'Hide' : 'Show'} Recommendations
            </Button>
          )}
        </div>

        {showSkillRecommendations && recommendedSkills.length > 0 && (
          <div className='p-3 bg-muted/50 rounded-lg space-y-2'>
            <p className='text-sm text-muted-foreground flex items-center gap-2'>
              <Sparkles className='h-4 w-4' />
              Recommended skills based on job title:
            </p>
            <div className='flex flex-wrap gap-2'>
              {recommendedSkills.slice(0, 10).map(skill => (
                <Badge
                  key={skill}
                  variant='outline'
                  className='cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors'
                  onClick={() => handleAddRecommendedSkill(skill)}
                >
                  <Plus className='h-3 w-3 mr-1' />
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className='flex gap-2 relative'>
          <div className='flex-1 relative'>
            <Input
              placeholder='Add a required skill and press Enter'
              value={currentSkill}
              onChange={e => {
                setCurrentSkill(e.target.value)
                setShowSkillDropdown(true)
              }}
              onFocus={() => setShowSkillDropdown(true)}
              onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddItem(currentSkill, 'skills', setCurrentSkill)
                  setShowSkillDropdown(false)
                }
              }}
            />
            {showSkillDropdown && currentSkill && (
              <div className='absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto'>
                {COMMON_SKILLS.filter(
                  skill =>
                    skill.toLowerCase().includes(currentSkill.toLowerCase()) &&
                    !formData.skills.includes(skill)
                )
                  .slice(0, 10)
                  .map(skill => (
                    <div
                      key={skill}
                      className='px-3 py-2 hover:bg-accent cursor-pointer'
                      onMouseDown={() => {
                        handleAddItem(skill, 'skills', setCurrentSkill)
                        setShowSkillDropdown(false)
                      }}
                    >
                      {skill}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <Button
            type='button'
            size='sm'
            onClick={() => {
              handleAddItem(currentSkill, 'skills', setCurrentSkill)
              setShowSkillDropdown(false)
            }}
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
        <div className='flex flex-wrap gap-2'>
          {formData.skills.map((item, index) => (
            <Badge key={index} variant='default' className='pl-3 pr-1'>
              {item}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-auto p-1 ml-1 hover:bg-primary-foreground/20'
                onClick={() => handleRemoveItem(index, 'skills')}
              >
                <X className='h-3 w-3' />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Nice-to-Have Skills */}
      <div className='space-y-3'>
        <Label>Nice-to-Have Skills</Label>
        <div className='flex gap-2'>
          <Input
            placeholder='Add a nice-to-have skill and press Enter'
            value={currentNiceToHave}
            onChange={e => setCurrentNiceToHave(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddItem(
                  currentNiceToHave,
                  'niceToHaveSkills',
                  setCurrentNiceToHave
                )
              }
            }}
          />
          <Button
            type='button'
            size='sm'
            onClick={() =>
              handleAddItem(
                currentNiceToHave,
                'niceToHaveSkills',
                setCurrentNiceToHave
              )
            }
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
        <div className='flex flex-wrap gap-2'>
          {formData.niceToHaveSkills.map((item, index) => (
            <Badge key={index} variant='outline' className='pl-3 pr-1'>
              {item}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-auto p-1 ml-1'
                onClick={() => handleRemoveItem(index, 'niceToHaveSkills')}
              >
                <X className='h-3 w-3' />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Application Form */}
      <div className='space-y-4 p-4 border rounded-lg bg-muted/30'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <Label className='flex items-center gap-2 text-base font-semibold'>
              <Link2 className='h-5 w-5' />
              Application Form
            </Label>
            <p className='text-sm text-muted-foreground mt-1'>
              Create a shareable link so candidates can apply with their resume
              and answer screening questions
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Checkbox
              id='createApplicationForm'
              checked={formData.createApplicationForm}
              onCheckedChange={checked =>
                setFormData({
                  ...formData,
                  createApplicationForm: !!checked
                })
              }
            />
            <Label
              htmlFor='createApplicationForm'
              className='text-sm font-medium cursor-pointer'
            >
              Enable
            </Label>
          </div>
        </div>

        {formData.createApplicationForm && (
          <>
            {/* Screening Questions */}
            <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium'>Screening Questions</Label>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleGenerateAIQuestions}
              disabled={generateQuestionsMutation.isPending}
              className='shrink-0'
            >
              {generateQuestionsMutation.isPending ? (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              ) : (
                <Sparkles className='h-4 w-4 mr-2' />
              )}
              Generate with AI
            </Button>
          </div>
          <div className='flex gap-2'>
            <div className='flex-1'>
              <Input
                placeholder='Enter a screening question...'
                value={currentFormQuestion}
                onChange={e => setCurrentFormQuestion(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && currentFormQuestion.trim()) {
                    e.preventDefault()
                    setFormData({
                      ...formData,
                      formQuestions: [
                        ...formData.formQuestions,
                        {
                          question: currentFormQuestion.trim(),
                          weight: currentQuestionWeight
                        }
                      ]
                    })
                    setCurrentFormQuestion('')
                  }
                }}
              />
            </div>
            <Select
              value={currentQuestionWeight}
              onValueChange={value =>
                setCurrentQuestionWeight(
                  value as 'critical' | 'important' | 'nice_to_have'
                )
              }
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='critical'>Critical</SelectItem>
                <SelectItem value='important'>Important</SelectItem>
                <SelectItem value='nice_to_have'>Nice to Have</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type='button'
              size='sm'
              onClick={() => {
                if (currentFormQuestion.trim()) {
                  setFormData({
                    ...formData,
                    formQuestions: [
                      ...formData.formQuestions,
                      {
                        question: currentFormQuestion.trim(),
                        weight: currentQuestionWeight
                      }
                    ]
                  })
                  setCurrentFormQuestion('')
                }
              }}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
          <div className='space-y-2'>
            {formData.formQuestions.map((item, index) => (
              <div
                key={index}
                className='flex items-start gap-2 p-3 bg-background border rounded-lg'
              >
                <div className='flex-1'>
                  <p className='text-sm'>{item.question}</p>
                  <Badge variant='secondary' className='text-xs mt-2'>
                    {item.weight === 'critical'
                      ? '🔴 Critical'
                      : item.weight === 'important'
                      ? '🟡 Important'
                      : '🟢 Nice to Have'}
                  </Badge>
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setFormData({
                      ...formData,
                      formQuestions: formData.formQuestions.filter(
                        (_, i) => i !== index
                      )
                    })
                  }}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            ))}
            {formData.formQuestions.length === 0 && (
              <p className='text-sm text-muted-foreground italic text-center py-4'>
                No screening questions yet. Add manually or generate with AI.
              </p>
            )}
          </div>
        </div>

        {/* Form Settings */}
        <div className='space-y-4 border-t pt-4'>
          <h4 className='font-semibold text-sm'>Form Settings</h4>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label
                htmlFor='formExpiresAt'
                className='flex items-center gap-2'
              >
                <Calendar className='h-4 w-4' />
                Form Expires On
              </Label>
              <Input
                id='formExpiresAt'
                type='date'
                value={formData.formExpiresAt}
                onChange={e =>
                  setFormData({
                    ...formData,
                    formExpiresAt: e.target.value
                  })
                }
              />
              <p className='text-xs text-muted-foreground'>
                Leave empty for no expiration
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='formMaxSubmissions'>Max Submissions</Label>
              <Input
                id='formMaxSubmissions'
                type='number'
                placeholder='e.g., 100'
                value={formData.formMaxSubmissions}
                onChange={e =>
                  setFormData({
                    ...formData,
                    formMaxSubmissions: e.target.value
                  })
                }
              />
              <p className='text-xs text-muted-foreground'>
                Leave empty for unlimited
              </p>
            </div>
          </div>

          <div className='space-y-3'>
            <Label className='text-sm font-medium'>Required Information</Label>
            <div className='grid grid-cols-2 gap-2'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='formRequireEmail'
                  checked={formData.formRequireEmail}
                  onCheckedChange={checked =>
                    setFormData({
                      ...formData,
                      formRequireEmail: !!checked
                    })
                  }
                />
                <Label
                  htmlFor='formRequireEmail'
                  className='text-sm cursor-pointer'
                >
                  Require Email
                </Label>
              </div>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='formRequireName'
                  checked={formData.formRequireName}
                  onCheckedChange={checked =>
                    setFormData({ ...formData, formRequireName: !!checked })
                  }
                />
                <Label
                  htmlFor='formRequireName'
                  className='text-sm cursor-pointer'
                >
                  Require Full Name
                </Label>
              </div>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='formRequirePhone'
                  checked={formData.formRequirePhone}
                  onCheckedChange={checked =>
                    setFormData({
                      ...formData,
                      formRequirePhone: !!checked
                    })
                  }
                />
                <Label
                  htmlFor='formRequirePhone'
                  className='text-sm cursor-pointer'
                >
                  Require Phone
                </Label>
              </div>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='formAutoExpire'
                  checked={formData.formAutoExpire}
                  onCheckedChange={checked =>
                    setFormData({ ...formData, formAutoExpire: !!checked })
                  }
                />
                <Label
                  htmlFor='formAutoExpire'
                  className='text-sm cursor-pointer'
                >
                  Auto-close at max
                </Label>
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='formCustomMessage'>
              Welcome Message (Optional)
            </Label>
            <Textarea
              id='formCustomMessage'
              placeholder='A brief message to candidates about this position...'
              className='min-h-[80px]'
              value={formData.formCustomMessage}
              onChange={e =>
                setFormData({
                  ...formData,
                  formCustomMessage: e.target.value
                })
              }
            />
          </div>
        </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className='flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background pb-2'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading
            ? isEditing
              ? 'Updating...'
              : 'Creating...'
            : isEditing
            ? 'Update Job'
            : 'Create Job'}
        </Button>
      </div>
    </form>
  )
}
