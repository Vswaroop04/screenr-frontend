"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminAPI, type AdminUser } from "@/lib/screening-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Briefcase,
  FileText,
  BarChart3,
  Shield,
  Gift,
  RefreshCw,
  UserX,
  UserCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface UserCandidate {
  resumeId: string;
  fileName: string;
  candidateName?: string;
  candidateEmail?: string;
  status: string;
  jobId?: string;
  jobTitle?: string;
  uploadedAt: string;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [jobs, setJobs] = useState<
    Array<{ id: string; title: string; status: string; resumeCount: number }>
  >([]);
  const [candidates, setCandidates] = useState<UserCandidate[]>([]);
  const [candidatesTotal, setCandidatesTotal] = useState(0);
  const [candidatesPage, setCandidatesPage] = useState(0);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [bonusResumes, setBonusResumes] = useState("");
  const [bonusAnalyses, setBonusAnalyses] = useState("");

  const candidatesLimit = 20;

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await adminAPI.getUser(userId);
        setUser(data.user);
        setJobs(data.jobs);
        setSelectedPlan(data.user.planType || "free");
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  useEffect(() => {
    async function fetchCandidates() {
      setCandidatesLoading(true);
      try {
        const data = await adminAPI.getUserCandidates(userId, {
          limit: candidatesLimit,
          offset: candidatesPage * candidatesLimit,
        });
        setCandidates(data.candidates);
        setCandidatesTotal(data.total);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setCandidatesLoading(false);
      }
    }
    if (userId) fetchCandidates();
  }, [userId, candidatesPage]);

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;
    setActionLoading(true);
    try {
      await adminAPI.updateUserPlan(userId, selectedPlan, "Admin update");
      setUser((prev) => (prev ? { ...prev, planType: selectedPlan } : null));
    } catch (error) {
      console.error("Failed to update plan:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrantBonus = async () => {
    setActionLoading(true);
    try {
      await adminAPI.grantUsageBonus(
        userId,
        bonusResumes ? parseInt(bonusResumes) : undefined,
        bonusAnalyses ? parseInt(bonusAnalyses) : undefined,
        "Admin bonus",
      );
      setBonusResumes("");
      setBonusAnalyses("");
      // Refresh user data
      const data = await adminAPI.getUser(userId);
      setUser(data.user);
    } catch (error) {
      console.error("Failed to grant bonus:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetUsage = async () => {
    setActionLoading(true);
    try {
      await adminAPI.resetUserUsage(userId, "Admin reset");
      // Refresh user data
      const data = await adminAPI.getUser(userId);
      setUser(data.user);
    } catch (error) {
      console.error("Failed to reset usage:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await adminAPI.toggleUserStatus(userId, !user.isActive, "Admin toggle");
      setUser((prev) => (prev ? { ...prev, isActive: !prev.isActive } : null));
    } catch (error) {
      console.error("Failed to toggle status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getPlanBadgeVariant = (plan?: string) => {
    switch (plan) {
      case "starter":
        return "secondary";
      case "pro":
        return "default";
      case "enterprise":
        return "destructive";
      default:
        return "outline";
    }
  };

  const candidatesTotalPages = Math.ceil(candidatesTotal / candidatesLimit);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{user.fullName || user.email}</h1>
          <p className="text-muted-foreground">User Details</p>
        </div>
        <Badge
          variant={user.isActive ? "default" : "destructive"}
          className="text-sm"
        >
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* User Info */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan & Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Plan & Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Current Plan
              </span>
              <Badge
                variant={getPlanBadgeVariant(user.planType)}
                className="capitalize"
              >
                {user.planType || "free"}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              {user.role === "recruiter" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Resumes This Month
                    </span>
                    <span className="font-medium">
                      {user.resumesUploadedThisMonth || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Jobs This Month
                    </span>
                    <span className="font-medium">
                      {user.jobsCreatedThisMonth || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Lifetime Resumes
                    </span>
                    <span className="font-medium">
                      {user.lifetimeResumesUploaded || 0}
                    </span>
                  </div>
                </>
              )}
              {user.role === "candidate" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Analyses This Month
                    </span>
                    <span className="font-medium">
                      {user.analysesThisMonth || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Lifetime Analyses
                    </span>
                    <span className="font-medium">
                      {user.lifetimeAnalyses || 0}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Update Plan */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Update Plan</label>
              <div className="flex gap-2">
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleUpdatePlan}
                  disabled={actionLoading || selectedPlan === user.planType}
                >
                  Update
                </Button>
              </div>
            </div>

            {/* Grant Bonus */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-auto py-4">
                  <Gift className="h-4 w-4 mr-2" />
                  Grant Bonus
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Grant Usage Bonus</DialogTitle>
                  <DialogDescription>
                    Grant additional usage to this user
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bonus Resumes</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={bonusResumes}
                      onChange={(e) => setBonusResumes(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Bonus Analyses
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={bonusAnalyses}
                      onChange={(e) => setBonusAnalyses(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleGrantBonus} disabled={actionLoading}>
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Grant Bonus
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Reset Usage */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-auto py-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Usage
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Monthly Usage</DialogTitle>
                  <DialogDescription>
                    This will reset all monthly usage counters to zero.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleResetUsage}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Reset Usage
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Toggle Status */}
            <Button
              variant={user.isActive ? "destructive" : "default"}
              className="h-auto py-4"
              onClick={handleToggleStatus}
              disabled={actionLoading}
            >
              {user.isActive ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User's Jobs */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Jobs ({jobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resumes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === "active" ? "default" : "secondary"
                        }
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.resumeCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Candidates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Candidates ({candidatesTotal})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candidatesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : candidates.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.resumeId}>
                      <TableCell className="font-medium">
                        {candidate.fileName}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{candidate.candidateName || "Unknown"}</p>
                          {candidate.candidateEmail && (
                            <p className="text-sm text-muted-foreground">
                              {candidate.candidateEmail}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{candidate.jobTitle || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            candidate.status === "processed"
                              ? "default"
                              : candidate.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {candidate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(candidate.uploadedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {candidatesTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {candidatesPage * candidatesLimit + 1} to{" "}
                    {Math.min(
                      (candidatesPage + 1) * candidatesLimit,
                      candidatesTotal,
                    )}{" "}
                    of {candidatesTotal}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCandidatesPage((p) => Math.max(0, p - 1))
                      }
                      disabled={candidatesPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {candidatesPage + 1} of {candidatesTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCandidatesPage((p) =>
                          Math.min(candidatesTotalPages - 1, p + 1),
                        )
                      }
                      disabled={candidatesPage >= candidatesTotalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No candidates uploaded by this user
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
