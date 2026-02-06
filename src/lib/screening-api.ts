// src/lib/screening-api.ts
// API client for resume screening endpoints

import { env } from './env'

const API_BASE = env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

// ============================================================================
// Types
// ============================================================================

export interface ScoringWeights {
  skills: number
  experience: number
  trust: number
  education: number
  projects: number
}

export interface CustomPreferences {
  questions: Array<{
    question: string
    weight: 'critical' | 'important' | 'nice_to_have'
  }>
  preferences: string[]
}

export interface SkillMatchDetail {
  required: string[]
  matched: Array<{
    skill: string
    confidence: number
    source?: string[]
  }>
  missing: string[]
  partial: Array<{
    skill: string
    confidence: number
  }>
  matchPercentage: number
}

export interface ScoreExplanation {
  whyRankedHigh: string[]
  whyRankedLower: string[]
}

export interface CustomAnswer {
  question: string
  answer: string
  satisfied: boolean
}

export interface Job {
  id: string
  title: string
  company?: string
  location?: string
  description: string
  requiredSkills?: string[]
  preferredSkills?: string[]
  minExperienceYears?: number
  maxExperienceYears?: number
  scoringWeights?: ScoringWeights
  customPreferences?: CustomPreferences
  status: string
  resumeCount: number
  processedCount: number
  createdAt: string
}

export interface JobMetadata {
  locationType?: 'remote' | 'hybrid' | 'onsite'
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship'
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead'
  department?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  responsibilities?: string[]
  requirements?: string[]
}

export interface CreateJobRequest {
  title: string
  company?: string
  location?: string
  description: string
  requiredSkills?: string[]
  preferredSkills?: string[]
  jobMetadata?: JobMetadata
  scoringWeights?: ScoringWeights
  customPreferences?: CustomPreferences
}

export interface UploadUrlResponse {
  resumeId: string
  uploadUrl: string
  fileKey: string
}

export interface Candidate {
  resumeId: string
  analysisId?: string
  fileName: string
  candidateName?: string
  candidateEmail?: string
  jobId?: string
  jobTitle?: string
  overallScore?: number
  skillsScore?: number
  experienceScore?: number
  educationScore?: number
  projectScore?: number
  trustScore?: number
  trustFlags?: string[]
  rankPosition?: number
  percentile?: number
  recommendation?: string
  strengths?: string[]
  concerns?: string[]
  explanation?: ScoreExplanation
  customAnswers?: CustomAnswer[]
  skillMatch?: SkillMatchDetail
  parsedLocation?: { city?: string; state?: string; country?: string }
  predictedRoles?: string[]
  totalYearsExperience?: number
  status: string
  uploadedAt?: string
  processedAt?: string
  // Shortlisting
  isShortlisted?: boolean
  groupName?: string
  shortlistNotes?: string
  // Enhanced analysis signals
  skillConfidence?: SkillConfidenceItem[]
  roleFitScores?: RoleFitScore[]
  experienceQuality?: ExperienceQuality
  skillFreshness?: SkillFreshnessItem[]
  transferableSkills?: TransferableSkillItem[]
  resumeQualityScore?: ResumeQualityScore
  scoreConfidence?: ScoreConfidence
  trustBadges?: string[]
}

export interface JobCandidatesResponse {
  jobId: string
  jobTitle: string
  totalCandidates: number
  processedCandidates: number
  candidates: Candidate[]
}

export interface QuickAnalyzeRequest {
  resumeText: string
  jobDescription: string
  isBase64Pdf?: boolean
}

export interface SkillConfidenceItem {
  skill: string
  confidence: 'high' | 'medium' | 'low' | 'none'
  evidence: string[]
  sourceCount: number
  verifiedByGithub: boolean
  lastUsed?: string
}

export interface RoleFitScore {
  role: string
  fitPercentage: number
  topBlockers: string[]
  topStrengths: string[]
  confidence: number
}

