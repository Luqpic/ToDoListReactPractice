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
import {
  User as UserIcon,
  LogOut,
  Mail,
  Calendar,
  Copy,
  Check,
} from "lucide-react";

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

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [copiedId, setCopiedId] = useState(false);

  // Dialog states
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Profile Edit State
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "🦊");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
                \"{user.bio}\"
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

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as string)}
            className="w-full flex flex-col gap-5"
          >
            <TabsList className="w-full grid grid-cols-1">
              <TabsTrigger value="profile">
                <UserIcon className="size-3.5" />
                Edit Profile
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
    </div>
  );
}
