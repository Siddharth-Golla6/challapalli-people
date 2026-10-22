import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { IS_MOCK } from "../lib/api";
import { toast } from "../lib/motion";

// Note: this banner is bundled live in production *because* mock mode is
// on (`VITE_USE_MOCK=true` in the deployed build). It stays visible on the
// hosted demo and dismisses with a soft slide/scale via AnimatePresence.
export default function MockBanner() {
  const [open, setOpen] = useState(true);
  if (!IS_MOCK) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mock-banner"
          variants={toast}
          initial="initial"
          animate="animate"
          exit="exit"
          className="pointer-events-auto fixed bottom-4 right-4 z-50 flex max-w-xs items-start gap-2 rounded-lg border border-amber-300 bg-amber-50/95 px-3 py-2 text-xs text-amber-900 shadow-lg backdrop-blur dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100"
        >
          <div className="flex-1 leading-snug">
            <p className="font-bold">Mock data — no backend connected</p>
            <p className="mt-0.5 opacity-80">
              Resident <span className="font-mono">9876500001</span> · Admin <span className="font-mono">9876500000</span> · password <span className="font-mono">demo1234</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Dismiss"
            className="rounded p-0.5 hover:bg-amber-200/60 dark:hover:bg-amber-500/20"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
