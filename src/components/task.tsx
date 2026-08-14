import "./task.css";
import { useState } from "react";

interface props {
  task: {
    id: number;
    text: string;
  };
  onDelete: (id: number) => void;
  onEdit: (id: number, newTask: string) => void;
}

function TaskList({ task, onDelete, onEdit }: props) {
  const [isEditing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);

  const handleSave = () => {
    onEdit(task.id, editValue);
    setEditing(false);
  };

  return (
    <li className="task-item">
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
        />
      ) : (
        <span className="task-text">{task.text}</span>
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
