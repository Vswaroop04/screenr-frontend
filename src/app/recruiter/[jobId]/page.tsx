"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Upload, RefreshCw, Users, CheckCircle, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/screening/file-upload";
import { CandidateCard } from "@/components/screening/candidate-card";
import {
  useJob,
  useJobCandidates,
  useUploadResumes,
  useAnalyzeJobResumes,
  useUpdateJobPreferences,
  useRecomputeRanking,
} from "@/lib/screening-hooks";
import type { ScoringWeights, CustomPreferences } from "@/lib/screening-api";
import Loader from "@/components/shared/loader";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default function JobDetailPage({ params }: PageProps) {
  const { jobId } = use(params);
  const { data: job, isLoading: jobLoading } = useJob(jobId);
  const { data: candidatesData, isLoading: candidatesLoading } = useJobCandidates(jobId);
  const uploadResumes = useUploadResumes(jobId);
  const analyzeResumes = useAnalyzeJobResumes(jobId);
  const updatePreferences = useUpdateJobPreferences(jobId);
  const recomputeRanking = useRecomputeRanking(jobId);

  const [weights, setWeights] = useState<ScoringWeights>({
    skills: 0.4, experience: 0.25, trust: 0.2, education: 0.1, projects: 0.05,
  });
  const [questions, setQuestions] = useState<CustomPreferences["questions"]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionWeight, setNewQuestionWeight] = useState<"critical" | "important" | "nice_to_have">("important");
  const [newPreference, setNewPreference] = useState("");

  const handleUpload = async (files: File[]) => {
    try {
      const results = await uploadResumes.mutateAsync(files);
      toast.success(`Uploaded ${results.length} resume(s)`);
    } catch (error) {
      toast.error("Failed to upload resumes");
      console.error(error);
    }
  };

  const handleAnalyze = async () => {
    try {
      const result = await analyzeResumes.mutateAsync();
      toast.success(`Queued ${result.queued} resume(s) for analysis`);
    } catch (error) {
      toast.error("Failed to start analysis");
      console.error(error);
    }
  };

  if (jobLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Job not found</p>
      </div>
    );
  }

  const candidates = candidatesData?.candidates || [];
  const processedCount = candidates.filter((c) => c.overallScore !== undefined).length;
  const progress = candidates.length > 0 ? (processedCount / candidates.length) * 100 : 0;

  // Split candidates by recommendation
  const strongMatches = candidates.filter(
    (c) => c.recommendation === "strong_yes" || c.recommendation === "yes"
  );
  const maybeMatches = candidates.filter((c) => c.recommendation === "maybe");
  const weakMatches = candidates.filter(
    (c) => c.recommendation === "no" || c.recommendation === "strong_no"
  );
  const pending = candidates.filter((c) => c.overallScore === undefined);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/recruiter"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {job.company && (
                <span className="text-muted-foreground">{job.company}</span>
              )}
              {job.location && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{job.location}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await recomputeRanking.mutateAsync();
                  toast.success("Re-ranking queued");
                } catch { toast.error("Failed to re-rank"); }
              }}
              disabled={recomputeRanking.isPending || processedCount === 0}
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${recomputeRanking.isPending ? "animate-spin" : ""}`} />
              Re-rank
            </Button>
            <Button
              variant="outline"
              onClick={handleAnalyze}
              disabled={analyzeResumes.isPending || candidates.length === 0}
            >
              {analyzeResumes.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Analyze All
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{candidates.length}</p>
                <p className="text-sm text-muted-foreground">Total Resumes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{processedCount}</p>
                <p className="text-sm text-muted-foreground">Analyzed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="h-5">
                {strongMatches.length}
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">Strong Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {processedCount > 0
                    ? Math.round(
                        candidates
                          .filter((c) => c.trustScore !== undefined)
                          .reduce((sum, c) => sum + (c.trustScore || 0), 0) /
                          Math.max(1, candidates.filter((c) => c.trustScore !== undefined).length)
                      )
                    : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Avg Trust Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Required Skills */}
      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Required Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, i) => (
                <Badge key={i} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="candidates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="candidates">
            Candidates ({candidates.length})
          </TabsTrigger>
          <TabsTrigger value="upload">Upload Resumes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="jd">Job Description</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-6">
          {candidatesLoading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : candidates.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
                <p className="text-muted-foreground text-center">
                  Upload resumes to start screening candidates
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Strong Matches */}
              {strongMatches.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="success">Strong Matches</Badge>
                    <span className="text-muted-foreground font-normal">
                      ({strongMatches.length})
                    </span>
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {strongMatches.map((candidate, i) => (
                      <CandidateCard
                        key={candidate.resumeId}
                        candidate={candidate}
                        rank={i + 1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Maybe */}
              {maybeMatches.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="warning">Maybe</Badge>
                    <span className="text-muted-foreground font-normal">
                      ({maybeMatches.length})
                    </span>
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {maybeMatches.map((candidate) => (
                      <CandidateCard
                        key={candidate.resumeId}
                        candidate={candidate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Weak Matches */}
              {weakMatches.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="destructive">Not Recommended</Badge>
                    <span className="text-muted-foreground font-normal">
                      ({weakMatches.length})
                    </span>
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {weakMatches.map((candidate) => (
                      <CandidateCard
                        key={candidate.resumeId}
                        candidate={candidate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Pending */}
              {pending.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="outline">Pending Analysis</Badge>
                    <span className="text-muted-foreground font-normal">
                      ({pending.length})
                    </span>
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pending.map((candidate) => (
                      <CandidateCard
                        key={candidate.resumeId}
                        candidate={candidate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Resumes</CardTitle>
              <CardDescription>
                Upload PDF or DOC files. They will be automatically parsed and
                queued for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesSelected={handleUpload}
                isUploading={uploadResumes.isPending}
                maxFiles={100}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {/* Scoring Weights */}
          <Card>
            <CardHeader>
              <CardTitle>Scoring Weights</CardTitle>
              <CardDescription>
                Adjust how each dimension contributes to the overall score. Weights must sum to 100%.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeights({ skills: 0.4, experience: 0.25, trust: 0.2, education: 0.1, projects: 0.05 })}
                >
                  Default
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeights({ skills: 0.3, experience: 0.3, trust: 0.25, education: 0.05, projects: 0.1 })}
                >
                  Senior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeights({ skills: 0.45, experience: 0.1, trust: 0.15, education: 0.2, projects: 0.1 })}
                >
                  Junior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeights({ skills: 0.35, experience: 0.05, trust: 0.1, education: 0.35, projects: 0.15 })}
                >
                  Internship
                </Button>
              </div>
              {(["skills", "experience", "trust", "education", "projects"] as const).map((key) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="capitalize">{key}</Label>
                    <span className="text-sm text-muted-foreground">{Math.round(weights[key] * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(weights[key] * 100)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) / 100;
                      setWeights((prev) => ({ ...prev, [key]: val }));
                    }}
                    className="w-full"
                  />
                </div>
              ))}
              <p className={`text-sm ${Math.abs(Object.values(weights).reduce((a, b) => a + b, 0) - 1) > 0.01 ? "text-red-500" : "text-muted-foreground"}`}>
                Total: {Math.round(Object.values(weights).reduce((a, b) => a + b, 0) * 100)}%
                {Math.abs(Object.values(weights).reduce((a, b) => a + b, 0) - 1) > 0.01 && " (must equal 100%)"}
              </p>
            </CardContent>
          </Card>

          {/* Custom Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Screening Questions</CardTitle>
              <CardDescription>
                Add questions the AI will evaluate from resumes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Badge variant="outline" className="shrink-0">{q.weight}</Badge>
                  <span className="text-sm flex-1">{q.question}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuestions((prev) => prev.filter((_, j) => j !== i))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Does candidate have leadership experience?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={newQuestionWeight}
                  onChange={(e) => setNewQuestionWeight(e.target.value as any)}
                  className="border rounded px-2 text-sm"
                >
                  <option value="critical">Critical</option>
                  <option value="important">Important</option>
                  <option value="nice_to_have">Nice to Have</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newQuestion.trim()) {
                      setQuestions((prev) => [...prev, { question: newQuestion.trim(), weight: newQuestionWeight }]);
                      setNewQuestion("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Preferences</CardTitle>
              <CardDescription>
                Add preferences the AI should consider when analyzing resumes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {preferences.map((pref, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm flex-1">{pref}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreferences((prev) => prev.filter((_, j) => j !== i))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Prefer candidates with remote work experience"
                  value={newPreference}
                  onChange={(e) => setNewPreference(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newPreference.trim()) {
                      setPreferences((prev) => [...prev, newPreference.trim()]);
                      setNewPreference("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save & Re-rank */}
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                try {
                  await updatePreferences.mutateAsync({
                    scoringWeights: weights,
                    customPreferences: questions.length > 0 || preferences.length > 0
                      ? { questions, preferences }
                      : undefined,
                  });
                  toast.success("Preferences saved");
                } catch (error) {
                  toast.error("Failed to save preferences");
                }
              }}
              disabled={updatePreferences.isPending || Math.abs(Object.values(weights).reduce((a, b) => a + b, 0) - 1) > 0.01}
            >
              {updatePreferences.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
              Save Preferences
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await updatePreferences.mutateAsync({
                    scoringWeights: weights,
                    customPreferences: questions.length > 0 || preferences.length > 0
                      ? { questions, preferences }
                      : undefined,
                  });
                  await recomputeRanking.mutateAsync();
                  toast.success("Saved & re-ranking queued");
                } catch { toast.error("Failed"); }
              }}
              disabled={updatePreferences.isPending || recomputeRanking.isPending || processedCount === 0}
            >
              Save & Re-rank
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="jd">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {job.description}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
