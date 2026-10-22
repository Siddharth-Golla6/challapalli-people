import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart as PieChartIcon, CheckCircle2, AlertCircle, Clock, Users as UsersIcon, ArrowRight, MapPin, X as XIcon } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { gridContainer, gridItem } from "../lib/motion";
import GlassCard from "../components/GlassCard";
import WardCard from "../components/WardCard";
import ProblemCard from "../components/ProblemCard";
import ProblemFilters, { DEFAULT_FILTERS, applyFilters } from "../components/ProblemFilters";
import StatCounter from "../components/StatCounter";
import { CardGridSkeleton } from "../components/Skeleton";
import { WARDS } from "../data/geography";
import { CATEGORY_OPTIONS } from "../data/mockData";
import { useProblems } from "../context/ProblemsContext";
import { useVolunteers } from "../context/VolunteersContext";
import { useLang } from "../context/LanguageContext";
import useDelayedReady from "../hooks/useDelayedReady";

const PIE_COLORS = ["#D32F2F", "#FFC107", "#059669", "#0891B2", "#7C3AED", "#EA580C", "#4B5563", "#DB2777"];

export default function Dashboard() {
  const { t } = useLang();
  const ready = useDelayedReady(500);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { problems, fetchNearby } = useProblems();
  const { volunteers } = useVolunteers();

  // "Near me" overlay — when set, replaces the main grid with a server-side
  // Haversine filter around the user's current GPS. Cleared with the X chip.
  const [nearby, setNearby] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState("");

  const requestNearby = () => {
    if (!navigator.geolocation) {
      setNearbyError(t("myReports.geoUnsupported"));
      return;
    }
    setNearbyLoading(true);
    setNearbyError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const list = await fetchNearby({ lat: pos.coords.latitude, lng: pos.coords.longitude, radiusKm: 2 });
          setNearby({ list, lat: pos.coords.latitude, lng: pos.coords.longitude });
        } catch (err) {
          setNearbyError(err.message || "Failed to fetch nearby problems.");
        } finally {
          setNearbyLoading(false);
        }
      },
      () => {
        setNearbyLoading(false);
        setNearbyError(t("myReports.geoDenied"));
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const filteredProblems = useMemo(
    () => (nearby ? nearby.list : applyFilters(problems, filters)),
    [problems, filters, nearby]
  );

  const stats = useMemo(() => {
    const total = problems.length;
    const resolved = problems.filter((p) => p.status === "Completed").length;
    const pending = problems.filter((p) => !["Completed", "Rejected"].includes(p.status)).length;
    const critical = problems.filter((p) => p.priority === "Critical" && p.status !== "Completed").length;
    return { total, resolved, pending, critical };
  }, [problems]);

  const solvedByDepartment = useMemo(
    () =>
      CATEGORY_OPTIONS.map((c) => ({
        name: t(`cat.${c}`),
        value: problems.filter((p) => p.category === c && p.status === "Completed").length,
      })).filter((d) => d.value > 0),
    [problems, t]
  );

  const departmentWorkload = useMemo(
    () =>
      CATEGORY_OPTIONS.map((c) => {
        const inCategory = problems.filter((p) => p.category === c);
        return {
          name: t(`cat.${c}`),
          total: inCategory.length,
          resolved: inCategory.filter((p) => p.status === "Completed").length,
        };
      }).filter((d) => d.total > 0),
    [problems, t]
  );

  const byCategory = useMemo(
    () =>
      CATEGORY_OPTIONS.map((c) => ({
        name: t(`cat.${c}`),
        value: problems.filter((p) => p.category === c).length,
      })).filter((c) => c.value > 0),
    [problems, t]
  );

  const STATS = [
    { icon: AlertCircle, label: t("ward.stats.total"), value: stats.total, tone: "text-neutral-900 dark:text-white", bg: "bg-neutral-100 dark:bg-neutral-800" },
    { icon: CheckCircle2, label: t("ward.stats.resolved"), value: stats.resolved, tone: "text-status-success", bg: "bg-status-success-bg dark:bg-emerald-500/10" },
    { icon: Clock, label: t("ward.stats.pending"), value: stats.pending, tone: "text-status-warning", bg: "bg-status-warning-bg dark:bg-amber-500/10" },
    { icon: UsersIcon, label: t("ward.stats.volunteers"), value: volunteers.length, tone: "text-brand-red", bg: "bg-brand-red/10 dark:bg-brand-red/15" },
  ];

  return (
    <div className="page-enter">
      <section className="border-b border-neutral-200/70 bg-gradient-to-br from-brand-yellow/15 via-brand-cream to-brand-red/5 px-4 pb-6 pt-12 dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-red/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-brand-red dark:bg-brand-red/15">
            {t("dashboard.constituency")}
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            {t("dashboard.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">
            {t("dashboard.subtitle")}
          </p>

          {/* KPI tiles — compact, tabular numerals, meaningful icon per stat.
              Stagger-in via framer-motion for a lightly orchestrated entrance. */}
          <motion.div
            className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
            variants={gridContainer}
            initial="initial"
            animate="animate"
          >
            {STATS.map(({ icon: Icon, label, value, tone, bg }) => (
              <motion.div
                key={label}
                variants={gridItem}
                className="card-flat flex items-center gap-3 !p-4"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon size={18} className={tone} strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <p className={`font-display text-2xl font-extrabold leading-none tabular-nums ${tone}`}>
                    <StatCounter value={value} />
                  </p>
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
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-neutral-900 dark:text-white">
            {t("dashboard.wardsAtGlance")}
          </h2>
          <Link
            to="/report"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red transition-colors hover:text-brand-red-dark"
          >
            {t("dashboard.reportAProblem")}
            <ArrowRight size={14} />
          </Link>
        </div>
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={gridContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
        >
          {WARDS.map((m) => (
            <WardCard key={m.id} ward={m} />
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="mb-5 flex items-center gap-2">
          <PieChartIcon size={20} className="text-brand-red" />
          <h2 className="font-display text-xl font-bold text-neutral-900 dark:text-white">{t("dashboard.analytics")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <GlassCard>
            <h3 className="mb-1 text-sm font-bold text-neutral-800 dark:text-neutral-200">{t("dashboard.byCategory")}</h3>
            <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
              {t("dashboard.byCategoryDesc")}
            </p>
            {byCategory.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-neutral-500">
                {t("dashboard.noComplaintsYet")}
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={{ fontSize: 10 }}>
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="mb-1 text-sm font-bold text-neutral-800 dark:text-neutral-200">{t("dashboard.solvedByDept")}</h3>
            <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
              {t("dashboard.solvedByDeptDesc")}
            </p>
            {solvedByDepartment.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-neutral-500">
                {t("dashboard.noSolvedYet")}
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={solvedByDepartment} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={{ fontSize: 10 }}>
                      {solvedByDepartment.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="mb-1 text-sm font-bold text-neutral-800 dark:text-neutral-200">{t("dashboard.deptProgress")}</h3>
            <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
              {t("dashboard.deptProgressDesc")}
            </p>
            {departmentWorkload.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-neutral-500">
                {t("dashboard.noComplaintsYet")}
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentWorkload} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" allowDecimals={false} fontSize={11} />
                    <YAxis type="category" dataKey="name" fontSize={10} width={110} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="total" name={t("dashboard.chart.reported")} fill="#FFC107" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="resolved" name={t("dashboard.chart.resolved")} fill="#059669" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-neutral-900 dark:text-white">
            {t("dashboard.communityProblems")}
          </h2>
          <Link
            to="/report"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red transition-colors hover:text-brand-red-dark"
          >
            {t("dashboard.reportAProblem")}
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={requestNearby}
            disabled={nearbyLoading}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-red/30 bg-brand-red/10 px-3 py-1.5 text-xs font-semibold text-brand-red transition hover:bg-brand-red/15 disabled:opacity-50 dark:border-brand-red/40"
          >
            <MapPin size={13} />
            {nearbyLoading ? t("myReports.locating") : t("myReports.nearMe")}
          </button>
          {nearby && (
            <button
              type="button"
              onClick={() => setNearby(null)}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <XIcon size={12} /> {t("myReports.clearNearby")}
            </button>
          )}
          {nearbyError && (
            <span className="text-xs text-brand-red">{nearbyError}</span>
          )}
          {nearby && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {nearby.list.length} {t("myReports.within2km")}
            </span>
          )}
        </div>
        {!nearby && (
          <div className="mb-6">
            <ProblemFilters filters={filters} onChange={setFilters} />
          </div>
        )}

        {!ready ? (
          <CardGridSkeleton count={6} />
        ) : filteredProblems.length === 0 ? (
          <GlassCard className="py-12 text-center text-neutral-500">{t("dashboard.noProblemsMatch")}</GlassCard>
        ) : (
          <motion.div
            key={filteredProblems.length}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            variants={gridContainer}
            initial="initial"
            animate="animate"
          >
            {filteredProblems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