export interface ExperienceQuality {
  totalYears: number
  projectsPerYear: number
  hasProductionExposure: boolean
  continuityScore: number
  averageTenureMonths: number
  longestTenureMonths: number
  summary: string
}

export interface SkillFreshnessItem {
  skill: string
  lastUsed: string
  source: string
}

export interface TransferableSkillItem {
  missingSkill: string
  adjacentSkills: string[]
  transferability: 'high' | 'medium' | 'low'
  reasoning: string
}

export interface ResumeQualityScore {
  overall: number
  clarity: number
  impactEvidence: number
  consistency: number
  overclaimRisk: 'low' | 'medium' | 'high'
  details: string[]
}

export interface ScoreConfidence {
  level: 'high' | 'medium' | 'low'
  dataSourceCount: number
  evidenceStrength: string
  completeness: string
  improvementCta?: string
}

export interface QuickAnalyzeResponse {
  score: number
  strengths: string[]
  improvements: string[]
  summary: string
  skillsMatched?: string[]
  skillsMissing?: string[]
  predictedRoles?: Array<{
    role: string
    confidence: number
    reasoning: string
  }>
  courseRecommendations?: Array<{
    title: string
    platform: string
    skill: string
    url?: string
  }>
  resumeTips?: Array<{ category: string; tip: string; priority: string }>
  // Enhanced analysis signals
  skillConfidence?: SkillConfidenceItem[]
  roleFitScores?: RoleFitScore[]
  experienceQuality?: ExperienceQuality
  skillFreshness?: SkillFreshnessItem[]
  transferableSkills?: TransferableSkillItem[]
  resumeQualityScore?: ResumeQualityScore
  scoreConfidence?: ScoreConfidence
  trustBadges?: string[]
}

export interface ResumeStatus {
  resumeId: string
  status: string
  errorMessage?: string
  parsedData?: {
    name?: string
    email?: string
    skills?: string[]
    totalYearsExperience?: number
  }
}

export interface CandidateAnalysisItem {
  analysisId: string
  jobTitle?: string
  jobDescription?: string
  overallScore?: number
  skillsScore?: number
  experienceScore?: number
  educationScore?: number
  projectScore?: number
  trustScore?: number
  recommendation?: string
  strengths?: string[]
  concerns?: string[]
  status: string
  createdAt: string
}

export interface CandidateResumeItem {
  resumeId: string
  fileName: string
  status: string
  candidateName?: string
  candidateEmail?: string
  skills?: string[]
  totalYearsExperience?: number
  location?: { city?: string; state?: string; country?: string }
  createdAt: string
  updatedAt?: string
  errorMessage?: string
  analyses: CandidateAnalysisItem[]
}

export interface CandidateMyResumesResponse {
  resumes: CandidateResumeItem[]
  totalResumes: number
}

export interface CandidateProfileResponse {
  userId: string
  email: string
  fullName?: string
  totalResumes: number
  totalAnalyses: number
  averageScore?: number
  topSkills?: string[]
  lastActivity?: string
}

export interface AnalysisResult {
  analysisId: string
  resumeId: string
  status: string
  result?: {
    overallScore: number
    skillsScore: number
    experienceScore: number
    educationScore: number
    projectScore?: number
    trustScore?: number
    strengths: string[]
    concerns: string[]
    suggestions: string[]
    summary: string
    recommendation: string
    skillsMatched: Array<{
      skill: string
      status: string
      level?: string
    }>
    skillsMissing: string[]
    skillMatch?: SkillMatchDetail
    explanation?: ScoreExplanation
    customAnswers?: CustomAnswer[]
    predictedRoles?: Array<{
      role: string
      confidence: number
      reasoning: string
    }>
    courseRecommendations?: Array<{
      title: string
      platform: string
      skill: string
      url?: string
    }>
    resumeTips?: Array<{ category: string; tip: string; priority: string }>
  }
  verifications?: {
    github?: {
      verified: boolean
      username?: string
      topLanguages?: string[]
      publicRepos?: number
    }
    linkedin?: {
      accessible: boolean
    }
  }
}

