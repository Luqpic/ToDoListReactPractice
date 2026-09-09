# Multi-select & group drag-reorder for tasks

Date: 2026-09-09

## Summary

Add the ability to select multiple tasks via a right-click context menu,
then bulk-delete them or drag-reorder them together as a group. This
replaces the task list's current single-item drag mechanism (Framer
Motion's `Reorder`) with `@dnd-kit` so both single-item and group
dragging run through one drag engine.

## Scope

In scope:
- Right-click context menu on a task with a "Select" action.
- Selection mode: checkbox-based multi-select, floating action bar,
  bulk delete, group drag-reorder.
- Migrating the existing single-item drag from Framer Motion's
  `Reorder` to `@dnd-kit`.

Out of scope (can follow later if wanted):
- A pixel-accurate stacked-card visual during group drag (see
  "Group-drag visuals" below for the simplified first pass).
- Any change to Edit behavior (stays on the existing "⋮" popover).
- Automated tests — this project has none currently; verification is
  manual (see "Testing plan").

## New dependencies

- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (npm
  packages) — sortable list + drag overlay primitives.
- shadcn `context-menu` component, added via
  `npx shadcn@latest add context-menu` (pulls from the project's
  existing `@base-ui/react` primitives, same as `menubar` and
  `dropdown-menu` already in the project — no extra npm dependency
  beyond what the CLI installs).

## Approach: full migration to dnd-kit (not a dual-engine setup)

`task.tsx` currently drags a single item via Framer Motion's
`Reorder.Group`/`Reorder.Item` + a grip handle
(`src/components/task.tsx`). Rather than adding dnd-kit only for group
drag and keeping `Reorder` for the normal case, both single-item and
group dragging move to dnd-kit's `DndContext` + `SortableContext` +
`useSortable`. Framer Motion's `motion.div`/`AnimatePresence` stay
exactly as they are for layout and enter/exit animation — only the
drag-move mechanics change engines. This avoids maintaining two
parallel drag implementations for the same list and the runtime
mode-switching bugs that would invite.

Trade-off accepted: this means rewriting currently-working drag code,
which needs manual re-verification (see "Testing plan") since this
project has no automated test suite.

## State & component architecture

`TodoPage.tsx` (`src/pages/TodoPage.tsx`) gains:
- `selectionMode: boolean`
- `selectedIds: Set<number>`
- `enterSelectionMode(taskId: number)` — sets `selectionMode = true`,
  seeds `selectedIds` with `taskId`, clears `search`, forces
  `filter = "All"`.
- `toggleSelected(id: number)` — adds/removes `id` from `selectedIds`.
- `selectAll()` — sets `selectedIds` to every task's id.
- `clearSelection()` — clears `selectedIds`, sets `selectionMode = false`
  (re-enables search/filter).
- `bulkDelete()` — removes all tasks whose id is in `selectedIds`. A
  new `AlertDialog` instance (separate from the existing single-task
  delete confirmation) follows the same confirm/cancel pattern already
  used in `TodoPage.tsx`, worded for a bulk action (e.g. "Delete N
  tasks?").

While `selectionMode` is true, the search `Input` and filter `Select`
are disabled (locked to `search = ""`, `filter = "All"`) so
drag-reordering always operates on the real, full list order.

`task.tsx` (`TaskList`) gains props: `selectionMode`, `isSelected`,
`onSelect`. Existing props (`onDelete`, `onEdit`, `onToggle`,
`canReorder`) are unchanged.

- The existing completed-checkbox is repurposed: while
  `selectionMode` is true, it calls `onSelect(task.id)` instead of
  `onToggle(task.id)`. Completion toggling resumes when selection mode
  ends.
- The grip handle is only draggable when the row `isSelected` is true
  and `selectionMode` is active; a non-selected row's grip renders in
  the same disabled/grayed style already used for `canReorder === false`.
  Outside selection mode, the grip behaves exactly as it does today.
- Edit and Delete stay exclusively on the existing "⋮" popover menu —
  not duplicated onto the new context menu.

## Right-click context menu

A new shadcn `ContextMenu` wraps each task's `Card`, with a single
item: **"Select"**. Choosing it calls `enterSelectionMode(task.id)`.

## Floating action bar

Rendered whenever `selectionMode` is true (e.g. pinned below
`CardContent`, above the card's bottom edge):
- "N selected" label
- **Select All** button → `selectAll()`
- **Delete** button (destructive) → opens the new bulk-delete
  `AlertDialog`; confirming calls `bulkDelete()`
- **Done** button → `clearSelection()`

## Group-drag mechanics & visuals

- `DndContext` wraps the list in `TodoPage.tsx`; `SortableContext`
  (vertical list strategy) holds the current task order. Each
  `TaskList` row uses `useSortable`, with drag `listeners` attached
  only to the grip button — same "grab the grip icon" gesture as
  today, not a whole-row drag.
- **Dragging a selected task**: `onDragStart` captures the full
  ordered subset of `selectedIds` (in their current relative order).
  The *other* selected rows fade out from their original positions for
  the duration of the drag — they do not visually follow the cursor as
  a stacked deck. The dragged card renders via dnd-kit's
  `DragOverlay`, with a small count badge (e.g. "3") showing how many
  tasks are moving.

  This is a deliberate simplification of "stack behind the dragged
  card": a true layered-card stack is significant extra visual work
  for a first pass. Badge + fade communicates the same information
  with far less implementation risk. **The user has agreed to try this
  simplified version first and evaluate.**
- **`onDragEnd`**: compute the drop index, remove all selected tasks
  from their old positions, and re-insert them as a contiguous block
  at the drop index (in original relative order), then `setTask(...)`.
- **Dragging a non-selected task while `selectionMode` is true**: no-op
  (disabled grip style, per above).
- **Outside selection mode**: dragging behaves exactly as it does
  today (single item, via the same grip handle), just running through
  dnd-kit's sortable machinery instead of Framer Motion's `Reorder`.

## Persistence

No change: the existing `useEffect` in `TodoPage.tsx` that writes
`task` to `localStorage` under `todo-tasks-${user.id}` on every change
continues to fire for both bulk-delete and group-reorder, same as it
does today for single-item operations.

## Testing plan

This project has no automated test suite (checked: no `*.test.*` /
`*.spec.*` files, no test script in `package.json`). Verification is
manual, in a running dev server:

1. Existing single-item drag still works and feels the same after the
   dnd-kit migration (grip handle, disabled state when
   filter/search active).
2. Right-click a task → "Select" appears → clicking it enters
   selection mode, task is selected, search/filter become disabled.
3. Clicking other tasks' (now-repurposed) checkboxes adds/removes them
   from selection.
4. Floating action bar shows the correct count; Select All selects
   every task; Done exits selection mode and re-enables search/filter.
5. Delete in the action bar shows the confirmation dialog and removes
   only the selected tasks.
6. Dragging a selected task's grip moves the whole selected group to
   the drop position, preserving their relative order; non-selected
   tasks shift to fill the gap.
7. Attempting to drag a non-selected task's grip while selecting does
   nothing.
8. Refresh the page after a bulk delete / group reorder — order and
   remaining tasks persist correctly from `localStorage`.
