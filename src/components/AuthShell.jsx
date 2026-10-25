import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useLang } from "../context/LanguageContext";

// Shared layout for Login / Register / Forgot Password / Admin Login.
// Modern floating-card look: a single centered glass panel over a dark
// mesh gradient with slow-pulsing colored orbs and a subtle dot grid.
// Linear / Vercel / Clerk influence — minimal, dark-first, focus pulled
// to the form itself.
export default function AuthShell({ title, subtitle, children, footer }) {
  const { t } = useLang();

  return (
    <div className="dark relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4 py-10 text-neutral-100">
      {/* Backdrop — three slow orbs + a faint grid, all pointer-events-none
          so they never swallow a click meant for the card. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="auth-orb left-[8%] top-[15%] h-[32rem] w-[32rem] bg-emerald-500/25" />
        <div className="auth-orb right-[-6rem] top-[55%] h-[28rem] w-[28rem] bg-brand-yellow/20" style={{ animationDelay: "4s" }} />
        <div className="auth-orb left-1/2 bottom-[-10rem] h-[24rem] w-[24rem] -translate-x-1/2 bg-brand-red/20" style={{ animationDelay: "8s" }} />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/0 via-neutral-950/20 to-neutral-950/80" />
      </div>

      <style>{`
        @keyframes auth-orb-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.75; }
          50%      { transform: translate3d(0, -24px, 0) scale(1.08); opacity: 1; }
        }
        .auth-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(72px);
          animation: auth-orb-float 14s ease-in-out infinite;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .auth-orb { animation: none; }
        }
      `}</style>

      <div className="page-enter relative w-full max-w-[420px]">
        {/* Floating brand chip */}
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2.5"
          aria-label="challapalli.people"
        >
          <img
            src="/logo.png"
            alt=""
            width={44}
            height={44}
            className="rounded-full ring-2 ring-brand-yellow/40"
          />
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            challapalli<span className="text-brand-yellow">.</span>people
          </span>
        </Link>

        {/* The card — glass over the orb-lit backdrop. Border uses a soft
            emerald tint so it feels tethered to the brand without shouting. */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-9">
          {/* top-edge highlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />

          {/* Context pill above the heading */}
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
            <Sparkles size={11} /> {t("brand.taglineDot")}
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-[2.1rem]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              {subtitle}
            </p>
          )}

          <div className="auth-form mt-7">{children}</div>
        </div>

        {/* Secondary links / footer prose below the card */}
        {footer && (
          <div className="mt-5 text-center text-sm text-neutral-400">
            {footer}
          </div>
        )}

        {/* Lightweight trust indicator — gives the auth screen a sense of
            legitimacy without a boilerplate "we take security seriously" line. */}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-500">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span>bcrypt-hashed, JWT-signed, no third-party tracking</span>
        </p>
      </div>
    </div>
  );
}
