import { create } from "zustand";
import { moveTasks } from "@/lib/reorder";

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string;
}

// Whose list is loaded. Tasks are stored per user, and guests use
// sessionStorage (gone when the tab closes) so a guest can't really "save".
interface TaskOwner {
  id: string;
  isGuest: boolean;
}

interface TaskState {
  owner: TaskOwner | null;
  tasks: Task[];
  loadFor: (owner: TaskOwner) => void;
  add: (text: string) => Task;
  remove: (id: number) => void;
  removeMany: (ids: Set<number>) => void;
  edit: (id: number, text: string) => void;
  toggle: (id: number) => void;
  setDueDate: (id: number, dueDate: string | undefined) => void;
  reorder: (movingIds: Set<number>, overId: number) => void;
  clear: () => void;
}

const storageKey = (owner: TaskOwner) => `todo-tasks-${owner.id}`;
const storageFor = (owner: TaskOwner) =>
  owner.isGuest ? sessionStorage : localStorage;

function readTasks(owner: TaskOwner): Task[] {
  try {
    const stored = storageFor(owner).getItem(storageKey(owner));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

const updateTask = (tasks: Task[], id: number, changes: Partial<Task>) =>
  tasks.map((t) => (t.id === id ? { ...t, ...changes } : t));

export const useTaskStore = create<TaskState>()((set) => ({
  owner: null,
  tasks: [],

  loadFor: (owner) => set({ owner, tasks: readTasks(owner) }),

  add: (text) => {
    const task: Task = { id: Date.now(), text, completed: false };
    set((s) => ({ tasks: [...s.tasks, task] }));
    return task;
  },

  remove: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  removeMany: (ids) =>
    set((s) => ({ tasks: s.tasks.filter((t) => !ids.has(t.id)) })),

  edit: (id, text) =>
    set((s) => ({ tasks: updateTask(s.tasks, id, { text }) })),

  toggle: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    })),

  setDueDate: (id, dueDate) =>
    set((s) => ({ tasks: updateTask(s.tasks, id, { dueDate }) })),

  reorder: (movingIds, overId) =>
    set((s) => ({ tasks: moveTasks(s.tasks, movingIds, overId) })),

  clear: () => set({ tasks: [] }),
}));

// Saves the list after every change. A change that also switches the owner
// is a load (the data just came from storage), so it's skipped: writing
// there is how one user's tasks could end up under another user's key.
useTaskStore.subscribe((state, prev) => {
  if (
    !state.owner ||
    state.owner !== prev.owner ||
    state.tasks === prev.tasks
  ) {
    return;
  }
  storageFor(state.owner).setItem(
    storageKey(state.owner),
    JSON.stringify(state.tasks),
  );
});
