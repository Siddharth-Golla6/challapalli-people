import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Settings2,
  CheckCircle2,
  Users,
  ShieldCheck,
  Clock,
  TrendingUp,
  Check,
  Palmtree,
  Sailboat,
  Code2,
  Server,
  Database,
  Image as ImageIcon,
} from "lucide-react";
import GlassCard from "../components/GlassCard";
import { WARDS } from "../data/geography";
import { useLang } from "../context/LanguageContext";

const COMMITMENTS = [
  { icon: Users, titleKey: "about.c.peopleFirst", textKey: "about.c.peopleFirstDesc" },
  { icon: ShieldCheck, titleKey: "about.c.transparency", textKey: "about.c.transparencyDesc" },
  { icon: Clock, titleKey: "about.c.timelyAction", textKey: "about.c.timelyActionDesc" },
  { icon: CheckCircle2, titleKey: "about.c.accountability", textKey: "about.c.accountabilityDesc" },
  { icon: TrendingUp, titleKey: "about.c.better", textKey: "about.c.betterDesc" },
];

const MISSION_KEYS = ["about.m1", "about.m2", "about.m3", "about.m4"];

const HOW_IT_WORKS = [
  { icon: FileText, titleKey: "about.hw.report", textKey: "about.hw.reportDesc" },
  { icon: Search, titleKey: "about.hw.review", textKey: "about.hw.reviewDesc" },
  { icon: Settings2, titleKey: "about.hw.action", textKey: "about.hw.actionDesc" },
  { icon: CheckCircle2, titleKey: "about.hw.resolution", textKey: "about.hw.resolutionDesc" },
];

// The canonical production stack. If any of these services changes, update
// here first — the deploy docs and the Copyright page both reference this.
const STACK = [
  {
    icon: Code2,
    layerKey: "about.stack.frontend",
    service: "React + Vite (Tailwind)",
    tag: "Netlify",
    detailKey: "about.stack.frontendDetail",
  },
  {
    icon: Server,
    layerKey: "about.stack.backend",
    service: "Express API",
    tag: "Render (free plan)",
    detailKey: "about.stack.backendDetail",
  },
  {
    icon: Database,
    layerKey: "about.stack.database",
    service: "Supabase Postgres",
    tag: "via Prisma",
    detailKey: "about.stack.databaseDetail",
  },
  {
    icon: ImageIcon,
    layerKey: "about.stack.photo",
    service: "Cloudflare R2",
    tag: "S3-compatible",
    detailKey: "about.stack.photoDetail",
  },
];

