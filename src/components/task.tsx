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

// One row's worth of props: the task itself, callbacks TodoPage already has
// bound to its own setTask logic, and flags describing how this row should
// currently behave (reorder allowed, selection mode, drag state).
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

// Renders a single task row: drag handle, checkbox, editable text, and an
// actions popover (edit/delete). Holds no task data itself — everything
// about the task's content and ordering lives in the parent (TodoPage).
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
  // Inline-edit state: a local draft of the text, only committed via
  // handleSave (so cancelling/navigating away never touches the real task).
  const [isEditing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);

  const [menuOpen, setMenuOpen] = useState(false);

  // In selection mode, only a selected row is draggable (for a group drag);
  // otherwise it follows the page-level canReorder flag (disabled while
  // filtering/searching, since index-based reordering would be ambiguous).
  const dragEnabled = selectionMode ? isSelected : canReorder;

  // dnd-kit's per-item sortable hook: reports this row's live drag position
  // (transform) and hands back the pieces needed to wire up the drag handle.
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
    // Plain wrapper carries dnd-kit's live drag transform (translate while
    // dragging); kept separate from the motion.div below so the two
    // animation systems (dnd-kit's transform, framer-motion's opacity/scale)
    // don't fight over the same element's style.
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={false}
        animate={{
          // Hidden entirely for the other selected rows during a group
          // drag (they're represented by the single DragOverlay instead);
          // dimmed while this exact row is the one being dragged solo.
          opacity: isHiddenDuringDrag ? 0 : isDragging ? 0.4 : 1,
          scale: 1,
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={layoutTransition}
      >
        {/* Right-click menu: enter/leave selection mode */}
        <ContextMenu>
          <ContextMenuTrigger>
            <Card
              size="sm"
              onClick={(e) => {
                if (!selectionMode) return;
                // Avoid double triggering if clicking interactive elements inside card
                if (
                  (e.target as HTMLElement).closest(
                    'button, [data-slot="checkbox"], input'
                  )
                ) {
                  return;
                }
                onSelect();
              }}
              className={cn(
                "bg-muted ring-0 min-h-10 transition-all",
                selectionMode && "cursor-pointer select-none hover:bg-muted/80",
                selectionMode &&
                  isSelected &&
                  "ring-2 ring-inset ring-primary bg-accent/40",
              )}
            >
              <CardContent className="flex items-center justify-between h-full px-4 py-2 gap-2">
                {/* Drag handle: the only element wired to dnd-kit's pointer
                    listeners, so dragging only starts from here, not the
                    whole row. */}
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
                {/* Doubles as the row's selection checkbox in selection mode,
                    or its completed/incomplete toggle otherwise. */}
                <Checkbox
                  checked={selectionMode ? isSelected : task.completed}
                  onCheckedChange={() =>
                    selectionMode ? onSelect() : onToggle(task.id)
                  }
                />
                {/* Task text, or its inline edit input; `layout` animates
                    the size change between the two instead of snapping. */}
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
                {/* While editing: a save button. Otherwise: the actions
                    popover (edit / delete). */}
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
          {/* The right-click menu's single item toggles selection mode /
              this row's selection, depending on whether it's already active. */}
          <ContextMenuContent>
            {selectionMode ? (
              <ContextMenuItem onClick={onSelect}>
                {isSelected ? "Deselect" : "Select"}
              </ContextMenuItem>
            ) : (
              <ContextMenuItem onClick={onEnterSelection}>
                Select
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>
      </motion.div>
    </div>
  );
}

export default TaskList;
