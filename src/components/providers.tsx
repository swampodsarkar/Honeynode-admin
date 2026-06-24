"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-provider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1E293B",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#F8FAFC",
          },
        }}
      />
    </AuthProvider>
  );
}
