"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const statusData = [
  {
    name: "Paid",
    value: 62,
    color: "#10b981",
  },
  {
    name: "Pending",
    value: 18,
    color: "#f59e0b",
  },
  {
    name: "Processing",
    value: 12,
    color: "#3b82f6",
  },
  {
    name: "Overdue",
    value: 8,
    color: "#ef4444",
  },
];

export default function InvoiceStatusChart() {
  return (
    <div className="relative h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={statusData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={72}
            outerRadius={98}
            paddingAngle={3}
            stroke="none"
          >
            {statusData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              background: "#0b111b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.35)",
            }}
            itemStyle={{
              color: "#fff",
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-semibold text-white">
          84
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Total invoices
        </p>
      </div>
    </div>
  );
}