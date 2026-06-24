"use client";

import { useState, useMemo } from "react";
import { useAllUsers } from "@/lib/use-firebase-db";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Network, Search, Wifi, WifiOff, Clock, Globe, Smartphone } from "lucide-react";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function NodesPage() {
  const { allNodes, loading } = useAllUsers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");

  const filtered = useMemo(() => {
    return allNodes
      .filter((n) => {
        if (statusFilter === "online" && !(n.node.online && n.node.sharing)) return false;
        if (statusFilter === "offline" && (n.node.online && n.node.sharing)) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            n.ip.toLowerCase().includes(q) ||
            n.email.toLowerCase().includes(q) ||
            n.node.deviceModel?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.node.lastHeartbeat - a.node.lastHeartbeat);
  }, [allNodes, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-honey border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Network className="w-6 h-6 text-honey" />
          Live Node Directory
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All registered client nodes across the network
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by IP, email, or device..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-white/5"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-secondary/30">
          {(["all", "online", "offline"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === f
                  ? "bg-honey/10 text-honey border border-honey/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filtered.length} of {allNodes.length} nodes
      </div>

      <div className="space-y-2">
        {filtered.map((n, i) => {
          const isOnline = n.node.online && n.node.sharing;
          return (
            <Card key={`${n.uid}-${n.ip}-${i}`} className="glass hover:glow-honey transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isOnline
                          ? "bg-emerald-500/10 border border-emerald-500/20"
                          : "bg-white/5 border border-white/5"
                      }`}
                    >
                      {isOnline ? (
                        <Wifi className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-medium">{n.ip}</p>
                        <span className="text-muted-foreground text-xs">:{n.node.proxyPort}</span>
                        <Badge
                          variant={isOnline ? "default" : "secondary"}
                          className={
                            isOnline
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]"
                              : "bg-white/5 text-muted-foreground text-[10px]"
                          }
                        >
                          {isOnline ? "ONLINE" : "OFFLINE"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {n.email}
                        </span>
                        <span className="flex items-center gap-1 hidden sm:flex">
                          <Smartphone className="w-3 h-3" />
                          {n.node.deviceModel}
                        </span>
                        <span className="flex items-center gap-1 hidden md:flex">
                          <Clock className="w-3 h-3" />
                          {timeAgo(n.node.lastHeartbeat)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">Traffic</p>
                    <p className="text-xs font-mono">
                      {(n.node.bytesIn || 0) > 0
                        ? `${((n.node.bytesIn + n.node.bytesOut) / (1024 * 1024)).toFixed(1)} MB`
                        : "0 B"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No nodes match your search criteria
          </div>
        )}
      </div>
    </div>
  );
}
