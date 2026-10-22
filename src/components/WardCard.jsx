import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";
import { getWardHealth, getProblemsByWard, getProblemStats } from "../data/mockData";
import { useProblems } from "../context/ProblemsContext";
import { useLang } from "../context/LanguageContext";
import { gridItem, T } from "../lib/motion";

const HEALTH_STYLES = {
  green: {
    accent: "border-l-status-success",
    dot: "bg-status-success",
    labelKey: "ward.health.healthy",
    chip: "bg-status-success-bg text-status-success-fg dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  yellow: {
    accent: "border-l-status-warning",
    dot: "bg-status-warning",
    labelKey: "ward.health.moderate",
    chip: "bg-status-warning-bg text-status-warning-fg dark:bg-amber-500/15 dark:text-amber-300",
  },
  red: {
    accent: "border-l-status-danger",
    dot: "bg-status-danger animate-subtle-pulse",
    labelKey: "ward.health.critical",
    chip: "bg-status-danger-bg text-status-danger-fg dark:bg-red-500/15 dark:text-red-300",
  },
};

export default function WardCard({ ward }) {
  const { problems } = useProblems();
  const { t } = useLang();
  const health = getWardHealth(problems, ward.id);
  const style = HEALTH_STYLES[health];
  const stats = getProblemStats(getProblemsByWard(problems, ward.id));

  return (
    <motion.div
      variants={gridItem}
      whileHover={{ y: -6, transition: T.base }}
      whileTap={{ scale: 0.98, transition: T.snap }}
    >
      <Link
        to={`/ward/${ward.id}`}
        className={`card-flat group block overflow-hidden border-l-4 ${style.accent} !p-5`}
        aria-label={`${ward.name} — ${t(style.labelKey)}`}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={`badge ${style.chip}`}>
            <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden="true" />
            {t(style.labelKey)}
          </span>
          <ArrowUpRight
            size={16}
            className="text-neutral-400 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-red"
            aria-hidden="true"
          />
        </div>

        <h3 className="font-display mb-1 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
          {ward.name}
        </h3>
        <p className="mb-4 inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
          <MapPin size={12} aria-hidden="true" /> {t("ward.panchayatLine")}
        </p>

        <div className="grid grid-cols-3 gap-2 border-t border-neutral-200/70 pt-3 text-center dark:border-neutral-800">
          <div>
            <p className="font-display text-xl font-extrabold tabular-nums text-neutral-900 dark:text-white">{stats.total}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">{t("ward.stats.total")}</p>
          </div>
          <div>
            <p className="font-display text-xl font-extrabold tabular-nums text-status-success">{stats.resolved}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">{t("ward.stats.resolved")}</p>
          </div>
          <div>
            <p className="font-display text-xl font-extrabold tabular-nums text-brand-red">{stats.pending}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">{t("ward.stats.pending")}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
