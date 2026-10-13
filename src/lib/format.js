// src/lib/format.js
"use client";

import { useMemo } from "react";
import { usePreferences } from "@/contexts/PreferencesContext";

const LOCALE_MAP = {
  en: "en-LK",
  si: "si-LK",
  ta: "ta-LK",
};

const DATE_FORMATS = ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"];

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

/**
 * Preference-aware formatters. Every consumer re-renders when the user
 * changes language / timezone / date format / currency in Settings.
 */
export function useFormat() {
  const { regional } = usePreferences();
  const locale = LOCALE_MAP[regional.language] || "en-LK";
  const timeZone = regional.timezone || "Asia/Colombo";
  const currency = regional.currency || "LKR";
  const dateFormat = DATE_FORMATS.includes(regional.dateFormat)
    ? regional.dateFormat
    : "DD/MM/YYYY";

  return useMemo(() => {
    const formatCurrency = (value) => {
      const num = Number(value);
      if (value == null || Number.isNaN(num)) return "—";
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    };

    const formatNumber = (value, digits = 2) => {
      const num = Number(value);
      if (value == null || Number.isNaN(num)) return "—";
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(num);
    };

    const formatDate = (value) => {
      if (!value) return "—";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "—";
      const p = timeZoneParts(d, timeZone);
      switch (dateFormat) {
        case "YYYY-MM-DD":
          return `${p.year}-${p.month}-${p.day}`;
        case "MM/DD/YYYY":
          return `${p.month}/${p.day}/${p.year}`;
        default:
          return `${p.day}/${p.month}/${p.year}`;
      }
    };

    const formatDateTime = (value) => {
      if (!value) return "—";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "—";
      const p = timeZoneParts(d, timeZone);
      const hh = p.hour === "24" ? "00" : p.hour;
      switch (dateFormat) {
        case "YYYY-MM-DD":
          return `${p.year}-${p.month}-${p.day} ${hh}:${p.minute}`;
        case "MM/DD/YYYY":
          return `${p.month}/${p.day}/${p.year} ${hh}:${p.minute}`;
        default:
          return `${p.day}/${p.month}/${p.year} ${hh}:${p.minute}`;
      }
    };

    const formatCompact = (value) => {
      const num = Number(value);
      if (value == null || Number.isNaN(num)) return "—";
      return new Intl.NumberFormat(locale, {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(num);
    };

    /** Currency + value without decimals, e.g. for KPI tiles */
    const formatMoneyShort = (value) => formatCompact(value);

    return {
      formatCurrency,
      formatMoney: formatCurrency,
      formatMoneyShort,
      formatNumber,
      formatDate,
      formatDateTime,
      formatCompact,
      locale,
      timeZone,
      currency,
    };
  }, [locale, timeZone, currency, dateFormat]);
}
