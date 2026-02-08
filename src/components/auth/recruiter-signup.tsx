"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recruiterSignup, sendOtp, verifyOtp } from "@/lib/auth-api";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { Loader2, Building2, User, Mail, Phone, Briefcase, Globe, Factory } from "lucide-react";
import Link from "next/link";
import { OtpInput } from "@/components/ui/otp-input";
import { ErrorText } from "@/components/ui/error-text";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { validateEmail, validateRequired, validateURL, validatePhone } from "@/lib/validation";

const INDUSTRIES = [
  "technology",
  "finance",
  "healthcare",
  "education",
  "retail",
  "manufacturing",
  "consulting",
  "other",
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export function RecruiterSignup() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [step, setStep] = useState<"details" | "otp">("details");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    companyName: "",
    companyWebsite: "",
    industry: "",
    companySize: "",
    jobTitle: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    fullName: "",
    companyName: "",
    companyWebsite: "",
    industry: "",
    phoneNumber: "",
  });

  const [otp, setOtp] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "email":
        error = validateEmail(value) || "";
        break;
      case "fullName":
        error = validateRequired(value, "Full name") || "";
        break;
      case "companyName":
        error = validateRequired(value, "Company name") || "";
        break;
      case "companyWebsite":
        error = validateURL(value) || "";
        break;
      case "phoneNumber":
        error = validatePhone(value) || "";
        break;
      case "industry":
        error = validateRequired(value, "Industry") || "";
        break;
    }

    setErrors({
      ...errors,
      [name]: error,
    });

    return error === "";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    validateField(e.target.name, e.target.value);
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: validateEmail(formData.email) || "",
      fullName: validateRequired(formData.fullName, "Full name") || "",
      companyName: validateRequired(formData.companyName, "Company name") || "",
      companyWebsite: validateURL(formData.companyWebsite) || "",
      phoneNumber: validatePhone(formData.phoneNumber) || "",
      industry: validateRequired(formData.industry, "Industry") || "",
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const result = await recruiterSignup(formData);

      if (result.success) {
        toast.success(result.message);
        const otpResult = await sendOtp({
          email: formData.email,
          type: "login",
          role: "recruiter",
        });

        if (otpResult.success) {
          toast.success("OTP sent to your email");
          setStep("otp");
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await verifyOtp({
        email: formData.email,
        otp,
        type: "login",
      });

      if (result.success && result.token && result.user) {
        setAuth(result.user, result.token);
        toast.success("Account verified successfully!");
        router.push("/recruiter");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Organization Sign Up</h1>
        <p className="text-muted-foreground">
          {step === "details"
            ? "Create your organization account to start hiring verified talent"
            : "Enter the verification code sent to your email"}
        </p>
        <ProgressSteps
          steps={[
            { label: "Details", status: step === "details" ? "current" : "completed" },
            { label: "Verification", status: step === "otp" ? "current" : "upcoming" },
          ]}
          className="pt-4"
        />
      </div>

      {step === "details" ? (
        <form onSubmit={handleSignup} className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  className="pl-10"
                  aria-invalid={!!errors.fullName}
                />
              </div>
              {errors.fullName && <ErrorText>{errors.fullName}</ErrorText>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  className="pl-10"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <ErrorText>{errors.email}</ErrorText>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="pl-10"
                  aria-invalid={!!errors.phoneNumber}
                />
              </div>
              {errors.phoneNumber && <ErrorText>{errors.phoneNumber}</ErrorText>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  placeholder="Talent Acquisition Manager"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Company Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="Acme Inc."
                    value={formData.companyName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className="pl-10"
                    aria-invalid={!!errors.companyName}
                  />
                </div>
                {errors.companyName && <ErrorText>{errors.companyName}</ErrorText>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Company Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyWebsite"
                    name="companyWebsite"
                    type="url"
                    placeholder="https://company.com"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className="pl-10"
                    aria-invalid={!!errors.companyWebsite}
                  />
                </div>
                {errors.companyWebsite && <ErrorText>{errors.companyWebsite}</ErrorText>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <div className="relative">
                  <Factory className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-input hover:bg-input/80 pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring transition-[color,box-shadow]"
                    aria-invalid={!!errors.industry}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry.charAt(0).toUpperCase() + industry.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.industry && <ErrorText>{errors.industry}</ErrorText>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} employees
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <TypingIndicator text="Creating your account" />
            ) : (
              "Create Organization Account"
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => router.push("/auth/recruiter/login")}
            >
              Login
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
              "Verify & Complete Signup"
            )}
          </Button>
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
