"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const revenueData = [
  {
    month: "Apr",
    revenue: 32000,
    invoices: 18,
  },
  {
    month: "May",
    revenue: 41000,
    invoices: 24,
  },
  {
    month: "Jun",
    revenue: 38000,
    invoices: 21,
  },
  {
    month: "Jul",
    revenue: 52000,
    invoices: 31,
  },
  {
    month: "Aug",
    revenue: 61000,
    invoices: 36,
  },
  {
    month: "Sep",
    revenue: 74450,
    invoices: 42,
  },
];

function formatCurrency(value) {
  return `$${Number(value).toLocaleString("en-US")}`;
}

export default function RevenueChart() {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={revenueData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient
              id="revenueGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#8b5cf6"
                stopOpacity={0.35}
              />

              <stop
                offset="100%"
                stopColor="#8b5cf6"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#64748b",
              fontSize: 12,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            width={60}
            tick={{
              fill: "#64748b",
              fontSize: 11,
            }}
            tickFormatter={(value) =>
              `$${value / 1000}k`
            }
          />

          <Tooltip
            cursor={{
              stroke: "rgba(139,92,246,0.35)",
            }}
            contentStyle={{
              background: "#0b111b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.35)",
            }}
            labelStyle={{
              color: "#94a3b8",
              fontSize: 12,
              marginBottom: 4,
            }}
            itemStyle={{
              color: "#fff",
              fontSize: 13,
            }}
            formatter={(value) => [
              formatCurrency(value),
              "Revenue",
            ]}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{
              r: 5,
              strokeWidth: 3,
              stroke: "#0b111b",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}