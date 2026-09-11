import { Progress } from "@/components/ui/progress";
import type { Task } from "../pages/TodoPage";

interface AnalyticsDashboardProps {
  tasks: Task[];
}

// Read-only summary of the task list: a progress bar plus a completed/total/
// remaining count. Holds no state of its own — everything is derived fresh
// from the `tasks` prop on every render, so it stays in sync with TodoPage's
// task state automatically.
export default function AnalyticsDashboard({ tasks }: AnalyticsDashboardProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const remaining = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col gap-2">
      <Progress value={percent} />
      <p className="text-sm text-muted-foreground">
        {completed} of {total} completed · {remaining} remaining
      </p>
    </div>
  );
}
