import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const ProblemsContext = createContext(null);

const normalize = (p) => ({ ...p, id: p.id || p._id });

export function ProblemsProvider({ children }) {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const { problems: list } = await api.get("/problems");
      setProblems(list.map(normalize));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on login/logout/role change — the server includes different
  // fields (reporter contact) and problems (pending "New" ones) depending on
  // who's asking, so a stale pre-login fetch would under-show staff users.
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const replaceOne = (updated) => {
    const normalized = normalize(updated);
    setProblems((prev) => prev.map((p) => (p.id === normalized.id ? normalized : p)));
    return normalized;
  };

  const addProblem = async (input) => {
    const { problem } = await api.post("/problems", input);
    const normalized = normalize(problem);
    setProblems((prev) => [normalized, ...prev]);
    return normalized;
  };

  // Optimistic update: the UI reflects the new value immediately so the
  // dropdown/badge doesn't appear stuck while Render's free tier spins up a
  // 300-1500 ms round-trip. On an API failure we revert to the pre-patch
  // row and re-throw so the caller can surface the error.
  const updateProblem = async (id, patch) => {
    const rollback = problems.find((p) => p.id === id);
    if (rollback) {
      setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    }
    try {
      const { problem } = await api.patch(`/problems/${id}`, patch);
      return replaceOne(problem);
    } catch (err) {
      if (rollback) setProblems((prev) => prev.map((p) => (p.id === id ? rollback : p)));
      throw err;
    }
  };

  const deleteProblem = async (id) => {
    const rollback = problems.find((p) => p.id === id);
    setProblems((prev) => prev.filter((p) => p.id !== id));
    try {
      await api.del(`/problems/${id}`);
    } catch (err) {
      if (rollback) setProblems((prev) => [rollback, ...prev]);
      throw err;
    }
  };

  const addComment = async (id, text) => {
    const { problem } = await api.post(`/problems/${id}/comments`, { text });
    return replaceOne(problem);
  };

  // Upvote is bumped locally straight away — a +1 counter should never feel
  // laggy. The server reply replaces our row so the authoritative count wins.
  const upvote = async (id) => {
    const rollback = problems.find((p) => p.id === id);
    if (rollback) {
      setProblems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, supportCount: (p.supportCount || 0) + 1 } : p))
      );
    }
    try {
      const { problem } = await api.post(`/problems/${id}/upvote`, {});
      return replaceOne(problem);
    } catch (err) {
      if (rollback) setProblems((prev) => prev.map((p) => (p.id === id ? rollback : p)));
      throw err;
    }
  };

  // One-off geo query — not stored in state because the user's "Near me"
  // view is a transient slice over the main list, not a replacement for it.
  const fetchNearby = async ({ lat, lng, radiusKm = 2 }) => {
    const qs = new URLSearchParams({ nearLat: lat, nearLng: lng, radiusKm }).toString();
    const { problems: list } = await api.get(`/problems?${qs}`);
    return list.map(normalize);
  };

  return (
    <ProblemsContext.Provider
      value={{ problems, loading, error, refresh, addProblem, updateProblem, deleteProblem, addComment, upvote, fetchNearby }}
    >
      {children}
    </ProblemsContext.Provider>
  );
}

export const useProblems = () => {
  const ctx = useContext(ProblemsContext);
  if (!ctx) throw new Error("useProblems must be used within ProblemsProvider");
  return ctx;
};
