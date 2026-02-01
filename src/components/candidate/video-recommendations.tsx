"use client";

import { Play, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VideoRecommendation } from "@/lib/video-recommendations";

interface VideoRecommendationsProps {
  videos: VideoRecommendation[];
}

const categoryLabels: Record<string, string> = {
  interview_prep: "Interview Prep",
  resume_tips: "Resume Tips",
  career_advice: "Career Advice",
  skill_specific: "Skill Building",
};

export function VideoRecommendations({ videos }: VideoRecommendationsProps) {
  if (!videos || videos.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Recommended Videos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {videos.map((video, i) => (
            <a
              key={i}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                  {video.title}
                </p>
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{video.channel}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {categoryLabels[video.category] || video.category}
                </Badge>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
