import React, { useState } from "react";
import {
  LayoutDashboard, ClipboardList, Megaphone,
  Users, Map, History, FileDown, BarChart3,
  Lightbulb, MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProblems } from "../context/ProblemsContext";
import { useLang } from "../context/LanguageContext";
import { downloadCsv } from "../utils/exportData";

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
  const [tab, setTab] = useState("analytics");

  const exportProblems = () =>
    downloadCsv(
      "challapalli-people-complaints.csv",
      problems.map((p) => ({
        ID: p.id,
        Title: p.title,
        Category: p.category,
        Ward: p.wardName,
        Landmark: p.landmark || "",
        Status: p.status,
        Priority: p.priority,
        ReportedAt: new Date(p.createdAt || p.reportedAt).toLocaleDateString("en-IN"),
      }))
    );

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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={exportProblems}
                  className="glass-card p-5 text-left transition hover:-translate-y-1"
                >
                  <FileDown size={20} className="mb-2 text-brand-red" />
                  <p className="font-bold text-neutral-900 dark:text-white">{t("admin.reports.exportComplaints")}</p>
                  <p className="text-xs text-neutral-500">{t("admin.reports.exportDesc", { n: problems.length })}</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
