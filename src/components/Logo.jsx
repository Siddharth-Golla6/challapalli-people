import React from "react";
import { useLang } from "../context/LanguageContext";

// Site logo: the circular challapalli mark at the requested pixel size, with
// an optional wordmark beside it. Image lives at /public/logo.png so React
// Router SPA fallback never touches it and browsers can cache it long-term.
// `size` controls the circle's edge in pixels; the wordmark auto-scales.
export default function Logo({ size = 40, showText = true, className = "" }) {
  const { t } = useLang();
  const subFont = Math.max(10, Math.round(size * 0.22));

  return (
    <div className={`inline-flex items-center gap-2.5 leading-tight ${className}`}>
      <img
        src="/logo.png"
        alt={t("brand.name")}
        width={size}
        height={size}
        className="shrink-0 rounded-full"
        loading="eager"
        decoding="async"
      />
      {showText && (
        <span className="flex flex-col">
          <span className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
            {t("brand.name")}
          </span>
          <span
            className="font-semibold tracking-wide text-neutral-500 dark:text-neutral-400"
            style={{ fontSize: subFont + "px" }}
          >
            challapalli.peoples
          </span>
        </span>
      )}
    </div>
  );
}
