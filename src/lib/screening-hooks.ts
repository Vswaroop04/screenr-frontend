// src/lib/screening-hooks.ts
// React Query hooks for resume screening

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  recruiterAPI,
  candidateAPI,
  uploadFileToS3,
  type CreateJobRequest,
  type QuickAnalyzeRequest,
  type ScoringWeights,
  type CustomPreferences,
} from "./screening-api";

// ============================================================================
// Query Keys
// ============================================================================

export const screeningKeys = {
  jobs: ["jobs"] as const,
  job: (id: string) => ["jobs", id] as const,
  jobCandidates: (id: string) => ["jobs", id, "candidates"] as const,
  resumeStatus: (id: string) => ["resumes", id, "status"] as const,
  analysis: (id: string) => ["analyses", id] as const,
};

// ============================================================================
// Recruiter Hooks
// ============================================================================

export function useJobs() {
  return useQuery({
    queryKey: screeningKeys.jobs,
    queryFn: () => recruiterAPI.listJobs(),
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: screeningKeys.job(jobId),
    queryFn: () => recruiterAPI.getJob(jobId),
    enabled: !!jobId,
  });
}

export function useJobCandidates(jobId: string) {
  return useQuery({
    queryKey: screeningKeys.jobCandidates(jobId),
    queryFn: () => recruiterAPI.getJobCandidates(jobId),
    enabled: !!jobId,
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobRequest) => recruiterAPI.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: screeningKeys.jobs });
    },
  });
}

export function useUploadResumes(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const results = [];

      for (const file of files) {
        // Get presigned URL
        const { resumeId, uploadUrl } = await recruiterAPI.getResumeUploadUrl(
          jobId,
          file.name,
          file.type
        );

        // Upload to S3
        await uploadFileToS3(uploadUrl, file);

        // Confirm upload
        await recruiterAPI.confirmUpload(
          resumeId,
          file.name,
          file.size,
          file.type
        );

        results.push({ resumeId, fileName: file.name });
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: screeningKeys.job(jobId) });
      queryClient.invalidateQueries({
        queryKey: screeningKeys.jobCandidates(jobId),
      });
    },
  });
}

export function useAnalyzeJobResumes(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recruiterAPI.analyzeJobResumes(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: screeningKeys.jobCandidates(jobId),
      });
    },
  });
}

export function useUpdateJobPreferences(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { scoringWeights?: ScoringWeights; customPreferences?: CustomPreferences }) =>
      recruiterAPI.updateJobPreferences(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: screeningKeys.job(jobId) });
    },
  });
}

export function useRecomputeRanking(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recruiterAPI.recomputeRanking(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: screeningKeys.jobCandidates(jobId),
      });
    },
  });
}

// ============================================================================
// Candidate Hooks
// ============================================================================

export function useQuickAnalyze() {
  return useMutation({
    mutationFn: (data: QuickAnalyzeRequest) => candidateAPI.quickAnalyze(data),
  });
}

export function useResumeStatus(resumeId: string | null) {
  return useQuery({
    queryKey: screeningKeys.resumeStatus(resumeId || ""),
    queryFn: () => candidateAPI.getResumeStatus(resumeId!),
    enabled: !!resumeId,
    refetchInterval: (query) => {
      // Keep polling until parsed or failed
      const status = query.state.data?.status;
      if (status === "parsed" || status === "analyzed" || status === "failed") {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });
}

export function useAnalysisResult(analysisId: string | null) {
  return useQuery({
    queryKey: screeningKeys.analysis(analysisId || ""),
    queryFn: () => candidateAPI.getAnalysisResult(analysisId!),
    enabled: !!analysisId,
    refetchInterval: (query) => {
      // Keep polling until completed or failed
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
  });
}

export function useUploadCandidateResume() {
  return useMutation({
    mutationFn: async (file: File) => {
      // Get presigned URL
      const { resumeId, uploadUrl } = await candidateAPI.getUploadUrl(
        file.name,
        file.type
      );

      // Upload to S3
      await uploadFileToS3(uploadUrl, file);

      // Confirm upload
      await candidateAPI.confirmUpload(resumeId, file.name, file.size);

      return { resumeId, fileName: file.name };
    },
  });
}

export function useAnalyzeResume() {
  return useMutation({
    mutationFn: ({
      resumeId,
      jobDescription,
    }: {
      resumeId: string;
      jobDescription: string;
    }) => candidateAPI.analyzeResume(resumeId, jobDescription),
  });
}
