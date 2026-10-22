import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ThumbsUp, ArrowUpRight } from "lucide-react";
import { StatusBadge, PriorityBadge } from "./Badges";
import { gridItem, T } from "../lib/motion";

export default function ProblemCard({ problem }) {
  return (
    <motion.div
      variants={gridItem}
      whileHover={{ y: -6, transition: T.base }}
      whileTap={{ scale: 0.98, transition: T.snap }}
    >
      <Link
        to={`/problem/${problem.id}`}
        className="card-flat group flex flex-col overflow-hidden !p-0"
        aria-label={`${problem.title} — ${problem.wardName}`}
      >
        <div className="relative h-44 w-full overflow-hidden">
          <motion.img
            src={problem.photo}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            loading="lazy"
            whileHover={{ scale: 1.04 }}
            transition={T.slow}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 drop-shadow-md">
            <PriorityBadge priority={problem.priority} />
          </span>
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            <ThumbsUp size={11} strokeWidth={2.25} /> {problem.supportCount}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={problem.status} />
            <ArrowUpRight
              size={16}
              className="text-neutral-400 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden="true"
            />
          </div>

          <h3 className="font-display line-clamp-2 text-base font-bold leading-snug text-neutral-900 dark:text-white">
            {problem.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {problem.description}
          </p>

          <p className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <MapPin size={13} className="shrink-0 text-brand-red" strokeWidth={2.25} />
            <span className="truncate">
              {problem.landmark ? `${problem.landmark}, ` : ""}{problem.wardName}
            </span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
