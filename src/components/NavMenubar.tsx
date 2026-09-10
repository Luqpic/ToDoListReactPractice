import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListTodo, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Task List", path: "/", icon: ListTodo },
  { label: "Profile", path: "/profile", icon: User },
];

export default function NavMenubar() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname.startsWith("/profile") ? "/profile" : "/";

  return (
    <Tabs
      value={currentTab}
      onValueChange={(val) => {
        if (typeof val === "string" && val !== location.pathname) {
          navigate(val);
        }
      }}
    >
      <TabsList className="h-9">
        {NAV_ITEMS.map((item) => {
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
  );
}
