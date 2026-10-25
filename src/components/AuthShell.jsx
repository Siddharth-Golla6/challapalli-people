import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, MapPin, Globe } from "lucide-react";
import Logo from "./Logo";
import { useLang } from "../context/LanguageContext";

// Shared layout for Login / Register / Forgot Password / Admin Login.
// Desktop: split-screen with a branded showcase panel on the left and the
// form card on the right. Mobile: single column, form only (showcase
// collapses to a slim banner above the form).
export default function AuthShell({ title, subtitle, children, footer }) {
  const { t } = useLang();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-brand-yellow/20 via-white to-brand-red/10 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
      {/* Showcase panel — hidden on mobile, visible from lg+ */}
      <aside className="relative hidden overflow-hidden lg:flex lg:w-5/12 lg:flex-col lg:justify-between bg-gradient-to-br from-brand-green via-emerald-700 to-emerald-900 px-10 py-12 text-white">
        {/* Oversized backdrop word — the same identity device the landing
            page uses, dropped straight into the login hero to tie the two
            surfaces together. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-16 select-none font-display text-[14rem] font-black leading-none tracking-tight text-brand-yellow/15"
        >
          CHALLAPALLI
        </span>

        {/* Soft radial decoration */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-yellow/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-brand-red/20 blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/logo.png" alt="challapalli.people" width={56} height={56} className="rounded-full ring-2 ring-brand-yellow/40" />
            <span className="font-display text-xl font-extrabold tracking-tight">challapalli.people</span>
          </Link>
          <p className="mt-10 max-w-sm text-sm font-semibold uppercase tracking-widest text-brand-yellow">
            {t("brand.taglineDot")}
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight">
            {t("login.hero.title")}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
            {t("login.hero.subtitle")}
          </p>
        </div>

        <ul className="relative z-10 mt-10 space-y-3 text-sm text-white/90">
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
              <MapPin size={14} strokeWidth={2.5} />
            </span>
            <span>{t("login.hero.feature1")}</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
              <ShieldCheck size={14} strokeWidth={2.5} />
            </span>
            <span>{t("login.hero.feature2")}</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
              <Globe size={14} strokeWidth={2.5} />
            </span>
            <span>{t("login.hero.feature3")}</span>
          </li>
        </ul>
      </aside>

      {/* Form panel — fills the whole viewport on mobile; right half on lg+ */}
      <main className="flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-8 lg:w-7/12">
        <div className="page-enter w-full max-w-md">
          {/* Mobile-only logo (the showcase handles branding on lg+). */}
          <Link to="/" className="mb-6 flex justify-center lg:hidden">
            <Logo size={56} />
          </Link>

          <div className="rounded-2xl border border-neutral-200/70 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80 sm:p-10">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
            )}
            <div className="mt-7">{children}</div>
          </div>

          {footer && <div className="mt-5 text-center text-sm">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
