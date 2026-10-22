import { useEffect, useState } from "react";

// Simulates a brief network/data load so skeleton loaders have something to show.
export default function useDelayedReady(ms = 500) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready;
}
