import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, CheckCircle2, X } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { Label, Input, Select, Textarea } from "../components/FormField";
import MapPicker from "../components/MapPicker";
import { WARDS } from "../data/geography";
import { CATEGORY_OPTIONS } from "../data/mockData";
import { categoryImage } from "../utils/placeholderImage";
import { compressImage } from "../utils/compressImage";
import { useProblems } from "../context/ProblemsContext";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  title: "",
  category: "",
  wardId: "",
  landmark: "",
  description: "",
};

export default function ReportProblem() {
  const { t } = useLang();
  const { addProblem } = useProblems();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [reporterName, setReporterName] = useState(user?.name || "");
  const [reporterPhone, setReporterPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(null);
  const [photoDataUrls, setPhotoDataUrls] = useState([]);
  const [error, setError] = useState("");
  const [submittedId, setSubmittedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // A ref (not state) gates the actual submit — state updates from several
  // synchronous clicks in the same tick get batched by React and can all
  // still see the old `submitting` value before a re-render happens, so a
  // state-only guard doesn't reliably stop a fast double/triple click. A ref
  // mutates immediately and is shared across every call, so it can't race.
  const submittingRef = useRef(false);

  const MAX_PHOTOS = 10;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handlePhoto = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const remaining = MAX_PHOTOS - photoDataUrls.length;
    if (remaining <= 0) {
      setError(t("report.error.maxPhotos", { max: MAX_PHOTOS }));
      return;
    }

    for (const file of files.slice(0, remaining)) {
      try {
        const dataUrl = await compressImage(file);
        setPhotoDataUrls((prev) => [...prev, dataUrl]);
      } catch {
        setError(t("report.error.badPhoto"));
      }
    }
  };

  const removePhoto = (index) => {
    setPhotoDataUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setError("");
    if (!form.title.trim() || !form.category || !form.wardId || !form.description.trim() || !reporterName.trim() || !reporterPhone.trim()) {
      setError(t("report.error.required"));
      return;
    }

    const ward = WARDS.find((m) => m.id === form.wardId);

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const photos = photoDataUrls.length
        ? photoDataUrls
        : [categoryImage(form.category, form.landmark || ward.name)];

      const created = await addProblem({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        photo: photos[0],
        photos,
        wardId: form.wardId,
        wardName: ward.name,
        landmark: form.landmark.trim(),
        lat: location?.lat ?? null,
        lng: location?.lng ?? null,
        reporterName: reporterName.trim(),
        reporterPhone: reporterPhone.trim(),
      });
      setSubmittedId(created.id);
    } catch (err) {
      setError(err.message);
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <CheckCircle2 size={56} className="mb-4 text-emerald-500" />
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{t("report.success.title")}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t("report.success.body")}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate(`/problem/${submittedId}`)}
            className="rounded-lg bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark"
          >
            {t("report.success.viewReport")}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
          >
            {t("report.success.backToDashboard")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">{t("report.title")}</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        {t("report.subtitle")}
      </p>

      <GlassCard as="form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="title" required>{t("report.field.title")}</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={t("report.field.titlePh")}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="reporterName" required>{t("report.field.reporterName")}</Label>
            <Input
              id="reporterName"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="reporterPhone" required>{t("report.field.reporterPhone")}</Label>
            <Input
              id="reporterPhone"
              type="tel"
              inputMode="numeric"
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
              required
            />
          </div>
        </div>
        <p className="-mt-3 text-xs text-neutral-500 dark:text-neutral-400">{t("report.field.contactNote")}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="category" required>{t("report.field.category")}</Label>
            <Select id="category" value={form.category} onChange={(e) => set("category", e.target.value)} required>
              <option value="">{t("report.field.categoryPh")}</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{t(`cat.${c}`)}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="constituency">{t("report.field.constituency")}</Label>
            <Input id="constituency" value={t("dashboard.constituency")} readOnly disabled />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ward" required>{t("report.field.ward")}</Label>
            <Select
              id="ward"
              value={form.wardId}
              onChange={(e) => set("wardId", e.target.value)}
              required
            >
              <option value="">{t("report.field.wardPh")}</option>
              {WARDS.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="landmark">{t("report.field.landmark")}</Label>
            <Input
              id="landmark"
              value={form.landmark}
              onChange={(e) => set("landmark", e.target.value)}
              placeholder={t("report.field.landmarkPh")}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description" required>{t("report.field.description")}</Label>
          <Textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder={t("report.field.descriptionPh")}
            required
          />
        </div>

        <div>
          <Label htmlFor="photo">{t("report.field.photo")}</Label>

          {photoDataUrls.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photoDataUrls.map((url, i) => (
                <div key={i} className="group relative h-24 overflow-hidden rounded-lg">
                  <img src={url} alt={t("report.selectedAlt", { n: i + 1 })} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={t("report.removePhoto")}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photoDataUrls.length < MAX_PHOTOS && (
            <label
              htmlFor="photo"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-white/60 p-6 text-center transition hover:border-brand-red dark:border-neutral-700 dark:bg-neutral-900/40"
            >
              <UploadCloud size={28} className="mb-2 text-neutral-400" />
              <span className="text-sm text-neutral-500">
                {photoDataUrls.length > 0
                  ? t("report.uploadMore", { count: photoDataUrls.length, max: MAX_PHOTOS })
                  : t("report.uploadClick")}
              </span>
            </label>
          )}
          <input
            id="photo"
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhoto}
            className="hidden"
          />
        </div>

        <div>
          <Label>{t("report.field.gps")}</Label>
          <MapPicker value={location} onChange={setLocation} />
        </div>

        {error && <p className="text-sm font-medium text-brand-red" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-red py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? t("report.submitting") : t("report.submit")}
        </button>
      </GlassCard>
    </div>
  );
}
