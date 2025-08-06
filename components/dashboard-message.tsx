import { motion, AnimatePresence } from "framer-motion";

export function DashboardMessage({ message }: { message: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4 }}
        className="mb-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 px-6 py-3 font-medium shadow"
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
} 