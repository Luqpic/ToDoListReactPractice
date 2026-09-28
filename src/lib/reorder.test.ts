import { describe, it, expect } from "vitest";
import { arrayMove } from "@dnd-kit/sortable";
import { moveTasks } from "./reorder";

const tasks = [1, 2, 3, 4, 5].map((id) => ({ id }));
const ids = (list: { id: number }[]) => list.map((t) => t.id);

describe("moveTasks: single-item drag", () => {
  // dnd-kit's arrayMove is the reference behaviour for a one-item drag, so
  // every from/to pair in a five-item list must agree with it.
  it("matches dnd-kit's arrayMove for every possible single drag", () => {
    for (let from = 0; from < tasks.length; from++) {
      for (let to = 0; to < tasks.length; to++) {
        if (from === to) continue;
        const moved = moveTasks(tasks, new Set([tasks[from].id]), tasks[to].id);
        expect(ids(moved), `drag ${from} -> ${to}`).toEqual(
          ids(arrayMove(tasks, from, to)),
        );
      }
    }
  });
});

describe("moveTasks: group drag", () => {
  it("lands the group after the target when dragged forward", () => {
    expect(ids(moveTasks(tasks, new Set([1, 3]), 5))).toEqual([2, 4, 5, 1, 3]);
  });

  it("lands the group before a target sitting between moved items", () => {
    expect(ids(moveTasks(tasks, new Set([1, 4]), 2))).toEqual([1, 4, 2, 3, 5]);
  });

  it("keeps list order, not the order tasks were selected in", () => {
    expect(ids(moveTasks(tasks, new Set([3, 1]), 5))).toEqual([2, 4, 5, 1, 3]);
  });

  // Documents current behaviour rather than endorsing it: see the
  // "known first-pass limitation" comment in reorder.ts. If that gets fixed,
  // this test should change with it.
  it("appends the group to the end when dropped onto a selected task", () => {
    expect(ids(moveTasks(tasks, new Set([1, 3]), 3))).toEqual([2, 4, 5, 1, 3]);
  });
});

describe("moveTasks: purity", () => {
  it("does not mutate the input list", () => {
    const input = [...tasks];
    moveTasks(input, new Set([1]), 4);
    expect(ids(input)).toEqual([1, 2, 3, 4, 5]);
  });
});
