import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AnnouncementsContext = createContext(null);

const normalize = (a) => ({ ...a, id: a.id || a._id });

export function AnnouncementsProvider({ children }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const { announcements: list } = await api.get("/announcements");
      setAnnouncements(list.map(normalize));
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const addAnnouncement = async (a) => {
    const { announcement } = await api.post("/announcements", a);
    const normalized = normalize(announcement);
    setAnnouncements((prev) => [normalized, ...prev]);
    return normalized;
  };

  const deleteAnnouncement = async (id) => {
    await api.del(`/announcements/${id}`);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AnnouncementsContext.Provider value={{ announcements, loading, addAnnouncement, deleteAnnouncement }}>
      {children}
    </AnnouncementsContext.Provider>
  );
}

export const useAnnouncements = () => {
  const ctx = useContext(AnnouncementsContext);
  if (!ctx) throw new Error("useAnnouncements must be used within AnnouncementsProvider");
  return ctx;
};
