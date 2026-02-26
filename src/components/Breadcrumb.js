"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

const formatSegment = (segment) => {
  if (!segment) return "";
  // Check if it's a UUID or ID (simple heuristic: has numbers or is long hex)
  if (/^[0-9a-fA-F-]{8,}$/.test(segment) || /^\d+$/.test(segment)) {
    return "Details";
  }
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Breadcrumb({ items, path }) {
  let breadcrumbItems = items;

  if (path && !items) {
    const segments = path.split("/").filter(Boolean);
    breadcrumbItems = segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      return {
        label: formatSegment(segment),
        href: href,
      };
    });
  }

  if (!breadcrumbItems || breadcrumbItems.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 group/breadcrumb">
      <Link
        href="/dashboard"
        className="hover:text-primary transition-colors flex items-center gap-1"
      >
        <Home size={12} />
        <span>Home</span>
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight size={10} className="text-gray-300" />
            {isLast ? (
              <span className="text-gray-600 dark:text-gray-300 font-black">
                {item.label || item}
              </span>
            ) : (
              <Link
                href={item.href || "#"}
                className="hover:text-primary transition-colors"
              >
                {item.label || item}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
