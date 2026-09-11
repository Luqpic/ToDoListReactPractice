import { motion } from "motion/react";
import type { ReactNode } from "react";

// Enter/exit motion for a page: fades and slides in from below, slides out
// upward — driven by AnimatePresence in App.tsx on route change.
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

// Wraps a page's content so every route gets the same enter/exit animation
// without repeating the motion config on each page component.
export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
