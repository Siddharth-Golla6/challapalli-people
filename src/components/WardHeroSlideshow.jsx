import React, { useEffect, useState } from "react";

// Crossfading full-page background slideshow for a Ward's page. Fixed to
// the viewport so it stays put behind content while scrolling. Renders
// nothing if there are no photos — callers only mount this when a Ward
// has a photo set.
export default function WardHeroSlideshow({ photos, intervalMs = 5000 }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!photos || photos.length < 2) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % photos.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [photos, intervalMs]);

  if (!photos || photos.length === 0) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {photos.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === active ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-white/55 dark:bg-neutral-950/70" />
    </div>
  );
}
