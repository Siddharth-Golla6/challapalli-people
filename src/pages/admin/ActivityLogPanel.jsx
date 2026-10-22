import React from "react";
import { History } from "lucide-react";
import GlassCard from "../../components/GlassCard";
import { useActivityLog } from "../../context/ActivityLogContext";
import { useLang } from "../../context/LanguageContext";

export default function ActivityLogPanel() {
  const { t, lang } = useLang();
  const { entries } = useActivityLog();
  const dateLocale = lang === "te" ? "te-IN" : "en-IN";

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
        <History size={18} /> {t("admin.logs.title")}
      </h2>
      <GlassCard className="!p-0">
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {entries.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm text-neutral-700 dark:text-neutral-200">{e.action}</p>
                <p className="text-xs text-neutral-400">{e.actor}</p>
              </div>
              <p className="shrink-0 text-xs text-neutral-400">
                {new Date(e.date).toLocaleString(dateLocale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </li>
          ))}
          {entries.length === 0 && <li className="p-6 text-center text-sm text-neutral-400">{t("admin.logs.emptyRecorded")}</li>}
        </ul>
      </GlassCard>
    </div>
  );
}
