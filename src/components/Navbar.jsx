import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, LogOut, ShieldCheck, User, Languages } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/LanguageContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  const LINKS = [
    { to: "/dashboard", label: t("nav.home") },
    { to: "/report", label: t("nav.report") },
    { to: "/voice", label: t("nav.voice") },
    { to: "/solved", label: t("nav.solved") },
    { to: "/announcements", label: t("nav.announcements") },
    { to: "/about", label: t("nav.about") },
  ];

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  // Underline indicator on the active route — subtler than the previous
  // red pill, lets long nav rows read as a line of options instead of
  // competing buttons. Fallback hover: soft yellow wash.
  const linkClass = ({ isActive }) =>
    `relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150 ease-emphasised ${
      isActive
        ? "text-brand-red after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-red"
        : "text-neutral-700 hover:text-brand-red hover:bg-brand-yellow/15 dark:text-neutral-200 dark:hover:bg-brand-yellow/10"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <NavLink to="/" className="shrink-0">
          <Logo size={38} />
        </NavLink>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t("nav.primary")}>
          {LINKS.filter((l, i) => LINKS.findIndex((x) => x.label === l.label) === i).map((link) => (
            <NavLink key={link.label} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              {t("nav.adminDashboard")}
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            onClick={toggleLang}
            aria-label={t("nav.toggleLang")}
            title={t("nav.toggleLang")}
            className="flex min-h-[36px] items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <Languages size={16} />
            {lang === "en" ? "తె" : "EN"}
          </button>
          <button
            onClick={toggleTheme}
            aria-label={t("nav.toggleDark")}
            className="rounded-full p-2 text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-brand-yellow/20 px-3 py-1.5 text-xs font-semibold text-neutral-800 ring-1 ring-brand-yellow/30 dark:bg-brand-yellow/15 dark:text-brand-yellow">
                {isAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors duration-150 hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <LogOut size={14} /> {t("nav.logout")}
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="inline-flex min-h-[40px] items-center rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 ease-emphasised hover:-translate-y-px hover:bg-brand-red-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 focus-visible:ring-offset-2"
            >
              {t("nav.login")}
            </NavLink>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-neutral-700 dark:text-neutral-200 lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={t("nav.mobileMenu")}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label={t("nav.mobile")}>
            {LINKS.filter((l, i) => LINKS.findIndex((x) => x.label === l.label) === i).map((link) => (
              <NavLink key={link.label} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                {t("nav.adminDashboard")}
              </NavLink>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200"
                >
                  {dark ? <Sun size={16} /> : <Moon size={16} />} {dark ? t("nav.lightMode") : t("nav.darkMode")}
                </button>
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-1 text-sm font-semibold text-neutral-700 dark:text-neutral-200"
                >
                  <Languages size={16} /> {lang === "en" ? "తె" : "EN"}
                </button>
              </div>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
                >
                  <LogOut size={14} /> {t("nav.logout")}
                </button>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white"
                >
                  {t("nav.login")}
                </NavLink>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