// ============================================================================
// API Functions
// ============================================================================

function getAuthToken (): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed?.state?.token || null
    }
  } catch {
    // ignore
  }
  return null
}

async function fetchAPI<T> (
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>)
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `API Error: ${res.status}`)
  }

  return res.json()
}

// ============================================================================
// Recruiter API
// ============================================================================

export const recruiterAPI = {
  // Create a new job
  createJob: (data: CreateJobRequest): Promise<Job> =>
    fetchAPI('/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Get all jobs
  listJobs: (): Promise<{ jobs: Job[] }> => fetchAPI('/jobs'),

  // Get single job
  getJob: (jobId: string): Promise<Job> => fetchAPI(`/jobs/${jobId}`),

  // Update job preferences (scoring weights + custom preferences)
  updateJobPreferences: (
    jobId: string,
    data: {
      scoringWeights?: ScoringWeights
      customPreferences?: CustomPreferences
    }
  ): Promise<Job> =>
    fetchAPI(`/jobs/${jobId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify({ jobId, ...data })
    }),

  // Re-trigger ranking computation (optionally for selected candidates only)
  recomputeRanking: (
    jobId: string,
    resumeIds?: string[]
  ): Promise<{ success: boolean; message: string; rankedCount?: number }> =>
    fetchAPI(`/jobs/${jobId}/rerank`, {
      method: 'POST',
      body: JSON.stringify({ jobId, resumeIds })
    }),

  // Get upload URL for resume
  getResumeUploadUrl: (
    jobId: string,
    fileName: string,
    mimeType: string
  ): Promise<UploadUrlResponse> =>
    fetchAPI(`/jobs/${jobId}/resumes/upload-url`, {
      method: 'POST',
      body: JSON.stringify({ jobId, fileName, mimeType })
    }),

  // Confirm resume upload
  confirmUpload: (
    resumeId: string,
    fileName: string,
    fileSize: number,
    mimeType: string
  ): Promise<{ success: boolean; resumeId: string }> =>
    fetchAPI(`/resumes/${resumeId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ resumeId, fileName, fileSize, mimeType })
    }),

  // Trigger analysis for all resumes in a job
  analyzeJobResumes: (jobId: string): Promise<{ queued: number }> =>
    fetchAPI(`/jobs/${jobId}/analyze`, {
      method: 'POST'
    }),

  // Get ranked candidates for a job
  getJobCandidates: (jobId: string): Promise<JobCandidatesResponse> =>
    fetchAPI(`/jobs/${jobId}/candidates`),

  // Get presigned download URL for a resume PDF
  getResumeDownloadUrl: (resumeId: string): Promise<{ downloadUrl: string }> =>
    fetchAPI(`/resumes/${resumeId}/download-url`),

  // Reprocess a failed resume
  reprocessResume: (
    resumeId: string
  ): Promise<{ success: boolean; message: string }> =>
    fetchAPI(`/resumes/${resumeId}/reprocess`, { method: 'POST' }),

  // Toggle shortlist for a candidate
  toggleShortlist: (
    jobId: string,
    resumeId: string,
    isShortlisted: boolean
  ): Promise<{ success: boolean; isShortlisted: boolean }> =>
    fetchAPI(`/jobs/${jobId}/candidates/${resumeId}/shortlist`, {
      method: 'POST',
      body: JSON.stringify({ jobId, resumeId, isShortlisted })
    }),

  // Bulk shortlist candidates
  bulkShortlist: (
    jobId: string,
    resumeIds: string[],
    isShortlisted: boolean
  ): Promise<{ success: boolean; updated: number }> =>
    fetchAPI(`/jobs/${jobId}/candidates/bulk-shortlist`, {
      method: 'POST',
      body: JSON.stringify({ jobId, resumeIds, isShortlisted })
    }),

  // Assign candidates to a group
  assignGroup: (
    jobId: string,
    resumeIds: string[],
    groupName: string
  ): Promise<{ success: boolean; updated: number }> =>
    fetchAPI(`/jobs/${jobId}/candidates/assign-group`, {
      method: 'POST',
      body: JSON.stringify({ jobId, resumeIds, groupName })
    }),

  // Remove candidates from a group
  removeFromGroup: (
    jobId: string,
    resumeIds: string[]
  ): Promise<{ success: boolean; updated: number }> =>
    fetchAPI(`/jobs/${jobId}/candidates/remove-group`, {
      method: 'POST',
      body: JSON.stringify({ jobId, resumeIds })
    }),

  // Get all groups for a job
  getJobGroups: (
    jobId: string
  ): Promise<{ groups: Array<{ name: string; count: number }> }> =>
    fetchAPI(`/jobs/${jobId}/groups`),

  // Update job details
  updateJob: (
    jobId: string,
    data: {
      title?: string
      company?: string
      location?: string
      description?: string
      requiredSkills?: string[]
      preferredSkills?: string[]
      minExperienceYears?: number
      maxExperienceYears?: number
      educationLevel?: string
    }
  ): Promise<Job> =>
    fetchAPI(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify({ jobId, ...data })
    }),

  // Archive job (soft delete)
  archiveJob: (jobId: string): Promise<{ success: boolean; message: string }> =>
    fetchAPI(`/jobs/${jobId}/archive`, {
      method: 'POST'
    })
}

