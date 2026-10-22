import React, { useState } from "react";
import {
  LayoutDashboard, ClipboardList, Megaphone,
  Users, Map, History, FileDown, BarChart3,
  Lightbulb, MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProblems } from "../context/ProblemsContext";
import { useSuggestions } from "../context/SuggestionsContext";
import { useFeedback } from "../context/FeedbackContext";
import { useLang } from "../context/LanguageContext";
import { downloadCsv } from "../utils/exportData";
import { WARDS } from "../data/geography";

import AnalyticsPanel from "./admin/AnalyticsPanel";
import ComplaintsPanel from "./admin/ComplaintsPanel";
import AnnouncementsPanel from "./admin/AnnouncementsPanel";
import UsersPanel from "./admin/UsersPanel";
import GeographyPanel from "./admin/GeographyPanel";
import ActivityLogPanel from "./admin/ActivityLogPanel";
import SuggestionsPanel from "./admin/SuggestionsPanel";
import FeedbackPanel from "./admin/FeedbackPanel";

const TABS = [
  { key: "analytics", labelKey: "admin.tab.analytics", icon: BarChart3 },
  { key: "complaints", labelKey: "admin.tab.complaints", icon: ClipboardList },
  { key: "suggestions", labelKey: "admin.tab.suggestions", icon: Lightbulb },
  { key: "feedback", labelKey: "admin.tab.feedback", icon: MessageSquare },
  { key: "announcements", labelKey: "admin.tab.announcements", icon: Megaphone },
  { key: "users", labelKey: "admin.tab.users", icon: Users },
  { key: "geography", labelKey: "admin.tab.geography", icon: Map },
  { key: "reports", labelKey: "admin.tab.reports", icon: FileDown },
  { key: "logs", labelKey: "admin.tab.logs", icon: History },
];

