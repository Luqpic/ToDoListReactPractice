import { describe, it, expect, beforeEach } from "vitest";
import { useTaskStore } from "./taskStore";

const alice = { id: "alice", isGuest: false };
const bob = { id: "bob", isGuest: false };
const guest = { id: "guest", isGuest: true };

const saved = (storage: Storage, id: string) =>
  JSON.parse(storage.getItem(`todo-tasks-${id}`) ?? "null");

// The store is one shared object for the whole test file, so it's reset
// before each test (storage itself is cleared in src/test/setup.ts).
beforeEach(() => {
  useTaskStore.setState({ owner: null, tasks: [] });
});

describe("taskStore", () => {
  it("loads the list saved for that user", () => {
    localStorage.setItem(
      "todo-tasks-alice",
      JSON.stringify([{ id: 1, text: "Alice's task", completed: false }]),
    );
    useTaskStore.getState().loadFor(alice);
    expect(useTaskStore.getState().tasks.map((t) => t.text)).toEqual([
      "Alice's task",
    ]);
  });

  it("saves changes under the current user's key", () => {
    useTaskStore.getState().loadFor(alice);
    useTaskStore.getState().add("Buy milk");
    expect(saved(localStorage, "alice")).toHaveLength(1);
  });

  it("saves a guest's tasks to sessionStorage only", () => {
    useTaskStore.getState().loadFor(guest);
    useTaskStore.getState().add("Temporary");
    expect(saved(sessionStorage, "guest")).toHaveLength(1);
    expect(saved(localStorage, "guest")).toBeNull();
  });

  it("never writes the previous user's tasks under the next user's key", () => {
    useTaskStore.getState().loadFor(alice);
    useTaskStore.getState().add("Alice's secret");
    useTaskStore.getState().loadFor(bob);

    expect(useTaskStore.getState().tasks).toEqual([]);
    expect(saved(localStorage, "bob")).toBeNull();
  });
});
