import React, { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import GlassCard from "../../components/GlassCard";
import { Select, Textarea } from "../../components/FormField";
import { useSuggestions } from "../../context/SuggestionsContext";
import { useLang } from "../../context/LanguageContext";
import { WARDS } from "../../data/geography";

const STATUSES = ["Submitted", "Under Review", "Accepted", "Rejected", "Implemented"];

export default function SuggestionsPanel() {
  const { t } = useLang();
  const { suggestions, updateSuggestion, deleteSuggestion } = useSuggestions();
  const [filters, setFilters] = useState({ wardId: "", status: "" });
  const [notes, setNotes] = useState({});
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    return suggestions.filter((s) => {
      if (filters.wardId && s.wardId !== filters.wardId) return false;
      if (filters.status && s.status !== filters.status) return false;
      return true;
    });
  }, [suggestions, filters]);

  const changeStatus = async (s, status) => {
    setError("");
    try {
      await updateSuggestion(s.id, { status, moderationNote: notes[s.id] ?? s.moderationNote ?? "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const saveNote = async (s) => {
    setError("");
    try {
      await updateSuggestion(s.id, { moderationNote: notes[s.id] ?? "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const removeOne = async (s) => {
    if (!window.confirm(t("admin.sugg.deleteConfirm", { title: s.title }))) return;
    try {
      await deleteSuggestion(s.id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">{t("admin.sugg.title")}</h2>

      <GlassCard className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select value={filters.wardId} onChange={(e) => setFilters((f) => ({ ...f, wardId: e.target.value }))}>
          <option value="">{t("filters.allWards")}</option>
          {WARDS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </Select>
        <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">{t("sugg.filters.allStatuses")}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{t(`sugg.status.${s}`)}</option>)}
        </Select>
      </GlassCard>

      {error && <p className="mb-3 text-sm font-medium text-brand-red">{error}</p>}

      {filtered.length === 0 ? (
        <GlassCard className="py-10 text-center text-neutral-500">{t("sugg.noneFiltered")}</GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <GlassCard key={s.id}>
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{s.referenceId}</span>
                    <span className="text-xs text-neutral-400">· {s.wardName} · {t(`sugg.cat.${s.category}`)}</span>
                  </div>
                  <h3 className="mt-1 font-bold text-neutral-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{s.description}</p>
                  {s.submittedByName && (
                    <p className="mt-1 text-xs text-neutral-400">— {s.submittedByName}{s.submittedByPhone ? ` · ${s.submittedByPhone}` : ""}</p>
                  )}
                </div>
                <button onClick={() => removeOne(s)} className="rounded-lg p-1.5 text-brand-red hover:bg-red-50 dark:hover:bg-red-500/10" aria-label={t("common.delete")}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-neutral-500">{t("admin.sugg.col.status")}</label>
                  <Select value={s.status} onChange={(e) => changeStatus(s, e.target.value)} className="!py-1.5 text-xs">
                    {STATUSES.map((st) => <option key={st} value={st}>{t(`sugg.status.${st}`)}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-neutral-500">{t("admin.sugg.noteLabel")}</label>
                  <Textarea
                    rows={2}
                    value={notes[s.id] ?? s.moderationNote ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))}
                    placeholder={t("admin.sugg.notePh")}
                  />
                </div>
                <button
                  onClick={() => saveNote(s)}
                  className="h-10 rounded-lg border border-neutral-300 px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  {t("common.save")}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
