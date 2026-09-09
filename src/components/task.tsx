import { useState } from "react";
import { motion } from "motion/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

import { MoreVertical } from "lucide-react"; // already a dependency here (see GripVertical import)
import { Trash2 } from "lucide-react";
import { Pencil } from "lucide-react";
import { SavePen } from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ButtonGroup } from "@/components/ui/button-group";

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
  selectionMode: boolean;
  isSelected: boolean;
  onEnterSelection: () => void;
  onSelect: () => void;
  isHiddenDuringDrag: boolean;
}

function TaskList({
  task,
  onDelete,
  onEdit,
  onToggle,
  canReorder,
  selectionMode,
  isSelected,
  onEnterSelection,
  onSelect,
  isHiddenDuringDrag,
}: props) {
  const [isEditing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);

  const [menuOpen, setMenuOpen] = useState(false);

  const dragEnabled = selectionMode ? isSelected : canReorder;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !dragEnabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onEdit(task.id, editValue);
    setEditing(false);
  };

  const layoutTransition = { duration: 0.2, ease: "easeOut" } as const;

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={false}
        animate={{
          opacity: isHiddenDuringDrag ? 0 : isDragging ? 0.4 : 1,
          scale: 1,
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={layoutTransition}
      >
        <ContextMenu>
          <ContextMenuTrigger>
            <Card
              size="sm"
              className={cn(
                "bg-muted ring-0 min-h-10",
                selectionMode && isSelected && "ring-2 ring-primary",
              )}
            >
              <CardContent className="flex items-center justify-between h-full px-4 py-2 gap-2">
                <button
                  type="button"
                  ref={setActivatorNodeRef}
                  {...attributes}
                  {...listeners}
                  onTouchStart={(e) => e.stopPropagation()}
                  disabled={!dragEnabled}
                  className={
                    dragEnabled
                      ? "shrink-0 cursor-grab text-muted-foreground touch-none"
                      : "shrink-0 cursor-not-allowed text-muted-foreground/40 touch-none"
                  }
                  aria-label="Drag to reorder"
                >
                  <GripVertical size={18} />
                </button>
                <Checkbox
                  checked={selectionMode ? isSelected : task.completed}
                  onCheckedChange={() =>
                    selectionMode ? onSelect() : onToggle(task.id)
                  }
                />
                <motion.div
                  layout
                  layoutDependency={isEditing}
                  transition={layoutTransition}
                  className="flex-1"
                >
                  {isEditing ? (
                    <Input
                      className="h-6 py-1 md:text-[1.1rem] text-[1.1rem] bg-background"
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    <span
                      className={`text-[1.1rem] ${
                        task.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.text}
                    </span>
                  )}
                </motion.div>
                <div className="flex gap-2 shrink-0">
                  {isEditing ? (
                    <Button variant="outline" onClick={handleSave}>
                      <SavePen />
                    </Button>
                  ) : (
                    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Task actions"
                            className="text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground transition-colors"
                          />
                        }
                      >
                        <MoreVertical />
                      </PopoverTrigger>
                      <PopoverContent
                        side="left"
                        align="center"
                        className="w-auto p-1"
                      >
                        <ButtonGroup>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setEditing(true);
                              setMenuOpen(false);
                            }}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => onDelete(task.id)}
                          >
                            <Trash2 />
                          </Button>
                        </ButtonGroup>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </CardContent>
            </Card>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={onEnterSelection}>Select</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </motion.div>
    </div>
  );
}

export default TaskList;
