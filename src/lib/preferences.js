// src/lib/preferences.js
// Local preference storage shared between the PreferencesContext, the
// axios debug gate, and the settings page. All reads happen at call time
// so toggling a preference takes effect immediately without a reload.

const KEYS = {
  density: "procurex_density",
  debug: "procurex_debug_mode",
  language: "procurex_language",
  timezone: "procurex_timezone",
  dateFormat: "procurex_date_format",
  currency: "procurex_currency",
};

export const DENSITY_MODES = ["comfortable", "compact"];

function read(key, fallback = null) {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — preferences stay in-memory for this session */
  }
}

/* ── Density ─────────────────────────────────────────────── */
export function getDensity() {
  const v = read(KEYS.density, "comfortable");
  return DENSITY_MODES.includes(v) ? v : "comfortable";
}

export function isCompact() {
  return getDensity() === "compact";
}

export function setDensity(mode) {
  const next = DENSITY_MODES.includes(mode) ? mode : "comfortable";
  write(KEYS.density, next);
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-density", next);
  }
  return next;
}

export function applyDensity() {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-density", getDensity());
  }
}

/* ── Debug (verbose API tracing) ─────────────────────────── */
export function isDebugEnabled() {
  return read(KEYS.debug, "false") === "true";
}

export function setDebugEnabled(enabled) {
  const v = enabled ? "true" : "false";
  write(KEYS.debug, v);
  return v === "true";
}

/* ── Regional ────────────────────────────────────────────── */
export function getRegional() {
  return {
    language: read(KEYS.language, "en"),
    timezone: read(KEYS.timezone, "Asia/Colombo"),
    dateFormat: read(KEYS.dateFormat, "DD/MM/YYYY"),
    currency: read(KEYS.currency, "LKR"),
  };
}

export function setRegional({ language, timezone, dateFormat, currency }) {
  if (language !== undefined) write(KEYS.language, language);
  if (timezone !== undefined) write(KEYS.timezone, timezone);
  if (dateFormat !== undefined) write(KEYS.dateFormat, dateFormat);
  if (currency !== undefined) write(KEYS.currency, currency);
}
