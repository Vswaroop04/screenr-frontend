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
  status: string;
  processedAt?: string;
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

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
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
