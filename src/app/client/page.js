"use client";

import {
  ArrowUpRight,
  CircleDollarSign,
  FileText,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

import { getInvoices } from "@/services/invoiceService";
import { getClientById } from "@/services/clientService";
import { getCurrentUser } from "@/lib/auth";

export default function ClientPortalPage() {
  const [invoices, setInvoices] = useState([]);
  const [client, setClient] = useState(null);

  const user = getCurrentUser();

const allInvoices = getInvoices();

const clientInvoices = allInvoices.filter(
  (invoice) => invoice.clientId === user?.id
);

  useEffect(() => {
    const user = getCurrentUser();

    if (!user) {
      return;
    }

    const clientRecord = getClientById(user.id);
    const allInvoices = getInvoices();

    const clientInvoices = allInvoices.filter(
      (invoice) => invoice.clientId === user.id
    );

    setClient(clientRecord);
    setInvoices(clientInvoices);
  }, []);

  const stats = useMemo(() => {
    const total = invoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.amount || 0),
      0
    );

    const paid = invoices
      .filter(
        (invoice) => invoice.status === "paid"
      )
      .reduce(
        (sum, invoice) =>
          sum + Number(invoice.amount || 0),
        0
      );

    const outstanding = invoices
      .filter(
        (invoice) => invoice.status !== "paid"
      )
      .reduce(
        (sum, invoice) =>
          sum + Number(invoice.amount || 0),
        0
      );

    return {
      total,
      paid,
      outstanding,
      pendingCount: invoices.filter(
        (invoice) => invoice.status !== "paid"
      ).length,
    };
  }, [invoices]);

  function formatAmount(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(
      new Date(`${date}T00:00:00`)
    );
  }

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8">

        <div className="mb-3 flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
            <WalletCards
              size={18}
              className="text-violet-400"
            />
          </div>

          <span className="text-xs font-medium uppercase tracking-[0.15em] text-violet-400">
            Client Portal
          </span>

        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Welcome back{client?.name ? `, ${client.name}` : ""}
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Review your invoices, payments and
          outstanding balances from one secure
          workspace.
        </p>

      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Card hover>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500">
                Total Invoiced
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {formatAmount(stats.total)}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <FileText
                size={18}
                className="text-violet-400"
              />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500">
                Paid
              </p>

              <p className="mt-2 text-2xl font-semibold text-emerald-400">
                {formatAmount(stats.paid)}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <CircleDollarSign
                size={18}
                className="text-emerald-400"
              />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500">
                Outstanding
              </p>

              <p className="mt-2 text-2xl font-semibold text-amber-400">
                {formatAmount(
                  stats.outstanding
                )}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <WalletCards
                size={18}
                className="text-amber-400"
              />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500">
                Open Invoices
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {stats.pendingCount}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <ReceiptText
                size={18}
                className="text-blue-400"
              />
            </div>
          </div>
        </Card>

      </div>

      {/* Main */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

        {/* Recent Invoices */}
        <Card className="overflow-hidden p-0">

          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">

            <div>
              <h2 className="font-semibold text-white">
                Recent Invoices
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your latest billing activity
              </p>
            </div>

            <Link
              href="/client/invoices"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 transition hover:text-violet-300"
            >
              View all
              <ArrowUpRight size={14} />
            </Link>

          </div>

          {recentInvoices.length === 0 ? (
            <div className="px-6 py-14 text-center">

              <ReceiptText
                size={24}
                className="mx-auto text-slate-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                No invoices available for your account.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">

              {recentInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/admin/invoices/${invoice.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-white/[0.025]"
                >

                  <div className="min-w-0">

                    <p className="text-sm font-medium text-white">
                      {invoice.id}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {invoice.description ||
                        "Corporate billing"}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Due {formatDate(invoice.dueDate)}
                    </p>

                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">

                    <p className="text-sm font-medium text-white">
                      {formatAmount(invoice.amount)}
                    </p>

                    <Badge status={invoice.status}>
                      {invoice.status}
                    </Badge>

                  </div>

                </Link>
              ))}

            </div>
          )}

        </Card>

        {/* Account */}
        <Card>

          <div className="mb-6">

            <p className="text-xs font-medium uppercase tracking-[0.12em] text-violet-400">
              Account
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Account Summary
            </h2>

          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-lg font-semibold text-violet-300">
                {client?.company
                  ?.slice(0, 2)
                  .toUpperCase() || "CL"}
              </div>

              <div className="min-w-0">

                <p className="truncate font-medium text-white">
                  {client?.company || "Client Account"}
                </p>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {client?.email || "Client Portal"}
                </p>

              </div>

            </div>

            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-500">
                  Account status
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-500">
                  Total invoices
                </span>

                <span className="text-sm font-medium text-white">
                  {invoices.length}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-500">
                  Outstanding
                </span>

                <span className="text-sm font-medium text-amber-400">
                  {formatAmount(stats.outstanding)}
                </span>

              </div>

            </div>

          </div>

          <div className="mt-5 rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-5">

            <p className="text-sm font-medium text-white">
              Need assistance?
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Contact your account administrator
              for billing questions or payment
              support.
            </p>

            <button
              type="button"
              className="mt-4 text-xs font-medium text-violet-400 transition hover:text-violet-300"
            >
              Contact support →
            </button>

          </div>

        </Card>

      </div>

    </div>
  );
}