import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadWorkbook } from "../lib/excel";
import { excludeFutureDated } from "../lib/time";
import { useSettings } from "./SettingsContext";

const DataContext = createContext(null);

const EMPTY = { Candidates: [], Jobs: [], Recruiters: [], Interviews: [], TechnicalHelp: [], Activity: [], MarketingActivity: [] };

export function DataProvider({ children }) {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { settings } = useSettings();
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    setStatus((s) => (s === "ready" ? "refreshing" : "loading"));
    try {
      const wb = await loadWorkbook();
      setData(wb);
      setLastUpdated(new Date());
      setStatus("ready");
      setError(null);
    } catch (e) {
      console.error(e);
      setError(e.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Settings-driven auto refresh (Settings page controls this).
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (settings.autoRefresh) {
      intervalRef.current = setInterval(refresh, settings.autoRefreshSeconds * 1000);
    }
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [settings.autoRefresh, settings.autoRefreshSeconds, refresh]);

  // Jobs and Candidates dated in the future are hidden until that date arrives.
  // Interviews are hidden based on InterviewReceivedDate (the invite can't be
  // "received" in the future) -- but InterviewDate itself is left alone, so
  // genuinely upcoming/scheduled interviews still show. MarketingActivity is
  // generated only up to today/placement already, but we filter defensively.
  //
  // `tick` changes every minute purely to force this memo to recompute with a
  // fresh nowIST() -- so if the app is left open past midnight, "today"
  // rolls over on its own instead of needing a manual refresh.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const visible = useMemo(
    () => ({
      Jobs: excludeFutureDated(data.Jobs, "PostedDate"),
      Candidates: excludeFutureDated(data.Candidates, "CreatedAt"),
      Recruiters: data.Recruiters,
      Interviews: excludeFutureDated(data.Interviews, "InterviewReceivedDate"),
      TechnicalHelp: data.TechnicalHelp,
      Activity: data.Activity,
      MarketingActivity: excludeFutureDated(data.MarketingActivity, "Date"),
    }),
    [data, tick] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <DataContext.Provider value={{ data, visible, status, error, lastUpdated, refresh }}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
