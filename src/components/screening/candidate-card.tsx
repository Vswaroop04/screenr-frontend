"use client";

import { User, Mail, FileText, CheckCircle, AlertCircle, Clock, XCircle, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCircle, ScoreDisplay, TrustBadge } from "./score-display";
import type { Candidate } from "@/lib/screening-api";

interface CandidateCardProps {
  candidate: Candidate;
  rank?: number;
  onClick?: () => void;
}

export function CandidateCard({ candidate, rank, onClick }: CandidateCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const getRecommendationBadge = (rec?: string) => {
    switch (rec) {
      case "strong_yes":
        return <Badge variant="success">Strong Yes</Badge>;
      case "yes":
        return <Badge variant="success">Yes</Badge>;
      case "maybe":
        return <Badge variant="warning">Maybe</Badge>;
      case "no":
        return <Badge variant="destructive">No</Badge>;
      case "strong_no":
        return <Badge variant="destructive">Strong No</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "analyzed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "analyzing":
      case "parsing":
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const isProcessed = candidate.overallScore !== undefined;

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md cursor-pointer",
        isProcessed && candidate.overallScore! >= 70 && "border-green-500/30",
        onClick && "hover:border-primary"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {(candidate.rankPosition || rank) && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {candidate.rankPosition || rank}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {candidate.candidateName || "Unknown Candidate"}
                </span>
                {getStatusIcon(candidate.status)}
              </div>
              {candidate.candidateEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {candidate.candidateEmail}
                </div>
              )}
              {candidate.rankPosition && candidate.percentile && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  Ranked #{candidate.rankPosition} (Top {100 - candidate.percentile + 1}%)
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isProcessed && candidate.trustScore !== undefined && (
              <TrustBadge score={candidate.trustScore} flags={candidate.trustFlags} />
            )}
            {isProcessed && (
              <ScoreCircle score={candidate.overallScore!} size={60} />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* File name */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span className="truncate">{candidate.fileName}</span>
        </div>

        {isProcessed ? (
          <>
            {/* Recommendation badge */}
            <div className="flex items-center gap-2">
              {getRecommendationBadge(candidate.recommendation)}
            </div>

            {/* Score breakdown - 5 columns */}
            <div className="grid grid-cols-5 gap-2">
              <ScoreDisplay
                score={candidate.skillsScore || 0}
                label="Skills"
                size="sm"
                showProgress={false}
              />
              <ScoreDisplay
                score={candidate.experienceScore || 0}
                label="Exp"
                size="sm"
                showProgress={false}
              />
              <ScoreDisplay
                score={candidate.educationScore || 0}
                label="Edu"
                size="sm"
                showProgress={false}
              />
              <ScoreDisplay
                score={candidate.projectScore || 0}
                label="Projects"
                size="sm"
                showProgress={false}
              />
              <ScoreDisplay
                score={candidate.trustScore || 0}
                label="Trust"
                size="sm"
                showProgress={false}
              />
            </div>

            {/* Strengths */}
            {candidate.strengths && candidate.strengths.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Top Strengths
                </p>
                <div className="flex flex-wrap gap-1">
                  {candidate.strengths.slice(0, 2).map((strength, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {strength.length > 30 ? strength.slice(0, 30) + "..." : strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Concerns */}
            {candidate.concerns && candidate.concerns.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Concerns
                </p>
                <div className="flex flex-wrap gap-1">
                  {candidate.concerns.slice(0, 2).map((concern, i) => (
                    <Badge key={i} variant="outline" className="text-xs text-orange-600">
                      {concern.length > 30 ? concern.slice(0, 30) + "..." : concern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation (collapsible) */}
            {candidate.explanation && (
              <div>
                <button
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowExplanation(!showExplanation);
                  }}
                >
                  {showExplanation ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  Why this ranking?
                </button>
                {showExplanation && (
                  <div className="mt-1 space-y-1 text-xs">
                    {candidate.explanation.whyRankedHigh?.map((reason, i) => (
                      <div key={i} className="flex items-start gap-1 text-green-600">
                        <span>+</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                    {candidate.explanation.whyRankedLower?.map((reason, i) => (
                      <div key={i} className="flex items-start gap-1 text-amber-600">
                        <span>-</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom answers */}
            {candidate.customAnswers && candidate.customAnswers.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Custom Questions
                </p>
                <div className="space-y-1">
                  {candidate.customAnswers.map((ca, i) => (
                    <div key={i} className="flex items-start gap-1 text-xs">
                      <span className={ca.satisfied ? "text-green-500" : "text-red-500"}>
                        {ca.satisfied ? "✓" : "✗"}
                      </span>
                      <span className="text-muted-foreground truncate">{ca.question}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
            {candidate.status === "failed" ? (
              <span className="text-red-500">Processing failed</span>
            ) : (
              <span>Processing...</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
