import React, { useState } from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import GlassCard from "../../components/GlassCard";
import { WARDS } from "../../data/geography";
import { useProblems } from "../../context/ProblemsContext";
import { useVolunteers } from "../../context/VolunteersContext";
import { useLang } from "../../context/LanguageContext";
import { getProblemsByWard } from "../../data/mockData";

export default function GeographyPanel() {
  const { t } = useLang();
  const [open, setOpen] = useState(WARDS[0]?.id);
  const { problems } = useProblems();
  const { volunteers: allVolunteers } = useVolunteers();

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-neutral-900 dark:text-white">{t("admin.geo.pageTitle")}</h2>
      <p className="mb-4 text-sm text-neutral-500">
        {t("admin.geo.summary", {
          constituency: t("dashboard.constituency"),
          wards: WARDS.length,
        })}
      </p>

      <div className="space-y-3">
        {WARDS.map((w) => {
          const isOpen = open === w.id;
          const wardProblems = getProblemsByWard(problems, w.id);
          const volunteers = allVolunteers.filter((v) => v.wardId === w.id);
          return (
            <GlassCard key={w.id} className="!p-0">
              <button
                onClick={() => setOpen(isOpen ? null : w.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">{w.name}</p>
                  <p className="text-xs text-neutral-500">
                    {t("admin.geo.wardSummary", {
                      complaints: wardProblems.length,
                      volunteers: volunteers.length,
                    })}
                  </p>
                </div>
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              {isOpen && (
                <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-neutral-400">
                    <Users size={12} /> {t("admin.geo.volunteersLabel")}
                  </p>
                  {volunteers.length === 0 ? (
                    <p className="text-xs text-neutral-400">{t("admin.geo.noVolunteers")}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {volunteers.map((v) => (
                        <span key={v.id} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                          {v.name} · {t("ward.resolvedCount", { n: v.resolved })}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
