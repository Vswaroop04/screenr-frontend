"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface ScoreRadarChartProps {
  scores: {
    skillsScore: number;
    experienceScore: number;
    educationScore: number;
    projectScore?: number;
    trustScore?: number;
  };
}

export function ScoreRadarChart({ scores }: ScoreRadarChartProps) {
  const data = [
    { dimension: "Skills", value: scores.skillsScore },
    { dimension: "Experience", value: scores.experienceScore },
    { dimension: "Education", value: scores.educationScore },
    { dimension: "Projects", value: scores.projectScore ?? 0 },
    { dimension: "Trust", value: scores.trustScore ?? 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
