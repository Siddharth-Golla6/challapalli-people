import React from "react";
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

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import WardDashboard from "./pages/WardDashboard";
import ReportProblem from "./pages/ReportProblem";
import ProblemDetails from "./pages/ProblemDetails";
import SolvedProblems from "./pages/SolvedProblems";
import Announcements from "./pages/Announcements";
import AboutUs from "./pages/AboutUs";
import AdminDashboard from "./pages/AdminDashboard";
import CommunityVoice from "./pages/CommunityVoice";
import Copyright from "./pages/Copyright";
import MyReports from "./pages/MyReports";
import NotFound from "./pages/NotFound";

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

// Wrapping Routes in AnimatePresence is what makes exit transitions fire —
// without it, the leaving page is unmounted instantly. Keyed on pathname so
// each route is a distinct "scene" to animate between.
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
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
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Providers>
      <AnimatedRoutes />
    </Providers>
  );
}
