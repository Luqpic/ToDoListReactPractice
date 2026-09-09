import "../App.css";
import TaskList from "../components/task.tsx";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import AnimatedHeight from "../components/AnimatedHeight";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { Toaster, toast } from "@/components/ui/toast";
import logo from "../assets/Chatgpt.svg";
import { Plus } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoPage() {
  const { user } = useAuth();
  const storageKey = `todo-tasks-${user!.id}`;

  const [input, setInput] = useState("");
  const [task, setTask] = useState<Task[]>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  });
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const enterSelectionMode = (taskId: number) => {
    setSelectionMode(true);
    setSelectedIds(new Set([taskId]));
    setSearch("");
    setFilter("All");
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(task.map((t) => t.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const [showBulkDeleteAlert, setShowBulkDeleteAlert] = useState(false);

  const bulkDelete = () => {
    setTask((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    setShowBulkDeleteAlert(false);
    clearSelection();
  };

  const canReorder = filter === "All" && search.trim() === "";

  const sensors = useSensors(useSensor(PointerSensor));

  const [activeId, setActiveId] = useState<number | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeIdNum = active.id as number;
    const overIdNum = over.id as number;
    const isGroupDrag = selectionMode && selectedIds.has(activeIdNum);

    setTask((prev) => {
      const movingIds = isGroupDrag
        ? prev.filter((t) => selectedIds.has(t.id)).map((t) => t.id)
        : [activeIdNum];

      const remaining = prev.filter((t) => !movingIds.includes(t.id));
      const moving = prev.filter((t) => movingIds.includes(t.id));

      const overIndexInRemaining = remaining.findIndex(
        (t) => t.id === overIdNum,
      );

      let insertAt: number;
      if (overIndexInRemaining === -1) {
        // Dropping onto another already-selected task (which was just
        // filtered out of `remaining`) falls back to appending at the end.
        // Known first-pass limitation — flagged in the spec for follow-up
        // once this is tried out.
        insertAt = remaining.length;
      } else {
        const overOriginalIndex = prev.findIndex((t) => t.id === overIdNum);
        const movingOriginalIndices = movingIds.map((id) =>
          prev.findIndex((t) => t.id === id),
        );
        const maxMovingOriginalIndex = Math.max(...movingOriginalIndices);
        // Dragging strictly past every moving item (the drop target's
        // original index is after all of them) lands the moved block
        // immediately AFTER the target — this matches dnd-kit's
        // arrayMove semantics for a plain forward single-item drag.
        // Otherwise (a backward drag, or the target originally sitting
        // between two moving items) the block lands immediately BEFORE
        // the target.
        insertAt =
          overOriginalIndex > maxMovingOriginalIndex
            ? overIndexInRemaining + 1
            : overIndexInRemaining;
      }

      return [
        ...remaining.slice(0, insertAt),
        ...moving,
        ...remaining.slice(insertAt),
      ];
    });
  };

  const filteredTask = task
    .filter((t) => {
      if (filter === "Active") return !t.completed;
      if (filter === "Completed") return t.completed;
      return true;
    })
    .filter((t) => t.text.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(task));
  }, [task, storageKey]);

  const addtask = () => {
    if (input.trim() === "") return;
    const newTask = { id: Date.now(), text: input, completed: false };
    setTask([...task, newTask]);
    setInput("");

    const toastId = toast.add({
      title: "Task created",
      description: `"${newTask.text}" was added.`,
      type: "success",
      actionProps: {
        children: "Undo",
        onClick: () => {
          setTask((prev) => prev.filter((t) => t.id !== newTask.id));
          toast.close(toastId);
        },
      },
    });
  };

  const deleteTask = (taskId: number) => {
    const updatedTasks = task.filter((task) => task.id !== taskId);
    setTask(updatedTasks);
  };

  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  const confirmDelete = () => {
    if (taskToDelete !== null) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const editTask = (taskId: number, newText: string) => {
    const updatedTasks = task.map((task) => {
      if (task.id === taskId) {
        return { ...task, text: newText };
      }
      return task;
    });
    setTask(updatedTasks);
  };

  const toggleComplete = (taskId: number) => {
    const updatedTasks = task.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
    setTask(updatedTasks);
  };

  return (
    <div className="min-h-screen  flex justify-center px-4 py-12">
      <Card className="w-full max-w-xl h-fit shadow-md">
        <CardHeader>
          <div className="flex flex-row items-center gap-1">
            <img src={logo} className="w-12 h-12" />
            <CardTitle className="text-2xl font-semibold tracking-tight uppercase">
              TODOLIST
            </CardTitle>
          </div>
          <CardDescription>Keeping track of whachtu doing </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <AnalyticsDashboard tasks={task} />
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="add item . . ."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addtask()}
            />
            <Button className="w-full h-10" onClick={addtask}>
              <Plus />
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              className="flex-1"
              placeholder="search item . . ."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={selectionMode}
            />
            <Select
              value={filter}
              onValueChange={(v) => setFilter(v as string)}
              disabled={selectionMode}
            >
              <SelectTrigger className="w-32 shrink-0">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Filter</SelectLabel>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <AnimatedHeight>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={filteredTask.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredTask.map((task) => (
                      <TaskList
                        key={task.id}
                        task={task}
                        onDelete={(id) => setTaskToDelete(id)}
                        onEdit={editTask}
                        onToggle={toggleComplete}
                        canReorder={canReorder}
                        selectionMode={selectionMode}
                        isSelected={selectedIds.has(task.id)}
                        onEnterSelection={() => enterSelectionMode(task.id)}
                        onSelect={() => toggleSelected(task.id)}
                        isHiddenDuringDrag={
                          activeId !== null &&
                          selectionMode &&
                          selectedIds.has(activeId) &&
                          selectedIds.has(task.id) &&
                          task.id !== activeId
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
              <DragOverlay>
                {activeId !== null
                  ? (() => {
                      const activeTask = task.find((t) => t.id === activeId);
                      if (!activeTask) return null;
                      const isGroupDrag =
                        selectionMode && selectedIds.has(activeId);
                      return (
                        <div className="relative">
                          <Card size="sm" className="bg-muted ring-2 ring-primary min-h-10">
                            <CardContent className="flex items-center px-4 py-2">
                              <span className="text-[1.1rem]">
                                {activeTask.text}
                              </span>
                            </CardContent>
                          </Card>
                          {isGroupDrag && selectedIds.size > 1 && (
                            <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                              {selectedIds.size}
                            </span>
                          )}
                        </div>
                      );
                    })()
                  : null}
              </DragOverlay>
            </DndContext>
          </AnimatedHeight>

          {selectionMode && (
            <div className="flex items-center justify-between rounded-lg border bg-muted px-3 py-2">
              <span className="text-sm font-medium">
                {selectedIds.size} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedIds.size === 0}
                  onClick={() => setShowBulkDeleteAlert(true)}
                >
                  Delete
                </Button>
                <Button variant="secondary" size="sm" onClick={clearSelection}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={taskToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDeleteAlert} onOpenChange={setShowBulkDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowBulkDeleteAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={bulkDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </div>
  );
}
