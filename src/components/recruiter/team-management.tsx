"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  UserPlus,
  Mail,
  Trash2,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { teamAPI } from "@/lib/screening-api";

interface TeamMember {
  id: string;
  email: string;
  fullName?: string;
  role: "admin" | "member";
  status: "active" | "pending";
  joinedAt?: string;
  invitationId?: string;
}

export function TeamManagement() {
  const { user } = useAuthStore();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isInviting, setIsInviting] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!user?.id) return;
    try {
      const result = await teamAPI.getTeamMembers(user.id);
      setTeamMembers(result.members.map(m => ({
        ...m,
        fullName: m.fullName || undefined,
        joinedAt: m.joinedAt || undefined,
        invitationId: m.invitationId || undefined,
      })));
      setIsAdmin(result.isAdmin);
    } catch {
      console.error("Failed to fetch team members");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInviteMember = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!user?.id) return;

    setIsInviting(true);
    try {
      await teamAPI.inviteTeamMember(inviteEmail, inviteRole, user.id);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setIsInviteDialogOpen(false);
      await fetchMembers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.message || "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!user?.id) return;
    try {
      await teamAPI.removeTeamMember(memberId, user.id);
      toast.success("Team member removed");
      await fetchMembers();
    } catch {
      toast.error("Failed to remove team member");
    }
  };

  const handleResendInvite = async (invitationId: string, email: string) => {
    try {
      await teamAPI.resendInvitation(invitationId);
      toast.success(`Invitation resent to ${email}`);
    } catch {
      toast.error("Failed to resend invitation");
    }
  };

  const getStatusBadge = (status: TeamMember["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const getRoleBadge = (role: TeamMember["role"]) => {
    return role === "admin" ? (
      <Badge variant="default" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Admin
      </Badge>
    ) : (
      <Badge variant="outline">Member</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">
            Invite team members to collaborate on recruitment
          </p>
        </div>
        {isAdmin && <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your recruitment team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="member"
                      checked={inviteRole === "member"}
                      onChange={() => setInviteRole("member")}
                      className="cursor-pointer"
                    />
                    <span>Member</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={inviteRole === "admin"}
                      onChange={() => setInviteRole("admin")}
                      className="cursor-pointer"
                    />
                    <span>Admin</span>
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Admins can invite members and manage team settings
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteMember} disabled={isInviting}>
                  {isInviting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({teamMembers.length})</CardTitle>
          <CardDescription>
            Manage your team members and their access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No team members yet. Invite your first team member to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-semibold">
                      {member.fullName?.charAt(0) || member.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.fullName || member.email}</p>
                        {getRoleBadge(member.role)}
                        {getStatusBadge(member.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      {member.status === "active" && member.joinedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && member.status === "pending" && member.invitationId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendInvite(member.invitationId!, member.email)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Resend
                      </Button>
                    )}
                    {isAdmin && member.id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Permissions</CardTitle>
          <CardDescription>
            Understand what each role can do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Admin</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Create and manage jobs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Review and shortlist candidates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Invite and remove team members</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Access all analytics and reports</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-semibold">Member</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>View jobs and candidates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Review and comment on candidates</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>Cannot create or delete jobs</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>Cannot manage team members</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
