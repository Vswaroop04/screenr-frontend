"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreDistributionChart } from "@/components/charts/score-distribution-chart";
import { RecommendationPieChart } from "@/components/charts/recommendation-pie-chart";
import { ExperienceDistributionChart } from "@/components/charts/experience-distribution-chart";
import { SkillsFrequencyChart } from "@/components/charts/skills-frequency-chart";
import { LocationDistributionChart } from "@/components/charts/location-distribution-chart";
import { PredictedRolesChart } from "@/components/charts/predicted-roles-chart";
import { TopCandidatesRadar } from "@/components/charts/top-candidates-radar";
import type { Candidate } from "@/lib/screening-api";

interface JobAnalyticsProps {
  candidates: Candidate[];
}

export function JobAnalytics({ candidates }: JobAnalyticsProps) {
  const processed = candidates.filter((c) => c.overallScore !== undefined);

  if (processed.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            No analyzed candidates yet. Analytics will appear after resumes are processed.
          </p>
        </CardContent>
      </Card>
    );
  }

  const avgScore = Math.round(
    processed.reduce((sum, c) => sum + (c.overallScore || 0), 0) / processed.length
  );

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{candidates.length}</p>
            <p className="text-sm text-muted-foreground">Total Candidates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{processed.length}</p>
            <p className="text-sm text-muted-foreground">Analyzed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{avgScore}</p>
            <p className="text-sm text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {processed.filter((c) => c.recommendation === "yes" || c.recommendation === "strong_yes").length}
            </p>
            <p className="text-sm text-muted-foreground">Recommended</p>
          </CardContent>
        </Card>
      </div>

      {/* Top candidates radar */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Candidates Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <TopCandidatesRadar candidates={candidates} />
        </CardContent>
      </Card>

      {/* Score distribution + Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreDistributionChart candidates={candidates} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <RecommendationPieChart candidates={candidates} />
          </CardContent>
        </Card>
      </div>

      {/* Experience + Predicted Roles */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Experience Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ExperienceDistributionChart candidates={candidates} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Predicted Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <PredictedRolesChart candidates={candidates} />
          </CardContent>
        </Card>
      </div>

      {/* Skills frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Most Common Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillsFrequencyChart candidates={candidates} />
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationDistributionChart candidates={candidates} />
        </CardContent>
      </Card>
    </div>
  );
}
