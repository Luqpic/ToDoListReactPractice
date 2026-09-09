import type { ReactNode } from "react";
import NavMenubar from "@/components/NavMenubar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="flex justify-center px-4 pt-6">
        <div className="w-full max-w-xl flex justify-center">
          <NavMenubar />
        </div>
      </div>
      {children}
    </>
  );
}
