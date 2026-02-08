"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/screening-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  TrendingUp,
  FileText,
  Briefcase,
  BarChart3,
  Loader2,
  ArrowUpDown,
  Users,
} from "lucide-react";

type SortBy = "resumes" | "jobs" | "analyses" | "lifetime";

export default function CreditConsumptionPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("resumes");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await adminAPI.getCreditConsumption({
          planType: planFilter === "all" ? undefined : planFilter,
          sortBy: sortBy,
          limit: 100,
        });
        setData(result);
      } catch (error) {
        console.error("Failed to fetch credit consumption:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [planFilter, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Credit Consumption</h1>
          <p className="text-muted-foreground mt-1">
            Monitor resource usage across all users
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resumes">Resumes Used</SelectItem>
              <SelectItem value="jobs">Jobs Created</SelectItem>
              <SelectItem value="analyses">Analyses Run</SelectItem>
              <SelectItem value="lifetime">Lifetime Usage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold mt-1">
                {summary?.totalUsersTracked || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Resumes This Month
              </p>
              <p className="text-3xl font-bold mt-1">
                {summary?.totalResumesThisMonth || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Jobs This Month</p>
              <p className="text-3xl font-bold mt-1">
                {summary?.totalJobsThisMonth || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Analyses This Month
              </p>
              <p className="text-3xl font-bold mt-1">
                {summary?.totalAnalysesThisMonth || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage by Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Free</p>
              <p className="text-2xl font-bold">
                {summary?.byPlan?.free?.users || 0} users
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {summary?.byPlan?.free?.resumesUsed || 0} resumes used
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Pro</p>
              <p className="text-2xl font-bold">
                {summary?.byPlan?.pro?.users || 0} users
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {summary?.byPlan?.pro?.resumesUsed || 0} resumes used
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Enterprise</p>
              <p className="text-2xl font-bold">
                {summary?.byPlan?.enterprise?.users || 0} users
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {summary?.byPlan?.enterprise?.resumesUsed || 0} resumes used
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Credit Consumption</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Resumes (Month)</TableHead>
                  <TableHead>Jobs (Month)</TableHead>
                  <TableHead>Analyses (Month)</TableHead>
                  <TableHead>Lifetime Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.users && data.users.length > 0 ? (
                  data.users.map((user: any) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user.fullName || user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.planType === "free" ? "secondary" : "default"
                          }
                        >
                          {user.planType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>
                              {user.resumesUploadedThisMonth} /{" "}
                              {user.resumesLimitThisMonth === -1
                                ? "∞"
                                : user.resumesLimitThisMonth}
                            </span>
                            <span className="text-muted-foreground">
                              {user.resumesPercentageUsed}%
                            </span>
                          </div>
                          <Progress
                            value={user.resumesPercentageUsed}
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span>{user.jobsCreatedThisMonth} jobs</span>
                          <br />
                          <span className="text-muted-foreground">
                            {user.activeJobsCount} active
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>
                              {user.analysesThisMonth} /{" "}
                              {user.analysesLimitThisMonth === -1
                                ? "∞"
                                : user.analysesLimitThisMonth}
                            </span>
                            <span className="text-muted-foreground">
                              {user.analysesPercentageUsed}%
                            </span>
                          </div>
                          <Progress
                            value={user.analysesPercentageUsed}
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{user.lifetimeResumesUploaded} resumes</div>
                          <div className="text-muted-foreground">
                            {user.lifetimeJobsCreated} jobs,{" "}
                            {user.lifetimeAnalyses} analyses
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
