"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { CandidateHome } from "@/components/candidate/candidate-home";

export default function CandidateHomePage() {
  return (
    <ProtectedRoute requiredRole="candidate">
      <CandidateHome />
    </ProtectedRoute>
  );
}