// ============================================================================
// Candidate API
// ============================================================================

export const candidateAPI = {
  // Quick analyze (paste resume + JD)
  quickAnalyze: (data: QuickAnalyzeRequest): Promise<QuickAnalyzeResponse> =>
    fetchAPI('/analyze/quick', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Get upload URL for candidate resume
  getUploadUrl: (
    fileName: string,
    mimeType: string
  ): Promise<UploadUrlResponse> =>
    fetchAPI('/analyze/upload-url', {
      method: 'POST',
      body: JSON.stringify({ fileName, mimeType })
    }),

  // Confirm upload
  confirmUpload: (
    resumeId: string,
    fileName: string,
    fileSize: number
  ): Promise<{ resumeId: string; status: string }> =>
    fetchAPI('/analyze/confirm', {
      method: 'POST',
      body: JSON.stringify({ resumeId, fileName, fileSize })
    }),

  // Get resume status
  getResumeStatus: (resumeId: string): Promise<ResumeStatus> =>
    fetchAPI(`/resumes/${resumeId}/status`),

  // Run full analysis
  analyzeResume: (
    resumeId: string,
    jobDescription: string
  ): Promise<{ analysisId: string; status: string }> =>
    fetchAPI(`/analyze/${resumeId}`, {
      method: 'POST',
      body: JSON.stringify({ resumeId, jobDescription })
    }),

  // Get analysis result
  getAnalysisResult: (analysisId: string): Promise<AnalysisResult> =>
    fetchAPI(`/analyses/${analysisId}`),

  // Dashboard: Get all my resumes with analyses
  getMyResumes: (): Promise<CandidateMyResumesResponse> =>
    fetchAPI('/candidate/my-resumes'),

  // Dashboard: Get my profile summary
  getMyProfile: (): Promise<CandidateProfileResponse> =>
    fetchAPI('/candidate/profile'),

  // Dashboard: Get download URL for my resume
  getMyResumeDownloadUrl: (
    resumeId: string
  ): Promise<{ downloadUrl: string }> =>
    fetchAPI(`/candidate/resumes/${resumeId}/download`)
}

// ============================================================================
// Settings API
// ============================================================================

export const settingsAPI = {
  getCompany: (
    token: string
  ): Promise<{
    success: boolean
    company?: {
      id: string
      name: string
      website: string | null
      industry: string | null
      companySize: string | null
      description: string | null
      logo: string | null
      linkedinUrl: string | null
    }
    message?: string
  }> =>
    fetchAPI('/auth/company/get', {
      method: 'POST',
      body: JSON.stringify({ token })
    }),

  updateCompany: (
    token: string,
    data: {
      name?: string
      website?: string
      industry?: string
      companySize?: string
    }
  ): Promise<{ success: boolean; message: string }> =>
    fetchAPI('/auth/company/update', {
      method: 'POST',
      body: JSON.stringify({ token, ...data })
    }),

  deleteAccount: (
    token: string
  ): Promise<{ success: boolean; message: string }> =>
    fetchAPI('/auth/account/delete', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
}

// ============================================================================
// Team API
// ============================================================================

export const teamAPI = {
  inviteTeamMember: (
    email: string,
    role: 'admin' | 'member',
    inviterId: string
  ): Promise<{ invitationId: string; token: string; expiresAt: string }> =>
    fetchAPI('/team/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role, inviterId })
    }),

  getTeamMembers: (
    recruiterId: string
  ): Promise<{
    members: Array<{
      id: string
      email: string
      fullName?: string
      role: 'admin' | 'member'
      status: 'active' | 'pending'
      joinedAt?: string
      invitationId?: string
    }>
    isAdmin: boolean
  }> => fetchAPI(`/team/${recruiterId}/members`),

  removeTeamMember: (
    memberId: string,
    recruiterId: string
  ): Promise<{ success: boolean }> =>
    fetchAPI(`/team/members/${memberId}`, {
      method: 'DELETE',
      body: JSON.stringify({ memberId, recruiterId })
    }),

  resendInvitation: (invitationId: string): Promise<{ success: boolean }> =>
    fetchAPI(`/team/invitations/${invitationId}/resend`, {
      method: 'POST'
    }),

  acceptInvitation: (
    token: string,
    userId: string
  ): Promise<{ success: boolean; recruiterId: string }> =>
    fetchAPI('/team/accept', {
      method: 'POST',
      body: JSON.stringify({ token, userId })
    })
}

// ============================================================================
// Usage API
// ============================================================================

export interface UsageStatus {
  // Recruiter limits
  resumesUsedThisMonth: number
  resumesLimitThisMonth: number
  resumesRemaining: number
  activeJobsCount: number
  activeJobsLimit: number
  canCreateJob: boolean
  canUploadResume: boolean

  // Candidate limits
  analysesUsedThisMonth: number
  analysesLimitThisMonth: number
  analysesRemaining: number
  canRunAnalysis: boolean

  // Lifetime stats
  lifetimeResumesUploaded: number
  lifetimeJobsCreated: number
  lifetimeAnalyses: number

  // Period info
  currentPeriodStart: string
  planType: string
}

export const usageAPI = {
  // Get current usage status
  getUsageStatus: (): Promise<UsageStatus> => fetchAPI('/usage/status'),

  // Get available plans (for pricing page)
  getPlans: (): Promise<{
    plans: Array<{
      id: string
      name: string
      price: number
      priceDisplay: string
      recruiter: {
        maxActiveJobs: number | string
        maxResumesPerMonth: number | string
      }
      candidate: {
        maxAnalysesPerMonth: number | string
      }
    }>
  }> => fetchAPI('/plans')
}

// ============================================================================
// Dashboard API
// ============================================================================

export interface DashboardStats {
  activeJobs: number
  totalCandidates: number
  verifiedCandidates: number
  pendingReviews: number
}

export const dashboardAPI = {
  getStats: (): Promise<DashboardStats> => fetchAPI('/dashboard/stats'),

  getAllCandidates: (): Promise<{ candidates: Candidate[] }> =>
    fetchAPI('/candidates')
}

// ============================================================================
// Admin API
// ============================================================================

export interface AdminUser {
  id: string
  email: string
  fullName?: string
  role: string
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  lastLoginAt?: string
  planType?: string
  resumesUploadedThisMonth?: number
  jobsCreatedThisMonth?: number
  analysesThisMonth?: number
  lifetimeResumesUploaded?: number
  lifetimeJobsCreated?: number
  lifetimeAnalyses?: number
}

export interface SystemStats {
  totalUsers: number
  totalRecruiters: number
  totalCandidates: number
  activeUsersLast30Days: number
  totalJobs: number
  activeJobs: number
  totalResumes: number
  totalAnalyses: number
  planDistribution: {
    free: number
    starter: number
    pro: number
    enterprise: number
  }
}

export const adminAPI = {
  // Get system-wide statistics
  getStats: (): Promise<SystemStats> => fetchAPI('/admin/stats'),

  // Get admin dashboard summary
  getDashboard: (): Promise<{
    stats: SystemStats
    recentUsers: AdminUser[]
    recentJobs: Array<{
      id: string
      title: string
      recruiterEmail: string
      createdAt: string
    }>
  }> => fetchAPI('/admin/dashboard'),

  // List all users
  listUsers: (params?: {
    role?: string
    planType?: string
    limit?: number
    offset?: number
  }): Promise<{ users: AdminUser[]; total: number }> => {
    const searchParams = new URLSearchParams()
    if (params?.role) searchParams.set('role', params.role)
    if (params?.planType) searchParams.set('planType', params.planType)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    const query = searchParams.toString()
    return fetchAPI(`/admin/users${query ? `?${query}` : ''}`)
  },

  // Get single user details
  getUser: (
    userId: string
  ): Promise<{
    user: AdminUser
    jobs: Array<{
      id: string
      title: string
      status: string
      resumeCount: number
    }>
    recentActivity: Array<{ type: string; description: string; date: string }>
  }> => fetchAPI(`/admin/users/${userId}`),

  // Update user's plan
  updateUserPlan: (
    userId: string,
    planType: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> =>
    fetchAPI(`/admin/users/${userId}/plan`, {
      method: 'PUT',
      body: JSON.stringify({ userId, planType, reason })
    }),

  // Grant usage bonus
  grantUsageBonus: (
    userId: string,
    bonusResumes?: number,
    bonusAnalyses?: number,
    reason?: string
  ): Promise<{ success: boolean; message: string }> =>
    fetchAPI(`/admin/users/${userId}/grant-usage`, {
      method: 'POST',
      body: JSON.stringify({ userId, bonusResumes, bonusAnalyses, reason })
    }),

  // Reset user's monthly usage
  resetUserUsage: (
    userId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> =>
    fetchAPI(`/admin/users/${userId}/reset-usage`, {
      method: 'POST',
      body: JSON.stringify({ userId, reason })
    }),

  // Activate/deactivate user
  toggleUserStatus: (
    userId: string,
    isActive: boolean,
    reason?: string
  ): Promise<{ success: boolean; message: string }> =>
    fetchAPI(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ userId, isActive, reason })
    }),

  // Get recent jobs
  getRecentJobs: (params?: {
    limit?: number
    offset?: number
  }): Promise<{
    jobs: Array<{
      id: string
      title: string
      company?: string
      status: string
      resumeCount: number
      recruiterEmail: string
      createdAt: string
    }>
    total: number
  }> => {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    const query = searchParams.toString()
    return fetchAPI(`/admin/jobs${query ? `?${query}` : ''}`)
  },

  // Get candidates uploaded by a specific user
  getUserCandidates: (
    userId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<{
    candidates: Array<{
      resumeId: string
      fileName: string
      candidateName?: string
      candidateEmail?: string
      status: string
      jobId?: string
      jobTitle?: string
      uploadedAt: string
    }>
    total: number
  }> => {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    const query = searchParams.toString()
    return fetchAPI(`/admin/users/${userId}/candidates${query ? `?${query}` : ''}`)
  }
}

// ============================================================================
// Debug API (for development)
// ============================================================================

export const debugAPI = {
  // Check job ownership - helps identify why jobs aren't showing
  getJobOwnership: (): Promise<{
    currentUserId: string
    currentUserEmail: string
    currentUserRole: string
    jobsInDb: Array<{
      id: string
      title: string
      recruiterId: string | null
      status: string
    }>
    matchingJobs: number
    orphanJobs: number
    otherUserJobs: number
  }> => fetchAPI('/debug/job-ownership'),

  // Claim all jobs for current user (development only)
  claimAllJobs: (): Promise<{ success: boolean; claimed: number }> =>
    fetchAPI('/debug/claim-all-jobs', { method: 'POST' })
}

// ============================================================================
// Verix Types
// ============================================================================

export interface VerixConversationSummary {
  id: string
  candidateEmail: string
  candidateName?: string
  status: string
  issueCount: number
  questionCount: number
  trustScore?: number
  skillsScore?: number
  createdAt: string
  respondedAt?: string
}

export interface VerixConversationsResponse {
  conversations: VerixConversationSummary[]
  total: number
  statusBreakdown: Record<string, number>
}

export interface VerixQuestionResponse {
  id: string
  text: string
  type: string
  skill?: string
  required: boolean
  weight: number
  position: number
  response?: {
    id: string
    answer: string
    responseTimeSeconds?: number
    aiDetectionScore?: number
    aiDetectionResult?: {
      score: number
      indicators: string[]
      verdict: 'human' | 'ai_assisted' | 'ai_generated'
    }
    qualityScore?: number
    qualityBreakdown?: {
      depth: number
      specificity: number
      relevance: number
      technical: number
      overall: number
    }
  }
}

export interface VerixEventItem {
  id: string
  eventType: string
  data?: Record<string, unknown>
  createdAt: string
}

export interface VerixConversationDetail {
  id: string
  resumeId: string
  jobId?: string
  candidateEmail: string
  candidateName?: string
  status: string
  issues: Array<{
    type: string
    severity: string
    detail: string
    value?: number
  }>
  trustScore?: number
  skillsScore?: number
  tokenExpiresAt: string
  emailSentAt?: string
  respondedAt?: string
  reanalyzedAt?: string
  createdAt: string
  questions: VerixQuestionResponse[]
  events: VerixEventItem[]
}

export interface VerixPublicView {
  conversationId: string
  candidateName?: string
  jobTitle?: string
  questions: Array<{
    id: string
    text: string
    type: string
    required: boolean
    position: number
  }>
  expiresAt: string
  status: string
}

// ============================================================================
// Verix Recruiter API (Authenticated)
// ============================================================================

export const verixRecruiterAPI = {
  getConversations: (jobId: string): Promise<VerixConversationsResponse> =>
    fetchAPI(`/jobs/${jobId}/verix/conversations`),

  getConversationDetail: (conversationId: string): Promise<VerixConversationDetail> =>
    fetchAPI(`/verix/conversations/${conversationId}`),

  retryConversation: (conversationId: string): Promise<{ success: boolean; message: string }> =>
    fetchAPI(`/verix/conversations/${conversationId}/retry`, { method: 'POST' }),
}

// ============================================================================
// Verix Public API (No Auth)
// ============================================================================

async function fetchPublicAPI<T> (
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>)
    }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `API Error: ${res.status}`)
  }

  return res.json()
}

