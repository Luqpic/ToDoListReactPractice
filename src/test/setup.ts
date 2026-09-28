import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Without Vitest globals, Testing Library can't register its own
// auto-cleanup, so each test would see the previous test's rendered DOM.
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
