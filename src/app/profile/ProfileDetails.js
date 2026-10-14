"use client";

// src/app/profile/ProfileDetails.js
// Read-only profile view. All modification lives in Settings → Account.

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Briefcase,
  Calendar,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Settings as SettingsIcon,
  ShieldCheck,
  User as UserIcon,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FIELDS = [
  { key: "name", label: "Full name", icon: UserIcon },
  { key: "email", label: "Email address", icon: Mail },
  { key: "phone", label: "Phone number", icon: Phone },
  { key: "date_of_birth", label: "Date of birth", icon: Calendar },
  { key: "gender", label: "Gender", icon: UserCircle },
  { key: "address", label: "Address", icon: MapPin },
  { key: "city", label: "City", icon: MapPin },
  { key: "country", label: "Country", icon: Globe },
  { key: "postal_code", label: "Postal code", icon: Globe },
  { key: "company", label: "Company / organization", icon: Building2 },
  { key: "job_title", label: "Job title", icon: Briefcase },
  { key: "tax_id", label: "Tax ID / national ID", icon: FileText },
];

function displayValue(user, key) {
  const v = user?.[key];
  if (v === null || v === undefined || v === "") return "\u2014";
  if (key === "date_of_birth") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
  }
  return String(v);
}

export default function ProfileDetails({ user }) {
  const [previewing, setPreviewing] = useState(false);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {previewing && user?.avatar_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewing(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          >
            <div
              className="relative aspect-square w-full max-w-sm overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={user.avatar_url}
                alt="Avatar preview"
                fill
                sizes="384px"
                className="object-cover"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Identity card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {user?.avatar_url ? (
            <button type="button" onClick={() => setPreviewing(true)} className="cursor-zoom-in shrink-0">
              <Image
                src={user.avatar_url}
                alt="Avatar"
                width={80}
                height={80}
                className="rounded-full object-cover border-2 border-border"
              />
            </button>
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border shrink-0">
              <UserIcon className="w-9 h-9 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">{user?.name}</h2>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Last updated: {user?.profile_updated_at ? new Date(user.profile_updated_at).toLocaleString() : "\u2014"}
              {user?.profile_updated_by ? ` \u00B7 by ${user.profile_updated_by}` : ""}
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5 shrink-0">
            <Link href="/settings?tab=account">
              <SettingsIcon className="w-3.5 h-3.5" />
              Edit in Settings
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Read-only field grid */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-xs font-medium text-foreground uppercase tracking-wider mb-4">
          Personal Information
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {FIELDS.map((f) => (
            <div key={f.key} className="min-w-0">
              <dt className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <f.icon className="w-3 h-3" />
                {f.label}
              </dt>
              <dd className="text-xs text-foreground mt-1 break-words">
                {displayValue(user, f.key)}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 rounded-lg bg-muted/50 p-3 flex items-start gap-2.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Profile details are read-only here. Photo, personal information and email changes are made in{" "}
            <Link href="/settings?tab=account" className="text-primary hover:underline font-medium">
              Settings \u2192 Account
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
