import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import GlassCard from "../../components/GlassCard";
import { useProblems } from "../../context/ProblemsContext";
import { useVolunteers } from "../../context/VolunteersContext";
import { useLang } from "../../context/LanguageContext";
import { WARDS } from "../../data/geography";
import { CATEGORY_OPTIONS } from "../../data/mockData";

const PIE_COLORS = ["#D32F2F", "#FFC107", "#059669", "#0891B2", "#7C3AED", "#EA580C", "#4B5563", "#DB2777"];

export default function AnalyticsPanel() {
  const { t, lang } = useLang();
  const { problems } = useProblems();
  const { volunteers } = useVolunteers();
  const dateLocale = lang === "te" ? "te-IN" : "en-IN";
  const monthKey = (dateStr) => new Date(dateStr).toLocaleDateString(dateLocale, { month: "short", year: "2-digit" });

  const byWard = useMemo(
    () => WARDS.map((w) => ({ name: `W${w.number}`, value: problems.filter((p) => p.wardId === w.id).length })),
    [problems]
  );

  const topLandmarks = useMemo(() => {
    const counts = {};
    problems.forEach((p) => {
      const key = (p.landmark || "").trim();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([landmark, value]) => ({ landmark, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [problems]);

  const byCategory = useMemo(
    () => CATEGORY_OPTIONS.map((c) => ({ name: t(`cat.${c}`), value: problems.filter((p) => p.category === c).length })).filter((c) => c.value > 0),
    [problems, t]
  );

  const monthlyTrend = useMemo(() => {
    const map = {};
    problems.forEach((p) => {
      const k = monthKey(p.createdAt || p.reportedAt);
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([month, complaints]) => ({ month, complaints })).sort((a, b) => (a.month > b.month ? 1 : -1));
  }, [problems, lang]);

  const volunteerActivity = useMemo(
    () => [...volunteers].sort((a, b) => b.resolved - a.resolved).slice(0, 8).map((v) => ({ name: v.name, resolved: v.resolved })),
    [volunteers]
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{t("admin.analytics.title")}</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-3 text-sm font-bold text-neutral-800 dark:text-neutral-200">{t("admin.analytics.byWard")}</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={byWard} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={10} angle={-30} textAnchor="end" height={60} interval={0} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" fill="#D32F2F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-bold text-neutral-800 dark:text-neutral-200">{t("admin.analytics.topLandmarks")}</h3>
          {topLandmarks.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">{t("admin.analytics.noLandmarks")}</p>
          ) : (
            <div className="h-64"><ResponsiveContainer width="100%" height="100%">
              <BarChart data={topLandmarks} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" allowDecimals={false} fontSize={11} />
                <YAxis type="category" dataKey="landmark" fontSize={10} width={110} />
                <Tooltip />
                <Bar dataKey="value" fill="#FFC107" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer></div>
          )}
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-bold text-neutral-800 dark:text-neutral-200">{t("dashboard.byCategory")}</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={{ fontSize: 10 }}>
                {byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer></div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-bold text-neutral-800 dark:text-neutral-200">{t("admin.analytics.monthly")}</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="complaints" stroke="#D32F2F" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer></div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-bold text-neutral-800 dark:text-neutral-200">{t("admin.analytics.volunteerActivity")}</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={volunteerActivity} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" allowDecimals={false} fontSize={11} />
              <YAxis type="category" dataKey="name" fontSize={10} width={100} />
              <Tooltip />
              <Bar dataKey="resolved" fill="#0891B2" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </GlassCard>
      </div>
    </div>
  );
}
