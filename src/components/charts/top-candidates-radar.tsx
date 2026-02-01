"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Candidate } from "@/lib/screening-api";

interface TopCandidatesRadarProps {
  candidates: Candidate[];
}

const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ec4899", "#eab308"];

export function TopCandidatesRadar({ candidates }: TopCandidatesRadarProps) {
  const top5 = candidates
    .filter((c) => c.overallScore !== undefined)
    .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
    .slice(0, 5);

  if (top5.length === 0) return null;

  const dimensions = ["Skills", "Experience", "Education", "Projects", "Trust"];

  const data = dimensions.map((dim) => {
    const entry: Record<string, string | number> = { dimension: dim };
    for (const c of top5) {
      const label = c.candidateName || `#${c.rankPosition || "?"}`;
      switch (dim) {
        case "Skills": entry[label] = c.skillsScore || 0; break;
        case "Experience": entry[label] = c.experienceScore || 0; break;
        case "Education": entry[label] = c.educationScore || 0; break;
        case "Projects": entry[label] = c.projectScore || 0; break;
        case "Trust": entry[label] = c.trustScore || 0; break;
      }
    }
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
        />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
        {top5.map((c, i) => {
          const label = c.candidateName || `#${c.rankPosition || "?"}`;
          return (
            <Radar
              key={c.resumeId}
              name={label}
              dataKey={label}
              stroke={COLORS[i]}
              fill={COLORS[i]}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          );
        })}
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
