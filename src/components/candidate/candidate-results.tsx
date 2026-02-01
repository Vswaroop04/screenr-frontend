"use client";

import { ArrowLeft, FileText, CheckCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCircle } from "@/components/screening/score-display";
import { ScoreRadarChart } from "@/components/charts/score-radar-chart";
import { PredictedRoles } from "@/components/candidate/predicted-roles";
import { CourseRecommendations } from "@/components/candidate/course-recommendations";
import { ResumeTips } from "@/components/candidate/resume-tips";
import { VideoRecommendations } from "@/components/candidate/video-recommendations";
import { getRecommendedVideos } from "@/lib/video-recommendations";
import type { QuickAnalyzeResponse } from "@/lib/screening-api";

interface CandidateResultsProps {
  result: QuickAnalyzeResponse;
  onBack: () => void;
}

export function CandidateResults({ result, onBack }: CandidateResultsProps) {
  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Excellent match! You're a strong candidate.";
    if (score >= 60) return "Good match. Some areas could be improved.";
    if (score >= 40) return "Moderate match. Consider the suggestions below.";
    return "Low match. Review the job requirements carefully.";
  };

  // Derive scores for radar chart (quick analysis only has overall score)
  const radarScores = {
    skillsScore: result.score,
    experienceScore: Math.min(100, result.score + 5),
    educationScore: Math.min(100, result.score - 5),
    projectScore: Math.min(100, result.score - 10),
    trustScore: 50, // Not available in quick analysis
  };

  // Get video recommendations based on predicted roles and skill gaps
  const predictedRoleNames = result.predictedRoles?.map((r) => r.role) ?? [];
  const skillGaps = result.skillsMissing ?? [];
  const videos = getRecommendedVideos(predictedRoleNames, skillGaps);

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Check Another
      </Button>

      {/* Score + Radar */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <ScoreCircle score={result.score} size={140} label="Match Score" />
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-1">
                  {result.score >= 70
                    ? "Great Match!"
                    : result.score >= 50
                      ? "Good Potential"
                      : "Needs Work"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {getScoreMessage(result.score)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreRadarChart scores={radarScores} />
          </CardContent>
        </Card>
      </div>

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

      {/* Skills Analysis */}
      {(result.skillsMatched || result.skillsMissing) && (
        <Card>
          <CardHeader>
            <CardTitle>Skills Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.skillsMatched && result.skillsMatched.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 text-green-600">Skills You Have</p>
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
                <p className="text-sm font-medium mb-2 text-orange-600">Skills to Add/Highlight</p>
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

      {/* Predicted Roles */}
      {result.predictedRoles && result.predictedRoles.length > 0 && (
        <PredictedRoles roles={result.predictedRoles} />
      )}

      {/* Course Recommendations */}
      {result.courseRecommendations && result.courseRecommendations.length > 0 && (
        <CourseRecommendations courses={result.courseRecommendations} />
      )}

      {/* Resume Tips */}
      {result.resumeTips && result.resumeTips.length > 0 && (
        <ResumeTips tips={result.resumeTips} />
      )}

      {/* Video Recommendations */}
      {videos.length > 0 && <VideoRecommendations videos={videos} />}
    </div>
  );
}
