"use client";

import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Lightbulb,
  Shield,
  Target,
  Briefcase,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Award,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScoreCircle } from "@/components/screening/score-display";
import { ScoreRadarChart } from "@/components/charts/score-radar-chart";
import { PredictedRoles } from "@/components/candidate/predicted-roles";
import { CourseRecommendations } from "@/components/candidate/course-recommendations";
import { ResumeTips } from "@/components/candidate/resume-tips";
import { VideoRecommendations } from "@/components/candidate/video-recommendations";
import { getRecommendedVideos } from "@/lib/video-recommendations";
import { cn } from "@/lib/utils";
import type { QuickAnalyzeResponse } from "@/lib/screening-api";

interface CandidateResultsProps {
  result: QuickAnalyzeResponse;
  onBack: () => void;
}

// ============================================================================
// Helper components
// ============================================================================

function ConfidenceBadge({ level }: { level: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    high: { color: "text-green-700 dark:text-green-400", bg: "bg-green-100 dark:bg-green-500/15 border-green-200 dark:border-green-500/20" },
    medium: { color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-500/15 border-yellow-200 dark:border-yellow-500/20" },
    low: { color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-500/15 border-orange-200 dark:border-orange-500/20" },
    none: { color: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-500/15 border-red-200 dark:border-red-500/20" },
  };
  const c = config[level] || config.low;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", c.bg, c.color)}>
      {level}
    </span>
  );
}

function TrustBadgeItem({ badge }: { badge: string }) {
  const label = badge.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400">
      <CheckCircle className="h-3 w-3" />
      {label}
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-2 font-semibold">
          <Icon className="h-5 w-5" />
          {title}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
      />
    </div>
  );
}

function getScoreBarColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

// ============================================================================
// Main component
// ============================================================================

export function CandidateResults({ result, onBack }: CandidateResultsProps) {
  const [showScoreExplanation, setShowScoreExplanation] = useState(false);

  const radarScores = {
    skillsScore: result.score,
    experienceScore: Math.min(100, result.score + 5),
    educationScore: Math.min(100, result.score - 5),
    projectScore: Math.min(100, result.score - 10),
    trustScore: 50,
  };

  const predictedRoleNames = result.predictedRoles?.map((r) => r.role) ?? [];
  const skillGaps = result.skillsMissing ?? [];
  const videos = getRecommendedVideos(predictedRoleNames, skillGaps);

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Check Another
      </Button>

      {/* ================================================================== */}
      {/* TOP: Score + Confidence + Trust Badges */}
      {/* ================================================================== */}
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

                {/* Score Confidence Banner */}
                {result.scoreConfidence && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          result.scoreConfidence.level === "high"
                            ? "border-green-300 text-green-700 dark:text-green-400"
                            : result.scoreConfidence.level === "medium"
                              ? "border-yellow-300 text-yellow-700 dark:text-yellow-400"
                              : "border-orange-300 text-orange-700 dark:text-orange-400",
                        )}
                      >
                        <Shield className="mr-1 h-3 w-3" />
                        {result.scoreConfidence.level} confidence
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {result.scoreConfidence.completeness}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {result.scoreConfidence.evidenceStrength}
                    </p>

                    {/* Why is this score? */}
                    <button
                      onClick={() => setShowScoreExplanation(!showScoreExplanation)}
                      className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto"
                    >
                      <Info className="h-3 w-3" />
                      {showScoreExplanation ? "Hide explanation" : "Why this score?"}
                    </button>
                    {showScoreExplanation && (
                      <div className="text-left text-xs bg-muted/50 rounded-lg p-3 space-y-1">
                        {result.strengths.slice(0, 3).map((s, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5">+</span>
                            <span>{s}</span>
                          </div>
                        ))}
                        {result.improvements.slice(0, 3).map((s, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-orange-500 mt-0.5">-</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Improvement CTA */}
                    {result.scoreConfidence.improvementCta && (
                      <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg px-3 py-2 text-xs text-blue-700 dark:text-blue-400">
                        <Zap className="h-3 w-3 flex-shrink-0" />
                        {result.scoreConfidence.improvementCta}
                      </div>
                    )}
                  </div>
                )}
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

      {/* Trust Badges */}
      {result.trustBadges && result.trustBadges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {result.trustBadges.map((badge, i) => (
            <TrustBadgeItem key={i} badge={badge} />
          ))}
        </div>
      )}

      {/* ================================================================== */}
      {/* SUMMARY */}
      {/* ================================================================== */}
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

      {/* ================================================================== */}
      {/* SKILL CONFIDENCE — The big trust builder */}
      {/* ================================================================== */}
      {result.skillConfidence && result.skillConfidence.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Skill Analysis
              <span className="text-xs font-normal text-muted-foreground ml-auto">
                Confidence based on resume evidence
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.skillConfidence.map((skill, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg border p-3 space-y-2",
                  skill.confidence === "none"
                    ? "border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5"
                    : skill.confidence === "high"
                      ? "border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/5"
                      : "border-border",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{skill.skill}</span>
                    <ConfidenceBadge level={skill.confidence} />
                    {skill.verifiedByGithub && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 dark:text-blue-400">
                            GitHub
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Verified via GitHub repositories</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {skill.lastUsed && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {skill.lastUsed === "recent" ? "Recent" : skill.lastUsed}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skill.evidence.map((ev, j) => (
                    <span
                      key={j}
                      className="text-xs text-muted-foreground bg-muted rounded px-2 py-0.5"
                    >
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Transferable skills — shows fairness */}
            {result.transferableSkills && result.transferableSkills.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <ArrowRight className="h-4 w-4" />
                  Transferable Skills Detected
                </p>
                <div className="space-y-2">
                  {result.transferableSkills.map((ts, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{ts.missingSkill}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            ts.transferability === "high"
                              ? "border-green-300 text-green-700"
                              : ts.transferability === "medium"
                                ? "border-yellow-300 text-yellow-700"
                                : "border-orange-300 text-orange-700",
                          )}
                        >
                          {ts.transferability} transferability
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{ts.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================================================================== */}
      {/* ROLE-FIT SCORES */}
      {/* ================================================================== */}
      {result.roleFitScores && result.roleFitScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Role Fit Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.roleFitScores.map((role, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{role.role}</span>
                  <span
                    className={cn(
                      "text-lg font-bold",
                      role.fitPercentage >= 70
                        ? "text-green-500"
                        : role.fitPercentage >= 50
                          ? "text-yellow-500"
                          : "text-orange-500",
                    )}
                  >
                    {role.fitPercentage}%
                  </span>
                </div>
                <ScoreBar score={role.fitPercentage} color={getScoreBarColor(role.fitPercentage)} />
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-medium text-green-600 dark:text-green-400 mb-1">Strengths</p>
                    {role.topStrengths.map((s, j) => (
                      <div key={j} className="flex items-start gap-1 text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-medium text-orange-600 dark:text-orange-400 mb-1">Blockers</p>
                    {role.topBlockers.map((b, j) => (
                      <div key={j} className="flex items-start gap-1 text-muted-foreground">
                        <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ================================================================== */}
      {/* EXPERIENCE QUALITY */}
      {/* ================================================================== */}
      {result.experienceQuality && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Experience Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {result.experienceQuality.summary}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center rounded-lg border p-3">
                <p className="text-2xl font-bold">{result.experienceQuality.totalYears}</p>
                <p className="text-xs text-muted-foreground">Years Total</p>
              </div>
              <div className="text-center rounded-lg border p-3">
                <p className="text-2xl font-bold">{result.experienceQuality.projectsPerYear}</p>
                <p className="text-xs text-muted-foreground">Projects/Year</p>
              </div>
              <div className="text-center rounded-lg border p-3">
                <p className="text-2xl font-bold">
                  {result.experienceQuality.hasProductionExposure ? (
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Production Exposure</p>
              </div>
              <div className="text-center rounded-lg border p-3">
                <p className={cn(
                  "text-2xl font-bold",
                  result.experienceQuality.continuityScore >= 80
                    ? "text-green-500"
                    : result.experienceQuality.continuityScore >= 50
                      ? "text-yellow-500"
                      : "text-orange-500",
                )}>
                  {result.experienceQuality.continuityScore}
                </p>
                <p className="text-xs text-muted-foreground">Continuity Score</p>
              </div>
            </div>
            {result.experienceQuality.averageTenureMonths > 0 && (
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span>Avg tenure: {result.experienceQuality.averageTenureMonths} months</span>
                <span>Longest: {result.experienceQuality.longestTenureMonths} months</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================================================================== */}
      {/* RESUME QUALITY SCORE */}
      {/* ================================================================== */}
      {result.resumeQualityScore && (
        <CollapsibleSection title="Resume Quality" icon={Award} defaultOpen={false}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Overall", score: result.resumeQualityScore.overall },
                { label: "Clarity", score: result.resumeQualityScore.clarity },
                { label: "Impact Evidence", score: result.resumeQualityScore.impactEvidence },
                { label: "Consistency", score: result.resumeQualityScore.consistency },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.score}%</span>
                  </div>
                  <ScoreBar score={item.score} color={getScoreBarColor(item.score)} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Overclaim risk:</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  result.resumeQualityScore.overclaimRisk === "low"
                    ? "border-green-300 text-green-700 dark:text-green-400"
                    : result.resumeQualityScore.overclaimRisk === "medium"
                      ? "border-yellow-300 text-yellow-700 dark:text-yellow-400"
                      : "border-red-300 text-red-700 dark:text-red-400",
                )}
              >
                {result.resumeQualityScore.overclaimRisk}
              </Badge>
            </div>
            <div className="space-y-1">
              {result.resumeQualityScore.details.map((detail, i) => (
                <p key={i} className="text-xs text-muted-foreground">{detail}</p>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* ================================================================== */}
      {/* SKILL FRESHNESS (collapsible) */}
      {/* ================================================================== */}
      {result.skillFreshness && result.skillFreshness.length > 0 && (
        <CollapsibleSection title="Skill Freshness" icon={Clock} defaultOpen={false}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {result.skillFreshness.map((sf, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-2.5 text-sm"
              >
                <span className="font-medium">{sf.skill}</span>
                <span className={cn(
                  "text-xs",
                  sf.lastUsed === "unknown"
                    ? "text-muted-foreground"
                    : sf.lastUsed === new Date().getFullYear().toString() || sf.lastUsed === "recent"
                      ? "text-green-600 dark:text-green-400 font-medium"
                      : "text-yellow-600 dark:text-yellow-400",
                )}>
                  {sf.lastUsed === "unknown" ? "Unknown" : sf.lastUsed === "recent" ? "Recent" : sf.lastUsed}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* ================================================================== */}
      {/* STRENGTHS & IMPROVEMENTS */}
      {/* ================================================================== */}
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

      {/* ================================================================== */}
      {/* LEGACY: Skills matched/missing (kept for backward compat) */}
      {/* ================================================================== */}
      {!result.skillConfidence && (result.skillsMatched || result.skillsMissing) && (
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
                    <Badge key={i} variant="success">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            {result.skillsMissing && result.skillsMissing.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 text-orange-600">Skills to Add/Highlight</p>
                <div className="flex flex-wrap gap-2">
                  {result.skillsMissing.map((skill, i) => (
                    <Badge key={i} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================================================================== */}
      {/* PREDICTED ROLES (original component) */}
      {/* ================================================================== */}
      {result.predictedRoles && result.predictedRoles.length > 0 && !result.roleFitScores && (
        <PredictedRoles roles={result.predictedRoles} />
      )}

      {/* ================================================================== */}
      {/* COURSE RECOMMENDATIONS */}
      {/* ================================================================== */}
      {result.courseRecommendations && result.courseRecommendations.length > 0 && (
        <CourseRecommendations courses={result.courseRecommendations} />
      )}

      {/* ================================================================== */}
      {/* RESUME TIPS */}
      {/* ================================================================== */}
      {result.resumeTips && result.resumeTips.length > 0 && (
        <ResumeTips tips={result.resumeTips} />
      )}

      {/* ================================================================== */}
      {/* VIDEO RECOMMENDATIONS */}
      {/* ================================================================== */}
      {videos.length > 0 && <VideoRecommendations videos={videos} />}
    </div>
  );
}
