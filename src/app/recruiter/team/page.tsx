"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { RecruiterLayout } from "@/components/layout/recruiter-layout";
import { TeamManagement } from "@/components/recruiter/team-management";

export default function TeamPage() {
  return (
    <ProtectedRoute requiredRole="recruiter">
      <RecruiterLayout>
        <TeamManagement />
      </RecruiterLayout>
    </ProtectedRoute>
  );
}
