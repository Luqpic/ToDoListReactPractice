import "./App.css";
import TaskList from "./components/task.tsx";
import { useState, useEffect } from "react";

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

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = "todo-tasks";

function App() {
  const [input, setInput] = useState("");
  const [task, setTask] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [filter, setFilter] = useState("all");

  const filteredTask = task.filter((task) => {
    if (filter === "all") return true;
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(task));
  }, [task]);

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
    <div className="todo-app">
      <h1>TODOLIST</h1>

      <div className="input-section">
        <Input
          type="text"
          placeholder="add item . . ."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addtask()}
        />
        <Select>
          <SelectTrigger className="w-50 max-w-50 h-10 m-1 flex self-center">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter</SelectLabel>
              <SelectItem value="all" onClick={() => setFilter("all")}>
                All
              </SelectItem>
              <SelectItem value="active" onClick={() => setFilter("active")}>
                Active
              </SelectItem>
              <SelectItem
                value="completed"
                onClick={() => setFilter("completed")}
              >
                Completed
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button className="w-50 h-10 m-1 flex self-center" onClick={addtask}>
          ADD
        </Button>
      </div>
      <ul className="task-list">
        {filteredTask.map((task) => (
          <TaskList
            key={task.id}
            task={task}
            onDelete={deleteTask}
            onEdit={editTask}
            onToggle={toggleComplete}
          />
        ))}
      </ul>
      <p className="watermark">Practicing React Project by Luqman Hayyan</p>
    </div>
  );
}

export default App;
