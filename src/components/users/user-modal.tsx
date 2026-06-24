"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserData } from "@/lib/use-firebase-db";
import { ref, update } from "firebase/database";
import { getFirebaseDb } from "@/lib/firebase";
import { toast } from "sonner";
import {
  Wifi,
  WifiOff,
  Coins,
  Loader2,
  Smartphone,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface UserModalProps {
  user: UserData | null;
  uid: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatCredits(c: number) {
  return c.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function UserModal({ user, uid, open, onOpenChange }: UserModalProps) {
  const [creditAdj, setCreditAdj] = useState("");
  const [adjLoading, setAdjLoading] = useState(false);

  if (!user || !uid) return null;

  const profile = user.profile;
  const nodes = user.nodes ? Object.entries(user.nodes) : [];

  if (!profile) return null;

  const handleCreditAdjustment = async (type: "add" | "deduct") => {
    const amount = parseFloat(creditAdj);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid positive amount");
      return;
    }

    setAdjLoading(true);
    try {
      const userRef = ref(getFirebaseDb(), `users/${uid}/profile/credits`);
      const delta = type === "add" ? amount : -amount;
      await update(userRef, { ".sv": null });

      const { get, set } = await import("firebase/database");
      const snapshot = await get(userRef);
      const current = snapshot.val() || 0;
      await set(userRef, Math.max(0, current + delta));

      toast.success(
        type === "add"
          ? `Added ${formatCredits(amount)} credits`
          : `Deducted ${formatCredits(amount)} credits`
      );
      setCreditAdj("");
    } catch {
      toast.error("Failed to update credits");
    } finally {
      setAdjLoading(false);
    }
  };

  const onlineCount = nodes.filter(([, n]) => n.online).length;
  const totalBytes = nodes.reduce((sum, [, n]) => sum + (n.bytesIn || 0) + (n.bytesOut || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass-strong max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-honey/20 flex items-center justify-center text-xs font-bold text-honey">
              {profile.username?.[0]?.toUpperCase() || "?"}
            </div>
            {profile.username || "Unknown User"}
          </DialogTitle>
          <DialogDescription>{profile.email}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          <div className="p-3 rounded-lg bg-secondary/30 text-center">
            <p className="text-lg font-bold text-honey">{formatCredits(profile.credits)}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Credits</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30 text-center">
            <p className="text-lg font-bold">${(profile.credits * 0.001).toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground uppercase">USD Value</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30 text-center">
            <p className="text-lg font-bold">{nodes.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Devices</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30 text-center">
            <p className="text-lg font-bold text-emerald-400">{onlineCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Online</p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-secondary/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Joined</span>
          <span className="text-xs font-mono">{new Date(profile.joinedAt).toLocaleDateString()}</span>
        </div>

        <Separator className="bg-white/5" />

        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-honey" />
            Linked Nodes ({nodes.length})
          </h4>
          {nodes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No nodes registered</p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {nodes.map(([ip, node]) => (
                <div
                  key={ip}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 text-sm"
                >
                  <div className="flex items-center gap-3">
                    {node.online ? (
                      <Wifi className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-mono text-xs">{ip}:{node.proxyPort}</p>
                      <p className="text-[10px] text-muted-foreground">{node.deviceModel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={node.online ? "default" : "secondary"}
                      className={
                        node.online
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-white/5 text-muted-foreground"
                      }
                    >
                      {node.online ? "Online" : "Offline"}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(node.lastHeartbeat)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="bg-white/5" />

        <div>
          <h4 className="text-sm font-medium mb-3">Admin Credit Adjustment</h4>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount"
              value={creditAdj}
              onChange={(e) => setCreditAdj(e.target.value)}
              className="bg-secondary/50 border-white/5 flex-1"
              min="0"
              step="100"
            />
            <Button
              size="sm"
              disabled={adjLoading}
              onClick={() => handleCreditAdjustment("add")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
            >
              {adjLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUpRight className="w-3 h-3" />}
              Add
            </Button>
            <Button
              size="sm"
              disabled={adjLoading}
              onClick={() => handleCreditAdjustment("deduct")}
              variant="destructive"
              className="gap-1"
            >
              {adjLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowDownRight className="w-3 h-3" />}
              Deduct
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
