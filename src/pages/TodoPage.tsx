import "../App.css";
import TaskList from "../components/task.tsx";
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

import { useAuth } from "@/context/AuthContext";

interface Task {
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
  };

  const deleteTask = (taskId: number) => {
    const updatedTasks = task.filter((task) => task.id !== taskId);
    setTask(updatedTasks);
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
    <div className="min-h-screen bg-background flex justify-center px-4 py-12">
      <Card className="w-full max-w-xl h-fit shadow-md">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight uppercase">
              Todolist
            </CardTitle>
            <CardDescription>Keeping track of whachtu doing </CardDescription>
          </div>
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="add item . . ."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addtask()}
            />
            <Button className="w-full h-10" onClick={addtask}>
              ADD
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
                    onDelete={deleteTask}
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
    </div>
  );
}
