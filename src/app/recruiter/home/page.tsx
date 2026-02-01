"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { RecruiterHome } from "@/components/recruiter/recruiter-home";

export default function RecruiterHomePage() {
  return (
    <ProtectedRoute requiredRole="recruiter">
      <RecruiterHome />
    </ProtectedRoute>
  );
}
