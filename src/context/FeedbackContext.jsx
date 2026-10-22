import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const { feedback: list } = await api.get("/feedback");
      setFeedback(list);
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

  const addFeedback = async (input) => {
    const { feedback: created } = await api.post("/feedback", input);
    setFeedback((prev) => [created, ...prev]);
    return created;
  };

  const updateFeedback = async (id, patch) => {
    const { feedback: updated } = await api.patch(`/feedback/${id}`, patch);
    setFeedback((prev) => prev.map((f) => (f.id === id ? updated : f)));
    return updated;
  };

  const deleteFeedback = async (id) => {
    await api.del(`/feedback/${id}`);
    setFeedback((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <FeedbackContext.Provider
      value={{ feedback, loading, error, refresh, addFeedback, updateFeedback, deleteFeedback }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export const useFeedback = () => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider");
  return ctx;
};
