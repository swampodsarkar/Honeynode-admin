"use client";

import { Globe, Wifi } from "lucide-react";

export function MapPlaceholder() {
  return (
    <div className="relative w-full h-[280px] rounded-xl overflow-hidden bg-secondary/30 border border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.06)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-48 h-24">
            <svg viewBox="0 0 360 180" className="w-full h-full opacity-20">
              <ellipse cx="180" cy="100" rx="160" ry="70" fill="none" stroke="#F59E0B" strokeWidth="0.5" />
              <ellipse cx="180" cy="100" rx="120" ry="50" fill="none" stroke="#F59E0B" strokeWidth="0.5" />
              <ellipse cx="180" cy="100" rx="80" ry="30" fill="none" stroke="#F59E0B" strokeWidth="0.5" />
              <path d="M30,100 Q105,40 180,100 Q255,160 330,100" fill="none" stroke="#F59E0B" strokeWidth="0.5" />
              <path d="M0,100 Q180,20 360,100" fill="none" stroke="#F59E0B" strokeWidth="0.3" />
            </svg>
            <div className="absolute top-4 left-12 w-2 h-2 rounded-full bg-honey animate-pulse-slow" />
            <div className="absolute top-8 right-16 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" style={{ animationDelay: "1s" }} />
            <div className="absolute bottom-6 left-20 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-slow" style={{ animationDelay: "2s" }} />
            <div className="absolute top-6 right-1/3 w-2 h-2 rounded-full bg-honey animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Globe className="w-3 h-3" />
              Global Node Distribution
            </p>
            <p className="text-[10px] text-muted-foreground/60 flex items-center justify-center gap-1">
              <Wifi className="w-2.5 h-2.5" />
              Real-time geographic presence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
