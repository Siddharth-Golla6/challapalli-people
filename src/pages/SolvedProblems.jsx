import React, { useMemo, useState } from "react";
import ProblemCard from "../components/ProblemCard";
import GlassCard from "../components/GlassCard";
import ProblemFilters, { DEFAULT_FILTERS, applyFilters } from "../components/ProblemFilters";
import { CardGridSkeleton } from "../components/Skeleton";
import { useProblems } from "../context/ProblemsContext";
import { useLang } from "../context/LanguageContext";
import useDelayedReady from "../hooks/useDelayedReady";

export default function SolvedProblems() {
  const { t } = useLang();
  const { problems } = useProblems();
  const ready = useDelayedReady(400);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const solved = useMemo(() => problems.filter((p) => p.status === "Completed"), [problems]);
  const filtered = useMemo(() => applyFilters(solved, filters), [solved, filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">{t("solved.title")}</h1>
      <p className="mt-1 mb-6 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
        {t("solved.subtitleCount", { n: solved.length })}
      </p>

      <div className="mb-6">
        <ProblemFilters filters={filters} onChange={setFilters} />
      </div>

      {!ready ? (
        <CardGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <GlassCard className="py-12 text-center text-neutral-500">{t("solved.noneFiltered")}</GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      )}
    </div>
  );
}
