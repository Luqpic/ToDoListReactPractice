import "./App.css";
import TaskList from "./components/task.tsx";
import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [task, setTask] = useState<{ id: number; text: string }[]>([]);

  const handleAddTask = () => {
    if (input.trim() === "") return;
    const newTask = { id: Date.now(), text: input };
    setTask([...task, newTask]);
    setInput("");
  };

  const deleteTask = (taskId: number) => {
    const updatedTasks = task.filter((task) => task.id !== taskId);
    setTask(updatedTasks);
    {
      task.map((task) => (
        <TaskList
          key={task.id}
          task={task}
          onDelete={deleteTask}
          onEdit={editTask}
        />
      ));
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

  return (
    <div className="todo-app">
      <h1>TODOLIST</h1>

      <div className="input-section">
        <input
          type="text"
          placeholder="add item . . ."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="add-btn" onClick={handleAddTask}>
          ADD
        </button>
      </div>
      <ul className="task-list">
        {task.map((task, index) => (
          <TaskList
            key={index}
            task={task}
            onDelete={deleteTask}
            onEdit={editTask}
          />
        ))}
      </ul>
      <p className="watermark">Practicing React Project by Luqman Hayyan</p>
    </div>
  );
}

export default App;
