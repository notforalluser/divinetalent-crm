import { createContext, useContext, useEffect, useState } from "react";

const EMPTY_PROFILE = {
  jobRoles: [], // matched fuzzily against Jobs.Title in AI Match
  experienceYears: "",
  location: "",
  name: "",
  mobile: "",
  email: "",
  skills: [],
};

const DEFAULTS = {
  pageSize: 10,
  density: "comfortable", // comfortable | compact
  autoRefresh: false,
  autoRefreshSeconds: 60,
  defaultCandidateStatusFilter: "All",
  showSavedOnlyByDefault: false,
  defaultLandingPage: "/",
  upcomingInterviewWindowDays: 14,
  // AI Match: ATS score simulation
  atsScoreMin: 60,
  atsScoreMax: 80,
  atsEligibilityThreshold: 75,
  atsGeneralProfile: EMPTY_PROFILE, // shown for any resume with no filename override
  atsFilenameOverrides: [], // [{ id, filename, minScore, profile }]
};

const STORAGE_KEY = "crm.settings.v1";
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULTS;
      return sanitize(JSON.parse(saved));
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function updateGeneralProfile(partial) {
    setSettings((prev) => ({ ...prev, atsGeneralProfile: { ...prev.atsGeneralProfile, ...partial } }));
  }

  /** Creates a new override (existingId omitted) or updates one in place. */
  function upsertAtsOverride(existingId, { filename, minScore, profile }) {
    const trimmed = (filename || "").trim();
    if (!trimmed) return;
    setSettings((prev) => {
      const others = (prev.atsFilenameOverrides || []).filter(
        (o) => o.id !== existingId && o.filename.trim().toLowerCase() !== trimmed.toLowerCase()
      );
      const id = existingId || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return {
        ...prev,
        atsFilenameOverrides: [
          ...others,
          { id, filename: trimmed, minScore: Number(minScore) || 80, profile: { ...EMPTY_PROFILE, ...(profile || {}) } },
        ],
      };
    });
  }

  function removeAtsOverride(id) {
    setSettings((prev) => ({
      ...prev,
      atsFilenameOverrides: (prev.atsFilenameOverrides || []).filter((o) => o.id !== id),
    }));
  }

  function sanitize(parsed) {
    return {
      ...DEFAULTS,
      ...parsed,
      atsGeneralProfile: { ...EMPTY_PROFILE, ...(parsed.atsGeneralProfile || {}) },
      atsFilenameOverrides: (parsed.atsFilenameOverrides || []).map((o) => ({
        ...o,
        profile: { ...EMPTY_PROFILE, ...(o.profile || {}) },
      })),
    };
  }

  /** Wholesale-replaces settings -- used when importing a settings file exported from another device. */
  function replaceAllSettings(imported) {
    setSettings(sanitize(imported || {}));
  }

  function resetSettings() {
    setSettings(DEFAULTS);
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateGeneralProfile,
        upsertAtsOverride,
        removeAtsOverride,
        resetSettings,
        replaceAllSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
