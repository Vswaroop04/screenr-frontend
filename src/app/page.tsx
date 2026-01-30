"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileSearch, ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      {/* Hero */}
      <div className="max-w-2xl text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          AI-Powered Resume Screening
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Screen resumes in seconds,{" "}
          <span className="text-primary">not hours</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload resumes, add your job description, and let AI rank candidates
          instantly. For recruiters and job seekers alike.
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Recruiter Card */}
        <Card className="group hover:border-primary transition-colors">
          <CardHeader>
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">For Recruiters</CardTitle>
            <CardDescription>
              Upload multiple resumes, get AI-ranked candidates with detailed
              match scores and insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Bulk resume upload (PDF, DOC)
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                AI-powered candidate ranking
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                GitHub & LinkedIn verification
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Detailed skills & experience analysis
              </li>
            </ul>
            <Button asChild className="w-full group-hover:bg-primary">
              <Link href="/recruiter">
                Start Screening
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Candidate Card */}
        <Card className="group hover:border-primary transition-colors">
          <CardHeader>
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileSearch className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">For Job Seekers</CardTitle>
            <CardDescription>
              Check how well your resume matches a job description and get
              improvement suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Instant match score
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Skills gap analysis
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Personalized improvement tips
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Free & instant results
              </li>
            </ul>
            <Button asChild variant="outline" className="w-full">
              <Link href="/candidate">
                Check My Resume
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-8 text-center">
        <div>
          <div className="text-3xl font-bold text-primary">90%</div>
          <div className="text-sm text-muted-foreground">Time Saved</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-primary">100+</div>
          <div className="text-sm text-muted-foreground">Resumes/Minute</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-primary">95%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
      </div>
    </main>
  );
}
