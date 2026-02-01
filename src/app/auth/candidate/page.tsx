import { CandidateLogin } from "@/components/auth/candidate-login";

export default function CandidateAuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <CandidateLogin />
    </div>
  );
}
