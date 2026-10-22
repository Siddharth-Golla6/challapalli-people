import React from "react";
import { useLang } from "../context/LanguageContext";

// Status styles include a small coloured dot so meaning is not conveyed
// by colour alone — the label stays legible for colour-blind users and
// in high-contrast modes.
export const STATUS_STYLES = {
  New: {
    chip: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  Verified: {
    chip: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  "In Progress": {
    chip: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  "Waiting for Funds": {
    chip: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  Completed: {
    chip: "bg-status-success-bg text-status-success-fg dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-status-success",
  },
  Rejected: {
    chip: "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
    dot: "bg-neutral-500",
  },
};

export const PRIORITY_STYLES = {
  Critical: "bg-brand-red text-white",
  Medium: "bg-brand-yellow text-neutral-900",
  Low: "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
};

export function StatusBadge({ status }) {
  const { t } = useLang();
  const style = STATUS_STYLES[status] || STATUS_STYLES.New;
  return (
    <span className={`badge ${style.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {t(`status.${status}`)}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const { t } = useLang();
  return (
    <span className={`badge font-bold ${PRIORITY_STYLES[priority] || ""}`}>
      {t(`priority.${priority}`)}
    </span>
  );
}
