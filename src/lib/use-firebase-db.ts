"use client";

import { useEffect, useState, useCallback } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

export interface UserProfile {
  username: string;
  email: string;
  credits: number;
  referralCode: string;
  lastLuckyPot: number;
  joinedAt: number;
}

export interface UserNode {
  publicIP: string;
  proxyPort: number;
  online: boolean;
  sharing: boolean;
  deviceModel: string;
  bytesIn: number;
  bytesOut: number;
  lastHeartbeat: number;
}

export interface UserData {
  profile: UserProfile;
  nodes?: Record<string, UserNode>;
}

export interface AllUsersData {
  [uid: string]: UserData;
}

export function useAllUsers() {
  const [users, setUsers] = useState<AllUsersData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const totalUsers = Object.keys(users).length;
  const totalCredits = Object.values(users).reduce(
    (sum, u) => sum + (u.profile?.credits || 0),
    0
  );
  const totalLiability = totalCredits * 0.001;

  let activeNodes = 0;
  let totalBytes = 0;
  const deviceModels: Record<string, number> = {};
  const allNodes: {
    uid: string;
    email: string;
    ip: string;
    node: UserNode;
  }[] = [];

  Object.entries(users).forEach(([uid, userData]) => {
    if (userData.nodes) {
      Object.entries(userData.nodes).forEach(([ip, node]) => {
        allNodes.push({
          uid,
          email: userData.profile?.email || "unknown",
          ip,
          node,
        });
        if (node.online && node.sharing) activeNodes++;
        totalBytes += (node.bytesIn || 0) + (node.bytesOut || 0);
        if (node.deviceModel) {
          const model = node.deviceModel.split(" ")[0] || "Unknown";
          deviceModels[model] = (deviceModels[model] || 0) + 1;
        }
      });
    }
  });

  const totalBandwidthGB = totalBytes / (1024 ** 3);
  const grossSales = totalBandwidthGB * 1.0;
  const netProfit = grossSales - totalLiability;

  return {
    users,
    loading,
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
  };
}
