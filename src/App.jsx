import React, { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { ProblemsProvider } from "./context/ProblemsContext";
import { AnnouncementsProvider } from "./context/AnnouncementsContext";
import { ActivityLogProvider } from "./context/ActivityLogContext";
import { VolunteersProvider } from "./context/VolunteersContext";
import { SuggestionsProvider } from "./context/SuggestionsContext";
import { FeedbackProvider } from "./context/FeedbackContext";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PageShell from "./components/PageShell";

// The landing + login flow has to feel instant, so those stay eager.
// Everything else is pulled off the critical path with React.lazy —
// recharts (~90 KB), leaflet (~60 KB) and the admin bundle live in
// their own JS chunks, downloaded only when a user actually opens a
// page that uses them.
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const WardDashboard = lazy(() => import("./pages/WardDashboard"));
const ReportProblem = lazy(() => import("./pages/ReportProblem"));
const ProblemDetails = lazy(() => import("./pages/ProblemDetails"));
const SolvedProblems = lazy(() => import("./pages/SolvedProblems"));
const Announcements = lazy(() => import("./pages/Announcements"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CommunityVoice = lazy(() => import("./pages/CommunityVoice"));
const Copyright = lazy(() => import("./pages/Copyright"));
const MyReports = lazy(() => import("./pages/MyReports"));

// Every routed element passes through PageShell, which gives it a shared
// fade+lift entrance/exit powered by framer-motion. withLayout stacks the
// chrome (Navbar + Footer) OUTSIDE PageShell so only the content transitions,
// not the top bar.
const withShell = (element) => <PageShell>{element}</PageShell>;
const withLayout = (element) => (
  <Layout>
    <PageShell>{element}</PageShell>
  </Layout>
);

function Providers({ children }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ProblemsProvider>
            <AnnouncementsProvider>
              <ActivityLogProvider>
                <VolunteersProvider>
                  <SuggestionsProvider>
                    <FeedbackProvider>{children}</FeedbackProvider>
                  </SuggestionsProvider>
                </VolunteersProvider>
              </ActivityLogProvider>
            </AnnouncementsProvider>
          </ProblemsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

// React Router v6 doesn't restore scroll on its own, and the framer-motion
// exit animation (plus the Suspense fallback for lazy-loaded routes) keeps
// the outgoing page visible/laid-out for a beat — the window ends up
// scrolled wherever the previous page was. Fix: scroll immediately on
// pathname change AND again on the next animation frame to catch any
// Suspense-swapped content that mounts after the first pass. Skip when
// the URL has a #hash — then the browser's anchor jump wins.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    const goTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    goTop();
    const raf = requestAnimationFrame(goTop);
    // Catches lazy chunks that mount a tick or two later.
    const timer = setTimeout(goTop, 80);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [pathname, hash]);
  return null;
}

// Wrapping Routes in AnimatePresence is what makes exit transitions fire —
// without it, the leaving page is unmounted instantly. Keyed on pathname so
// each route is a distinct "scene" to animate between.
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
        <Routes location={location} key={location.pathname}>
        <Route path="/" element={withShell(<LandingPage />)} />
        <Route path="/login" element={withShell(<Login />)} />
        <Route path="/register" element={withShell(<Register />)} />
        <Route path="/forgot-password" element={withShell(<ForgotPassword />)} />
        <Route path="/admin-login" element={withShell(<AdminLogin />)} />

        <Route path="/dashboard" element={withLayout(<Dashboard />)} />
        <Route path="/ward/:wardId" element={withLayout(<WardDashboard />)} />
        <Route path="/problem/:id" element={withLayout(<ProblemDetails />)} />
        <Route path="/solved" element={withLayout(<SolvedProblems />)} />
        <Route path="/announcements" element={withLayout(<Announcements />)} />
        <Route path="/voice" element={withLayout(<CommunityVoice />)} />
        <Route path="/suggestions" element={<Navigate to="/voice?tab=suggestions" replace />} />
        <Route path="/feedback" element={<Navigate to="/voice?tab=feedback" replace />} />
        <Route path="/about" element={withLayout(<AboutUs />)} />
        <Route path="/copyright" element={withLayout(<Copyright />)} />

        <Route
          path="/report"
          element={withLayout(
            <ProtectedRoute>
              <ReportProblem />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/my-reports"
          element={withLayout(
            <ProtectedRoute>
              <MyReports />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin"
          element={withLayout(
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          )}
        />

        {/* /404 is a direct URL for linking the page (useful for QR codes or
            share-sheet previews), while * catches every unmatched route.
            NotFound carries its own header, so wrap only in PageShell. */}
        <Route path="/404" element={withShell(<NotFound />)} />
        <Route path="*" element={withShell(<NotFound />)} />
      </Routes>
      </Suspense>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <Providers>
      <AnimatedRoutes />
    </Providers>
  );
}
