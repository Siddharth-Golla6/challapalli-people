import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, MessageSquare, Plus, Star, ThumbsUp, X } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { Label, Input, Select, Textarea } from "../components/FormField";
import { useSuggestions } from "../context/SuggestionsContext";
import { useFeedback } from "../context/FeedbackContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { WARDS, getWardById } from "../data/geography";
import { tabPanel } from "../lib/motion";

const SUGG_CATEGORIES = [
  "Infrastructure",
  "Public Services",
  "Health & Sanitation",
  "Education",
  "Environment",
  "Culture & Events",
  "Governance",
  "Other",
];
const SUGG_STATUSES = ["Submitted", "Under Review", "Accepted", "Rejected", "Implemented"];
const SUGG_STATUS_STYLE = {
  Submitted: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  "Under Review": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Implemented: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
};

const FB_TOPICS = [
  "Community Services",
  "Government Initiatives",
  "Website Experience",
  "General Appreciation",
  "Other",
];

const VALID_TABS = new Set(["suggestions", "feedback"]);

export default function CommunityVoice() {
  const { t } = useLang();
  const [params, setParams] = useSearchParams();

  const activeTab = VALID_TABS.has(params.get("tab")) ? params.get("tab") : "suggestions";
  const setTab = (tab) => {
    const next = new URLSearchParams(params);
    next.set("tab", tab);
    setParams(next, { replace: true });
    setShowForm(false);
    setSuccess("");
  };

  const { suggestions, addSuggestion, upvoteSuggestion } = useSuggestions();
  const { feedback, addFeedback } = useFeedback();
  const { user } = useAuth();

  const publicFeedback = useMemo(() => feedback.filter((f) => f.isPublic), [feedback]);

  const [showForm, setShowForm] = useState(false);
  // Which form is open regardless of active tab — lets a user switch inside the form.
  const [formKind, setFormKind] = useState("suggestions");

  // Keep formKind in sync with the active tab when the form is closed.
  useEffect(() => {
    if (!showForm) setFormKind(activeTab);
  }, [activeTab, showForm]);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [suggForm, setSuggForm] = useState({ title: "", description: "", category: "", wardId: "" });
  const [fbForm, setFbForm] = useState({
    topic: "",
    message: "",
    rating: "",
    wardId: "",
    shareContact: false,
    isPublic: false,
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const resetSuggForm = () => setSuggForm({ title: "", description: "", category: "", wardId: "" });
  const resetFbForm = () =>
    setFbForm({
      topic: "",
      message: "",
      rating: "",
      wardId: "",
      shareContact: false,
      isPublic: false,
      name: user?.name || "",
      phone: user?.phone || "",
    });

  // Shared filters per tab.
  const [suggFilters, setSuggFilters] = useState({ wardId: "", status: "", category: "" });
  const [fbFilters, setFbFilters] = useState({ wardId: "", topic: "" });

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => {
      if (suggFilters.wardId && s.wardId !== suggFilters.wardId) return false;
      if (suggFilters.status && s.status !== suggFilters.status) return false;
      if (suggFilters.category && s.category !== suggFilters.category) return false;
      return true;
    });
  }, [suggestions, suggFilters]);

  const filteredFeedback = useMemo(() => {
    return publicFeedback.filter((f) => {
      if (fbFilters.wardId && f.wardId !== fbFilters.wardId) return false;
      if (fbFilters.topic && f.topic !== fbFilters.topic) return false;
      return true;
    });
  }, [publicFeedback, fbFilters]);

  const submitSuggestion = async (e) => {
    e.preventDefault();
    setError("");
    if (!suggForm.title.trim() || !suggForm.description.trim() || !suggForm.category || !suggForm.wardId) {
      setError(t("sugg.form.required"));
      return;
    }
    setSubmitting(true);
    try {
      const created = await addSuggestion(suggForm);
      setSuccess(t("sugg.form.success", { ref: created.referenceId }));
      resetSuggForm();
      setShowForm(false);
      setTab("suggestions");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    setError("");
    if (!fbForm.topic || !fbForm.message.trim()) {
      setError(t("fb.form.required"));
      return;
    }
    setSubmitting(true);
    try {
      const created = await addFeedback({
        topic: fbForm.topic,
        message: fbForm.message.trim(),
        rating: fbForm.rating || null,
        wardId: fbForm.wardId || null,
        shareContact: fbForm.shareContact,
        isPublic: fbForm.isPublic,
        name: fbForm.shareContact ? fbForm.name.trim() : null,
        phone: fbForm.shareContact ? fbForm.phone.trim() : null,
      });
      setSuccess(t("fb.form.success", { ref: created.referenceId }));
      resetFbForm();
      setShowForm(false);
      setTab("feedback");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const supportSuggestion = async (id) => {
    if (!user) {
      setError(t("sugg.loginToSupport"));
      return;
    }
    try {
      await upvoteSuggestion(id);
    } catch (err) {
      setError(err.message);
    }
  };

  const TabButton = ({ id, icon: Icon, label, count }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setTab(id)}
        aria-pressed={active}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
          active
            ? "bg-brand-red text-white shadow"
            : "bg-white text-neutral-700 hover:bg-brand-yellow/15 dark:bg-neutral-900 dark:text-neutral-200"
        }`}
      >
        <Icon size={16} /> {label}
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-white/20" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"}`}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-red">
            <MessageSquare size={16} /> {t("voice.pageTitle")}
          </p>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white sm:text-3xl">{t("voice.pageTitle")}</h1>
          <p className="mt-1 text-sm text-neutral-500">{t("voice.subtitle")}</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setSuccess(""); setError(""); }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />} {t("voice.shareBtn")}
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <TabButton id="suggestions" icon={Lightbulb} label={t("voice.tab.suggestions")} count={suggestions.length} />
        <TabButton id="feedback" icon={MessageSquare} label={t("voice.tab.feedback")} count={publicFeedback.length} />
      </div>

      {success && (
        <GlassCard className="mb-6 border border-emerald-200 bg-emerald-50/60 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {success}
        </GlassCard>
      )}

      {showForm && (
        <GlassCard className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
            <span className="text-xs font-bold uppercase text-neutral-400">{t("voice.whatToShare")}</span>
            <button
              type="button"
              onClick={() => setFormKind("suggestions")}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${formKind === "suggestions" ? "bg-brand-red text-white" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"}`}
            >
              {t("voice.switchToSugg")}
            </button>
            <button
              type="button"
              onClick={() => setFormKind("feedback")}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${formKind === "feedback" ? "bg-brand-red text-white" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"}`}
            >
              {t("voice.switchToFb")}
            </button>
          </div>

          {formKind === "suggestions" ? (
            !user ? (
              <p className="rounded border-l-2 border-amber-400 bg-amber-50/70 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                {t("sugg.loginToSupport")}
              </p>
            ) : (
              <form onSubmit={submitSuggestion} className="space-y-4">
                <div>
                  <Label htmlFor="sugg-title" required>{t("sugg.form.title")}</Label>
                  <Input id="sugg-title" value={suggForm.title} onChange={(e) => setSuggForm((f) => ({ ...f, title: e.target.value }))} placeholder={t("sugg.form.titlePh")} required />
                </div>
                <div>
                  <Label htmlFor="sugg-desc" required>{t("sugg.form.description")}</Label>
                  <Textarea id="sugg-desc" rows={4} value={suggForm.description} onChange={(e) => setSuggForm((f) => ({ ...f, description: e.target.value }))} placeholder={t("sugg.form.descriptionPh")} required />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="sugg-cat" required>{t("sugg.form.category")}</Label>
                    <Select id="sugg-cat" value={suggForm.category} onChange={(e) => setSuggForm((f) => ({ ...f, category: e.target.value }))} required>
                      <option value="">{t("sugg.form.categoryPh")}</option>
                      {SUGG_CATEGORIES.map((c) => <option key={c} value={c}>{t(`sugg.cat.${c}`)}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sugg-ward" required>{t("sugg.form.ward")}</Label>
                    <Select id="sugg-ward" value={suggForm.wardId} onChange={(e) => setSuggForm((f) => ({ ...f, wardId: e.target.value }))} required>
                      <option value="">{t("sugg.form.wardPh")}</option>
                      {WARDS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </Select>
                  </div>
                </div>
                {error && <p className="text-sm font-medium text-brand-red" role="alert">{error}</p>}
                <button type="submit" disabled={submitting} className="w-full rounded-lg bg-brand-red py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-red-dark disabled:opacity-60">
                  {submitting ? t("sugg.form.submitting") : t("sugg.form.submit")}
                </button>
              </form>
            )
          ) : (
            <form onSubmit={submitFeedback} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fb-topic" required>{t("fb.form.topic")}</Label>
                  <Select id="fb-topic" value={fbForm.topic} onChange={(e) => setFbForm((f) => ({ ...f, topic: e.target.value }))} required>
                    <option value="">{t("fb.form.topicPh")}</option>
                    {FB_TOPICS.map((topic) => <option key={topic} value={topic}>{t(`fb.topic.${topic}`)}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fb-ward">{t("fb.form.ward")}</Label>
                  <Select id="fb-ward" value={fbForm.wardId} onChange={(e) => setFbForm((f) => ({ ...f, wardId: e.target.value }))}>
                    <option value="">{t("fb.form.wardPh")}</option>
                    {WARDS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="fb-msg" required>{t("fb.form.message")}</Label>
                <Textarea id="fb-msg" rows={4} value={fbForm.message} onChange={(e) => setFbForm((f) => ({ ...f, message: e.target.value }))} placeholder={t("fb.form.messagePh")} required />
              </div>
              <div>
                <Label>{t("fb.form.rating")}</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setFbForm((f) => ({ ...f, rating: String(n) }))} className="rounded-md p-1 transition hover:scale-110">
                      <Star size={22} className={Number(fbForm.rating) >= n ? "fill-amber-400 text-amber-400" : "text-neutral-300 dark:text-neutral-600"} />
                    </button>
                  ))}
                  {fbForm.rating && (
                    <button type="button" onClick={() => setFbForm((f) => ({ ...f, rating: "" }))} className="ml-2 text-xs text-neutral-400 hover:text-neutral-600">
                      {t("common.cancel")}
                    </button>
                  )}
                </div>
              </div>
              <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                <input type="checkbox" checked={fbForm.shareContact} onChange={(e) => setFbForm((f) => ({ ...f, shareContact: e.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-red focus:ring-brand-red" />
                <span>{t("fb.form.shareContact")}</span>
              </label>
              {fbForm.shareContact && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="fb-name">{t("report.field.reporterName")}</Label>
                    <Input id="fb-name" value={fbForm.name} onChange={(e) => setFbForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="fb-phone">{t("report.field.reporterPhone")}</Label>
                    <Input id="fb-phone" type="tel" inputMode="numeric" value={fbForm.phone} onChange={(e) => setFbForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
              )}
              <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                <input type="checkbox" checked={fbForm.isPublic} onChange={(e) => setFbForm((f) => ({ ...f, isPublic: e.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-red focus:ring-brand-red" />
                <span>{t("fb.form.makePublic")}</span>
              </label>
              <p className="text-xs text-neutral-500">{t("fb.form.publicNote")}</p>
              {error && <p className="text-sm font-medium text-brand-red" role="alert">{error}</p>}
              <button type="submit" disabled={submitting} className="w-full rounded-lg bg-brand-red py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-red-dark disabled:opacity-60">
                {submitting ? t("fb.form.submitting") : t("fb.form.submit")}
              </button>
            </form>
          )}
        </GlassCard>
      )}

      <AnimatePresence mode="wait">
      {activeTab === "suggestions" ? (
        <motion.div key="sugg-panel" variants={tabPanel} initial="initial" animate="animate" exit="exit">
          <GlassCard className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select value={suggFilters.wardId} onChange={(e) => setSuggFilters((f) => ({ ...f, wardId: e.target.value }))}>
              <option value="">{t("filters.allWards")}</option>
              {WARDS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </Select>
            <Select value={suggFilters.status} onChange={(e) => setSuggFilters((f) => ({ ...f, status: e.target.value }))}>
              <option value="">{t("sugg.filters.allStatuses")}</option>
              {SUGG_STATUSES.map((s) => <option key={s} value={s}>{t(`sugg.status.${s}`)}</option>)}
            </Select>
            <Select value={suggFilters.category} onChange={(e) => setSuggFilters((f) => ({ ...f, category: e.target.value }))}>
              <option value="">{t("filters.allCategories")}</option>
              {SUGG_CATEGORIES.map((c) => <option key={c} value={c}>{t(`sugg.cat.${c}`)}</option>)}
            </Select>
          </GlassCard>

          {filteredSuggestions.length === 0 ? (
            <GlassCard className="py-12 text-center text-neutral-500">
              {suggestions.length === 0 ? t("sugg.none") : t("sugg.noneFiltered")}
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {filteredSuggestions.map((s) => (
                <GlassCard key={s.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{s.referenceId}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${SUGG_STATUS_STYLE[s.status] || ""}`}>{t(`sugg.status.${s.status}`)}</span>
                      <span className="text-xs text-neutral-400">· {s.wardName}</span>
                      <span className="text-xs text-neutral-400">· {t(`sugg.cat.${s.category}`)}</span>
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white">{s.title}</h3>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{s.description}</p>
                    {s.moderationNote && (
                      <p className="mt-2 rounded border-l-2 border-amber-400 bg-amber-50/70 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                        {s.moderationNote}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-32 sm:items-end">
                    <button
                      onClick={() => supportSuggestion(s.id)}
                      disabled={!user}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      <ThumbsUp size={14} /> {s.supportCount}
                    </button>
                    <p className="text-right text-[10px] text-neutral-400">{t("sugg.supportedBy", { n: s.supportCount })}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div key="fb-panel" variants={tabPanel} initial="initial" animate="animate" exit="exit">
          <GlassCard className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select value={fbFilters.wardId} onChange={(e) => setFbFilters((f) => ({ ...f, wardId: e.target.value }))}>
              <option value="">{t("filters.allWards")}</option>
              {WARDS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </Select>
            <Select value={fbFilters.topic} onChange={(e) => setFbFilters((f) => ({ ...f, topic: e.target.value }))}>
              <option value="">{t("fb.form.topicPh")}</option>
              {FB_TOPICS.map((topic) => <option key={topic} value={topic}>{t(`fb.topic.${topic}`)}</option>)}
            </Select>
          </GlassCard>

          <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-white">{t("fb.publicFeedback")}</h2>
          {filteredFeedback.length === 0 ? (
            <GlassCard className="py-10 text-center text-neutral-500">{t("fb.none")}</GlassCard>
          ) : (
            <div className="space-y-3">
              {filteredFeedback.map((f) => {
                const ward = f.wardId ? getWardById(f.wardId) : null;
                return (
                  <GlassCard key={f.id}>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{f.referenceId}</span>
                      <span className="rounded-full bg-brand-yellow/20 px-2 py-0.5 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">{t(`fb.topic.${f.topic}`)}</span>
                      {ward && <span className="text-xs text-neutral-400">· {ward.name}</span>}
                      {f.rating && (
                        <span className="inline-flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: f.rating }).map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-200">{f.message}</p>
                    <p className="mt-2 text-xs text-neutral-400">— {f.submittedByName || t("fb.anon")}</p>
                    {f.response && (
                      <p className="mt-2 rounded border-l-2 border-emerald-400 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                        {f.response}
                      </p>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