export default function AboutUs() {
  const { t } = useLang();
  return (
    <div>
      {/* Who We Are */}
      <section className="border-b border-neutral-200/70 bg-brand-cream px-4 py-14 dark:border-neutral-800 dark:bg-neutral-950 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-3 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest text-brand-green dark:text-brand-yellow">
            <span className="h-px w-8 bg-brand-green dark:bg-brand-yellow" /> {t("about.eyebrow")} <span className="h-px w-8 bg-brand-green dark:bg-brand-yellow" />
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-neutral-900 dark:text-white sm:text-5xl">
            {t("about.title")}
          </h1>

          <p className="mt-6 text-lg font-semibold italic leading-snug text-brand-green dark:text-brand-yellow">
            <span className="mr-1 font-serif text-3xl not-italic leading-none text-brand-yellow">&ldquo;</span>
            {t("about.quote")}
            <span className="ml-1 font-serif text-3xl not-italic leading-none text-brand-yellow">&rdquo;</span>
          </p>

          <p className="mt-6 text-neutral-600 dark:text-neutral-400">
            {t("about.body1a")} <strong className="text-neutral-900 dark:text-white">{t("about.body1Name")}</strong> {t("about.body1b")}
          </p>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            {t("about.body2")}
          </p>

          <Link
            to="/report"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-brand-green-dark dark:bg-brand-yellow dark:text-neutral-900 dark:hover:bg-brand-yellow-dark"
          >
            <FileText size={18} /> {t("about.reportBtn")}
          </Link>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="bg-white px-4 py-14 dark:bg-neutral-900 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white sm:text-3xl">{t("about.commitment")}</h2>
            <p className="mx-auto mt-2 max-w-xl text-neutral-500 dark:text-neutral-400">
              {t("about.commitmentIntro")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {COMMITMENTS.map(({ icon: Icon, titleKey, textKey }) => (
              <div key={titleKey} className="text-center">
                <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-white dark:bg-brand-yellow dark:text-neutral-900">
                  <Icon size={26} />
                </span>
                <h3 className="font-bold text-neutral-900 dark:text-white">{t(titleKey)}</h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t(textKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission + How It Works */}
      <section className="bg-brand-cream px-4 py-14 dark:bg-neutral-950 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
          <GlassCard>
            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">{t("about.mission")}</h2>
            <ul className="space-y-3">
              {MISSION_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green text-white dark:bg-brand-yellow dark:text-neutral-900">
                    <Check size={13} />
                  </span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">{t(key)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-brand-green/5 py-4 dark:bg-brand-yellow/10">
              <Palmtree size={22} className="text-brand-green dark:text-brand-yellow" />
              <Sailboat size={26} className="text-brand-green dark:text-brand-yellow" />
              <Palmtree size={22} className="text-brand-green dark:text-brand-yellow" />
            </div>
          </GlassCard>

          <GlassCard className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto]">
            <div>
              <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">{t("about.howItWorks")}</h2>
              <ul className="space-y-4">
                {HOW_IT_WORKS.map(({ icon: Icon, titleKey, textKey }) => (
                  <li key={titleKey} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green dark:bg-brand-yellow/15 dark:text-brand-yellow">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{t(titleKey)}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{t(textKey)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phone mockup */}
            <div className="mx-auto hidden w-32 shrink-0 overflow-hidden rounded-[1.25rem] border-4 border-neutral-900 bg-white shadow-lg sm:block dark:border-neutral-700">
              <div className="bg-brand-green px-2 pb-3 pt-2 text-center text-white">
                <p className="text-[11px] font-extrabold leading-tight">{t("brand.name")}</p>
                <p className="text-[7px] leading-tight text-white/80">{t("about.mockPhone.tagline")}</p>
              </div>
              <div className="space-y-1.5 p-2">
                <div className="flex items-center gap-1 rounded-full bg-brand-green px-2 py-1 text-[7px] font-bold text-white">
                  <FileText size={9} /> {t("about.mockPhone.report")}
                </div>
                <div className="flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-1 text-[7px] text-neutral-400">
                  <Search size={9} /> {t("about.mockPhone.track")}
                </div>
                <div className="mt-1.5 flex h-12 items-center justify-center gap-1 rounded-lg bg-brand-cream">
                  <Palmtree size={14} className="text-brand-green" />
                  <Sailboat size={16} className="text-brand-green" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Coverage Area */}
      <section className="bg-white px-4 py-14 dark:bg-neutral-900 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white sm:text-3xl">
              {t("about.coverage")}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-neutral-500 dark:text-neutral-400">
              {t("about.coverageSub")}
            </p>
          </div>

          <GlassCard>
            <h3 className="mb-3 text-lg font-bold text-neutral-900 dark:text-white">{t("about.coverageArea")}</h3>
            <p className="mb-3 text-sm text-neutral-500">{t("about.coverageAreaSub")}</p>
            <div className="flex flex-wrap gap-2">
              {WARDS.map((m) => (
                <span key={m.id} className="rounded-full bg-brand-yellow/20 px-3 py-1.5 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {m.name}
                </span>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Technology stack — the four-layer schema that every deploy follows. */}
      <section className="border-t border-neutral-200/70 bg-brand-cream px-4 py-14 dark:border-neutral-800 dark:bg-neutral-950 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-green/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-brand-green dark:bg-brand-green/15 dark:text-brand-yellow">
              {t("about.stack.eyebrow")}
            </p>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
              {t("about.stack.title")}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-neutral-500 dark:text-neutral-400">
              {t("about.stack.subtitle")}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900">
            {/* Table header — hidden on mobile; cards stack vertically there. */}
            <div className="hidden grid-cols-[140px_1fr_auto] gap-6 border-b border-neutral-200/70 bg-neutral-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 sm:grid">
              <span>{t("about.stack.col.layer")}</span>
              <span>{t("about.stack.col.service")}</span>
              <span className="text-right">{t("about.stack.col.hosted")}</span>
            </div>

            <ul className="divide-y divide-neutral-200/70 dark:divide-neutral-800">
              {STACK.map(({ icon: Icon, layerKey, service, tag, detailKey }) => (
                <li
                  key={layerKey}
                  className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green dark:bg-brand-green/20">
                      <Icon size={16} strokeWidth={2.25} aria-hidden="true" />
                    </span>
                    <span className="font-display text-sm font-bold text-neutral-900 dark:text-white">
                      {t(layerKey)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{service}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {t(detailKey)}
                    </p>
                  </div>
                  <span className="justify-self-start rounded-full bg-brand-yellow/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-neutral-800 ring-1 ring-brand-yellow/30 dark:text-brand-yellow sm:justify-self-end">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 text-center text-xs text-neutral-500 dark:text-neutral-400">
            {t("about.stack.deployNote")}{" "}
            <Link to="/copyright" className="font-semibold text-brand-red underline-offset-2 hover:underline">
              {t("footer.copyrightLink")} →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
