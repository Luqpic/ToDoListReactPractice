import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";

export default function AnimatedHeight({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

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
    <motion.div
      animate={{ height }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ overflow: "hidden" }}
    >
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
}
