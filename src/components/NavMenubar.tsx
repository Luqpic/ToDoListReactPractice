import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ListTodo, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "Task List", path: "/", icon: ListTodo },
  { label: "Profile", path: "/profile", icon: User },
];

export default function NavMenubar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const items = user?.isGuest
    ? NAV_ITEMS.filter((item) => item.path !== "/profile")
    : NAV_ITEMS;

  const currentTab = location.pathname.startsWith("/profile") ? "/profile" : "/";

  return (
    <div className="flex items-center gap-2">
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
      {user?.isGuest && (
        <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
          Log in
        </Button>
      )}
    </div>
  );
}
