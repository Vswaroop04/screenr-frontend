"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { RecruiterLayout } from "@/components/layout/recruiter-layout";
import { CandidateTableView } from "@/components/recruiter/candidate-table-view";

export default function CandidatesPage() {
  return (
    <ProtectedRoute requiredRole="recruiter">
      <RecruiterLayout>
        <CandidateTableView />
      </RecruiterLayout>
    </ProtectedRoute>
  );
}
