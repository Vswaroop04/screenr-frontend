"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2, Trash2, Save, AlertTriangle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { settingsAPI } from "@/lib/screening-api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function RecruiterSettings() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    website: "",
    industry: "",
    size: "",
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchCompany() {
      if (!token) return;
      try {
        const result = await settingsAPI.getCompany(token);
        if (result.success && result.company) {
          setCompanyInfo({
            companyName: result.company.name || "",
            website: result.company.website || "",
            industry: result.company.industry || "",
            size: result.company.companySize || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch company info:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompany();
  }, [token]);

  const handleSaveCompanyInfo = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      const result = await settingsAPI.updateCompany(token, {
        name: companyInfo.companyName,
        website: companyInfo.website,
        industry: companyInfo.industry,
        companySize: companyInfo.size,
      });
      if (result.success) {
        toast.success("Company information updated successfully");
      } else {
        toast.error(result.message || "Failed to update company info");
      }
    } catch (error) {
      toast.error("Failed to update company information");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    if (!token) return;
    setIsDeleting(true);
    try {
      const result = await settingsAPI.deleteAccount(token);
      if (result.success) {
        toast.success("Account deleted successfully");
        logout();
        router.push("/");
      } else {
        toast.error(result.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and company information
        </p>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Company Information</CardTitle>
          </div>
          <CardDescription>
            Update your company details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyInfo.companyName}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, companyName: e.target.value })
                    }
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={companyInfo.website}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, website: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={companyInfo.industry}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, industry: e.target.value })
                    }
                    placeholder="Technology, Finance, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Company Size</Label>
                  <Input
                    id="size"
                    value={companyInfo.size}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, size: e.target.value })
                    }
                    placeholder="1-10, 11-50, 51-200, etc."
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveCompanyInfo} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your personal account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={user?.fullName || ""} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={user?.role || ""} disabled className="capitalize" />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove all your data from our servers, including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All job postings</li>
                    <li>All candidate data and analyses</li>
                    <li>Team members and invitations</li>
                    <li>Company information</li>
                  </ul>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm">
                    Type <span className="font-bold">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== "DELETE" || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Delete Account Permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
