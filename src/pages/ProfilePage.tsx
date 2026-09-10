import { useState, useRef } from "react";
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
  Download,
  Upload,
  Copy,
  Check,
  Database,
  CheckCheck,
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
  const [showClearCompletedAlert, setShowClearCompletedAlert] = useState(false);

  // Profile Edit State
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "🦊");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats calculation
  const completedTasks = tasks.filter((t) => t.completed).length;

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

  // Data Export - JSON
  const handleExportJSON = () => {
    if (tasks.length === 0) {
      toast.add({
        title: "No tasks to export",
        description: "Add some tasks before exporting.",
        type: "info",
      });
      return;
    }
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `todo-backup-${user?.email?.split("@")[0] || "tasks"}-${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast.add({
      title: "Exported successfully",
      description: `Downloaded ${tasks.length} tasks as JSON.`,
      type: "success",
    });
  };

  // Data Export - CSV
  const handleExportCSV = () => {
    if (tasks.length === 0) {
      toast.add({
        title: "No tasks to export",
        description: "Add some tasks before exporting.",
        type: "info",
      });
      return;
    }
    const headers = ["ID", "Task Description", "Completed"];
    const rows = tasks.map((t) => [
      t.id,
      `"${t.text.replace(/"/g, '""')}"`,
      t.completed ? "Yes" : "No",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute(
      "download",
      `todo-backup-${user?.email?.split("@")[0] || "tasks"}-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast.add({
      title: "Exported successfully",
      description: `Downloaded ${tasks.length} tasks as CSV.`,
      type: "success",
    });
  };

  // Data Import - JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error("Invalid file: Must contain an array of tasks.");
        }
        const validTasks: Task[] = parsed
          .filter((item) => item && typeof item.text === "string")
          .map((item, idx) => ({
            id: typeof item.id === "number" ? item.id : Date.now() + idx,
            text: String(item.text),
            completed: Boolean(item.completed),
          }));

        if (validTasks.length === 0) {
          throw new Error("No valid task entries found in the file.");
        }

        const existingIds = new Set(tasks.map((t) => t.id));
        const newTasks = validTasks.filter((t) => !existingIds.has(t.id));
        const merged = [...tasks, ...newTasks];

        localStorage.setItem(storageKey, JSON.stringify(merged));
        setTasks(merged);

        toast.add({
          title: "Tasks imported",
          description: `Imported ${newTasks.length} new tasks successfully!`,
          type: "success",
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to parse JSON";
        toast.add({
          title: "Import failed",
          description: message,
          type: "error",
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    const uncompleted = tasks.filter((t) => !t.completed);
    const countCleared = tasks.length - uncompleted.length;
    localStorage.setItem(storageKey, JSON.stringify(uncompleted));
    setTasks(uncompleted);
    setShowClearCompletedAlert(false);
    toast.add({
      title: "Completed tasks cleared",
      description: `Removed ${countCleared} completed task${countCleared === 1 ? "" : "s"}.`,
      type: "success",
    });
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

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as string)}
            className="w-full flex flex-col gap-5"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="profile">
                <UserIcon className="size-3.5" />
                Edit Profile
              </TabsTrigger>
              <TabsTrigger value="data">
                <Database className="size-3.5" />
                Data & Backup
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

            {/* Data & Backup Tab Panel */}
            <TabsContent value="data" className="m-0 space-y-4">
              {/* Export & Backup */}
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Download className="size-3.5 text-primary" />
                    Export & Backup Tasks
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Download your tasks to keep a local backup or migrate to another device
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Button
                    variant="outline"
                    className="flex-1 justify-center gap-2 h-9 text-xs"
                    onClick={handleExportJSON}
                  >
                    <Download className="size-3.5" />
                    Export as JSON (.json)
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 justify-center gap-2 h-9 text-xs"
                    onClick={handleExportCSV}
                  >
                    <Download className="size-3.5" />
                    Export as CSV (.csv)
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Import Tasks */}
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Upload className="size-3.5 text-primary" />
                    Import Tasks
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Restore previously exported tasks from a JSON backup file
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
                <div className="border-2 border-dashed rounded-xl p-5 text-center hover:bg-muted/40 transition-all flex flex-col items-center justify-center gap-2">
                  <Database className="size-7 text-muted-foreground/60" />
                  <p className="text-xs text-muted-foreground">
                    Upload a valid JSON backup file to merge tasks
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 text-xs"
                  >
                    Select JSON File
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Clean up completed tasks */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-muted/20">
                <div>
                  <p className="text-xs font-medium flex items-center gap-1.5">
                    <CheckCheck className="size-3.5 text-emerald-500" />
                    {completedTasks} completed task{completedTasks === 1 ? "" : "s"} found
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Keep your workspace tidy by clearing finished items.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={completedTasks === 0}
                  onClick={() => setShowClearCompletedAlert(true)}
                  className="text-xs"
                >
                  Clear Completed
                </Button>
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

      {/* Clear Completed Alert */}
      <AlertDialog
        open={showClearCompletedAlert}
        onOpenChange={setShowClearCompletedAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear completed tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all finished tasks ({completedTasks} item
              {completedTasks === 1 ? "" : "s"}). Active pending tasks will not
              be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowClearCompletedAlert(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleClearCompleted}
            >
              Clear Completed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
