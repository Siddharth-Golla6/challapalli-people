import React from "react";
import { Megaphone } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { useAnnouncements } from "../context/AnnouncementsContext";
import { getWardById } from "../data/geography";
import { useLang } from "../context/LanguageContext";

export default function Announcements() {
  const { t, lang } = useLang();
  const { announcements } = useAnnouncements();
  const dateLocale = lang === "te" ? "te-IN" : "en-IN";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold text-neutral-900 dark:text-white">
        <Megaphone className="text-brand-red" /> {t("ann.title")}
      </h1>
      <p className="mt-1 mb-8 text-sm text-neutral-500 dark:text-neutral-400">
        {t("ann.subtitle")}
      </p>

      <div className="space-y-4">
        {announcements.map((a) => (
          <GlassCard key={a.id}>
            <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
              <span>{new Date(a.date).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}</span>
              {a.wardId && (
                <span className="rounded-full bg-brand-yellow/20 px-2.5 py-0.5 font-semibold text-neutral-700 dark:text-brand-yellow">
                  {getWardById(a.wardId)?.name}
                </span>
              )}
            </div>
            <h2 className="mb-1 text-lg font-bold text-neutral-900 dark:text-white">{a.title}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{a.body}</p>
          </GlassCard>
        ))}
        {announcements.length === 0 && (
          <GlassCard className="py-12 text-center text-neutral-500">{t("ann.none")}</GlassCard>
        )}
      </div>
    </div>
  );
}
