// src/lib/screening-api.ts
// API client for resume screening endpoints

import { env } from "./env";

const API_BASE = env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

// ============================================================================
// Types
// ============================================================================

export interface ScoringWeights {
  skills: number;
  experience: number;
  trust: number;
  education: number;
  projects: number;
}

export interface CustomPreferences {
  questions: Array<{
    question: string;
    weight: "critical" | "important" | "nice_to_have";
  }>;
  preferences: string[];
}

export interface SkillMatchDetail {
  required: string[];
  matched: Array<{
    skill: string;
    confidence: number;
    source?: string[];
  }>;
  missing: string[];
  partial: Array<{
    skill: string;
    confidence: number;
  }>;
  matchPercentage: number;
}

export interface ScoreExplanation {
  whyRankedHigh: string[];
  whyRankedLower: string[];
}

export interface CustomAnswer {
  question: string;
  answer: string;
  satisfied: boolean;
}

export interface Job {
  id: string;
  title: string;
  company?: string;
  location?: string;
  description: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  minExperienceYears?: number;
  maxExperienceYears?: number;
  scoringWeights?: ScoringWeights;
  customPreferences?: CustomPreferences;
  status: string;
  resumeCount: number;
  processedCount: number;
  createdAt: string;
}

export interface CreateJobRequest {
  title: string;
  company?: string;
  location?: string;
  description: string;
  scoringWeights?: ScoringWeights;
  customPreferences?: CustomPreferences;
}

export interface UploadUrlResponse {
  resumeId: string;
  uploadUrl: string;
  fileKey: string;
}

export interface Candidate {
  resumeId: string;
  analysisId?: string;
  fileName: string;
  candidateName?: string;
  candidateEmail?: string;
  overallScore?: number;
  skillsScore?: number;
  experienceScore?: number;
  educationScore?: number;
  projectScore?: number;
  trustScore?: number;
  trustFlags?: string[];
  rankPosition?: number;
  percentile?: number;
  recommendation?: string;
  strengths?: string[];
  concerns?: string[];
  explanation?: ScoreExplanation;
  customAnswers?: CustomAnswer[];
  skillMatch?: SkillMatchDetail;
  parsedLocation?: { city?: string; state?: string; country?: string };
  predictedRoles?: string[];
  totalYearsExperience?: number;
  status: string;
  processedAt?: string;
  // Shortlisting
  isShortlisted?: boolean;
  groupName?: string;
  shortlistNotes?: string;
}

export interface JobCandidatesResponse {
  jobId: string;
  jobTitle: string;
  totalCandidates: number;
  processedCandidates: number;
  candidates: Candidate[];
}

export interface QuickAnalyzeRequest {
  resumeText: string;
  jobDescription: string;
  isBase64Pdf?: boolean;
}

export interface QuickAnalyzeResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  summary: string;
  skillsMatched?: string[];
  skillsMissing?: string[];
  predictedRoles?: Array<{ role: string; confidence: number; reasoning: string }>;
  courseRecommendations?: Array<{ title: string; platform: string; skill: string; url?: string }>;
  resumeTips?: Array<{ category: string; tip: string; priority: string }>;
}

export interface ResumeStatus {
  resumeId: string;
  status: string;
  errorMessage?: string;
  parsedData?: {
    name?: string;
    email?: string;
    skills?: string[];
    totalYearsExperience?: number;
  };
}

export interface CandidateAnalysisItem {
  analysisId: string;
  jobTitle?: string;
  jobDescription?: string;
  overallScore?: number;
  skillsScore?: number;
  experienceScore?: number;
  educationScore?: number;
  projectScore?: number;
  trustScore?: number;
  recommendation?: string;
  strengths?: string[];
  concerns?: string[];
  status: string;
  createdAt: string;
}

export interface CandidateResumeItem {
  resumeId: string;
  fileName: string;
  status: string;
  candidateName?: string;
  candidateEmail?: string;
  skills?: string[];
  totalYearsExperience?: number;
  location?: { city?: string; state?: string; country?: string };
  createdAt: string;
  updatedAt?: string;
  errorMessage?: string;
  analyses: CandidateAnalysisItem[];
}

export interface CandidateMyResumesResponse {
  resumes: CandidateResumeItem[];
  totalResumes: number;
}

export interface CandidateProfileResponse {
  userId: string;
  email: string;
  fullName?: string;
  totalResumes: number;
  totalAnalyses: number;
  averageScore?: number;
  topSkills?: string[];
  lastActivity?: string;
}

