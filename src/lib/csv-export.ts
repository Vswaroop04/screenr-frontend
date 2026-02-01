import type { Candidate } from "./screening-api";

export function exportCandidatesToCSV(candidates: Candidate[], jobTitle: string) {
  const rows = candidates.map((c) => ({
    Rank: c.rankPosition ?? "",
    Name: c.candidateName ?? "",
    Email: c.candidateEmail ?? "",
    "Overall Score": c.overallScore ?? "",
    "Skills Score": c.skillsScore ?? "",
    "Experience Score": c.experienceScore ?? "",
    "Education Score": c.educationScore ?? "",
    "Project Score": c.projectScore ?? "",
    "Trust Score": c.trustScore ?? "",
    Recommendation: c.recommendation ?? "",
    Strengths: (c.strengths ?? []).join("; "),
    Concerns: (c.concerns ?? []).join("; "),
    "Predicted Roles": (c.predictedRoles ?? []).join("; "),
    "Experience (Years)": c.totalYearsExperience ?? "",
    City: c.parsedLocation?.city ?? "",
    State: c.parsedLocation?.state ?? "",
    Country: c.parsedLocation?.country ?? "",
    Status: c.status,
    "File Name": c.fileName,
  }));

  exportToCSV(
    rows as unknown as Record<string, unknown>[],
    `${jobTitle.replace(/[^a-zA-Z0-9]/g, "_")}_candidates.csv`
  );
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val === null || val === undefined ? "" : String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
