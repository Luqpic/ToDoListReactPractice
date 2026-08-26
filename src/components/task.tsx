import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

export interface props {
  task: {
    id: number;
    text: string;
    completed: boolean;
  };
  onDelete: (id: number) => void;
  onEdit: (id: number, newTask: string) => void;
  onToggle: (id: number) => void;
  canReorder: boolean;
}

function TaskList({ task, onDelete, onEdit, onToggle, canReorder }: props) {
  const [isEditing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id, disabled: !canReorder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onEdit(task.id, editValue);
    setEditing(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      size="sm"
      className="bg-muted ring-0 h-10"
    >
      <CardContent className="flex items-center justify-between h-full px-4 py-0 gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={!canReorder}
          className={
            canReorder
              ? "shrink-0 cursor-grab text-muted-foreground touch-none"
              : "shrink-0 cursor-not-allowed text-muted-foreground/40 touch-none"
          }
          aria-label="Drag to reorder"
        >
          <GripVertical size={18} />
        </button>
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
        />
        {isEditing ? (
          <Input
            className="flex-1 h-6 py-1 md:text-[1.1rem] text-[1.1rem] bg-background"
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
