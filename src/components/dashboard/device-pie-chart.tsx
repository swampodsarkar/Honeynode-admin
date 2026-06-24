"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DevicePieChartProps {
  data: Record<string, number>;
}

const COLORS = ["#F59E0B", "#22C55E", "#3B82F6", "#A855F7", "#EF4444", "#06B6D4", "#EC4899", "#F97316"];

export function DevicePieChart({ data }: DevicePieChartProps) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        No device data available
      </div>
    );
  }

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="transparent"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#1E293B",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#F8FAFC",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#94A3B8" }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
