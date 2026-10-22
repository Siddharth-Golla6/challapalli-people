import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, FileText, Users, Globe2, Code2, Info, Film, AlertTriangle } from "lucide-react";
import { useLang } from "../context/LanguageContext";

// Lightweight legal / attribution page. Not a lawyered contract — a plain
// statement of who owns what, where credit belongs, and what this site is
// (and isn't). Keyed by i18n so the Telugu toggle switches it over.
export default function Copyright() {
  const { t } = useLang();
  const year = new Date().getFullYear();
  const updated = "2026-10-22";

  const SECTIONS = [
    { icon: ShieldCheck, titleKey: "copyright.sec.site.title", bodyKey: "copyright.sec.site.body" },
    { icon: Users, titleKey: "copyright.sec.content.title", bodyKey: "copyright.sec.content.body" },
    { icon: Info, titleKey: "copyright.sec.unofficial.title", bodyKey: "copyright.sec.unofficial.body" },
    { icon: FileText, titleKey: "copyright.sec.trademarks.title", bodyKey: "copyright.sec.trademarks.body" },
    { icon: Code2, titleKey: "copyright.sec.code.title", bodyKey: "copyright.sec.code.body" },
    { icon: Globe2, titleKey: "copyright.sec.thirdparty.title", bodyKey: "copyright.sec.thirdparty.body" },
  ];

  // Hero video is now properly licensed — credit kept out of the amber
  // "warning" tone and rendered as a normal attribution block below.
  const VIDEO_SOURCE_URL = "https://www.pexels.com/video/vibrant-kingfisher-on-natural-perch-35552250/";
  const VIDEO_AUTHOR_URL = "https://www.pexels.com/@iammottakin/";
  const VIDEO_LICENSE_URL = "https://www.pexels.com/license/";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-red/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-brand-red dark:bg-brand-red/15">
        {t("copyright.eyebrow")}
      </p>
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
        {t("copyright.title")}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        {t("copyright.subtitle")}
      </p>

      <p className="mt-6 inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white/70 px-3 py-1.5 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300">
        <ShieldCheck size={14} className="text-brand-green" />
        © {year} challapalli.people · {t("copyright.rightsReserved")}
      </p>

      <div className="mt-10 space-y-4">
        {SECTIONS.map(({ icon: Icon, titleKey, bodyKey }) => (
          <section
            key={titleKey}
            className="card-flat !p-5"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green dark:bg-brand-green/15">
                <Icon size={18} strokeWidth={2.25} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
                  {t(titleKey)}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {t(bodyKey)}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Hero video — properly licensed credit block. Kept as its own
          section so the attribution is easy to find for the author. */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-neutral-200 bg-white/70 p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green dark:bg-brand-green/15">
            <Film size={18} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
              {t("copyright.sec.video.title")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
              {t("copyright.sec.video.body")}
            </p>
            <dl className="mt-3 grid gap-x-4 gap-y-1 text-xs text-neutral-600 dark:text-neutral-300 sm:grid-cols-[auto_1fr]">
              <dt className="font-semibold">{t("copyright.sec.video.photographer")}</dt>
              <dd>
                <a
                  href={VIDEO_AUTHOR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-red underline-offset-2 hover:underline"
                >
                  Mojahid Mottakin ↗
                </a>
              </dd>
              <dt className="font-semibold">{t("copyright.sec.video.source")}</dt>
              <dd>
                <a
                  href={VIDEO_SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-red underline-offset-2 hover:underline"
                >
                  Pexels ↗
                </a>
              </dd>
              <dt className="font-semibold">{t("copyright.sec.video.license")}</dt>
              <dd>
                <a
                  href={VIDEO_LICENSE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-red underline-offset-2 hover:underline"
                >
                  Pexels License ↗
                </a>{" "}
                — {t("copyright.sec.video.licenseSummary")}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-yellow/40 bg-brand-yellow/10 px-5 py-4 text-sm text-neutral-700 dark:border-brand-yellow/30 dark:bg-brand-yellow/5 dark:text-neutral-300">
        <strong className="font-semibold text-neutral-900 dark:text-white">
          {t("copyright.lastUpdated")}:
        </strong>{" "}
        <time dateTime={updated}>{updated}</time>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-1 font-semibold text-brand-red underline-offset-2 hover:underline"
        >
          ← {t("notFound.backHome")}
        </Link>
        <span className="text-neutral-400">·</span>
        <Link
          to="/about"
          className="inline-flex items-center gap-1 font-semibold text-brand-red underline-offset-2 hover:underline"
        >
          {t("nav.about")}
        </Link>
      </div>
    </div>
  );
}
