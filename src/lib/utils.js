//src/lib/utils.js

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getRegional } from "@/lib/preferences";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const LOCALE_MAP = {
  en: "en-LK",
  si: "si-LK",
  ta: "ta-LK",
};

/**
 * Reads the user's regional preferences (Settings → Regional) and formats
 * money, dates and times accordingly. Values are read at call time so any
 * freshly rendered component picks up the latest preference.
 */
const getRegionalFormatOptions = () => {
  const regional = getRegional();
  return {
    locale: LOCALE_MAP[regional.language] || "en-LK",
    timeZone: regional.timezone || "Asia/Colombo",
    currency: regional.currency || "LKR",
    dateFormat: regional.dateFormat || "DD/MM/YYYY",
  };
};

const timeZoneParts = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;
  return map;
};

export function fmt(amount) {
  if (amount == null) return "—";
  const { locale, currency } = getRegionalFormatOptions();
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function fmtDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  const { timeZone, dateFormat } = getRegionalFormatOptions();
  const p = timeZoneParts(date, timeZone);
  switch (dateFormat) {
    case "YYYY-MM-DD":
      return `${p.year}-${p.month}-${p.day}`;
    case "MM/DD/YYYY":
      return `${p.month}/${p.day}/${p.year}`;
    default:
      return `${p.day}/${p.month}/${p.year}`;
  }
}

export function fmtDateTime(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  const { timeZone, dateFormat } = getRegionalFormatOptions();
  const p = timeZoneParts(date, timeZone);
  const hh = p.hour === "24" ? "00" : p.hour;
  switch (dateFormat) {
    case "YYYY-MM-DD":
      return `${p.year}-${p.month}-${p.day} ${hh}:${p.minute}`;
    case "MM/DD/YYYY":
      return `${p.month}/${p.day}/${p.year} ${hh}:${p.minute}`;
    default:
      return `${p.day}/${p.month}/${p.year} ${hh}:${p.minute}`;
  }
}
