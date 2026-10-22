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

  const updateProblem = async (id, patch) => {
    const { problem } = await api.patch(`/problems/${id}`, patch);
    return replaceOne(problem);
  };

  const deleteProblem = async (id) => {
    await api.del(`/problems/${id}`);
    setProblems((prev) => prev.filter((p) => p.id !== id));
  };

  const addComment = async (id, text) => {
    const { problem } = await api.post(`/problems/${id}/comments`, { text });
    return replaceOne(problem);
  };

  const upvote = async (id) => {
    const { problem } = await api.post(`/problems/${id}/upvote`, {});
    return replaceOne(problem);
  };

  return (
    <ProblemsContext.Provider
      value={{ problems, loading, error, refresh, addProblem, updateProblem, deleteProblem, addComment, upvote }}
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
