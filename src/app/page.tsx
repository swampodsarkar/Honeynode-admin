"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-[#0B0F19]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-honey border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading HoneyNode...</p>
      </div>
    </div>
  );
}
