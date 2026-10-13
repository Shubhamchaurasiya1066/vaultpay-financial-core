"use client";

import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Search,
  WalletCards,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getClientById } from "@/services/clientService";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

import { getInvoices } from "@/services/invoiceService";

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [client, setClient] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

      
  const handlePayment = async () => {
  if (!invoice) {
    return;
  }

  try {
    setPaymentLoading(true);
    setPaymentError("");

    const response = await fetch(
      "/api/stripe/create-checkout-session",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: invoice.amount,
          clientName: invoice.clientName,
          description: invoice.description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          "Unable to start payment."
      );
    }

    if (!data.url) {
      throw new Error(
        "Stripe checkout URL was not returned."
      );
    }

    window.location.href = data.url;
  } catch (error) {
    console.error(
      "Payment Error:",
      error
    );

    setPaymentError(
      error.message ||
        "Unable to start payment."
    );

    setPaymentLoading(false);
  }
};

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

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return invoices;
    }

    return invoices.filter((invoice) => {
      return (
        invoice.id?.toLowerCase().includes(query) ||
        invoice.clientName
          ?.toLowerCase()
          .includes(query) ||
        invoice.clientCompany
          ?.toLowerCase()
          .includes(query) ||
        invoice.status
          ?.toLowerCase()
          .includes(query) ||
        invoice.description
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [invoices, search]);

  const stats = useMemo(() => {
    const total = invoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.amount || 0),
      0
    );

    const paid = invoices
      .filter((invoice) => invoice.status === "paid")
      .reduce(
        (sum, invoice) =>
          sum + Number(invoice.amount || 0),
        0
      );

    const outstanding = invoices
      .filter((invoice) => invoice.status !== "paid")
      .reduce(
        (sum, invoice) =>
          sum + Number(invoice.amount || 0),
        0
      );

    return {
      total,
      paid,
      outstanding,
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

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8">

        <Link
          href="/client"
          className="mb-5 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to overview
        </Link>

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                <FileText
                  size={18}
                  className="text-violet-400"
                />
              </div>

              <span className="text-xs font-medium uppercase tracking-[0.15em] text-violet-400">
                Billing Center
              </span>

            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your Invoices
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              View your complete billing history,
              payment status and outstanding balances.
            </p>

          </div>

          <Link href="/client">
            <Button variant="secondary">
              <WalletCards size={16} />
              Overview
            </Button>
          </Link>

        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

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
                Total Paid
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
                {formatAmount(stats.outstanding)}
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

      </div>

      {/* Search */}
      <Card className="mb-6 p-4">

        <div className="relative">

          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search invoice ID, status or description..."
            className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/40"
          />

        </div>

      </Card>

      {/* Invoice Table */}
      <Card className="overflow-hidden p-0">

        <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">

          <h2 className="font-semibold text-white">
            Invoice History
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {filteredInvoices.length} invoice
            {filteredInvoices.length !== 1
              ? "s"
              : ""}{" "}
            available
          </p>

        </div>

        {filteredInvoices.length === 0 ? (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
              <FileText
                size={22}
                className="text-slate-600"
              />
            </div>

            <h3 className="mt-4 font-medium text-white">
              No invoices found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>

                <tr className="border-b border-white/[0.06] text-left">

                  <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                    Invoice
                  </th>

                  <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                    Issue Date
                  </th>

                  <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                    Due Date
                  </th>

                  <th className="px-6 py-4 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-[11px] font-medium uppercase tracking-wider text-slate-600">
                    Details
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredInvoices.map(
                  (invoice) => (

                    <tr
                      key={invoice.id}
                      className="transition-colors hover:bg-white/[0.025]"
                    >

                      {/* Invoice */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                            <FileText
                              size={17}
                              className="text-violet-400"
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="text-sm font-medium text-white">
                              {invoice.id}
                            </p>

                            <p className="mt-1 max-w-[260px] truncate text-xs text-slate-600">
                              {invoice.description ||
                                "Corporate billing"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Amount */}
                      <td className="px-6 py-5">

                        <p className="text-sm font-medium text-white">
                          {formatAmount(
                            invoice.amount
                          )}
                        </p>

                      </td>

                      {/* Issue Date */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-sm text-slate-400">

                          <CalendarDays
                            size={14}
                            className="text-slate-600"
                          />

                          {formatDate(
                            invoice.issueDate
                          )}

                        </div>

                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-sm text-slate-400">

                          <CalendarDays
                            size={14}
                            className="text-slate-600"
                          />

                          {formatDate(
                            invoice.dueDate
                          )}

                        </div>

                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">

                        <Badge
                          status={invoice.status}
                        >
                          {invoice.status}
                        </Badge>

                      </td>

                      {/* Details */}
                      <td className="px-6 py-5 text-right">

                        <Link
                          href={`/client/invoices/${invoice.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-violet-500/10 hover:text-violet-400"
                          title="View invoice"
                        >
                          <ArrowUpRight size={16} />
                        </Link>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </Card>

    </div>
  );
}