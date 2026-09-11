import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { Task } from "./TodoPage";
import {
  User as UserIcon,
  LogOut,
  Mail,
  Calendar,
  KeyRound,
  Copy,
  Check,
  ShieldAlert,
} from "lucide-react";

// Fixed set of emoji avatars a user can pick between (no image upload).
const AVATAR_PRESETS = [
  "🦊",
  "🚀",
  "⚡",
  "🎯",
  "✨",
  "🔥",
  "💻",
  "🎨",
  "🌟",
  "🐱",
];

type TabType = "profile" | "security";

// Account management screen: edit display name/bio/avatar, change password,
// and destructive actions (reset tasks, delete account). Only reachable by
// a real (non-guest) session — see ProtectedRoute's blockGuest.
export default function ProfilePage() {
  const { user, logout, updateProfile, changePassword, deleteAccount } =
    useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [copiedId, setCopiedId] = useState(false);

  // Dialog states
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showResetTasksAlert, setShowResetTasksAlert] = useState(false);
  const [showDeleteAccountAlert, setShowDeleteAccountAlert] = useState(false);

  // Profile Edit State
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "🦊");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Task Storage Key & tasks state
  const storageKey = `todo-tasks-${user?.id}`;
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (!user?.id) return [];
    try {
      const stored = localStorage.getItem(`todo-tasks-${user.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Stats calculation
  const totalTasks = tasks.length;

  // Joined date formatting
  const joinedDate = (() => {
    if (!user?.createdAt) return "Recent Member";
    try {
      const date = new Date(user.createdAt);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return "Recent Member";
    }
  })();

  // User Initials
  const initials = (() => {
    const displayName = user?.name || user?.email || "U";
    return displayName.slice(0, 2).toUpperCase();
  })();

  // Copy User ID
  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.add({
      title: "User ID copied",
      description: "Copied your unique ID to clipboard.",
      type: "success",
    });
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar: selectedAvatar,
      });
      toast.add({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
        type: "success",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.add({
        title: "Update failed",
        description: message,
        type: "error",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.add({
        title: "Passwords mismatch",
        description: "New password and confirmation do not match.",
        type: "error",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast.add({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.add({
        title: "Password changed",
        description: "Your password has been successfully updated.",
        type: "success",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to change password";
      toast.add({
        title: "Error",
        description: message,
        type: "error",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Reset all tasks
  const handleResetTasks = () => {
    localStorage.removeItem(storageKey);
    setTasks([]);
    setShowResetTasksAlert(false);
    toast.add({
      title: "All tasks reset",
      description: "Your task list has been wiped clean.",
      type: "info",
    });
  };

  // Delete account
  const handleDeleteAccount = () => {
    setShowDeleteAccountAlert(false);
    deleteAccount();
  };

  return (
    <div className="min-h-screen flex justify-center px-4 py-12">
      <Card className="w-full max-w-xl h-fit shadow-md">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex flex-row items-center gap-2.5">
            <Avatar className="size-11 rounded-xl border-2 border-background shadow-xs text-xl shrink-0 after:hidden">
              <AvatarFallback className="rounded-xl text-xl bg-muted">
                {user?.avatar || selectedAvatar || initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight uppercase">
                Profile
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowLogoutAlert(true)}
          >
            <LogOut className="size-3.5" />
            Log out
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {/* Quick Account Summary */}
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {user?.name || user?.email?.split("@")[0] || "User"}
                </span>
                <Badge
                  variant="outline"
                  className="gap-1 py-0.5 px-2 text-[11px] font-normal text-muted-foreground"
                >
                  <Calendar className="size-3" />
                  <span>Joined {joinedDate}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />
                <span>{user?.email}</span>
              </div>
            </div>

            {user?.bio && (
              <p className="text-xs text-foreground/80 italic border-l-2 border-primary/40 pl-2.5">
                "{user.bio}"
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2 pt-2 border-t">
              <span className="font-mono text-[11px] truncate max-w-[260px] sm:max-w-sm">
                ID: {user?.id}
              </span>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleCopyId}
                className="h-6 gap-1 text-[11px]"
              >
                {copiedId ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    Copy ID
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Shadcn Tabs Component */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as TabType)}
            className="w-full flex flex-col gap-5"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="profile">
                <UserIcon className="size-3.5" />
                Edit Profile
              </TabsTrigger>
              <TabsTrigger value="security">
                <KeyRound className="size-3.5" />
                Security & Danger
              </TabsTrigger>
            </TabsList>

            {/* Edit Profile Tab Panel */}
            <TabsContent value="profile" className="m-0">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Avatar Picker with Shadcn Buttons */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground block">
                    Choose Avatar Icon
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_PRESETS.map((icon) => {
                      const isSelected = selectedAvatar === icon;
                      return (
                        <Button
                          key={icon}
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedAvatar(icon)}
                          className={cn(
                            "size-10 text-lg rounded-xl transition-all",
                            isSelected
                              ? "bg-gray-50 border-neutral-300 ring-2 ring-neutral-300/80 scale-105 shadow-xs dark:bg-neutral-800 dark:border-neutral-600 dark:ring-neutral-600"
                              : "hover:bg-muted/60",
                          )}
                        >
                          {icon}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="display-name"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Display Name
                  </Label>
                  <Input
                    id="display-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Luqman Hayyan"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="bio"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Short Bio / Motivation
                  </Label>
                  <Input
                    id="bio"
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. Getting things done every day ✨"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Account Email (Read-only)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    disabled
                    value={user?.email}
                    className="text-sm bg-muted text-muted-foreground"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full sm:w-auto"
                  >
                    {isSavingProfile ? "Saving changes..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Security Tab Panel */}
            <TabsContent value="security" className="m-0 space-y-5">
              {/* Change Password */}
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <KeyRound className="size-3.5 text-primary" />
                    Change Password
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Ensure your account stays secure with a strong password
                  </p>
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="current-pwd"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Current Password
                  </Label>
                  <Input
                    id="current-pwd"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="new-pwd"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    New Password
                  </Label>
                  <Input
                    id="new-pwd"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="confirm-pwd"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-pwd"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="text-sm"
                  />
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full sm:w-auto text-xs"
                  >
                    {isChangingPassword
                      ? "Updating password..."
                      : "Update Password"}
                  </Button>
                </div>
              </form>

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3.5">
                <div>
                  <h4 className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                    <ShieldAlert className="size-3.5" />
                    Danger Zone
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Irreversible actions affecting your tasks and account
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 bg-background rounded-lg border border-destructive/20">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Reset All Task Data
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Permanently deletes all tasks associated with your account
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowResetTasksAlert(true)}
                    className="text-xs"
                  >
                    Reset All Tasks
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 bg-background rounded-lg border border-destructive/20">
                  <div>
                    <p className="text-xs font-semibold text-destructive">
                      Delete Account
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Wipes your credentials, profile, and all task data
                      completely
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteAccountAlert(true)}
                    className="text-xs"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Logout Confirmation Alert */}
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again
              to access your tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLogoutAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={logout}>
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Tasks Alert */}
      <AlertDialog
        open={showResetTasksAlert}
        onOpenChange={setShowResetTasksAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all task data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {totalTasks} task
              {totalTasks === 1 ? "" : "s"} from your account. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowResetTasksAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleResetTasks}>
              Yes, Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Alert */}
      <AlertDialog
        open={showDeleteAccountAlert}
        onOpenChange={setShowDeleteAccountAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Permanently delete your account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will completely delete your user profile, authentication
              credentials, and all tasks. You will not be able to recover this
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteAccountAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              Permanently Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
