import React from "react";

export function Label({ children, htmlFor, required }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
      {children} {required && <span className="text-brand-red">*</span>}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white ${props.className || ""}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white ${props.className || ""}`}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white ${props.className || ""}`}
    />
  );
}
