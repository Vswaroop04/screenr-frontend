"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Candidate } from "@/lib/screening-api";

interface LocationDistributionChartProps {
  candidates: Candidate[];
}

function countField(candidates: Candidate[], field: "city" | "state" | "country") {
  const counts: Record<string, number> = {};
  for (const c of candidates) {
    const val = c.parsedLocation?.[field];
    if (val) {
      counts[val] = (counts[val] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
}

function LocationBar({ data }: { data: { name: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No location data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" height={60} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="count" name="Candidates" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LocationDistributionChart({ candidates }: LocationDistributionChartProps) {
  const cities = countField(candidates, "city");
  const states = countField(candidates, "state");
  const countries = countField(candidates, "country");

  return (
    <Tabs defaultValue="country">
      <TabsList className="mb-2">
        <TabsTrigger value="country">Country</TabsTrigger>
        <TabsTrigger value="state">State</TabsTrigger>
        <TabsTrigger value="city">City</TabsTrigger>
      </TabsList>
      <TabsContent value="country">
        <LocationBar data={countries} />
      </TabsContent>
      <TabsContent value="state">
        <LocationBar data={states} />
      </TabsContent>
      <TabsContent value="city">
        <LocationBar data={cities} />
      </TabsContent>
    </Tabs>
  );
}
