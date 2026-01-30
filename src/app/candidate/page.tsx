"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Sparkles, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreCircle } from "@/components/screening/score-display";
import { FileUpload } from "@/components/screening/file-upload";
import { useQuickAnalyze, useUploadCandidateResume, useResumeStatus } from "@/lib/screening-hooks";
import Loader from "@/components/shared/loader";
import { toast } from "sonner";
import type { QuickAnalyzeResponse } from "@/lib/screening-api";

export default function CandidatePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<QuickAnalyzeResponse | null>(null);
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);

  const quickAnalyze = useQuickAnalyze();
  const uploadResume = useUploadCandidateResume();
  const { data: resumeStatus } = useResumeStatus(uploadedResumeId);

  const handleQuickAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.error("Please enter both resume and job description");
      return;
    }

    try {
      const response = await quickAnalyze.mutateAsync({
        resumeText,
        jobDescription,
      });
      setResult(response);
      toast.success("Analysis complete!");
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
      console.error(error);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      const { resumeId } = await uploadResume.mutateAsync(files[0]);
      setUploadedResumeId(resumeId);
      toast.success("Resume uploaded! Processing...");
    } catch (error) {
      toast.error("Failed to upload resume");
      console.error(error);
    }
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Excellent match! You're a strong candidate.";
    if (score >= 60) return "Good match. Some areas could be improved.";
    if (score >= 40) return "Moderate match. Consider the suggestions below.";
    return "Low match. Review the job requirements carefully.";
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold">Resume Match Checker</h1>
        <p className="text-muted-foreground mt-1">
          See how well your resume matches a job description and get improvement tips
        </p>
      </div>

      {result ? (
        /* Results View */
        <div className="space-y-6">
          <Button variant="outline" onClick={() => setResult(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Check Another
          </Button>

          {/* Score Card */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ScoreCircle score={result.score} size={140} label="Match Score" />
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">
                    {result.score >= 70 ? "Great Match!" : result.score >= 50 ? "Good Potential" : "Needs Work"}
                  </h2>
                  <p className="text-muted-foreground">{getScoreMessage(result.score)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{result.summary}</p>
            </CardContent>
          </Card>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card className="border-orange-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Lightbulb className="h-5 w-5" />
                  Suggestions to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.improvements.map((improvement, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Skills */}
          {(result.skillsMatched || result.skillsMissing) && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.skillsMatched && result.skillsMatched.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-green-600">
                      Skills You Have
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsMatched.map((skill, i) => (
                        <Badge key={i} variant="success">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {result.skillsMissing && result.skillsMissing.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-orange-600">
                      Skills to Add/Highlight
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsMissing.map((skill, i) => (
                        <Badge key={i} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Input View */
        <Tabs defaultValue="paste" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste">Paste Resume</TabsTrigger>
            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Resume</CardTitle>
                <CardDescription>
                  Paste your resume text below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your resume content here...

Example:
John Doe
Software Engineer

Experience:
- Senior Developer at TechCorp (2020-Present)
- Built scalable React applications
- Led team of 5 engineers

Skills: React, TypeScript, Node.js, AWS..."
                  className="min-h-[250px]"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Paste the job description you want to match against
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the job description here...

Example:
We are looking for a Senior Frontend Developer with:
- 5+ years of React experience
- Strong TypeScript skills
- Experience with cloud platforms (AWS/GCP)
- Team leadership experience..."
                  className="min-h-[200px]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full"
              onClick={handleQuickAnalyze}
              disabled={quickAnalyze.isPending || !resumeText.trim() || !jobDescription.trim()}
            >
              {quickAnalyze.isPending ? (
                <>
                  <Loader className="mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analyze My Resume
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
                <CardDescription>
                  Upload a PDF file for more accurate analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFilesSelected={handleFileUpload}
                  isUploading={uploadResume.isPending}
                  multiple={false}
                  maxFiles={1}
                />

                {uploadedResumeId && resumeStatus && (
                  <div className="mt-4 p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      {resumeStatus.status === "parsed" || resumeStatus.status === "analyzed" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : resumeStatus.status === "failed" ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Loader />
                      )}
                      <span className="font-medium">
                        Status: {resumeStatus.status}
                      </span>
                    </div>
                    {resumeStatus.parsedData?.name && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Detected: {resumeStatus.parsedData.name}
                        {resumeStatus.parsedData.skills && (
                          <> • {resumeStatus.parsedData.skills.length} skills found</>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {(resumeStatus?.status === "parsed" || resumeStatus?.status === "analyzed") && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                    <CardDescription>
                      Paste the job description you want to match against
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Paste the job description here..."
                      className="min-h-[200px]"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </CardContent>
                </Card>

                <Button
                  size="lg"
                  className="w-full"
                  disabled={!jobDescription.trim()}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Run Full Analysis
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
