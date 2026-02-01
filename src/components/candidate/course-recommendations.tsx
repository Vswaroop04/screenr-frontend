"use client";

import { GraduationCap, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CourseRecommendation {
  title: string;
  platform: string;
  skill: string;
  url?: string;
}

interface CourseRecommendationsProps {
  courses: CourseRecommendation[];
}

export function CourseRecommendations({ courses }: CourseRecommendationsProps) {
  if (!courses || courses.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Recommended Courses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {courses.map((course, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-muted/30"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{course.title}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {course.platform}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {course.skill}
                  </Badge>
                </div>
              </div>
              {course.url && (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