export default function AdminDashboard() {
  const { t } = useLang();
  const { user } = useAuth();
  const { problems } = useProblems();
  const { suggestions } = useSuggestions();
  const { feedback } = useFeedback();
  const [tab, setTab] = useState("analytics");

  // Shared filter state for the Reports tab — scopes CSV exports to a
  // specific ward and/or date window. "" means no restriction on that axis.
  const [filterWard, setFilterWard] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const matchesFilters = (row) => {
    const wardOk = !filterWard || row.wardId === filterWard;
    const createdAt = new Date(row.createdAt || row.reportedAt || row.date || 0);
    const fromOk = !filterFrom || createdAt >= new Date(filterFrom);
    const toOk = !filterTo || createdAt <= new Date(filterTo + "T23:59:59");
    return wardOk && fromOk && toOk;
  };

  const dateStamp = () => new Date().toISOString().slice(0, 10);

  const exportProblems = () => {
    const rows = problems.filter(matchesFilters);
    if (!rows.length) return;
    downloadCsv(
      `challapalli-complaints-${dateStamp()}.csv`,
      rows.map((p) => ({
        ID: p.id,
        Title: p.title,
        Category: p.category,
        Ward: p.wardName,
        Landmark: p.landmark || "",
        Status: p.status,
        Priority: p.priority,
        Supporters: p.supportCount ?? 0,
        ReportedAt: new Date(p.createdAt || p.reportedAt).toLocaleDateString("en-IN"),
      }))
    );
  };

  const exportSuggestions = () => {
    const rows = (suggestions || []).filter(matchesFilters);
    if (!rows.length) return;
    downloadCsv(
      `challapalli-suggestions-${dateStamp()}.csv`,
      rows.map((s) => ({
        Reference: s.referenceId,
        Title: s.title,
        Category: s.category,
        Ward: s.wardName,
        Status: s.status,
        Supporters: s.supportCount ?? 0,
        SubmittedAt: new Date(s.createdAt).toLocaleDateString("en-IN"),
      }))
    );
  };

  const exportFeedback = () => {
    const rows = (feedback || []).filter(matchesFilters);
    if (!rows.length) return;
    downloadCsv(
      `challapalli-feedback-${dateStamp()}.csv`,
      rows.map((f) => ({
        Reference: f.referenceId,
        Topic: f.topic,
        Rating: f.rating ?? "",
        Ward: f.wardId || "",
        Public: f.isPublic ? "Yes" : "No",
        Message: f.message,
        SubmittedAt: new Date(f.createdAt).toLocaleDateString("en-IN"),
      }))
    );
  };

  const filteredCounts = {
    problems: problems.filter(matchesFilters).length,
    suggestions: (suggestions || []).filter(matchesFilters).length,
    feedback: (feedback || []).filter(matchesFilters).length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-red">
            <LayoutDashboard size={16} /> {t("admin.dashboardEyebrow")}
          </p>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white sm:text-3xl">
            {t("admin.welcome", { name: user?.name })} <span className="text-sm font-medium text-neutral-400">({t(`role.${user?.role}`)})</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label={t("admin.sectionsAria")}>
          {TABS.map(({ key, labelKey, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                tab === key
                  ? "bg-brand-red text-white"
                  : "text-neutral-600 hover:bg-brand-yellow/15 dark:text-neutral-300"
              }`}
            >
              <Icon size={16} /> {t(labelKey)}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {tab === "analytics" && <AnalyticsPanel />}
          {tab === "complaints" && <ComplaintsPanel />}
          {tab === "suggestions" && <SuggestionsPanel />}
          {tab === "feedback" && <FeedbackPanel />}
          {tab === "announcements" && <AnnouncementsPanel />}
          {tab === "users" && <UsersPanel />}
          {tab === "geography" && <GeographyPanel />}
          {tab === "logs" && <ActivityLogPanel />}
          {tab === "reports" && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">{t("admin.reports.title")}</h2>

              <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 bg-white/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 sm:grid-cols-3">
                <label className="text-xs">
                  <span className="mb-1 block font-semibold text-neutral-600 dark:text-neutral-300">{t("admin.reports.filterWard")}</span>
                  <select
                    value={filterWard}
                    onChange={(e) => setFilterWard(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <option value="">{t("admin.reports.allWards")}</option>
                    {WARDS.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs">
                  <span className="mb-1 block font-semibold text-neutral-600 dark:text-neutral-300">{t("admin.reports.filterFrom")}</span>
                  <input
                    type="date"
                    value={filterFrom}
                    onChange={(e) => setFilterFrom(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </label>
                <label className="text-xs">
                  <span className="mb-1 block font-semibold text-neutral-600 dark:text-neutral-300">{t("admin.reports.filterTo")}</span>
                  <input
                    type="date"
                    value={filterTo}
                    onChange={(e) => setFilterTo(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <button
                  onClick={exportProblems}
                  disabled={filteredCounts.problems === 0}
                  className="glass-card p-5 text-left transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <FileDown size={20} className="mb-2 text-brand-red" />
                  <p className="font-bold text-neutral-900 dark:text-white">{t("admin.reports.exportComplaints")}</p>
                  <p className="text-xs text-neutral-500">{t("admin.reports.exportDesc", { n: filteredCounts.problems })}</p>
                </button>
                <button
                  onClick={exportSuggestions}
                  disabled={filteredCounts.suggestions === 0}
                  className="glass-card p-5 text-left transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <FileDown size={20} className="mb-2 text-brand-red" />
                  <p className="font-bold text-neutral-900 dark:text-white">{t("admin.reports.exportSuggestions")}</p>
                  <p className="text-xs text-neutral-500">{t("admin.reports.exportDesc", { n: filteredCounts.suggestions })}</p>
                </button>
                <button
                  onClick={exportFeedback}
                  disabled={filteredCounts.feedback === 0}
                  className="glass-card p-5 text-left transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <FileDown size={20} className="mb-2 text-brand-red" />
                  <p className="font-bold text-neutral-900 dark:text-white">{t("admin.reports.exportFeedback")}</p>
                  <p className="text-xs text-neutral-500">{t("admin.reports.exportDesc", { n: filteredCounts.feedback })}</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
