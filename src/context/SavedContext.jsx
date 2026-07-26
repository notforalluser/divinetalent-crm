import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "crm.savedOverrides.v1";
const SavedContext = createContext(null);

function loadOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { candidates: {}, jobs: {}, recruiters: {} };
  } catch {
    return { candidates: {}, jobs: {}, recruiters: {} };
  }
}

/**
 * Tracks save/unsave actions the person makes in the UI, independent of the
 * workbook's own `Saved` column. A toggle here overrides whatever the sheet
 * says for that specific row, and persists in localStorage so it survives
 * reloads and Excel refreshes.
 */
export function SavedProvider({ children }) {
  const [overrides, setOverrides] = useState(loadOverrides);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

  const isSaved = useCallback(
    (type, id, sheetValue) => {
      const override = overrides[type]?.[id];
      if (override !== undefined) return override;
      return sheetValue === true || sheetValue === "TRUE" || sheetValue === "true" || sheetValue === 1;
    },
    [overrides]
  );

  const toggleSaved = useCallback((type, id, sheetValue) => {
    setOverrides((prev) => {
      const current = prev[type]?.[id];
      const baseline = sheetValue === true || sheetValue === "TRUE" || sheetValue === "true" || sheetValue === 1;
      const currentlySaved = current !== undefined ? current : baseline;
      return { ...prev, [type]: { ...prev[type], [id]: !currentlySaved } };
    });
  }, []);

  const clearAllSaved = useCallback(() => {
    setOverrides({ candidates: {}, jobs: {}, recruiters: {} });
  }, []);

  return <SavedContext.Provider value={{ isSaved, toggleSaved, clearAllSaved }}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
