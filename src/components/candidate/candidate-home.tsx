"use client";

import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Upload, FileText, BarChart3, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

const ONBOARDING_STEPS = [
  {
    id: "upload",
    title: "Upload Resume",
    description: "Upload your resume to get started with AI-powered analysis",
    icon: Upload,
    completed: false,
  },
  {
    id: "analysis",
    title: "AI Analysis",
    description: "Our AI will analyze your skills, experience, and qualifications",
    icon: FileText,
    completed: false,
  },
  {
    id: "results",
    title: "View Results",
    description: "See your verified skill scores and improvement recommendations",
    icon: BarChart3,
    completed: false,
  },
  {
    id: "apply",
    title: "Get Matched",
    description: "Get matched with jobs that fit your verified skills",
    icon: Trophy,
    completed: false,
  },
];

export function CandidateHome() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const completedSteps = ONBOARDING_STEPS.filter((step) => step.completed).length;
  const progressPercentage = (completedSteps / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">
              Welcome back, {user?.fullName || user?.email?.split("@")[0] || "Candidate"}! 👋
            </h1>
            <p className="text-xl text-muted-foreground">
              Let&apos;s get your profile verified and start matching with great opportunities
            </p>
          </div>

          <div className="bg-card border rounded-xl p-8 space-y-6 shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Your Progress</h2>
                <span className="text-sm font-medium text-muted-foreground">
                  {completedSteps} of {ONBOARDING_STEPS.length} completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            <div className="grid gap-4">
              {ONBOARDING_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.completed;
                const isCurrent = !isCompleted && ONBOARDING_STEPS.slice(0, index).every((s) => s.completed);

                return (
                  <div
                    key={step.id}
                    className={`
                      relative flex items-start gap-4 p-6 rounded-lg border transition-all duration-300
                      ${isCurrent ? "bg-primary/5 border-primary shadow-md scale-[1.02]" : "bg-card"}
                      ${isCompleted ? "opacity-75" : ""}
                    `}
                  >
                    <div
                      className={`
                      flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted ? "bg-green-500/10 text-green-500" : isCurrent ? "bg-primary/10 text-primary animate-pulse" : "bg-muted text-muted-foreground"}
                    `}
                    >
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                        {isCurrent && (
                          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Current Step
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>

                    {isCurrent && (
                      <Button onClick={() => router.push("/candidate")} className="flex-shrink-0">
                        Start Now
                      </Button>
                    )}

                    {isCompleted && (
                      <div className="flex-shrink-0">
                        <Circle className="w-6 h-6 text-green-500 fill-green-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Resume Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered insights on your resume and skill verification
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push("/candidate")}>
                Upload Resume
              </Button>
            </div>

            <div className="bg-card border rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Skill Scores</h3>
                <p className="text-sm text-muted-foreground">View your verified skill scores and rankings</p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                View Scores
              </Button>
            </div>

            <div className="bg-card border rounded-xl p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Job Matches</h3>
                <p className="text-sm text-muted-foreground">Find jobs that match your verified skills</p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Browse Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
