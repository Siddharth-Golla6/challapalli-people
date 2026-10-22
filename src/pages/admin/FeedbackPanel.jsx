import React, { useMemo, useState } from "react";
import { Trash2, Eye, EyeOff, Star } from "lucide-react";
import GlassCard from "../../components/GlassCard";
import { Select, Textarea } from "../../components/FormField";
import { useFeedback } from "../../context/FeedbackContext";
import { useLang } from "../../context/LanguageContext";
import { WARDS, getWardById } from "../../data/geography";

const TOPICS = [
  "Community Services",
  "Government Initiatives",
  "Website Experience",
  "General Appreciation",
  "Other",
];

export default function FeedbackPanel() {
  const { t } = useLang();
  const { feedback, updateFeedback, deleteFeedback } = useFeedback();
  const [filters, setFilters] = useState({ topic: "", wardId: "", onlyPublic: false });
  const [responses, setResponses] = useState({});
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    return feedback.filter((f) => {
      if (filters.topic && f.topic !== filters.topic) return false;
      if (filters.wardId && f.wardId !== filters.wardId) return false;
      if (filters.onlyPublic && !f.isPublic) return false;
      return true;
    });
  }, [feedback, filters]);

  const togglePublic = async (f) => {
    try {
      await updateFeedback(f.id, { isPublic: !f.isPublic });
    } catch (err) {
      setError(err.message);
    }
  };

  const saveResponse = async (f) => {
    try {
      await updateFeedback(f.id, { response: responses[f.id] ?? f.response ?? "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const removeOne = async (f) => {
    if (!window.confirm(t("admin.fb.deleteConfirm"))) return;
    try {
      await deleteFeedback(f.id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">{t("admin.fb.title")}</h2>

      <GlassCard className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select value={filters.topic} onChange={(e) => setFilters((f) => ({ ...f, topic: e.target.value }))}>
          <option value="">{t("fb.form.topicPh")}</option>
          {TOPICS.map((topic) => <option key={topic} value={topic}>{t(`fb.topic.${topic}`)}</option>)}
        </Select>
        <Select value={filters.wardId} onChange={(e) => setFilters((f) => ({ ...f, wardId: e.target.value }))}>
          <option value="">{t("filters.allWards")}</option>
          {WARDS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </Select>
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
          <input
            type="checkbox"
            checked={filters.onlyPublic}
            onChange={(e) => setFilters((f) => ({ ...f, onlyPublic: e.target.checked }))}
            className="h-4 w-4 rounded border-neutral-300 text-brand-red focus:ring-brand-red"
          />
          {t("admin.fb.col.public")}
        </label>
      </GlassCard>

      {error && <p className="mb-3 text-sm font-medium text-brand-red">{error}</p>}

      {filtered.length === 0 ? (
        <GlassCard className="py-10 text-center text-neutral-500">{t("fb.none")}</GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => {
            const ward = f.wardId ? getWardById(f.wardId) : null;
            return (
              <GlassCard key={f.id}>
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{f.referenceId}</span>
                      <span className="rounded-full bg-brand-yellow/20 px-2 py-0.5 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">{t(`fb.topic.${f.topic}`)}</span>
                      {ward && <span className="text-xs text-neutral-400">· {ward.name}</span>}
                      {f.rating && (
                        <span className="inline-flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: f.rating }).map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${f.isPublic ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>
                        {f.isPublic ? t("common.yes") : t("common.no")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-200">{f.message}</p>
                    {f.submittedByName && (
                      <p className="mt-1 text-xs text-neutral-400">— {f.submittedByName}{f.submittedByPhone ? ` · ${f.submittedByPhone}` : ""}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => togglePublic(f)} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800" title={f.isPublic ? t("admin.fb.makePrivate") : t("admin.fb.makePublic")}>
                      {f.isPublic ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={() => removeOne(f)} className="rounded-lg p-1.5 text-brand-red hover:bg-red-50 dark:hover:bg-red-500/10" aria-label={t("common.delete")}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <Textarea
                    rows={2}
                    value={responses[f.id] ?? f.response ?? ""}
                    onChange={(e) => setResponses((r) => ({ ...r, [f.id]: e.target.value }))}
                    placeholder={t("admin.fb.responsePh")}
                  />
                  <button onClick={() => saveResponse(f)} className="h-10 rounded-lg border border-neutral-300 px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
                    {t("admin.fb.respond")}
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
