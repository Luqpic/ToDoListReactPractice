import { useLocation, useNavigate } from "react-router-dom";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Task List", path: "/" },
  { label: "Profile", path: "/profile" },
];

export default function NavMenubar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Menubar>
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <MenubarMenu key={item.path}>
            <MenubarTrigger
              onClick={() => navigate(item.path)}
              aria-current={isActive ? "page" : undefined}
              className={cn(isActive && "bg-muted")}
            >
              {item.label}
            </MenubarTrigger>
          </MenubarMenu>
        );
      })}
    </Menubar>
  );
}
