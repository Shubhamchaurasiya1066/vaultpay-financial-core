import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  FileText,
  MoreHorizontal,
  Plus,
  Users,
  Wallet,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

import RevenueChart from "@/components/dashboard/RevenueChart";
import InvoiceStatusChart from "@/components/dashboard/InvoiceStatusChart";

const invoices = [
  {
    id: "INV-1048",
    client: "Atlas Consulting",
    amount: "$18,500",
    status: "paid",
    date: "Sep 28, 2026",
  },
  {
    id: "INV-1047",
    client: "Northstar Labs",
    amount: "$9,800",
    status: "pending",
    date: "Sep 27, 2026",
  },
  {
    id: "INV-1046",
    client: "Vertex Group",
    amount: "$24,000",
    status: "processing",
    date: "Sep 26, 2026",
  },
  {
    id: "INV-1045",
    client: "Summit Holdings",
    amount: "$13,750",
    status: "paid",
    date: "Sep 25, 2026",
  },
  {
    id: "INV-1044",
    client: "BluePeak Systems",
    amount: "$7,420",
    status: "overdue",
    date: "Sep 23, 2026",
  },
];

const kpis = [
  {
    label: "Total Revenue",
    value: "$248,450",
    change: "+12.8%",
    description: "vs last month",
    trend: "up",
    icon: CircleDollarSign,
    iconClass:
      "bg-emerald-400/10 text-emerald-400",
  },
  {
    label: "Outstanding",
    value: "$42,800",
    change: "14",
    description: "invoices pending",
    trend: "down",
    icon: Wallet,
    iconClass:
      "bg-amber-400/10 text-amber-400",
  },
  {
    label: "Active Clients",
    value: "84",
    change: "+6",
    description: "new this month",
    trend: "up",
    icon: Users,
    iconClass:
      "bg-blue-400/10 text-blue-400",
  },
  {
    label: "Collection Rate",
    value: "94.6%",
    change: "+2.4%",
    description: "vs last month",
    trend: "up",
    icon: Clock3,
    iconClass:
      "bg-violet-400/10 text-violet-400",
  },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-[1600px] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />

            <span className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-400">
              System operational
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Financial Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor invoices, revenue and client activity
            from one secure financial workspace.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.2)] transition hover:bg-violet-400"
        >
          <Plus size={17} />
          Create Invoice
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <Card
              key={kpi.label}
              hover
              className="relative overflow-hidden p-5"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/[0.03] blur-2xl" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      {kpi.label}
                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                      {kpi.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.iconClass}`}
                  >
                    <Icon size={19} />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {kpi.trend === "up" ? (
                    <ArrowUpRight
                      size={14}
                      className="text-emerald-400"
                    />
                  ) : (
                    <ArrowDownRight
                      size={14}
                      className="text-amber-400"
                    />
                  )}

                  <span
                    className={
                      kpi.trend === "up"
                        ? "text-xs font-medium text-emerald-400"
                        : "text-xs font-medium text-amber-400"
                    }
                  >
                    {kpi.change}
                  </span>

                  <span className="text-xs text-slate-600">
                    {kpi.description}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Analytics */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card className="p-5 sm:p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-white">
                  Revenue Analytics
                </h2>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  +12.8%
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Monthly revenue performance
              </p>
            </div>

            <button
              type="button"
              className="rounded-lg border border-white/[0.07] px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Last 6 months
            </button>
          </div>

          <RevenueChart />
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-3">
            <h2 className="font-semibold text-white">
              Invoice Status
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current billing distribution
            </p>
          </div>

          <InvoiceStatusChart />

          <div className="mt-2 grid grid-cols-2 gap-3">
            {[
              ["Paid", "62%", "bg-emerald-400"],
              ["Pending", "18%", "bg-amber-400"],
              ["Processing", "12%", "bg-blue-400"],
              ["Overdue", "8%", "bg-red-400"],
            ].map(([label, value, dot]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${dot}`}
                  />

                  <span className="text-xs text-slate-400">
                    {label}
                  </span>
                </div>

                <span className="text-xs font-medium text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <FileText
                size={17}
                className="text-violet-400"
              />

              <h2 className="font-semibold text-white">
                Recent Invoices
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Latest billing activity across your clients
            </p>
          </div>

          <button
            type="button"
            className="hidden items-center gap-1 text-xs font-medium text-violet-400 transition hover:text-violet-300 sm:flex"
          >
            View all
            <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.12em] text-slate-600">
                <th className="px-5 py-3 font-medium sm:px-6">
                  Invoice
                </th>

                <th className="py-3 font-medium">
                  Client
                </th>

                <th className="py-3 font-medium">
                  Amount
                </th>

                <th className="py-3 font-medium">
                  Status
                </th>

                <th className="py-3 font-medium">
                  Date
                </th>

                <th className="px-5 py-3 sm:px-6" />
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="group border-b border-white/[0.04] transition last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                        <FileText
                          size={15}
                          className="text-violet-400"
                        />
                      </div>

                      <span className="text-sm font-medium text-white">
                        {invoice.id}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 text-sm text-slate-400">
                    {invoice.client}
                  </td>

                  <td className="py-4 text-sm font-medium text-slate-300">
                    {invoice.amount}
                  </td>

                  <td className="py-4">
                    <Badge status={invoice.status}>
                      {invoice.status}
                    </Badge>
                  </td>

                  <td className="py-4 text-sm text-slate-500">
                    {invoice.date}
                  </td>

                  <td className="px-5 py-4 sm:px-6">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 opacity-0 transition hover:bg-white/[0.05] hover:text-white group-hover:opacity-100"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}