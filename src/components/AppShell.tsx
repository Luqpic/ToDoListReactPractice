import { useLayoutEffect, type ReactNode } from "react";
import NavMenubar from "@/components/NavMenubar";
import { useAuth } from "@/context/AuthContext";
import { useTaskStore } from "@/stores/taskStore";

// Shared chrome for every protected page: renders the top nav bar above
// whatever page content is passed in as `children`. Also points the task
// store at this session's list, since both protected pages read it.
export default function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const isGuest = user?.isGuest ?? false;

  const ownerId = useTaskStore((s) => s.owner?.id);
  const loadFor = useTaskStore((s) => s.loadFor);

  // A layout effect runs before the browser paints, so the previous user's
  // tasks are never shown, not even for one frame.
  useLayoutEffect(() => {
    if (userId) loadFor({ id: userId, isGuest });
  }, [userId, isGuest, loadFor]);

  return (
    <>
      <div className="flex justify-center px-4 pt-6">
        <div className="w-full max-w-xl flex justify-center">
          <NavMenubar />
        </div>
      </div>
      {/* Pages wait until the store holds this user's list. */}
      {ownerId === userId ? children : null}
    </>
  );
}
