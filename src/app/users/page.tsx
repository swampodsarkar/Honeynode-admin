"use client";

import { useState, useMemo } from "react";
import { useAllUsers, UserData } from "@/lib/use-firebase-db";
import { UserModal } from "@/components/users/user-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, ArrowUpDown } from "lucide-react";

function formatCredits(c: number) {
  return c.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

type SortKey = "credits" | "bandwidth" | "devices" | "joinedAt";

export default function UsersPage() {
  const { users, loading } = useAllUsers();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("credits");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ user: UserData; uid: string } | null>(null);

  const userList = useMemo(() => {
    return Object.entries(users)
      .map(([uid, data]) => {
        const nodes = data.nodes ? Object.values(data.nodes) : [];
        const totalBytes = nodes.reduce((s, n) => s + (n.bytesIn || 0) + (n.bytesOut || 0), 0);
        return {
          uid,
          data,
          totalBytes,
          nodeCount: nodes.length,
          onlineNodes: nodes.filter((n) => n.online).length,
        };
      })
      .filter((item) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          item.data.profile?.username?.toLowerCase().includes(q) ||
          item.data.profile?.email?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let va: number, vb: number;
        switch (sortKey) {
          case "credits":
            va = a.data.profile?.credits || 0;
            vb = b.data.profile?.credits || 0;
            break;
          case "bandwidth":
            va = a.totalBytes;
            vb = b.totalBytes;
            break;
          case "devices":
            va = a.nodeCount;
            vb = b.nodeCount;
            break;
          case "joinedAt":
            va = a.data.profile?.joinedAt || 0;
            vb = b.data.profile?.joinedAt || 0;
            break;
          default:
            va = 0;
            vb = 0;
        }
        return sortAsc ? va - vb : vb - va;
      });
  }, [users, search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

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
          <Users className="w-6 h-6 text-honey" />
          User Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all registered users and their credentials
        </p>
      </div>

      <Card className="glass">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-white/5"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {userList.length} user{userList.length !== 1 ? "s" : ""}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th
                    className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("credits")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Credits <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    USD Value
                  </th>
                  <th
                    className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground hidden md:table-cell"
                    onClick={() => toggleSort("devices")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Devices <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground hidden lg:table-cell"
                    onClick={() => toggleSort("bandwidth")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Bandwidth <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground hidden lg:table-cell"
                    onClick={() => toggleSort("joinedAt")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Joined <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {userList.map((item) => (
                  <tr
                    key={item.uid}
                    onClick={() => setSelectedUser({ user: item.data, uid: item.uid })}
                    className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-honey/15 flex items-center justify-center text-xs font-bold text-honey shrink-0">
                          {item.data.profile?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate text-sm">
                            {item.data.profile?.username || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.data.profile?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono text-sm">
                      {formatCredits(item.data.profile?.credits || 0)}
                    </td>
                    <td className="p-3 text-right text-sm hidden sm:table-cell text-honey">
                      ${((item.data.profile?.credits || 0) * 0.001).toFixed(2)}
                    </td>
                    <td className="p-3 text-right hidden md:table-cell">
                      <Badge variant="secondary" className="bg-white/5 text-xs">
                        {item.nodeCount} ({item.onlineNodes} on)
                      </Badge>
                    </td>
                    <td className="p-3 text-right text-xs font-mono hidden lg:table-cell">
                      {formatBytes(item.totalBytes)}
                    </td>
                    <td className="p-3 text-right text-xs text-muted-foreground hidden lg:table-cell">
                      {item.data.profile?.joinedAt
                        ? new Date(item.data.profile.joinedAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
                {userList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <UserModal
        user={selectedUser?.user || null}
        uid={selectedUser?.uid || null}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      />
    </div>
  );
}
