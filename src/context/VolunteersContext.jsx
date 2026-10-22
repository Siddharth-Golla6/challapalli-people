import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const VolunteersContext = createContext(null);

const normalize = (v) => ({ ...v, id: v.id || v._id });

export function VolunteersProvider({ children }) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/volunteers")
      .then(({ volunteers: list }) => setVolunteers(list.map(normalize)))
      .catch(() => setVolunteers([]))
      .finally(() => setLoading(false));
  }, []);

  return <VolunteersContext.Provider value={{ volunteers, loading }}>{children}</VolunteersContext.Provider>;
}

export const useVolunteers = () => {
  const ctx = useContext(VolunteersContext);
  if (!ctx) throw new Error("useVolunteers must be used within VolunteersProvider");
  return ctx;
};
