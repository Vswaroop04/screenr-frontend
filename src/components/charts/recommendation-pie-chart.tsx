"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { Candidate } from "@/lib/screening-api";

interface RecommendationPieChartProps {
  candidates: Candidate[];
}

const COLORS: Record<string, string> = {
  strong_yes: "#16a34a",
  yes: "#22c55e",
  maybe: "#eab308",
  no: "#f97316",
  strong_no: "#ef4444",
};

const LABELS: Record<string, string> = {
  strong_yes: "Strong Yes",
  yes: "Yes",
  maybe: "Maybe",
  no: "No",
  strong_no: "Strong No",
};

export function RecommendationPieChart({ candidates }: RecommendationPieChartProps) {
  const processed = candidates.filter((c) => c.recommendation);

  const counts: Record<string, number> = {};
  for (const c of processed) {
    const rec = c.recommendation!;
    counts[rec] = (counts[rec] || 0) + 1;
  }

  const data = Object.entries(counts).map(([key, value]) => ({
    name: LABELS[key] || key,
    value,
    color: COLORS[key] || "#94a3b8",
  }));

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
