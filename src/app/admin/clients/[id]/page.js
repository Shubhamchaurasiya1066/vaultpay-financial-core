"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Mail,
  Receipt,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { getClientById } from "@/services/clientService";
import { getInvoices } from "@/services/invoiceService";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

    const clientData = getClientById(params.id);
    const allInvoices = getInvoices();

    setClient(clientData);

    if (clientData) {
      setInvoices(
        allInvoices.filter(
          (invoice) => invoice.clientId === clientData.id
        )
      );
    }

    setLoading(false);
  }, [params?.id]);

  const stats = useMemo(() => {
    const totalBilled = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.amount || 0),
      0
    );

    const paidAmount = invoices
      .filter((invoice) => invoice.status === "paid")
      .reduce(
        (sum, invoice) => sum + Number(invoice.amount || 0),
        0
      );

    const outstandingAmount = invoices
      .filter((invoice) => invoice.status !== "paid")
      .reduce(
        (sum, invoice) => sum + Number(invoice.amount || 0),
        0
      );

    const paidInvoices = invoices.filter(
      (invoice) => invoice.status === "paid"
    ).length;

    const pendingInvoices = invoices.filter(
      (invoice) => invoice.status !== "paid"
    ).length;

    return {
      totalBilled,
      paidAmount,
      outstandingAmount,
      paidInvoices,
      pendingInvoices,
    };
  }, [invoices]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "paid":
        return "success";

      case "overdue":
        return "danger";

      case "processing":
        return "warning";

      default:
        return "neutral";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Button
            variant="secondary"
            onClick={() => router.push("/admin/clients")}
          >
            <ArrowLeft size={17} />
            Back to Clients
          </Button>

          <div className="mt-8 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
              <Building2 size={24} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-white">
              Client Not Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              The client profile you are looking for does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin/clients")}
            className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Clients
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300 shadow-[0_10px_35px_rgba(109,93,252,0.12)]">
                <Building2 size={28} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
                    {client.name}
                  </h1>

                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                    Active Client
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Client ID: {client.id}
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => router.push("/admin/invoices")}
            >
              <Receipt size={17} />
              View All Invoices
            </Button>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-6 grid gap-5 lg:grid-cols-3">

          <Card className="lg:col-span-2">
            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-300/70">
                Client Profile
              </p>

              <h2 className="mt-2 text-lg font-semibold text-white">
                Business Information
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <Building2 size={17} />
                </div>

                <p className="text-xs text-slate-500">
                  Company
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {client.company}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                  <Mail size={17} />
                </div>

                <p className="text-xs text-slate-500">
                  Billing Email
                </p>

                <p className="mt-1 break-all text-sm font-medium text-white">
                  {client.email}
                </p>
              </div>

            </div>
          </Card>

          <Card>
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                  <WalletCards size={19} />
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Total Billed
                </p>

                <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  {formatCurrency(stats.totalBilled)}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
                <TrendingUp
                  size={14}
                  className="text-emerald-400"
                />
                {invoices.length} invoice
                {invoices.length !== 1 ? "s" : ""} generated
              </div>
            </div>
          </Card>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  Total Invoices
                </p>

                <p className="mt-3 text-2xl font-semibold text-white">
                  {invoices.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <FileText size={18} />
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  Paid
                </p>

                <p className="mt-3 text-2xl font-semibold text-emerald-300">
                  {formatCurrency(stats.paidAmount)}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  {stats.paidInvoices} paid invoice
                  {stats.paidInvoices !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  Outstanding
                </p>

                <p className="mt-3 text-2xl font-semibold text-amber-300">
                  {formatCurrency(stats.outstandingAmount)}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  {stats.pendingInvoices} open invoice
                  {stats.pendingInvoices !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                <Clock3 size={18} />
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  Collection Rate
                </p>

                <p className="mt-3 text-2xl font-semibold text-white">
                  {stats.totalBilled > 0
                    ? Math.round(
                        (stats.paidAmount /
                          stats.totalBilled) *
                          100
                      )
                    : 0}
                  %
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Based on billed amount
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <CreditCard size={18} />
              </div>
            </div>
          </Card>
        </div>

        {/* Invoice Section */}
        <Card className="overflow-hidden p-0">

          <div className="flex flex-col gap-3 border-b border-white/[0.07] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-300/70">
                Financial Activity
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Client Invoices
              </h2>
            </div>

            <span className="text-xs text-slate-500">
              {invoices.length} total
            </span>
          </div>

          {invoices.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-500">
                <FileText size={20} />
              </div>

              <h3 className="mt-4 text-sm font-medium text-white">
                No invoices yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                This client does not have any invoices.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-white/[0.05] text-left">
                    <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Invoice
                    </th>

                    <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Issue Date
                    </th>

                    <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Due Date
                    </th>

                    <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      onClick={() =>
                        router.push(
                          `/admin/invoices/${invoice.id}`
                        )
                      }
                      className="cursor-pointer border-b border-white/[0.045] transition hover:bg-white/[0.025]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-slate-400">
                            <Receipt size={16} />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white">
                              {invoice.id}
                            </p>

                            <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-600">
                              {invoice.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <CalendarDays size={14} />
                          {formatDate(invoice.issueDate)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(invoice.dueDate)}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(invoice.amount)}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          variant={getStatusVariant(
                            invoice.status
                          )}
                        >
                          {invoice.status
                            .charAt(0)
                            .toUpperCase() +
                            invoice.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}