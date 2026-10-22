import React from "react";
import { useLang } from "../context/LanguageContext";

export default function Logo({ size = 40, showText = true, className = "" }) {
  const { t } = useLang();
  if (!showText) return null;

  return (
    <div className={`leading-tight ${className}`}>
      <p className="font-display text-base font-bold tracking-tight text-neutral-900 dark:text-white">
        {t("brand.name")}
      </p>
    </div>
  );
}