export const verixPublicAPI = {
  getQuestions: (token: string): Promise<VerixPublicView> =>
    fetchPublicAPI(`/verix/${token}`),

  submitAnswers: (
    token: string,
    answers: Array<{ questionId: string; answer: string; responseTimeSeconds?: number }>
  ): Promise<{ success: boolean; message: string }> =>
    fetchPublicAPI(`/verix/${token}/submit`, {
      method: 'POST',
      body: JSON.stringify({ token, answers })
    }),
}

// ============================================================================
// Application Form Types
// ============================================================================

export interface ApplicationFormSettings {
  requireEmail?: boolean
  requirePhone?: boolean
  requireName?: boolean
  allowAnonymous?: boolean
  customMessage?: string
}

export interface CreateApplicationFormRequest {
  jobId: string
  questions?: Array<{
    question: string
    weight: 'critical' | 'important' | 'nice_to_have'
  }>
  formSettings?: ApplicationFormSettings
}

export interface ApplicationFormResponse {
  hasForm: boolean
  formLink?: string
  questions?: Array<{
    question: string
    weight: 'critical' | 'important' | 'nice_to_have'
  }>
  formSettings?: ApplicationFormSettings
}

export interface PublicApplicationForm {
  jobId: string
  jobTitle: string
  company?: string
  description: string
  validUntil?: string
  isExpired: boolean
  customMessage?: string
  questions: Array<{
    question: string
    weight: 'critical' | 'important' | 'nice_to_have'
    required?: boolean
  }>
  requireEmail: boolean
  requirePhone: boolean
  requireName: boolean
}

