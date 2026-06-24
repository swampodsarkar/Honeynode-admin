"use client";

import { useMemo } from "react";
import { useAllUsers } from "@/lib/use-firebase-db";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { BandwidthChart } from "@/components/dashboard/bandwidth-chart";
import { DevicePieChart } from "@/components/dashboard/device-pie-chart";
import { MapPlaceholder } from "@/components/dashboard/map-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Wifi,
  HardDrive,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function formatCredits(credits: number): string {
  return credits.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatUSD(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardPage() {
  const {
    totalUsers,
    totalCredits,
    totalLiability,
    activeNodes,
    totalBytes,
    totalBandwidthGB,
    grossSales,
    netProfit,
    deviceModels,
    allNodes,
  } = useAllUsers();

  const bandwidthData = useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now - (23 - i) * 3600000);
      const hourStr = hour.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const base = activeNodes * 0.5;
      const jitter = (Math.sin(i * 0.8) * 0.3 + 0.7) * base + Math.random() * base * 0.2;
      return { time: hourStr, mbps: Math.round(jitter * 100) / 100 };
    });
  }, [activeNodes]);

  const onlineNodes = allNodes.filter((n) => n.node.online && n.node.sharing);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Network Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time analytics across the HoneyNode network
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          subtitle={`${totalCredits.toLocaleString()} credits issued`}
          icon={<Users className="w-5 h-5" />}
        />
        <KpiCard
          title="Active Nodes"
          value={activeNodes.toLocaleString()}
          subtitle={`${allNodes.length} total registered`}
          icon={<Wifi className="w-5 h-5" />}
        />
        <KpiCard
          title="Bandwidth Harvested"
          value={formatBytes(totalBytes)}
          subtitle={`${totalBandwidthGB.toFixed(2)} GB total`}
          icon={<HardDrive className="w-5 h-5" />}
        />
        <KpiCard
          title="Net Revenue"
          value={formatUSD(netProfit)}
          subtitle={`Gross: ${formatUSD(grossSales)} | Liability: ${formatUSD(totalLiability)}`}
          icon={<DollarSign className="w-5 h-5" />}
          className={netProfit >= 0 ? "border-emerald-500/20" : "border-red-500/20"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-honey" />
              Bandwidth Consumption (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BandwidthChart data={bandwidthData} />
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Device Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DevicePieChart data={deviceModels} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingDown className="w-4 h-4 text-red-400" />
                Total Payout Liability
              </div>
              <span className="text-sm font-semibold text-red-400">{formatUSD(totalLiability)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Gross Sales (@ $1.00/GB)
              </div>
              <span className="text-sm font-semibold text-emerald-400">{formatUSD(grossSales)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-honey/5 border border-honey/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="w-4 h-4 text-honey" />
                Net Profit Margin
              </div>
              <span
                className={`text-lg font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {formatUSD(netProfit)}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground text-center pt-2">
              Credits: {formatCredits(totalCredits)} | Rate: 1000 credits = $1.00 USD
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Node Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MapPlaceholder />
          </CardContent>
        </Card>
      </div>

      {onlineNodes.length > 0 && (
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Active Nodes (by bandwidth)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {onlineNodes
                .sort(
                  (a, b) =>
                    b.node.bytesIn +
                    b.node.bytesOut -
                    (a.node.bytesIn + a.node.bytesOut)
                )
                .slice(0, 5)
                .map((n, i) => (
                  <div
                    key={`${n.uid}-${n.ip}-${i}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-honey/10 flex items-center justify-center text-xs font-bold text-honey">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium font-mono">{n.ip}</p>
                        <p className="text-xs text-muted-foreground">{n.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatBytes(n.node.bytesIn + n.node.bytesOut)}
                      </p>
                      <p className="text-xs text-muted-foreground">{n.node.deviceModel}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
