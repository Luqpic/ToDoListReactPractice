import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Task } from "@/pages/TodoPage";
import {
  Plus,
  ListFilter,
  User,
  LogOut,
  Circle,
  CircleCheck,
} from "lucide-react";

const FILTERS = ["All", "Active", "Completed", "Priority"];

function Item({
  children,
  onSelect,
  value,
}: {
  children: ReactNode;
  onSelect: () => void;
  value?: string;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-muted"
    >
      {children}
    </Command.Item>
  );
}

export default function CommandPalette({
  open,
  onOpenChange,
  tasks,
  onToggle,
  onSetFilter,
  onNewTask,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  onToggle: (id: number) => void;
  onSetFilter: (filter: string) => void;
  onNewTask: () => void;
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const run = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  // Rendered through a portal into <body> so the overlay isn't clipped by
  // TodoPage's card, and wrapped in AnimatePresence so the palette can
  // finish an exit animation before it unmounts. cmdk's own Command.Dialog
  // is deliberately not used here: it wraps a Radix dialog that unmounts
  // the instant `open` flips to false, which leaves no outro to animate.
  return createPortal(
    // AnimatePresence tracks exits per direct child, and each needs its own
    // key — wrapping these two in a fragment would hide them from it and the
    // outro would never play.
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => onOpenChange(false)}
        />
      )}
      {/* Centred with mx-auto rather than -translate-x-1/2: motion drives
          `transform` for the intro/outro, so leaving translate utilities off
          this element keeps the two from fighting over it. */}
      {open && (
        <motion.div
          key="panel"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          initial={{ opacity: 0, scale: 0.96, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-x-0 top-[20%] z-50 mx-auto w-full max-w-lg px-4"
        >
          <Command
            label="Command palette"
            // Escape used to be Radix's job; it's ours now that the dialog
            // is hand-composed.
            onKeyDown={(e) => {
              if (e.key === "Escape") onOpenChange(false);
            }}
            className="overflow-hidden rounded-xl border bg-white shadow-2xl"
          >
            <Command.Input
              autoFocus
              placeholder="Type a command or search tasks . . ."
              className="w-full border-b px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Command.List className="max-h-80 overflow-y-auto p-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>

              <Command.Group heading="Actions">
                <Item onSelect={() => run(onNewTask)}>
                  <Plus className="size-4" />
                  New task
                </Item>
                {FILTERS.map((f) => (
                  <Item key={f} onSelect={() => run(() => onSetFilter(f))}>
                    <ListFilter className="size-4" />
                    Filter: {f}
                  </Item>
                ))}
              </Command.Group>

              {tasks.length > 0 && (
                <Command.Group heading="Tasks">
                  {tasks.map((t) => (
                    <Item
                      key={t.id}
                      // cmdk matches on `value`, which defaults to the item's
                      // text. The id keeps two same-named tasks from
                      // collapsing into one.
                      value={`${t.text}-${t.id}`}
                      onSelect={() => run(() => onToggle(t.id))}
                    >
                      {t.completed ? (
                        <CircleCheck className="size-4 text-muted-foreground" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground" />
                      )}
                      <span
                        className={t.completed ? "line-through opacity-60" : ""}
                      >
                        {t.text}
                      </span>
                    </Item>
                  ))}
                </Command.Group>
              )}

              <Command.Group heading="Navigate">
                {!user?.isGuest && (
                  <Item onSelect={() => run(() => navigate("/profile"))}>
                    <User className="size-4" />
                    Go to Profile
                  </Item>
                )}
                <Item onSelect={() => run(logout)}>
                  <LogOut className="size-4" />
                  Log out
                </Item>
              </Command.Group>
            </Command.List>
          </Command>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
