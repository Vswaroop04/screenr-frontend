// src/lib/use-sse.ts
// Server-Sent Events hook for real-time status updates

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { screeningKeys } from "./screening-hooks";
import { env } from "./env";

const API_BASE = env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface SSEEvent {
  type: "resume_status" | "analysis_status" | "ranking_complete" | "connected" | "error";
  resumeId?: string;
  jobId?: string;
  status?: string;
  timestamp?: string;
  data?: Record<string, unknown>;
}

/**
 * Hook to subscribe to real-time job updates via SSE (recruiter flow)
 * Automatically invalidates React Query caches when events arrive
 */
export function useJobSSE(jobId: string | null) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleEvent = useCallback(
    (event: SSEEvent) => {
      if (!jobId) return;

      // Invalidate candidates list so the UI refreshes with new data
      queryClient.invalidateQueries({
        queryKey: screeningKeys.jobCandidates(jobId),
      });

      // Also invalidate the job itself (for processedCount updates)
      queryClient.invalidateQueries({
        queryKey: screeningKeys.job(jobId),
      });
    },
    [jobId, queryClient]
  );

  useEffect(() => {
    if (!jobId) return;

    const url = `${API_BASE}/jobs/${jobId}/events`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // Listen for specific event types
    eventSource.addEventListener("resume_status", (e) => {
      try {
        const data = JSON.parse(e.data) as SSEEvent;
        handleEvent(data);
      } catch {}
    });

    eventSource.addEventListener("analysis_status", (e) => {
      try {
        const data = JSON.parse(e.data) as SSEEvent;
        handleEvent(data);
      } catch {}
    });

    eventSource.addEventListener("ranking_complete", (e) => {
      try {
        const data = JSON.parse(e.data) as SSEEvent;
        handleEvent(data);
      } catch {}
    });

    // Generic message handler (for "connected" events)
    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as SSEEvent;
        if (data.type === "connected") {
          console.log("[SSE] Connected to job updates", { jobId });
        }
      } catch {}
    };

    eventSource.onerror = () => {
      // EventSource auto-reconnects, just log
      console.warn("[SSE] Connection error, will retry...");
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [jobId, handleEvent]);
}

/**
 * Hook to subscribe to real-time resume status updates via SSE (candidate flow)
 * Automatically invalidates React Query caches when events arrive
 */
export function useResumeSSE(
  resumeId: string | null,
  onStatusChange?: (status: string, data?: Record<string, unknown>) => void
) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!resumeId) return;

    const url = `${API_BASE}/resumes/${resumeId}/events`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    const handleSSEEvent = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as SSEEvent;

        // Invalidate resume status query
        queryClient.invalidateQueries({
          queryKey: screeningKeys.resumeStatus(resumeId),
        });

        // Notify callback
        if (onStatusChange && data.status) {
          onStatusChange(data.status, data.data);
        }

        // Close SSE on terminal states
        if (data.status === "analyzed" || data.status === "failed") {
          eventSource.close();
        }
      } catch {}
    };

    eventSource.addEventListener("resume_status", handleSSEEvent);
    eventSource.addEventListener("analysis_status", handleSSEEvent);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as SSEEvent;
        if (data.type === "connected") {
          console.log("[SSE] Connected to resume updates", { resumeId });
        }
      } catch {}
    };

    eventSource.onerror = () => {
      console.warn("[SSE] Connection error, will retry...");
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [resumeId, queryClient, onStatusChange]);
}
