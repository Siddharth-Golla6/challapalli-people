import React, { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import GlassCard from "../../components/GlassCard";
import { Label, Input, Select, Textarea } from "../../components/FormField";
import { useAnnouncements } from "../../context/AnnouncementsContext";
import { useActivityLog } from "../../context/ActivityLogContext";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../context/LanguageContext";
import { WARDS } from "../../data/geography";

const empty = { title: "", body: "", wardId: "" };

export default function AnnouncementsPanel() {
  const { t, lang } = useLang();
  const dateLocale = lang === "te" ? "te-IN" : "en-IN";
  const { announcements, addAnnouncement, deleteAnnouncement } = useAnnouncements();
  const { log } = useActivityLog();
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  // Activity-log is fire-and-forget — see ComplaintsPanel for the rationale.
  const logFire = (message) => {
    log(user?.name || "Admin", message).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setError("");
    try {
      await addAnnouncement(form);
      logFire(`Posted announcement "${form.title}"`);
      setForm(empty);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (a) => {
    setError("");
    try {
      await deleteAnnouncement(a.id);
      logFire(`Removed announcement "${a.title}"`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">{t("admin.ann.title")}</h2>
      {error && <p className="mb-4 text-sm font-medium text-brand-red">{error}</p>}

      <GlassCard as="form" onSubmit={handleSubmit} className="mb-8 space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-800 dark:text-neutral-200">
          <PlusCircle size={16} /> {t("admin.ann.newTitle")}
        </h3>
        <div>
          <Label htmlFor="antitle" required>{t("admin.ann.title2")}</Label>
          <Input id="antitle" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="anbody" required>{t("admin.ann.message")}</Label>
          <Textarea id="anbody" rows={3} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="anward">{t("admin.ann.wardOptional")}</Label>
          <Select id="anward" value={form.wardId} onChange={(e) => setForm((f) => ({ ...f, wardId: e.target.value }))}>
            <option value="">{t("admin.ann.allWards")}</option>
            {WARDS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
        </div>
        <button type="submit" className="rounded-lg bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red-dark">
          {t("admin.ann.publish")}
        </button>
      </GlassCard>

      <div className="space-y-3">
        {announcements.map((a) => (
          <GlassCard key={a.id} className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-neutral-400">{new Date(a.date).toLocaleDateString(dateLocale)}</p>
              <h3 className="font-bold text-neutral-900 dark:text-white">{a.title}</h3>
              <p className="text-sm text-neutral-500">{a.body}</p>
            </div>
            <button onClick={() => handleDelete(a)} className="shrink-0 rounded-lg p-1.5 text-brand-red hover:bg-red-50 dark:hover:bg-red-500/10">
              <Trash2 size={16} />
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
