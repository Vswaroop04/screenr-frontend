import { Suspense } from "react";
import { RecruiterLogin } from "@/components/auth/recruiter-login";
import { Loader2 } from "lucide-react";

function LoginFallback() {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function RecruiterLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Suspense fallback={<LoginFallback />}>
        <RecruiterLogin />
      </Suspense>
    </div>
  );
}
