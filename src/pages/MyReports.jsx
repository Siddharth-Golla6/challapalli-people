import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react";
import { gridContainer, gridItem } from "../lib/motion";
import GlassCard from "../components/GlassCard";
import ProblemCard from "../components/ProblemCard";
import { CardGridSkeleton } from "../components/Skeleton";
import { useProblems } from "../context/ProblemsContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import useDelayedReady from "../hooks/useDelayedReady";

// A resident's own filing history across every ward and every status.
// Backend `/api/problems` scopes to the caller already (admin sees all,
// everyone else sees verified + their own), so we filter client-side by
// reportedById === user.id and let React key the list stay stable.
export default function MyReports() {
  const { t } = useLang();
  const { user } = useAuth();
  const { problems, loading } = useProblems();
  const ready = useDelayedReady(400);

  const myProblems = useMemo(() => {
    if (!user) return [];
    return problems
      .filter((p) => p.reportedBy === user.id || p.reportedById === user.id)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [problems, user]);

  const stats = useMemo(() => {
    const total = myProblems.length;
    const resolved = myProblems.filter((p) => p.status === "Completed").length;
    const inProgress = myProblems.filter((p) => ["Verified", "In Progress", "Waiting for Funds"].includes(p.status)).length;
    const pending = myProblems.filter((p) => p.status === "New").length;
    return { total, resolved, inProgress, pending };
  }, [myProblems]);

  const STATS = [
    { icon: ClipboardList, label: t("myReports.stats.total"), value: stats.total, tone: "text-neutral-900 dark:text-white", bg: "bg-neutral-100 dark:bg-neutral-800" },
    { icon: CheckCircle2, label: t("myReports.stats.resolved"), value: stats.resolved, tone: "text-status-success", bg: "bg-status-success-bg dark:bg-emerald-500/10" },
    { icon: Clock, label: t("myReports.stats.inProgress"), value: stats.inProgress, tone: "text-status-info", bg: "bg-status-info-bg dark:bg-sky-500/10" },
    { icon: AlertCircle, label: t("myReports.stats.pending"), value: stats.pending, tone: "text-status-warning", bg: "bg-status-warning-bg dark:bg-amber-500/10" },
  ];

  return (
    <div className="page-enter">
      <section className="border-b border-neutral-200/70 bg-gradient-to-br from-brand-yellow/15 via-brand-cream to-brand-red/5 px-4 pb-6 pt-12 dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-red/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-brand-red dark:bg-brand-red/15">
            {t("myReports.eyebrow")}
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            {t("myReports.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">
            {t("myReports.subtitle")}
          </p>

          <motion.div
            className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
            variants={gridContainer}
            initial="initial"
            animate="animate"
          >
            {STATS.map(({ icon: Icon, label, value, tone, bg }) => (
              <motion.div key={label} variants={gridItem} className="card-flat flex items-center gap-3 !p-4">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon size={18} className={tone} strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <p className={`font-display text-2xl font-extrabold leading-none tabular-nums ${tone}`}>{value}</p>
                  <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    {label}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {loading || !ready ? (
          <CardGridSkeleton count={3} />
        ) : myProblems.length === 0 ? (
          <GlassCard className="py-16 text-center">
            <ClipboardList size={32} className="mx-auto mb-3 text-neutral-400" />
            <h2 className="font-display text-lg font-bold text-neutral-800 dark:text-neutral-200">
              {t("myReports.emptyTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
              {t("myReports.emptyBody")}
            </p>
            <Link
              to="/report"
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-red-dark"
            >
              <Plus size={15} /> {t("myReports.cta")}
            </Link>
          </GlassCard>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            variants={gridContainer}
            initial="initial"
            animate="animate"
          >
            {myProblems.map((p) => (
              <ProblemCard key={p.id} problem={p} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
