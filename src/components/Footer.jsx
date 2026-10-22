import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Logo from "./Logo";
import { useLang } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
        <div>
          <Logo size={40} />
          <p className="mt-3 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
            {t("footer.description")}
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800 dark:text-neutral-200">
            {t("footer.quickLinks")}
          </h4>
          <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
            <li><Link to="/dashboard" className="hover:text-brand-red">{t("footer.dashboard")}</Link></li>
            <li><Link to="/report" className="hover:text-brand-red">{t("footer.report")}</Link></li>
            <li><Link to="/voice" className="hover:text-brand-red">{t("footer.voice")}</Link></li>
            <li><Link to="/about" className="hover:text-brand-red">{t("footer.about")}</Link></li>
            <li><Link to="/copyright" className="hover:text-brand-red">{t("footer.copyrightLink")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200 py-5 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        <p className="inline-flex items-center justify-center gap-1.5">
          <ShieldCheck size={13} className="text-brand-green" aria-hidden="true" />
          <span>{t("footer.copyright", { year })}</span>
        </p>
        <p className="mx-auto mt-1.5 max-w-xl px-4 text-[11px] leading-snug text-neutral-400 dark:text-neutral-500">
          {t("footer.unofficialNotice")}{" "}
          <Link to="/copyright" className="font-semibold text-neutral-500 underline-offset-2 hover:underline dark:text-neutral-300">
            {t("footer.copyrightLink")} →
          </Link>
        </p>
        {/* Visible brand-variant line — natural prose including the three
            spellings residents actually search for (challapalli.people,
            challapallipeople, Challapalli People). Helps the site rank for
            exact-match brand queries in Google. */}
        <p className="mx-auto mt-2 max-w-xl px-4 text-[11px] leading-snug text-neutral-400 dark:text-neutral-500">
          {t("footer.brandNote")}
        </p>
      </div>
    </footer>
  );
}
