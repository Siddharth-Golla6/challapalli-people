import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, FileText, ShieldCheck, Users, Users2, Lightbulb, MessageSquare } from "lucide-react";
import LandingNavbar from "../components/LandingNavbar";
import landingBg from "../assets/landing-bg.jpg";
import { useLang } from "../context/LanguageContext";
import { heroContainer, heroItem, gridContainer, gridItem, T } from "../lib/motion";

const FEATURES = [
  { icon: Users, titleKey: "landing.feature1.title", textKey: "landing.feature1.text" },
  { icon: ShieldCheck, titleKey: "landing.feature2.title", textKey: "landing.feature2.text" },
  { icon: Users2, titleKey: "landing.feature3.title", textKey: "landing.feature3.text" },
];

// Hero video — a kingfisher on a natural perch by Mojahid Mottakin
// (Pexels, free for commercial use, no attribution required). Served from
// our own origin at /hero-kingfisher.mp4, so no hot-link to a third party.
// Credit lives on the /copyright page.
const HERO_VIDEO = "/hero-kingfisher.mp4";
const PLAYBACK_RATE = 1.0;
const REVEAL_AT = 0.6; // show the headline fast — well under a second
const HARD_TIMEOUT = 1500;

export default function LandingPage() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const videoRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Choreograph the hero reveal around the video's landing moment, with
  // every fail-safe we can think of so the UI is never stuck invisible.
  useEffect(() => {
    if (reduce) {
      setRevealed(true);
      setVideoReady(true);
      return;
    }
    const video = videoRef.current;
    const reveal = () => setRevealed(true);
    const ready = () => setVideoReady(true);
    const onTime = () => { if (video && video.currentTime >= REVEAL_AT) reveal(); };
    if (!video) { reveal(); return; }

    // Boost playback speed. Browsers apply the rate once the media has
    // enough data, so set it both now and again on `loadeddata` as a belt
    // and braces.
    try { video.playbackRate = PLAYBACK_RATE; } catch {}
    const applyRate = () => { try { video.playbackRate = PLAYBACK_RATE; } catch {} };

    video.addEventListener("loadeddata", ready);
    video.addEventListener("loadeddata", applyRate);
    video.addEventListener("ratechange", applyRate);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", reveal);
    video.addEventListener("error", reveal);
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => reveal());
    const timer = setTimeout(reveal, HARD_TIMEOUT);
    if (video.readyState >= 2) { ready(); applyRate(); }

    return () => {
      clearTimeout(timer);
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("loadeddata", applyRate);
      video.removeEventListener("ratechange", applyRate);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", reveal);
      video.removeEventListener("error", reveal);
    };
  }, [reduce]);

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-neutral-950">
      <LandingNavbar />

      <section className="relative isolate overflow-hidden">
        {/* 1 · poster fades out as video takes over */}
        <AnimatePresence>
          {!videoReady && (
            <motion.img
              key="poster"
              src={landingBg}
              alt={t("landing.heroAlt")}
              className="absolute inset-0 -z-20 h-full w-full object-cover"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: T.slow }}
            />
          )}
        </AnimatePresence>

        {/* 2 · hero video — mirrored left-to-right with scaleX(-1) so the
            kingfisher faces the headline on the left. GPU-cheap, no video
            re-encode needed. */}
        <motion.video
          ref={videoRef}
          src={HERO_VIDEO}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full -scale-x-100 object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: videoReady ? 1 : 0 }}
          transition={T.slow}
        />

        {/* 3 · legibility overlay */}
        <div className="absolute inset-0 -z-[8] bg-gradient-to-r from-brand-green/95 via-brand-green/80 to-brand-green/35 dark:from-neutral-950/95 dark:via-neutral-950/80 dark:to-neutral-950/40" />

        {/* 4 · giant CHALLAPALLI backdrop word via mix-blend-overlay */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[10vh] -z-[5] block select-none whitespace-nowrap text-center font-display text-[16vw] font-black uppercase leading-[0.82] tracking-[-0.04em] text-brand-yellow/90 mix-blend-overlay sm:text-[13vw] lg:text-[12vw]"
          style={{
            WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 55%, rgba(0,0,0,.35) 78%, transparent 100%)",
            maskImage: "linear-gradient(180deg, #000 0%, #000 55%, rgba(0,0,0,.35) 78%, transparent 100%)",
          }}
        >
          Challapalli
        </span>

        {/* 5 · foreground content — motion stagger kicks in once the bird lands */}
        <motion.div
          className="relative z-10 mx-auto flex min-h-[640px] max-w-7xl flex-col justify-center px-6 py-20 sm:min-h-[720px] lg:py-28"
          variants={heroContainer}
          initial="initial"
          animate={revealed ? "animate" : "initial"}
        >
          <motion.p
            variants={heroItem}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-yellow backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 animate-subtle-pulse rounded-full bg-brand-yellow" />
            Challapalli Gram Panchayat · 18 Wards
          </motion.p>

          <motion.h1
            variants={heroItem}
            className="max-w-2xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            {t("landing.headline1")}
            <br />
            <span className="text-brand-yellow">{t("landing.headline2")}</span>
          </motion.h1>

          <motion.div variants={heroItem} className="mt-6 h-1.5 w-20 rounded-full bg-brand-yellow" />

          <motion.p variants={heroItem} className="mt-7 max-w-lg text-lg leading-relaxed text-white/90 sm:text-xl">
            {t("landing.tagline")}
          </motion.p>

          <motion.div variants={heroItem} className="mt-10 flex flex-wrap items-center gap-4">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/dashboard"
                aria-label={t("landing.cta.getStarted")}
                className="group inline-flex items-center gap-2 rounded-full bg-brand-yellow px-7 py-3.5 text-base font-bold text-neutral-900 shadow-lg transition-shadow duration-200 ease-out hover:bg-brand-yellow-dark hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-green"
              >
                {t("landing.cta.getStarted")}
                <ArrowRight size={18} className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/report"
                aria-label={t("landing.cta.report")}
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/90 bg-white/5 px-7 py-3 text-base font-bold text-white backdrop-blur-sm transition-colors duration-200 ease-out hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-green"
              >
                <FileText size={18} /> {t("landing.cta.report")}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={heroItem} className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            <Link to="/voice" className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-yellow">
              <Lightbulb size={14} /> People's Voice
            </Link>
            <Link to="/announcements" className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-yellow">
              <MessageSquare size={14} /> Announcements
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature strip — fades in on scroll */}
      <motion.div
        className="border-t border-neutral-200/70 bg-brand-cream px-6 py-14 dark:border-neutral-800 dark:bg-neutral-950"
        variants={gridContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-3 sm:divide-x sm:divide-neutral-200 dark:sm:divide-neutral-800">
          {FEATURES.map(({ icon: Icon, titleKey, textKey }, i) => (
            <motion.div
              key={titleKey}
              variants={gridItem}
              className={`flex items-start gap-4 ${i > 0 ? "sm:pl-8" : ""}`}
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow/20 ring-1 ring-brand-yellow/30 transition-colors duration-200 ease-out">
                <Icon size={24} className="text-brand-green dark:text-brand-yellow" strokeWidth={2.25} />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">{t(titleKey)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{t(textKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
