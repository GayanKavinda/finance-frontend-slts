"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import PersonalDetails from "./PersonalDetails";
import SecuritySettings from "./SecuritySettings";
import ActivityLog from "./ActivityLog";

const TABS = [
  { key: "personal", label: "Personal" },
  { key: "security", label: "Security" },
  { key: "activity", label: "Activity" },
];

export default function ProfilePage() {
  const { user, loading, refetch } = useAuth();
  const [tab, setTab] = useState("personal");

  if (loading || !user) {
    return <div />;
  }

  return (
    <div className="min-h-full bg-background p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-medium tracking-tight text-foreground">
            Profile Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your personal information and security
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-6 py-2.5 text-sm font-medium -mb-px transition-all cursor-pointer ${
                tab === t.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {tab === "personal" && (
            <PersonalDetails key="personal" user={user} refetch={refetch} />
          )}

          {tab === "security" && <SecuritySettings key="security" />}

          {tab === "activity" && <ActivityLog key="activity" />}
        </div>
      </div>
    </div>
  );
}
