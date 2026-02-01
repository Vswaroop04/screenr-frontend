"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { RecruiterLayout } from "@/components/layout/recruiter-layout";
import { RecruiterSettings } from "@/components/recruiter/recruiter-settings";

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRole="recruiter">
      <RecruiterLayout>
        <RecruiterSettings />
      </RecruiterLayout>
    </ProtectedRoute>
  );
}
