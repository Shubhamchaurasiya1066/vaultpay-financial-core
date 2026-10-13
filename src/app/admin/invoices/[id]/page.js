"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Mail,
  MoreHorizontal,
  Receipt,
  ShieldCheck,
  X,
  User,
} from "lucide-react";

import { getInvoiceById, recordPayment } from "@/services/invoiceService";
import { getClientById } from "@/services/clientService";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState(null);
  const [client, setClient] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!params?.id) return;

    const invoiceData = getInvoiceById(params.id);

    if (!invoiceData) {
      router.replace("/admin/invoices");
      return;
    }

    setInvoice(invoiceData);

    const clientData = getClientById(invoiceData.clientId);

    setClient(clientData);
  }, [params?.id, router]);

  if (!invoice) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-sm text-slate-400">
          Loading invoice...
        </div>
      </div>
    );
  }

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(invoice.amount);

  const handleRecordPayment = () => {
    setPaymentError("");

    if (!paymentAmount || Number(paymentAmount) <= 0) {
      setPaymentError("Please enter a valid payment amount.");
      return;
    }

    if (Number(paymentAmount) > Number(invoice.amount)) {
      setPaymentError(
        "Payment amount cannot exceed the invoice total."
      );
      return;
    }

    if (!paymentDate) {
      setPaymentError("Please select a payment date.");
      return;
    }

    try {
      setPaymentLoading(true);

      const updatedInvoice = recordPayment(invoice.id, {
        amount: paymentAmount,
        paymentDate,
        method: paymentMethod,
        reference: paymentReference,
      });

      setInvoice(updatedInvoice);

      setShowPaymentModal(false);
      setPaymentSuccess(true);

      setPaymentAmount("");
      setPaymentReference("");

      setTimeout(() => {
        setPaymentSuccess(false);
      }, 4000);
    } catch (error) {
      console.error("Payment failed:", error);
      setPaymentError(
        "Unable to record payment. Please try again."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const statusConfig = {
    paid: {
      label: "Paid",
      icon: CheckCircle2,
    },
    pending: {
      label: "Pending",
      icon: Clock3,
    },
    processing: {
      label: "Processing",
      icon: Clock3,
    },
    overdue: {
      label: "Overdue",
      icon: Clock3,
    },
  };

  const currentStatus =
    statusConfig[invoice.status] || statusConfig.pending;

  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      {paymentSuccess && (
        <div className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-[#0b1511]/95 px-5 py-4 shadow-2xl backdrop-blur-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Payment recorded
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              Invoice has been marked as paid.
            </p>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              onClick={() => router.push("/admin/invoices")}
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to invoices
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {invoice.id}
              </h1>

              <Badge>
                <span className="inline-flex items-center gap-1.5">
                  <StatusIcon size={13} />
                  {currentStatus.label}
                </span>
              </Badge>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Invoice details and payment information
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                window.print()
              }
            >
              <Receipt size={16} />
              Print
            </Button>

            <Button
              onClick={() => {
                setPaymentAmount(invoice.amount);
                setPaymentError("");
                setShowPaymentModal(true);
              }}
              disabled={invoice.status === "paid"}
            >
              <CreditCard size={16} />
              {invoice.status === "paid"
                ? "Payment Recorded"
                : "Record Payment"}
            </Button>

            <Button
              variant="ghost"
              className="border border-white/10"
            >
              <MoreHorizontal size={18} />
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* Invoice */}
          <div className="space-y-6">

            {/* Invoice Summary */}
            <Card className="overflow-hidden p-0">
              <div className="border-b border-white/[0.07] p-6 sm:p-8">
                <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      <FileText size={21} />
                    </div>

                    <p className="text-sm text-slate-400">
                      Total invoice amount
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                      {formattedAmount}
                    </h2>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Invoice
                    </p>

                    <p className="mt-1 text-sm font-medium text-white">
                      {invoice.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Information */}
              <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">

                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                    Issue Date
                  </p>

                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <CalendarDays
                      size={16}
                      className="text-slate-500"
                    />
                    {invoice.issueDate}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                    Due Date
                  </p>

                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <CalendarDays
                      size={16}
                      className="text-slate-500"
                    />
                    {invoice.dueDate}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                    Description
                  </p>

                  <p className="text-sm leading-6 text-slate-300">
                    {invoice.description ||
                      "No description provided for this invoice."}
                  </p>
                </div>
              </div>
            </Card>

            {/* Client Details */}
            <Card>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Client Details
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Billing information associated with this invoice
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-slate-400">
                  <User size={18} />
                </div>
              </div>

              {client ? (
                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                      Client
                    </p>

                    <p className="mt-2 font-medium text-white">
                      {client.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                      Company
                    </p>

                    <p className="mt-2 font-medium text-white">
                      {client.company}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                      Email
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                      <Mail size={15} />
                      {client.email}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                      Client ID
                    </p>

                    <p className="mt-2 font-mono text-sm text-slate-300">
                      {client.id}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Client information unavailable.
                </p>
              )}
            </Card>

            {/* Payment Timeline */}
            <Card>
              <div className="mb-6">
                <h3 className="text-base font-semibold text-white">
                  Payment Activity
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Recent activity for this invoice
                </p>
              </div>

              <div className="space-y-6">

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-violet-300">
                      <FileText size={16} />
                    </div>

                    <div className="mt-2 h-full w-px bg-white/[0.07]" />
                  </div>

                  <div className="pb-2">
                    <p className="text-sm font-medium text-white">
                      Invoice created
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {invoice.issueDate}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
                    <ShieldCheck size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      Payment status: {currentStatus.label}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Current invoice payment state
                    </p>
                  </div>
                </div>

              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Payment Summary */}
            <Card>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                  <CreditCard size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Payment Summary
                  </h3>

                  <p className="text-xs text-slate-500">
                    Current invoice state
                  </p>
                </div>
              </div>

              <div className="space-y-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Invoice total
                  </span>

                  <span className="font-medium text-white">
                    {formattedAmount}
                  </span>
                </div>

                <div className="h-px bg-white/[0.07]" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Status
                  </span>

                  <Badge>
                    {currentStatus.label}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Due date
                  </span>

                  <span className="text-sm text-slate-300">
                    {invoice.dueDate}
                  </span>
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card className="border-violet-500/10 bg-violet-500/[0.03]">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Secure Financial Record
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    This invoice is protected by VaultPay financial
                    controls and role-based access.
                  </p>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0e13] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/[0.07] p-6">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <CreditCard size={19} />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Record Payment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Record a payment for {invoice.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentError("");
                }}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 p-6">

              {/* Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Payment Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    $
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(event) =>
                      setPaymentAmount(event.target.value)
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 pl-9 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10"
                    placeholder="0.00"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Invoice total: {formattedAmount}
                </p>
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Payment Date
                </label>

                <input
                  type="date"
                  value={paymentDate}
                  onChange={(event) =>
                    setPaymentDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10"
                >
                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>

                  <option value="Credit Card">
                    Credit Card
                  </option>

                  <option value="ACH">
                    ACH
                  </option>

                  <option value="Wire Transfer">
                    Wire Transfer
                  </option>

                  <option value="Cash">
                    Cash
                  </option>
                </select>
              </div>

              {/* Reference */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Payment Reference
                  <span className="ml-1 text-slate-600">
                    (optional)
                  </span>
                </label>

                <input
                  type="text"
                  value={paymentReference}
                  onChange={(event) =>
                    setPaymentReference(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10"
                  placeholder="e.g. VP-20261002-001"
                />
              </div>

              {/* Error */}
              {paymentError && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-sm text-rose-300">
                  {paymentError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] p-6 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentError("");
                }}
                disabled={paymentLoading}
              >
                Cancel
              </Button>

              <Button
                onClick={handleRecordPayment}
                loading={paymentLoading}
              >
                <CheckCircle2 size={16} />
                Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}