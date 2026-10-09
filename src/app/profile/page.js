"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
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
  const [activeTab, setActiveTab] = useState("personal");

  if (loading || !user) {
    return (
      <div className="min-h-full bg-background p-4 sm:p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-foreground">
            Profile Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal information, security settings, and view activity
          </p>
        </div>

        <Tabs value={activeTab} onChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {TABS.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="personal" className="pt-4">
            <PersonalDetails key="personal" user={user} refetch={refetch} />
          </TabsContent>

          <TabsContent value="security" className="pt-4">
            <SecuritySettings key="security" />
          </TabsContent>

          <TabsContent value="activity" className="pt-4">
            <ActivityLog key="activity" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
