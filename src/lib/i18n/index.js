// src/lib/i18n/index.js
// Full UI localization. Keys are the English source strings so any string
// can be wrapped with t("...") and missing translations fall back to English.
//
// The dictionaries are split by domain to keep each file manageable:
//   ui.js    — core shell (navigation, common actions, forms, settings)
//   help.js  — Help Center: FAQs, contacts, resources, support tickets
//   guides.js — System Walkthrough Guide
//   docs.js  — documentation pages (API, testing, setup, glossary, …)
//   dev.js   — developer documentation (database map, use cases, flowcharts)

import { si as uiSi, ta as uiTa } from "./ui";
import { si as helpSi, ta as helpTa } from "./help";
import { si as guidesSi, ta as guidesTa } from "./guides";
import { si as docsSi, ta as docsTa } from "./docs";
import { si as onbSi, ta as onbTa } from "./docs-onboarding";
import { si as gloSi, ta as gloTa } from "./docs-glossary";
import { si as chrSi, ta as chrTa } from "./docs-chrome";
import { si as tstSi, ta as tstTa } from "./docs-testing";
import { si as devSi, ta as devTa } from "./dev";

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "si", label: "Sinhala", native: "සිංහල" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
];

// English is the source — the key itself is the English string, so the en
// dictionary stays empty and lookups fall through to the key.
const en = {};

const si = { ...uiSi, ...helpSi, ...guidesSi, ...docsSi, ...onbSi, ...gloSi, ...chrSi, ...tstSi, ...devSi };
const ta = { ...uiTa, ...helpTa, ...guidesTa, ...docsTa, ...onbTa, ...gloTa, ...chrTa, ...tstTa, ...devTa };

export const dictionaries = { en, si, ta };

/**
 * Translate a UI string. Falls back to the English source when a
 * translation is missing, so untranslated strings still render correctly.
 */
export function translate(lang, text) {
  if (typeof text !== "string" || !text) return text ?? "";
  if (lang === "en") return text;
  const dict = dictionaries[lang];
  if (!dict) return text;
  return dict[text] ?? text;
}
