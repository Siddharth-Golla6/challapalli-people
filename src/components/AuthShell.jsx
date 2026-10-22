import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-yellow/20 via-white to-brand-red/10 px-4 py-10 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
      <div className="page-enter w-full max-w-md">
        <Link to="/" className="mb-6 flex justify-center">
          <Logo size={48} />
        </Link>
        <div className="glass-card p-7">
          <h1 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-center text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-4 text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}
