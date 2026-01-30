"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScoreDisplayProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
}

export function ScoreDisplay({
  score,
  label,
  size = "md",
  showProgress = true,
}: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("font-bold", sizeClasses[size], getScoreColor(score))}>
          {score}%
        </span>
      </div>
      {showProgress && (
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full transition-all duration-500", getProgressColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ScoreCircle({
  score,
  size = 120,
  strokeWidth = 8,
  label,
}: ScoreCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 60) return "stroke-yellow-500";
    if (score >= 40) return "stroke-orange-500";
    return "stroke-red-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700", getScoreColor(score))}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-3xl font-bold", getScoreTextColor(score))}>
          {score}
        </span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

interface TrustBadgeProps {
  score: number;
  flags?: string[];
}

export function TrustBadge({ score, flags }: TrustBadgeProps) {
  const getColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getBgColor = (score: number) => {
    if (score >= 70) return "bg-green-500/10";
    if (score >= 40) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  const formatFlag = (flag: string) =>
    flag.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              getBgColor(score),
              getColor(score)
            )}
          >
            <Shield className="h-3 w-3" />
            <span>{score}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">Trust Score: {score}/100</p>
            {flags && flags.length > 0 && (
              <div className="text-xs space-y-0.5">
                {flags.map((flag, i) => (
                  <div key={i} className="text-muted-foreground">
                    + {formatFlag(flag)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ScoreBreakdownProps {
  scores: {
    skillsScore: number;
    experienceScore: number;
    educationScore: number;
    projectScore: number;
    trustScore: number;
  };
  weights?: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
    trust: number;
  };
}

export function ScoreBreakdown({ scores, weights }: ScoreBreakdownProps) {
  const dimensions = [
    { label: "Skills", score: scores.skillsScore, weight: weights?.skills ?? 0.4 },
    { label: "Experience", score: scores.experienceScore, weight: weights?.experience ?? 0.25 },
    { label: "Education", score: scores.educationScore, weight: weights?.education ?? 0.1 },
    { label: "Projects", score: scores.projectScore, weight: weights?.projects ?? 0.05 },
    { label: "Trust", score: scores.trustScore, weight: weights?.trust ?? 0.2 },
  ];

  const getBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-2">
      {dimensions.map((dim) => (
        <div key={dim.label} className="space-y-0.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {dim.label}
              <span className="ml-1 text-xs opacity-50">
                ({Math.round(dim.weight * 100)}%)
              </span>
            </span>
            <span className="font-medium">{dim.score}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full transition-all duration-500 rounded-full", getBarColor(dim.score))}
              style={{ width: `${dim.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
