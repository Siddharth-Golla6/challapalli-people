import React from "react";
import { Search } from "lucide-react";
import { Input, Select } from "./FormField";
import { WARDS } from "../data/geography";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS } from "../data/mockData";
import { useLang } from "../context/LanguageContext";

export const DEFAULT_FILTERS = {
  q: "",
  wardId: "",
  category: "",
  priority: "",
  status: "",
};

export default function ProblemFilters({ filters, onChange }) {
  const { t } = useLang();

  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="glass-card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="relative lg:col-span-2">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder={t("filters.search")}
          value={filters.q}
          onChange={(e) => set("q", e.target.value)}
          className="pl-9"
          aria-label={t("filters.searchAria")}
        />
      </div>

      <Select value={filters.wardId} onChange={(e) => set("wardId", e.target.value)} aria-label={t("filters.wardAria")}>
        <option value="">{t("filters.allWards")}</option>
        {WARDS.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </Select>

      <Select value={filters.category} onChange={(e) => set("category", e.target.value)} aria-label={t("filters.categoryAria")}>
        <option value="">{t("filters.allCategories")}</option>
        {CATEGORY_OPTIONS.map((c) => (
          <option key={c} value={c}>{t(`cat.${c}`)}</option>
        ))}
      </Select>

      <Select value={filters.priority} onChange={(e) => set("priority", e.target.value)} aria-label={t("filters.priorityAria")}>
        <option value="">{t("filters.allPriorities")}</option>
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>{t(`priority.${p}`)}</option>
        ))}
      </Select>

      <Select value={filters.status} onChange={(e) => set("status", e.target.value)} aria-label={t("filters.statusAria")}>
        <option value="">{t("filters.allStatuses")}</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{t(`status.${s}`)}</option>
        ))}
      </Select>
    </div>
  );
}

export function applyFilters(problems, filters) {
  const q = filters.q.trim().toLowerCase();
  return problems.filter((p) => {
    if (filters.wardId && p.wardId !== filters.wardId) return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.priority && p.priority !== filters.priority) return false;
    if (filters.status && p.status !== filters.status) return false;
    if (
      q &&
      !`${p.title} ${p.id} ${p.reportedBy} ${p.landmark || ""}`.toLowerCase().includes(q)
    )
      return false;
    return true;
  });
}
