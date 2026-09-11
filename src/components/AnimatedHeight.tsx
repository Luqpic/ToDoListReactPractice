import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";

// Animates height changes on its content instead of letting them snap, so a
// container (e.g. the task list) smoothly grows/shrinks as items are
// added, removed, or filtered — without knowing the content's height ahead
// of time.
export default function AnimatedHeight({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  // Track the real, unclipped height of the content via ResizeObserver, so
  // `height` always reflects the current content size.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // The measured height animates on the wrapper; overflow:hidden clips
    // the content mid-transition so it doesn't visually spill out.
    <motion.div
      animate={{ height }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ overflow: "hidden" }}
    >
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
}
