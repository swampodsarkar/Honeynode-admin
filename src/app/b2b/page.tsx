"use client";

import { useState, useMemo } from "react";
import { useAllUsers } from "@/lib/use-firebase-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Download,
  Copy,
  Check,
  Server,
  Activity,
  Users,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

interface EnterpriseClient {
  id: string;
  name: string;
  key: string;
  quotaGB: number;
  usedGB: number;
  revenue: number;
  status: "active" | "paused" | "expired";
  lastAccess: number;
}

const DEMO_CLIENTS: EnterpriseClient[] = [
  {
    id: "c1",
    name: "ProxyMax Corp",
    key: "PMX-8f3k-a92d",
    quotaGB: 500,
    usedGB: 342.7,
    revenue: 342.7,
    status: "active",
    lastAccess: Date.now() - 120000,
  },
  {
    id: "c2",
    name: "DataBridge Solutions",
    key: "DBS-4j7m-b31e",
    quotaGB: 1000,
    usedGB: 891.2,
    revenue: 891.2,
    status: "active",
    lastAccess: Date.now() - 300000,
  },
  {
    id: "c3",
    name: "NetStream Ltd",
    key: "NST-2h9p-c55f",
    quotaGB: 250,
    usedGB: 250,
    revenue: 250,
    status: "expired",
    lastAccess: Date.now() - 86400000,
  },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export default function B2BPage() {
  const { allNodes, activeNodes, totalBandwidthGB, grossSales } = useAllUsers();
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<"ipport" | "json">("ipport");

  const onlineNodes = useMemo(
    () => allNodes.filter((n) => n.node.online && n.node.sharing),
    [allNodes]
  );

  const exportList = useMemo(() => {
    if (exportFormat === "json") {
      return JSON.stringify(
        onlineNodes.map((n) => ({
          ip: n.ip,
          port: n.node.proxyPort,
          device: n.node.deviceModel,
        })),
        null,
        2
      );
    }
    return onlineNodes.map((n) => `${n.ip}:${n.node.proxyPort}`).join("\n");
  }, [onlineNodes, exportFormat]);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportList);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = exportFormat === "json" ? "json" : "txt";
    const blob = new Blob([exportList], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `honeynode-proxies.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded proxy list");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-honey" />
          B2B Bandwidth Sales
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Package and sell collected bandwidth to corporate clients
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Available Nodes</p>
                <p className="text-2xl font-bold mt-1">{onlineNodes.length}</p>
                <p className="text-xs text-emerald-400 mt-1">Ready for routing</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Server className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Capacity</p>
                <p className="text-2xl font-bold mt-1">{totalBandwidthGB.toFixed(1)} GB</p>
                <p className="text-xs text-muted-foreground mt-1">Lifetime harvested</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-honey" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold mt-1 text-honey">${grossSales.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">@ $1.00/GB market rate</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-honey" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4 text-honey" />
              Proxy Export Tool
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={exportFormat === "ipport" ? "default" : "outline"}
                onClick={() => setExportFormat("ipport")}
                className={exportFormat === "ipport" ? "bg-honey text-black hover:bg-honey-dark" : ""}
              >
                IP:Port Format
              </Button>
              <Button
                size="sm"
                variant={exportFormat === "json" ? "default" : "outline"}
                onClick={() => setExportFormat("json")}
                className={exportFormat === "json" ? "bg-honey text-black hover:bg-honey-dark" : ""}
              >
                JSON Format
              </Button>
            </div>
            <div className="relative">
              <pre className="bg-[#0B0F19] rounded-xl p-4 text-xs font-mono text-muted-foreground overflow-auto max-h-[200px] border border-white/5">
                {exportList || "No online nodes available"}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCopy}
                disabled={!onlineNodes.length}
                className="gap-1 bg-honey text-black hover:bg-honey-dark"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={!onlineNodes.length}
                variant="outline"
                className="gap-1"
              >
                <Download className="w-3 h-3" />
                Download
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {onlineNodes.length} online nodes ready for proxy routing
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-honey" />
              Enterprise Traffic Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-honey/5 border border-honey/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Market Rate</span>
                <span className="text-lg font-bold text-honey">$1.00 / GB</span>
              </div>
              <Separator className="bg-white/5" />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <p className="text-muted-foreground">Tier 1 (0-100GB)</p>
                  <p className="font-semibold">$1.20/GB</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/20">
                  <p className="text-muted-foreground">Tier 2 (100-500GB)</p>
                  <p className="font-semibold">$1.00/GB</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/20">
                  <p className="text-muted-foreground">Tier 3 (500GB+)</p>
                  <p className="font-semibold">$0.80/GB</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/20">
                  <p className="text-muted-foreground">Bulk (1TB+)</p>
                  <p className="font-semibold">$0.60/GB</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              Pricing tiers for bandwidth sales to enterprise proxy clients
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-honey" />
            Enterprise Client Access Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    API Key
                  </th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Quota
                  </th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Used
                  </th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {DEMO_CLIENTS.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-3 font-medium">{client.name}</td>
                    <td className="p-3 font-mono text-xs text-muted-foreground hidden sm:table-cell">
                      {client.key}
                    </td>
                    <td className="p-3 text-right font-mono text-xs">{client.quotaGB} GB</td>
                    <td className="p-3 text-right hidden md:table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-honey"
                            style={{
                              width: `${Math.min(100, (client.usedGB / client.quotaGB) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono">{client.usedGB} GB</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono text-sm text-honey">
                      ${client.revenue.toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      <Badge
                        className={
                          client.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : client.status === "paused"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }
                      >
                        {client.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
