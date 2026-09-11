import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ListTodo, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Every possible tab; filtered down per-session below (guests don't get Profile).
const NAV_ITEMS = [
  { label: "Task List", path: "/", icon: ListTodo },
  { label: "Profile", path: "/profile", icon: User },
];

// Top nav bar shown above every protected page: tab switcher between
// Task List / Profile, plus a "Log in" escape hatch for guest sessions.
export default function NavMenubar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Guests have no account to manage, so the Profile tab is hidden rather
  // than shown-and-blocked (ProtectedRoute still enforces this server-side,
  // i.e. even via a direct URL).
  const items = user?.isGuest
    ? NAV_ITEMS.filter((item) => item.path !== "/profile")
    : NAV_ITEMS;

  // Highlight whichever tab matches the current route.
  const currentTab = location.pathname.startsWith("/profile") ? "/profile" : "/";

  return (
    <div className="flex items-center gap-2">
      {/* Tab switcher: navigates on change instead of managing its own state,
          so the URL stays the single source of truth for which page is active. */}
      <Tabs
        value={currentTab}
        onValueChange={(val) => {
          if (typeof val === "string" && val !== location.pathname) {
            navigate(val);
          }
        }}
      >
        <TabsList className="h-9">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger key={item.path} value={item.path} className="px-4">
                <Icon className="size-3.5" />
                {item.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
      {/* Guest-only: Profile (and its logout button) is hidden, so this is
          the only way back to a real login. */}
      {user?.isGuest && (
        <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
          Log in
        </Button>
      )}
    </div>
  );
}
