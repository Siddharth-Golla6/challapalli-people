import React from "react";

export function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function ProblemCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <SkeletonBlock className="h-44 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-2/3" />
        <div className="flex gap-2 pt-1">
          <SkeletonBlock className="h-6 w-16" />
          <SkeletonBlock className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6, Component = ProblemCardSkeleton }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
