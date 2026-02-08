"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtp, verifyOtp } from "@/lib/auth-api";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { Loader2, Mail, User } from "lucide-react";
import Link from "next/link";
import { OtpInput } from "@/components/ui/otp-input";
import { ErrorText } from "@/components/ui/error-text";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { validateEmail } from "@/lib/validation";

export function RecruiterLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const setAuth = useAuthStore((state) => state.setAuth);

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email before sending OTP
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    setLoading(true);

    try {
      const result = await sendOtp({
        email,
        type: "login",
        role: "recruiter",
      });

      if (result.success) {
        toast.success(result.message);
        setStep("otp");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await verifyOtp({
        email,
        otp,
        type: "login",
      });

      if (result.success && result.token && result.user) {
        setAuth(result.user, result.token);
        toast.success("Login successful!");
        router.push(returnUrl || "/recruiter");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Organization Login</h1>
        <p className="text-muted-foreground">
          {step === "email"
            ? "Enter your email to receive a verification code"
            : "Enter the 6-digit code sent to your email"}
        </p>
        <ProgressSteps
          steps={[
            { label: "Email", status: step === "email" ? "current" : "completed" },
            { label: "Verification", status: step === "otp" ? "current" : "upcoming" },
          ]}
          className="pt-4"
        />
      </div>

      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onBlur={(e) => {
                  const error = validateEmail(e.target.value);
                  setEmailError(error || "");
                }}
                required
                className="pl-10"
                aria-invalid={!!emailError}
              />
            </div>
            {emailError && <ErrorText>{emailError}</ErrorText>}
          </div>

          <Button type="submit" className="w-full" disabled={loading || !email || !!emailError}>
            {loading ? (
              <TypingIndicator text="Sending code" />
            ) : (
              "Continue with Email"
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => router.push("/auth/recruiter/signup")}
            >
              Sign up
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          <div className="space-y-3">
            <Label>Verification Code</Label>
            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Login"
            )}
          </Button>

          <div className="text-center text-sm">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto"
              onClick={() => setStep("email")}
              disabled={loading}
            >
              ← Back to email
            </Button>
          </div>
        </form>
      )}

      {/* Switch to Candidate */}
      <div className="pt-6 border-t">
        <div className="text-center text-sm text-muted-foreground mb-3">
          Looking for a job?
        </div>
        <Link href="/auth/candidate">
          <Button variant="outline" className="w-full">
            <User className="mr-2 h-4 w-4" />
            Login as Candidate
          </Button>
        </Link>
      </div>
    </div>
  );
}
