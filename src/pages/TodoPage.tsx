import "../App.css";
import TaskList from "../components/task.tsx";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  defaultDropAnimationSideEffects,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DropAnimation,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { Checkbox } from "@/components/ui/checkbox";
import logo from "../assets/Chatgpt.svg";
import { Plus, GripVertical } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

// Drop animation for dnd-kit's DragOverlay: fades the floating clone out
// while it eases back to the dropped item's final position, instead of
// popping away the instant the real list settles.
const dropAnimationConfig: DropAnimation = {
  duration: 200,
  easing: "ease",
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      { opacity: 0, transform: CSS.Transform.toString(transform.final) },
    ];
  },
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "1" } },
  }),
};

export interface Task {
  id: number;
  text: string;
  completed: boolean;
}

// Main screen: owns the task list itself, plus every derived and UI state
// that depends on it. Everything else in the app (TaskList rows,
// AnalyticsDashboard) is a child that reads this state via props or asks
// this component to change it via callbacks — see README's "Task state and
// lifting state up" for why.
export default function TodoPage() {
  const { user } = useAuth();
  // Guest tasks live in sessionStorage (gone once the tab closes) instead of
  // localStorage (permanent), so a guest genuinely can't "save" their list.
  const storageKey = `todo-tasks-${user!.id}`;
  const storage = user!.isGuest ? sessionStorage : localStorage;

  const [input, setInput] = useState("");
  const [task, setTask] = useState<Task[]>(() => {
    const stored = storage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  });
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  // Multi-select ("selection mode"): lets the user tick several tasks at
  // once for a group drag or a bulk delete.
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Enters selection mode (if not already in it) and marks `taskId` as the
  // first selected row. Also clears search/filter since selection mode only
  // makes sense against the full, unfiltered list.
  const enterSelectionMode = (taskId: number) => {
    setSelectionMode(true);
    setSelectedIds((prev) => {
      const next = new Set(selectionMode ? prev : []);
      next.add(taskId);
      return next;
    });
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

  const selectedCount = task.filter((t) => selectedIds.has(t.id)).length;

  // Reordering is only safe against the full, unfiltered, unsearched list —
  // a filtered subset's on-screen order wouldn't map cleanly onto indices
  // in the underlying `task` array.
  const canReorder = filter === "All" && search.trim() === "";

  // dnd-kit sensors: pointer drag (with a small activation distance so a
  // plain click/tap doesn't start a drag) and keyboard reordering.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Which task is currently being dragged (drives the DragOverlay and each
  // row's dimmed/hidden state below).
  const [activeId, setActiveId] = useState<number | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Commits a drag: reorders `task` so the dragged item (or, in selection
  // mode, the whole selected group) ends up at the drop target's position.
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

  // What's actually rendered: `task` narrowed by the active filter and
  // search text. Recomputed every render — cheap for a to-do list, and
  // keeps this as the single derived view rather than a second copy of state.
  const filteredTask = task
    .filter((t) => {
      if (filter === "Active") return !t.completed;
      if (filter === "Completed") return t.completed;
      return true;
    })
    .filter((t) => t.text.toLowerCase().includes(search.toLowerCase()));

  // Persist on every change, to whichever backend this session uses.
  useEffect(() => {
    storage.setItem(storageKey, JSON.stringify(task));
  }, [task, storageKey, storage]);

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

  // Deletion goes through a confirmation dialog: `taskToDelete` holds the
  // pending id (and doubles as the dialog's open/closed state) until
  // confirmed or cancelled.
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
          {/* Live progress bar + completed/total/remaining, derived from `task`. */}
          <AnalyticsDashboard tasks={task} />
          {/* New task input; Enter key or the button both call addtask(). */}
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

          {/* Search text + status filter; both disabled while in selection
              mode (see enterSelectionMode) and both drive `filteredTask`. */}
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

          {/* Smoothly resizes as the task list grows/shrinks/filters. */}
          <AnimatedHeight>
            {/* dnd-kit's drag context: wires up sensors and the
                start/end/cancel handlers that actually reorder `task`. */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              {/* Tells dnd-kit the draggable set and their order, so it can
                  compute drag-over positions and swap previews. */}
              <SortableContext
                items={filteredTask.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2 p-1">
                  {/* Animates rows in/out as they're added, deleted, or
                      filtered out of view. */}
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
              {/* Floating clone that follows the cursor while dragging —
                  keeps the real list item from having to double as the
                  drag preview, which is what made drops look glitchy before.
                  Shows a matching grip+checkbox+text so nothing appears to
                  vanish mid-drag, plus a count badge for a group drag. */}
              <DragOverlay dropAnimation={dropAnimationConfig}>
                {(() => {
                  if (activeId === null) return null;
                  const activeTask = task.find((t) => t.id === activeId);
                  if (!activeTask) return null;
                  const isGroupDrag =
                    selectionMode && selectedIds.has(activeId);
                  return (
                    <div className="relative animate-in fade-in-0 zoom-in-95 duration-150">
                      <Card size="sm" className="bg-muted ring-2 ring-inset ring-primary min-h-10">
                        <CardContent className="flex items-center px-4 py-2 gap-2">
                          <span className="shrink-0 text-muted-foreground">
                            <GripVertical size={18} />
                          </span>
                          <Checkbox
                            checked={
                              isGroupDrag ? true : activeTask.completed
                            }
                            disabled
                          />
                          <span className="text-[1.1rem] flex-1">
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
                })()}
              </DragOverlay>
            </DndContext>

            {/* Selection-mode toolbar: select all / bulk delete / done.
                Slides in only while selectionMode is active. */}
            <AnimatePresence>
              {selectionMode && (
                <motion.div
                  initial={{ opacity: 0, y: 16, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 16, height: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 px-1">
                    <div className="flex items-center justify-between rounded-lg border bg-muted px-3 py-2">
                      <span className="text-sm font-medium">
                        {selectedCount} selected
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAll}
                          disabled={
                            selectedCount === task.length || task.length === 0
                          }
                        >
                          Select All
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={selectedCount === 0}
                          onClick={() => setShowBulkDeleteAlert(true)}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={clearSelection}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </AnimatedHeight>
        </CardContent>
      </Card>

      {/* Single-task delete confirmation, driven by taskToDelete. */}
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

      {/* Bulk delete confirmation for selection mode's "Delete" button. */}
      <AlertDialog open={showBulkDeleteAlert} onOpenChange={setShowBulkDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} tasks?</AlertDialogTitle>
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
