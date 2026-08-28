import "../App.css";
import TaskList from "../components/task.tsx";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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
import { MoveUpRight } from "lucide-react";
import { Plus } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoPage() {
  const { user, logout } = useAuth();
  const storageKey = `todo-tasks-${user!.id}`;

  const [input, setInput] = useState("");
  const [task, setTask] = useState<Task[]>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  });
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  const canReorder = filter === "All" && search.trim() === "";

  const filteredTask = task
    .filter((t) => {
      if (filter === "Active") return !t.completed;
      if (filter === "Completed") return t.completed;
      return true;
    })
    .filter((t) => t.text.toLowerCase().includes(search.toLowerCase()));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTask((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === active.id);
      const newIndex = prev.findIndex((t) => t.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

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
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex flex-row items-center gap-1">
              <img src={logo} className="w-12 h-12" />
              <CardTitle className="text-2xl font-semibold tracking-tight uppercase">
                TODOLIST
              </CardTitle>
            </div>
            <CardDescription>Keeping track of whachtu doing </CardDescription>
          </div>
          <Button variant="destructive" onClick={logout}>
            <MoveUpRight />
            Log out
          </Button>
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
            />
            <Select
              value={filter}
              onValueChange={(v) => setFilter(v as string)}
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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTask.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-2">
                {filteredTask.map((task) => (
                  <TaskList
                    key={task.id}
                    task={task}
                    onDelete={(id) => setTaskToDelete(id)}
                    onEdit={editTask}
                    onToggle={toggleComplete}
                    canReorder={canReorder}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
      <p className="watermark">Practicing React Project by Luqman Hayyan</p>
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
      <Toaster />
    </div>
  );
}
