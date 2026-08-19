import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card size="sm" className="bg-muted ring-0">
      <CardContent className="flex items-center gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
        />
        {isEditing ? (
          <Input
            className="flex-1 h-auto py-1 md:text-[1.1rem] text-[1.1rem] bg-background"
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
        ) : (
          <span
            className={`flex-1 text-[1.1rem] ${
              task.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.text}
          </span>
        )}
        <div className="flex gap-2 shrink-0">
          <Button variant="destructive" onClick={() => onDelete(task.id)}>
            Delete
          </Button>
          {isEditing ? (
            <Button variant="outline" onClick={handleSave}>
              Save
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TaskList;
