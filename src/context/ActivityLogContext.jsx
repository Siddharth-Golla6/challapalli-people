import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const ActivityLogContext = createContext(null);

const normalize = (e) => ({ ...e, id: e.id || e._id });

export function ActivityLogProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const { entries: list } = await api.get("/activity-log");
      setEntries(list.map(normalize));
    } catch {
      // Non-admins can't read the log (403) — that's expected, not an error to surface.
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // actor is accepted for call-site compatibility but the backend derives the
  // real actor from the authenticated admin's JWT, so it's not sent.
  const log = async (_actorIgnored, action) => {
    try {
      const { entry } = await api.post("/activity-log", { action });
      setEntries((prev) => [normalize(entry), ...prev]);
    } catch {
      // Logging failures shouldn't block the admin action that triggered them.
    }
  };

  return <ActivityLogContext.Provider value={{ entries, loading, log, refresh }}>{children}</ActivityLogContext.Provider>;
}

export const useActivityLog = () => {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) throw new Error("useActivityLog must be used within ActivityLogProvider");
  return ctx;
};
