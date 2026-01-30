"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, Users, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useJobs, useCreateJob } from "@/lib/screening-hooks";
import Loader from "@/components/shared/loader";

export default function RecruiterDashboard() {
  const { data: jobsData, isLoading } = useJobs();
  const createJob = useCreateJob();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
  });

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob.mutateAsync(formData);
      setIsDialogOpen(false);
      setFormData({ title: "", company: "", location: "", description: "" });
    } catch (error) {
      console.error("Failed to create job:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "processing":
        return <Badge variant="warning">Processing</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  const jobs = jobsData?.jobs || [];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">
            Create jobs and screen candidates with AI
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Add a job description to start screening candidates
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Frontend Developer"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Acme Inc."
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Remote, New York, NY"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Paste the full job description here. Include requirements, responsibilities, qualifications, etc."
                  className="min-h-[200px]"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createJob.isPending}>
                  {createJob.isPending ? "Creating..." : "Create Job"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first job to start screening candidates
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    {job.company && (
                      <CardDescription>{job.company}</CardDescription>
                    )}
                  </div>
                  {getStatusBadge(job.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.location && (
                  <p className="text-sm text-muted-foreground">{job.location}</p>
                )}

                {/* Stats */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{job.resumeCount} resumes</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{job.processedCount} processed</span>
                  </div>
                </div>

                {/* Skills */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 5).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.requiredSkills.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.requiredSkills.length - 5}
                      </Badge>
                    )}
                  </div>
                )}

                <Button asChild variant="outline" className="w-full">
                  <Link href={`/recruiter/${job.id}`}>
                    View Candidates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
