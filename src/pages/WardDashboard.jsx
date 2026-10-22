import React, { useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users } from "lucide-react";
import GlassCard from "../components/GlassCard";
import StatCounter from "../components/StatCounter";
import ProblemCard from "../components/ProblemCard";
import WardHeroSlideshow from "../components/WardHeroSlideshow";
import { getWardById } from "../data/geography";
import {
  getProblemsByWard,
  getProblemStats,
  getWardHealth,
  CATEGORY_OPTIONS,
} from "../data/mockData";
import { useProblems } from "../context/ProblemsContext";
import { useVolunteers } from "../context/VolunteersContext";
import { useLang } from "../context/LanguageContext";

const HEALTH_LABEL_KEY = { green: "ward.health.healthy", yellow: "ward.health.moderate", red: "ward.health.critical" };
const HEALTH_COLOR = { green: "#059669", yellow: "#D97706", red: "#D32F2F" };

// Per-ward hero photos. Drop files into public/wards/ as /wards/ward-<n>-1.jpg
// to light up a ward's hero. Any missing entry falls back to the plain header.
const WARD_PHOTOS = {};

const CATEGORY_COLORS = [
  "#D32F2F", "#059669", "#2563EB", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#65A30D",
];

export default function WardDashboard() {
  const { t } = useLang();
  const { wardId } = useParams();
  const ward = getWardById(wardId);
  const { problems: allProblems } = useProblems();

  const problems = useMemo(
    () => (ward ? getProblemsByWard(allProblems, ward.id) : []),
    [ward, allProblems]
  );
  const stats = useMemo(() => getProblemStats(problems), [problems]);
  const health = ward ? getWardHealth(allProblems, ward.id) : "green";
  const { volunteers: allVolunteers } = useVolunteers();
  const volunteers = allVolunteers.filter((v) => v.wardId === wardId);

  const categoryData = useMemo(() => {
    const counts = {};
    for (const p of problems) counts[p.category] = (counts[p.category] || 0) + 1;
    return CATEGORY_OPTIONS
      .map((c) => ({ category: c, count: counts[c] || 0 }))
      .filter((d) => d.count > 0);
  }, [problems]);

  if (!ward) return <Navigate to="/dashboard" replace />;

  const heroPhotos = WARD_PHOTOS[ward.id];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {heroPhotos && <WardHeroSlideshow photos={heroPhotos} />}

      <div className={`mb-6 flex flex-wrap items-start justify-between gap-3 ${heroPhotos ? "glass-card p-5" : ""}`}>
        <div>
          <p className="text-sm font-semibold text-brand-red">{t("dashboard.constituency")}</p>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">{ward.name}</h1>
          <p
            className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: HEALTH_COLOR[health] }}
          >
            {t(HEALTH_LABEL_KEY[health])}
          </p>
        </div>
        <Link to="/report" className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark">
          {t("ward.reportHere")}
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <GlassCard className="!p-4 text-center"><p className="text-xl font-extrabold text-neutral-900 dark:text-white"><StatCounter value={stats.total} /></p><p className="text-[11px] text-neutral-500">{t("ward.stats.total")}</p></GlassCard>
        <GlassCard className="!p-4 text-center"><p className="text-xl font-extrabold text-emerald-600"><StatCounter value={stats.resolved} /></p><p className="text-[11px] text-neutral-500">{t("ward.stats.resolved")}</p></GlassCard>
        <GlassCard className="!p-4 text-center"><p className="text-xl font-extrabold text-amber-600"><StatCounter value={stats.pending} /></p><p className="text-[11px] text-neutral-500">{t("ward.stats.pending")}</p></GlassCard>
        <GlassCard className="!p-4 text-center"><p className="text-xl font-extrabold text-brand-red"><StatCounter value={stats.completionRate} suffix="%" /></p><p className="text-[11px] text-neutral-500">{t("ward.stats.completion")}</p></GlassCard>
        <GlassCard className="!p-4 text-center"><p className="text-xl font-extrabold text-sky-600"><StatCounter value={volunteers.length} /></p><p className="text-[11px] text-neutral-500">{t("ward.stats.volunteers")}</p></GlassCard>
      </div>

      <div className="mb-8">
        <GlassCard>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-neutral-800 dark:text-neutral-200">
            <Users size={16} className="text-indigo-600" /> {t("ward.activeVolunteers")}
          </h3>
          <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
            {volunteers.length === 0 && <li className="text-neutral-400">{t("ward.noVolunteers")}</li>}
            {volunteers.slice(0, 3).map((v) => (
              <li key={v.id}>
                <span>{v.name}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <GlassCard className="mb-8">
        <h3 className="mb-4 text-sm font-bold text-neutral-800 dark:text-neutral-200">{t("ward.categoryBreakdown")}</h3>
        {categoryData.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500">{t("ward.noProblemsHere")}</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-xl font-bold ${heroPhotos ? "glass-card inline-block px-4 py-2 text-neutral-900 dark:text-white" : "text-neutral-900 dark:text-white"}`}>
          {t("ward.problemsIn", { name: ward.name })}
        </h2>
      </div>
      {problems.length === 0 ? (
        <GlassCard className="py-10 text-center text-neutral-500">{t("ward.noProblemsHere")}</GlassCard>
      ) : (
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      )}
    </div>
  );
}
