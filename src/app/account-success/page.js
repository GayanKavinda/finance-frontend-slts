// src/app/account-success/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function AccountSuccess() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [timeLeft, setTimeLeft] = useState(8);
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
/* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      router.push("/dashboard");
    }
  }, [timeLeft, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <main className="w-full max-w-md bg-card border border-border rounded-xl shadow-soft p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">
            Account Created Successfully
          </h1>
          <p className="text-sm text-muted-foreground">
            Your account has been created. Redirecting to dashboard in {timeLeft} seconds...
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="mt-4"
          >
            Go to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
