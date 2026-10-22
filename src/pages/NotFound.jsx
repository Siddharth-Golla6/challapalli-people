import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Map,
  Info,
  ArrowLeft,
  Compass,
  Search,
} from "lucide-react";
import { useLang } from "../context/LanguageContext";
import LandingNavbar from "../components/LandingNavbar";

// Each suggestion is a tile the user can tap/click to escape the dead-end.
// Picked for the paths residents hit most often; icons are decorative, so
// aria-hidden is set on them to avoid double-reading in screen readers.
const SUGGESTIONS = [
  { to: "/", icon: Home, titleKey: "nav.home", textKey: "notFound.suggestionHome" },
  { to: "/dashboard", icon: LayoutDashboard, titleKey: "nav.dashboard", textKey: "notFound.suggestionDashboard" },
  { to: "/report", icon: FileText, titleKey: "nav.report", textKey: "notFound.suggestionReport" },
  { to: "/voice", icon: MessageSquare, titleKey: "nav.voice", textKey: "notFound.suggestionVoice" },
  { to: "/wards", icon: Map, titleKey: "nav.ward", textKey: "notFound.suggestionWards" },
  { to: "/about", icon: Info, titleKey: "nav.about", textKey: "notFound.suggestionAbout" },
];

export default function NotFound() {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-neutral-950">
      <LandingNavbar />

      <main
        role="main"
        className="relative isolate overflow-hidden px-4 py-16 sm:px-6 sm:py-20"
      >
        {/* Soft decorative blobs — tucked behind content, hidden from AT */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-green/10 blur-3xl" />
          <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-brand-yellow/20 blur-3xl" />
          <div className="absolute bottom-10 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-brand-red/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          {/* Big playful 404 with a compass as the middle 0 */}
          <div className="relative mx-auto flex items-center justify-center gap-2 sm:gap-4">
            <span
              aria-hidden="true"
              className="font-display text-[8rem] font-black leading-none text-brand-green sm:text-[12rem]"
            >
              4
            </span>
            <span
              aria-hidden="true"
              className="flex h-32 w-32 items-center justify-center rounded-full bg-brand-yellow text-brand-green shadow-xl sm:h-48 sm:w-48"
            >
              <Compass
                className="h-20 w-20 animate-[spin_18s_linear_infinite] sm:h-32 sm:w-32"
                strokeWidth={1.75}
              />
            </span>
            <span
              aria-hidden="true"
              className="font-display text-[8rem] font-black leading-none text-brand-green sm:text-[12rem]"
            >
              4
            </span>
          </div>

          {/* Hidden heading carrying the 404 number for screen readers */}
          <h1 className="sr-only">{t("notFound.srHeading")}</h1>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-red/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-red dark:bg-brand-red/15">
            {t("notFound.eyebrow")}
          </p>

          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            {t("notFound.title")}
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t("notFound.bodyRich")}
          </p>

          {/* The URL they tried, if we can safely show it */}
          {location.pathname && location.pathname !== "/" && (
            <p className="mx-auto mt-4 inline-flex max-w-full items-center gap-2 overflow-hidden rounded-lg border border-neutral-200 bg-white/70 px-3 py-1.5 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-400">
              <Search size={12} className="shrink-0 text-brand-red" aria-hidden="true" />
              <span className="truncate font-mono" dir="ltr">
                {location.pathname}
              </span>
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-neutral-300 bg-white/60 px-6 py-2.5 text-sm font-bold text-neutral-800 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-100 dark:hover:bg-neutral-900 dark:focus-visible:ring-offset-neutral-950"
            >
              <ArrowLeft size={16} aria-hidden="true" /> {t("notFound.goBack")}
            </button>
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand-green px-7 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-green-dark hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream dark:focus-visible:ring-offset-neutral-950"
            >
              <Home size={16} aria-hidden="true" /> {t("notFound.backHome")}
            </Link>
          </div>
        </div>

        {/* Helpful destinations grid */}
        <section
          aria-labelledby="where-next-heading"
          className="mx-auto mt-20 max-w-5xl"
        >
          <h3
            id="where-next-heading"
            className="mb-6 text-center font-display text-lg font-bold text-neutral-900 dark:text-white"
          >
            {t("notFound.whereNext")}
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SUGGESTIONS.map(({ to, icon: Icon, titleKey, textKey }) => (
              <Link
                key={to}
                to={to}
                className="card-flat group flex items-start gap-4 !p-5 transition-all duration-200 ease-out hover:-translate-y-1 focus-visible:-translate-y-1"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green transition-colors duration-200 ease-out group-hover:bg-brand-green group-hover:text-white dark:bg-brand-green/15">
                  <Icon size={20} strokeWidth={2.25} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-neutral-900 dark:text-white">
                    {t(titleKey)}
                  </p>
                  <p className="mt-0.5 text-sm leading-snug text-neutral-500 dark:text-neutral-400">
                    {t(textKey)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Still-stuck callout */}
        <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-brand-yellow/40 bg-brand-yellow/10 px-6 py-5 text-center text-sm text-neutral-700 dark:border-brand-yellow/30 dark:bg-brand-yellow/5 dark:text-neutral-300">
          <strong className="font-semibold text-neutral-900 dark:text-white">
            {t("notFound.stillStuckTitle")}
          </strong>{" "}
          {t("notFound.stillStuckBody")}{" "}
          <Link
            to="/voice"
            className="font-semibold text-brand-red underline-offset-2 hover:underline"
          >
            {t("notFound.stillStuckLink")}
          </Link>
          .
        </div>
      </main>
    </div>
  );
}