export interface AnalysisResult {
  analysisId: string;
  resumeId: string;
  status: string;
  result?: {
    overallScore: number;
    skillsScore: number;
    experienceScore: number;
    educationScore: number;
    projectScore?: number;
    trustScore?: number;
    strengths: string[];
    concerns: string[];
    suggestions: string[];
    summary: string;
    recommendation: string;
    skillsMatched: Array<{
      skill: string;
      status: string;
      level?: string;
    }>;
    skillsMissing: string[];
    skillMatch?: SkillMatchDetail;
    explanation?: ScoreExplanation;
    customAnswers?: CustomAnswer[];
    predictedRoles?: Array<{ role: string; confidence: number; reasoning: string }>;
    courseRecommendations?: Array<{ title: string; platform: string; skill: string; url?: string }>;
    resumeTips?: Array<{ category: string; tip: string; priority: string }>;
  };
  verifications?: {
    github?: {
      verified: boolean;
      username?: string;
      topLanguages?: string[];
      publicRepos?: number;
    };
    linkedin?: {
      accessible: boolean;
    };
  };
}

// ============================================================================
// API Functions
// ============================================================================

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    }
  } catch {
    // ignore
  }
  return null;
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `API Error: ${res.status}`);
  }

  return res.json();
}

// ============================================================================
// Recruiter API
// ============================================================================

