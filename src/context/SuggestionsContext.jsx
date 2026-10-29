import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const SuggestionsContext = createContext(null);

export function SuggestionsProvider({ children }) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const { suggestions: list } = await api.get("/suggestions");
      setSuggestions(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const addSuggestion = async (input) => {
    const { suggestion } = await api.post("/suggestions", input);
    setSuggestions((prev) => [suggestion, ...prev]);
    return suggestion;
  };

  // Optimistic updates — see ProblemsContext for the full comment. Same
  // pattern: patch state immediately, swap in the server copy on success,
  // revert on failure.
  const updateSuggestion = async (id, patch) => {
    const rollback = suggestions.find((s) => s.id === id);
    if (rollback) {
      setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    }
    try {
      const { suggestion } = await api.patch(`/suggestions/${id}`, patch);
      setSuggestions((prev) => prev.map((s) => (s.id === id ? suggestion : s)));
      return suggestion;
    } catch (err) {
      if (rollback) setSuggestions((prev) => prev.map((s) => (s.id === id ? rollback : s)));
      throw err;
    }
  };

  const deleteSuggestion = async (id) => {
    const rollback = suggestions.find((s) => s.id === id);
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    try {
      await api.del(`/suggestions/${id}`);
    } catch (err) {
      if (rollback) setSuggestions((prev) => [rollback, ...prev]);
      throw err;
    }
  };

  const upvoteSuggestion = async (id) => {
    const rollback = suggestions.find((s) => s.id === id);
    if (rollback) {
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, supportCount: (s.supportCount || 0) + 1 } : s))
      );
    }
    try {
      const { suggestion } = await api.post(`/suggestions/${id}/upvote`, {});
      setSuggestions((prev) => prev.map((s) => (s.id === id ? suggestion : s)));
      return suggestion;
    } catch (err) {
      if (rollback) setSuggestions((prev) => prev.map((s) => (s.id === id ? rollback : s)));
      throw err;
    }
  };

  return (
    <SuggestionsContext.Provider
      value={{ suggestions, loading, error, refresh, addSuggestion, updateSuggestion, deleteSuggestion, upvoteSuggestion }}
    >
      {children}
    </SuggestionsContext.Provider>
  );
}

export const useSuggestions = () => {
  const ctx = useContext(SuggestionsContext);
  if (!ctx) throw new Error("useSuggestions must be used within SuggestionsProvider");
  return ctx;
};
