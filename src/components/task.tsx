import "./task.css";
import { useState } from "react";

interface props {
  task: {
    id: number;
    text: string;
    completed: boolean;
  };
  onDelete: (id: number) => void;
  onEdit: (id: number, newTask: string) => void;
  onToggle: (id: number) => void;
}

function TaskList({ task, onDelete, onEdit, onToggle }: props) {
  const [isEditing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);

  const handleSave = () => {
    onEdit(task.id, editValue);
    setEditing(false);
  };

  return (
    <li className="task-item">
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      {isEditing ? (
        <input
          type="text"
          className="task-edit-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
        />
      ) : (
        <span className={`task-text ${task.completed ? "completed" : ""}`}>
          {task.text}
        </span>
      )}
      <div className="task-actions">
        <button className="delete-btn" onClick={() => onDelete(task.id)}>
          Delete
        </button>
        {isEditing ? (
          <button className="edit-btn" onClick={handleSave}>
            Save
          </button>
        ) : (
          <button className="edit-btn" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>
    </li>
  );
}

export default TaskList;