export const recruiterAPI = {
  // Create a new job
  createJob: (data: CreateJobRequest): Promise<Job> =>
    fetchAPI("/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Get all jobs
  listJobs: (): Promise<{ jobs: Job[] }> => fetchAPI("/jobs"),

  // Get single job
  getJob: (jobId: string): Promise<Job> => fetchAPI(`/jobs/${jobId}`),

  // Update job preferences (scoring weights + custom preferences)
  updateJobPreferences: (
    jobId: string,
    data: { scoringWeights?: ScoringWeights; customPreferences?: CustomPreferences }
  ): Promise<Job> =>
    fetchAPI(`/jobs/${jobId}/preferences`, {
      method: "PUT",
      body: JSON.stringify({ jobId, ...data }),
    }),

  // Re-trigger ranking computation
  recomputeRanking: (jobId: string): Promise<{ success: boolean; message: string }> =>
    fetchAPI(`/jobs/${jobId}/rerank`, {
      method: "POST",
    }),

  // Get upload URL for resume
  getResumeUploadUrl: (
    jobId: string,
    fileName: string,
    mimeType: string
  ): Promise<UploadUrlResponse> =>
    fetchAPI(`/jobs/${jobId}/resumes/upload-url`, {
      method: "POST",
      body: JSON.stringify({ jobId, fileName, mimeType }),
    }),

  // Confirm resume upload
  confirmUpload: (
    resumeId: string,
    fileName: string,
    fileSize: number,
    mimeType: string
  ): Promise<{ success: boolean; resumeId: string }> =>
    fetchAPI(`/resumes/${resumeId}/confirm`, {
      method: "POST",
      body: JSON.stringify({ resumeId, fileName, fileSize, mimeType }),
    }),

  // Trigger analysis for all resumes in a job
  analyzeJobResumes: (jobId: string): Promise<{ queued: number }> =>
    fetchAPI(`/jobs/${jobId}/analyze`, {
      method: "POST",
    }),

  // Get ranked candidates for a job
  getJobCandidates: (jobId: string): Promise<JobCandidatesResponse> =>
    fetchAPI(`/jobs/${jobId}/candidates`),

  // Get presigned download URL for a resume PDF
  getResumeDownloadUrl: (resumeId: string): Promise<{ downloadUrl: string }> =>
    fetchAPI(`/resumes/${resumeId}/download-url`),

  // Reprocess a failed resume
  reprocessResume: (resumeId: string): Promise<{ success: boolean; message: string }> =>
    fetchAPI(`/resumes/${resumeId}/reprocess`, { method: "POST" }),

  // Toggle shortlist for a candidate
  toggleShortlist: (
    jobId: string,
    resumeId: string,
    isShortlisted: boolean
  ): Promise<{ success: boolean; isShortlisted: boolean }> =>
    fetchAPI(`/jobs/${jobId}/candidates/${resumeId}/shortlist`, {
      method: "POST",
      body: JSON.stringify({ jobId, resumeId, isShortlisted }),
    }),

  // Bulk shortlist candidates
  bulkShortlist: (
    jobId: string,
    resumeIds: string[],
    isShortlisted: boolean
  ): Promise<{ success: boolean; updated: number }> =>
    fetchAPI(`/jobs/${jobId}/candidates/bulk-shortlist`, {
      method: "POST",
      body: JSON.stringify({ jobId, resumeIds, isShortlisted }),
    }),

  // Assign candidates to a group
  assignGroup: (
    jobId: string,
    resumeIds: string[],
    groupName: string
  ): Promise<{ success: boolean; updated: number }> =>
    fetchAPI(`/jobs/${jobId}/candidates/assign-group`, {
      method: "POST",
      body: JSON.stringify({ jobId, resumeIds, groupName }),
    }),

  // Remove candidates from a group
  removeFromGroup: (
    jobId: string,
    resumeIds: string[]
  ): Promise<{ success: boolean; updated: number }> =>
    fetchAPI(`/jobs/${jobId}/candidates/remove-group`, {
      method: "POST",
      body: JSON.stringify({ jobId, resumeIds }),
    }),

  // Get all groups for a job
  getJobGroups: (jobId: string): Promise<{ groups: Array<{ name: string; count: number }> }> =>
    fetchAPI(`/jobs/${jobId}/groups`),
};

// ============================================================================
// Candidate API
// ============================================================================

export const candidateAPI = {
  // Quick analyze (paste resume + JD)
  quickAnalyze: (data: QuickAnalyzeRequest): Promise<QuickAnalyzeResponse> =>
    fetchAPI("/analyze/quick", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Get upload URL for candidate resume
  getUploadUrl: (
    fileName: string,
    mimeType: string
  ): Promise<UploadUrlResponse> =>
    fetchAPI("/analyze/upload-url", {
      method: "POST",
      body: JSON.stringify({ fileName, mimeType }),
    }),

  // Confirm upload
  confirmUpload: (
    resumeId: string,
    fileName: string,
    fileSize: number
  ): Promise<{ resumeId: string; status: string }> =>
    fetchAPI("/analyze/confirm", {
      method: "POST",
      body: JSON.stringify({ resumeId, fileName, fileSize }),
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
      method: "POST",
      body: JSON.stringify({ resumeId, jobDescription }),
    }),

  // Get analysis result
  getAnalysisResult: (analysisId: string): Promise<AnalysisResult> =>
    fetchAPI(`/analyses/${analysisId}`),

  // Dashboard: Get all my resumes with analyses
  getMyResumes: (): Promise<CandidateMyResumesResponse> =>
    fetchAPI("/candidate/my-resumes"),

  // Dashboard: Get my profile summary
  getMyProfile: (): Promise<CandidateProfileResponse> =>
    fetchAPI("/candidate/profile"),

  // Dashboard: Get download URL for my resume
  getMyResumeDownloadUrl: (resumeId: string): Promise<{ downloadUrl: string }> =>
    fetchAPI(`/candidate/resumes/${resumeId}/download`),
};

// ============================================================================
// Settings API
// ============================================================================

export const settingsAPI = {
  getCompany: (token: string): Promise<{
    success: boolean;
    company?: {
      id: string;
      name: string;
      website: string | null;
      industry: string | null;
      companySize: string | null;
      description: string | null;
      logo: string | null;
      linkedinUrl: string | null;
    };
    message?: string;
  }> =>
    fetchAPI("/auth/company/get", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  updateCompany: (
    token: string,
    data: {
      name?: string;
      website?: string;
      industry?: string;
      companySize?: string;
    }
  ): Promise<{ success: boolean; message: string }> =>
    fetchAPI("/auth/company/update", {
      method: "POST",
      body: JSON.stringify({ token, ...data }),
    }),

  deleteAccount: (token: string): Promise<{ success: boolean; message: string }> =>
    fetchAPI("/auth/account/delete", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
};

// ============================================================================
// Team API
// ============================================================================

export const teamAPI = {
  inviteTeamMember: (
    email: string,
    role: "admin" | "member",
    inviterId: string
  ): Promise<{ invitationId: string; token: string; expiresAt: string }> =>
    fetchAPI("/team/invite", {
      method: "POST",
      body: JSON.stringify({ email, role, inviterId }),
    }),

  getTeamMembers: (
    recruiterId: string
  ): Promise<{
    members: Array<{
      id: string;
      email: string;
      fullName?: string;
      role: "admin" | "member";
      status: "active" | "pending";
      joinedAt?: string;
      invitationId?: string;
    }>;
    isAdmin: boolean;
  }> => fetchAPI(`/team/${recruiterId}/members`),

  removeTeamMember: (
    memberId: string,
    recruiterId: string
  ): Promise<{ success: boolean }> =>
    fetchAPI(`/team/members/${memberId}`, {
      method: "DELETE",
      body: JSON.stringify({ memberId, recruiterId }),
    }),

  resendInvitation: (invitationId: string): Promise<{ success: boolean }> =>
    fetchAPI(`/team/invitations/${invitationId}/resend`, {
      method: "POST",
    }),

  acceptInvitation: (
    token: string,
    userId: string
  ): Promise<{ success: boolean; recruiterId: string }> =>
    fetchAPI("/team/accept", {
      method: "POST",
      body: JSON.stringify({ token, userId }),
    }),
};

// ============================================================================
// File Upload Helper
// ============================================================================

export async function uploadFileToS3(
  uploadUrl: string,
  file: File
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to upload file to S3");
  }
}
