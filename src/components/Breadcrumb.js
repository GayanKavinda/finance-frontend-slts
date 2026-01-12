"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight size={12} />}
            {isLast ? (
              <span className="text-foreground">{item.label || item}</span>
            ) : (
              <span className="hover:text-foreground transition-colors">
                {item.href ? (
                  <Link href={item.href}>{item.label || item}</Link>
                ) : (
                  item.label || item
                )}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
