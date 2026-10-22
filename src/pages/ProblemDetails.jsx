import React, { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ThumbsUp, MapPin, User, Phone, Calendar, MessageCircle, X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { StatusBadge, PriorityBadge } from "../components/Badges";
import MapPicker from "../components/MapPicker";
import { Textarea } from "../components/FormField";
import { useProblems } from "../context/ProblemsContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { api } from "../lib/api";

export default function ProblemDetails() {
  const { t, lang } = useLang();
  const { id } = useParams();
  const { problems, loading: listLoading, upvote, addComment } = useProblems();
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState("");
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // The dashboard's shared problems list only holds what's currently
  // visible to this viewer (verified complaints, plus everything for staff).
  // A resident's own pending complaint — or any direct link the list wouldn't
  // include — still needs to load, so fall back to fetching it by id.
  const listProblem = problems.find((p) => p.id === id);
  const [fetchedProblem, setFetchedProblem] = useState(null);
  const [fetchStatus, setFetchStatus] = useState("idle"); // idle | loading | done | notfound

  useEffect(() => {
    if (listProblem || listLoading) return;
    let cancelled = false;
    setFetchStatus("loading");
    api
      .get(`/problems/${id}`)
      .then(({ problem: fetched }) => {
        if (!cancelled) {
          setFetchedProblem(fetched);
          setFetchStatus("done");
        }
      })
      .catch(() => {
        if (!cancelled) setFetchStatus("notfound");
      });
    return () => {
      cancelled = true;
    };
  }, [id, listProblem, listLoading]);

  const problem = listProblem || fetchedProblem;

  if (!problem) {
    if (listLoading || fetchStatus === "idle" || fetchStatus === "loading") return null;
    return <Navigate to="/dashboard" replace />;
  }

  const dateLocale = lang === "te" ? "te-IN" : "en-IN";
  const photos = problem.photos?.length ? problem.photos : problem.photo ? [problem.photo] : [];

  const showPhoto = (i) => setActivePhoto((i + photos.length) % photos.length);

  const handleUpvote = async () => {
    if (voted) return;
    try {
      const updated = await upvote(problem.id);
      setFetchedProblem(updated);
      setVoted(true);
    } catch (err) {
      if ((err.rawMessage || err.message).includes("already supported")) setVoted(true);
      else setError(err.message);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const updated = await addComment(problem.id, comment.trim());
      setFetchedProblem(updated);
      setComment("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to={`/ward/${problem.wardId}`} className="mb-4 inline-block text-sm font-semibold text-brand-red hover:underline">
        ← {problem.wardName}
      </Link>

      <div className="glass-card overflow-hidden">
        {photos.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="group relative block w-full bg-neutral-900"
            >
              <img
                src={photos[activePhoto]}
                alt={t("problem.photoAlt", { title: problem.title, n: activePhoto + 1 })}
                className="max-h-[28rem] w-full object-contain"
              />
              <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                <Expand size={14} /> {t("problem.viewFullSize")}
              </span>
              {photos.length > 1 && (
                <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                  {activePhoto + 1} / {photos.length}
                </span>
              )}
            </button>

            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-black/5 bg-black/5 p-2 dark:border-white/5 dark:bg-white/5">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-md ring-2 transition ${
                      i === activePhoto ? "ring-brand-red" : "ring-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={p} alt={t("problem.thumbnailAlt", { n: i + 1 })} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={problem.status} />
            <PriorityBadge priority={problem.priority} />
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {t(`cat.${problem.category}`)}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white sm:text-3xl">{problem.title}</h1>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {problem.landmark ? `${problem.landmark}, ` : ""}{problem.wardName}</span>
            {problem.reportedByName && (
              <span className="flex items-center gap-1.5"><User size={14} /> {t("problem.reportedBy", { name: problem.reportedByName })}</span>
            )}
            {problem.reportedByPhone && (
              <span className="flex items-center gap-1.5"><Phone size={14} /> {t("problem.reporterPhone", { phone: problem.reportedByPhone })}</span>
            )}
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(problem.createdAt).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>

          <p className="mt-5 leading-relaxed text-neutral-700 dark:text-neutral-300">{problem.description}</p>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleUpvote}
              disabled={voted}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                voted
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-brand-yellow/20 text-neutral-800 hover:bg-brand-yellow/30 dark:text-brand-yellow"
              }`}
            >
              <ThumbsUp size={16} /> {voted ? t("problem.supported") : t("problem.support")} · {problem.supportCount}
            </button>
            {problem.assignedVolunteer && (
              <span className="text-sm text-neutral-500">
                {t("problem.assignedTo", { name: problem.assignedVolunteer })}
              </span>
            )}
          </div>
        </div>
      </div>

      {problem.progressPhotos?.length > 0 && (
        <GlassCard className="mt-6">
          <h2 className="mb-3 text-sm font-bold text-neutral-800 dark:text-neutral-200">{t("problem.progressPhotos")}</h2>
          <div className="flex gap-3 overflow-x-auto">
            {problem.progressPhotos.map((p, i) => (
              <img key={i} src={p} alt={t("problem.progressPhotos")} className="h-32 w-48 shrink-0 rounded-lg object-cover" />
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard className="mt-6">
        <h2 className="mb-4 text-sm font-bold text-neutral-800 dark:text-neutral-200">{t("problem.statusTimeline")}</h2>
        <ol className="space-y-4 border-l-2 border-brand-yellow/50 pl-5">
          {problem.timeline.map((tl, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-red dark:border-neutral-900" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{t(`status.${tl.status}`)}</p>
              <p className="text-xs text-neutral-500">
                {new Date(tl.date).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </li>
          ))}
        </ol>
      </GlassCard>

      {(problem.lat || problem.lng) && (
        <GlassCard className="mt-6">
          <h2 className="mb-3 text-sm font-bold text-neutral-800 dark:text-neutral-200">{t("problem.location")}</h2>
          <MapPicker value={problem.lat ? { lat: problem.lat, lng: problem.lng } : null} readOnly onChange={() => {}} />
        </GlassCard>
      )}

      <GlassCard className="mt-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-800 dark:text-neutral-200">
          <MessageCircle size={16} /> {t("problem.comments")} ({problem.comments.length})
        </h2>
        <div className="mb-4 space-y-3">
          {problem.comments.map((c, i) => (
            <div key={i} className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{c.author}</p>
                <p className="text-xs text-neutral-400">
                  {new Date(c.date).toLocaleDateString(dateLocale, { day: "numeric", month: "short" })}
                </p>
              </div>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{c.text}</p>
            </div>
          ))}
        </div>

        {error && <p className="mb-3 text-sm font-medium text-brand-red">{error}</p>}

        {user ? (
          <form onSubmit={handleComment} className="flex gap-2">
            <Textarea
              rows={1}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("problem.commentPlaceholder")}
              className="flex-1"
            />
            <button type="submit" className="shrink-0 rounded-lg bg-brand-red px-4 text-sm font-semibold text-white hover:bg-brand-red-dark">
              {t("problem.postComment")}
            </button>
          </form>
        ) : (
          <p className="text-sm text-neutral-500">
            <Link to="/login" className="font-semibold text-brand-red hover:underline">{t("problem.loginToComment")}</Link>
          </p>
        )}
      </GlassCard>

      {lightboxOpen && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label={t("common.close")}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPhoto(activePhoto - 1);
              }}
              aria-label={t("problem.photoNav.previous")}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-4"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          <img
            src={photos[activePhoto]}
            alt={t("problem.fullSizeAlt", { title: problem.title, n: activePhoto + 1 })}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPhoto(activePhoto + 1);
                }}
                aria-label={t("problem.photoNav.next")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-4"
              >
                <ChevronRight size={26} />
              </button>
              <span className="mt-3 text-sm font-medium text-white/80">
                {activePhoto + 1} / {photos.length}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
