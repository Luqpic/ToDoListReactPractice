// Moves every task whose id is in `movingIds` to the drop position marked by
// `overId`, keeping the moved tasks in their original relative order. A
// single-item drag is just a one-element `movingIds`.
export function moveTasks<T extends { id: number }>(
  tasks: T[],
  movingIds: Set<number>,
  overId: number,
): T[] {
  const remaining = tasks.filter((t) => !movingIds.has(t.id));
  const moving = tasks.filter((t) => movingIds.has(t.id));

  const overIndexInRemaining = remaining.findIndex((t) => t.id === overId);

  let insertAt: number;
  if (overIndexInRemaining === -1) {
    // Dropping onto another already-selected task (which was just filtered
    // out of `remaining`) falls back to appending at the end. Known
    // first-pass limitation.
    insertAt = remaining.length;
  } else {
    const overOriginalIndex = tasks.findIndex((t) => t.id === overId);
    const maxMovingOriginalIndex = Math.max(
      ...tasks.flatMap((t, i) => (movingIds.has(t.id) ? [i] : [])),
    );
    // Dragging strictly past every moving item lands the block immediately
    // AFTER the target, matching dnd-kit's arrayMove for a plain forward
    // drag. Otherwise (a backward drag, or a target sitting between two
    // moving items) the block lands immediately BEFORE the target.
    insertAt =
      overOriginalIndex > maxMovingOriginalIndex
        ? overIndexInRemaining + 1
        : overIndexInRemaining;
  }

  return [
    ...remaining.slice(0, insertAt),
    ...moving,
    ...remaining.slice(insertAt),
  ];
}