export interface SubmitApplicationRequest {
  token: string
  email: string
  fullName?: string
  phone?: string
  questionResponses: Array<{
    question: string
    answer: string
    weight?: 'critical' | 'important' | 'nice_to_have'
  }>
}

// ============================================================================
// Application Form Recruiter API (Authenticated)
// ============================================================================

export const applicationFormAPI = {
  // Create or update application form for a job
  createForm: (
    data: CreateApplicationFormRequest
  ): Promise<{ success: boolean; formLink: string; token: string }> =>
    fetchAPI(`/jobs/${data.jobId}/application-form`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Get application form settings for a job
  getForm: (jobId: string): Promise<ApplicationFormResponse> =>
    fetchAPI(`/jobs/${jobId}/application-form`),

  // Generate questions using AI
  generateQuestions: (
    jobDescription: string
  ): Promise<{
    questions: Array<{
      question: string
      weight: 'critical' | 'important' | 'nice_to_have'
      reasoning: string
    }>
    tokensUsed: number
  }> =>
    fetchAPI('/jobs/generate-questions', {
      method: 'POST',
      body: JSON.stringify({ jobDescription })
    })
}

// ============================================================================
// Application Form Public API (No Auth)
// ============================================================================

export const applicationPublicAPI = {
  // Get public application form by token
  getForm: (token: string): Promise<PublicApplicationForm> =>
    fetchPublicAPI(`/apply/${token}`),

  // Submit application - Step 1: Send responses and get OTP
  submitApplication: (
    data: SubmitApplicationRequest
  ): Promise<{ submissionId: string; emailSent: boolean; message: string }> =>
    fetchPublicAPI(`/apply/${data.token}/submit`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Verify email with OTP - Step 2: Get upload URL for resume
  verifyEmail: (
    submissionId: string,
    otp: string
  ): Promise<{
    verified: boolean
    uploadUrl?: string
    resumeId?: string
    fileKey?: string
  }> =>
    fetchPublicAPI('/apply/verify-email', {
      method: 'POST',
      body: JSON.stringify({ submissionId, otp })
    }),

  // Confirm resume upload - Step 3: Start processing
  confirmUpload: (
    submissionId: string,
    resumeId: string,
    fileName: string,
    fileSize: number
  ): Promise<{ success: boolean; message: string }> =>
    fetchPublicAPI('/apply/confirm-upload', {
      method: 'POST',
      body: JSON.stringify({ submissionId, resumeId, fileName, fileSize })
    })
}

// ============================================================================
// File Upload Helper
// ============================================================================

export async function uploadFileToS3 (
  uploadUrl: string,
  file: File
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })

  if (!res.ok) {
    throw new Error('Failed to upload file to S3')
  }
}
