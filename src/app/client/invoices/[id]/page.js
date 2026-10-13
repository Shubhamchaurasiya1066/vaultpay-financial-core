"use client";

import {
  ArrowLeft,
  Download,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  Mail,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
  AlertCircle,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

import {
  getInvoiceById,
  recordPayment,
} from "@/services/invoiceService";

import { getClientById } from "@/services/clientService";
import { getCurrentUser } from "@/lib/auth";

export default function ClientInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [paymentError, setPaymentError] = useState("");
  const [pdfError, setPdfError] = useState("");

  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    type: "",
    title: "",
    message: "",
  });

  function showToast(type, title, message) {
    setToast({
      visible: true,
      type,
      title,
      message,
    });

    window.setTimeout(() => {
      setToast((current) => ({
        ...current,
        visible: false,
      }));
    }, 4500);
  }

  function closeToast() {
    setToast((current) => ({
      ...current,
      visible: false,
    }));
  }

  useEffect(() => {
    async function loadInvoice() {
      const user = getCurrentUser();

      if (!user || user.role !== "client") {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const invoiceId = params?.id;

      if (!invoiceId) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      let invoiceRecord = getInvoiceById(invoiceId);

      if (!invoiceRecord) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      /*
       * Client ownership check
       */
      if (invoiceRecord.clientId !== user.id) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const clientRecord = getClientById(user.id);

      /*
       * Stripe payment verification
       */
      const searchParams = new URLSearchParams(
        window.location.search
      );

      const paymentSuccess = searchParams.get("payment");
      const sessionId = searchParams.get("session_id");

      /*
       * Replay protection
       */
      const alreadyProcessed = Boolean(
        invoiceRecord.payment?.reference
      );

      if (
        paymentSuccess === "success" &&
        sessionId &&
        invoiceRecord.status !== "paid" &&
        !alreadyProcessed
      ) {
        try {
          const response = await fetch(
            `/api/stripe/verify-session?session_id=${encodeURIComponent(
              sessionId
            )}&invoice_id=${encodeURIComponent(invoiceId)}`
          );

          const data = await response.json();

          if (
            response.ok &&
            data.success &&
            data.paid
          ) {
            const latestInvoice =
              getInvoiceById(invoiceId);

            const sameSessionAlreadyRecorded =
              latestInvoice?.payment?.reference ===
              data.sessionId;

            if (!sameSessionAlreadyRecorded) {
              invoiceRecord = recordPayment(
                invoiceId,
                {
                  amount: data.amount,
                  paymentDate: data.paymentDate,
                  method: "Stripe",
                  reference: data.sessionId,
                }
              );

              showToast(
                "success",
                "Payment confirmed",
                "Your invoice payment has been successfully verified."
              );
            } else {
              invoiceRecord = latestInvoice;
            }
          } else if (!response.ok) {
            setPaymentError(
              data.message ||
              "Unable to verify payment."
            );

            showToast(
              "error",
              "Payment verification failed",
              data.message ||
              "Unable to verify your payment."
            );
          }
        } catch (error) {
          console.error(
            "Payment verification failed:",
            error
          );

          setPaymentError(
            "Payment verification could not be completed."
          );

          showToast(
            "error",
            "Payment verification failed",
            "Payment verification could not be completed."
          );
        }
      }

      /*
       * Remove Stripe payment query parameters
       */
      if (
        paymentSuccess === "success" ||
        paymentSuccess === "cancelled"
      ) {
        router.replace(
          `/client/invoices/${invoiceId}`
        );
      }

      setInvoice(invoiceRecord);
      setClient(clientRecord);
      setLoading(false);
    }

    loadInvoice();
  }, [params, router]);

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

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate);
  }

  function getStatusLabel(status) {
    if (status === "paid") {
      return "Paid";
    }

    if (status === "pending") {
      return "Payment Pending";
    }

    if (status === "processing") {
      return "Processing";
    }

    if (status === "overdue") {
      return "Overdue";
    }

    return status || "Unknown";
  }

  /*
   * Document Vault
   *
   * Generates the invoice PDF through the backend
   * and triggers a native browser download.
   */
  async function handleDownloadPdf() {
    if (!invoice || pdfLoading) {
      return;
    }

    try {
      setPdfLoading(true);
      setPdfError("");

      const queryParams = new URLSearchParams({
        clientId: invoice.clientId || "",
        clientName: invoice.clientName || "",
        amount: String(invoice.amount || 0),
        status: invoice.status || "pending",
        issueDate: invoice.issueDate || "",
        dueDate: invoice.dueDate || "",
        description:
          invoice.description ||
          "VaultPay financial services",
      });

      const response = await fetch(
        `/api/invoices/${encodeURIComponent(
          invoice.id
        )}/pdf?${queryParams.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        let message =
          "Unable to generate the invoice PDF.";

        try {
          const data = await response.json();

          if (data?.message) {
            message = data.message;
          }
        } catch {
          // Response was not JSON.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      if (!blob.size) {
        throw new Error(
          "The generated PDF is empty."
        );
      }

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = downloadUrl;
      anchor.download = `${invoice.id}.pdf`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(downloadUrl);

      showToast(
        "success",
        "PDF ready",
        `${invoice.id}.pdf has been downloaded successfully.`
      );
    } catch (error) {
      console.error(
        "PDF Download Error:",
        error
      );

      const message =
        error?.message ||
        "Unable to download the invoice PDF.";

      setPdfError(message);

      showToast(
        "error",
        "PDF download failed",
        message
      );
    } finally {
      setPdfLoading(false);
    }
  }

  async function handlePayment() {
    /*
     * Duplicate payment protection
     */
    if (
      !invoice ||
      invoice.status === "paid" ||
      invoice.status === "processing" ||
      invoice.payment?.reference ||
      paymentLoading
    ) {
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

      /*
       * Keep loading state active while
       * redirecting to Stripe.
       */
      window.location.href = data.url;
    } catch (error) {
      console.error(
        "Payment Error:",
        error
      );

      const message =
        error?.message ||
        "Unable to start payment.";

      setPaymentError(message);

      showToast(
        "error",
        "Payment could not start",
        message
      );

      setPaymentLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-400" />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Loading invoice...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (accessDenied || !invoice) {
    return (
      <div className="mx-auto max-w-[700px] p-6 lg:p-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <Card className="w-full p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
              <ShieldCheck
                size={25}
                className="text-red-400"
              />
            </div>

            <p className="mt-5 text-xs font-medium uppercase tracking-[0.15em] text-red-400">
              Access Restricted
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-white">
              Invoice unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              This invoice does not belong
              to your client account or is no
              longer available.
            </p>

            <Link
              href="/client/invoices"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              <ArrowLeft size={16} />
              Back to invoices
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-[1200px] p-6 lg:p-8">

      {/* Toast */}
      <div
        className={`pointer-events-none fixed left-1/2 top-6 z-[100] w-[calc(100%-40px)] max-w-[390px] -translate-x-1/2 transition-all duration-300 ${toast.visible
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0"
          }`}
      >
        {toast.visible && (
          <div
            className={`pointer-events-auto overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${toast.type === "success"
                ? "border-emerald-400/20 bg-[#071a14]/95 shadow-emerald-950/30"
                : "border-rose-400/20 bg-[#1c0b10]/95 shadow-rose-950/30"
              }`}
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toast.type === "success"
                    ? "bg-emerald-400/10"
                    : "bg-rose-400/10"
                  }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2
                    size={18}
                    className="text-emerald-400"
                  />
                ) : (
                  <AlertCircle
                    size={18}
                    className="text-rose-400"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {toast.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={closeToast}
                className="shrink-0 rounded-lg p-1 text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                aria-label="Close notification"
              >
                <X size={15} />
              </button>
            </div>

            <div
              className={`h-[2px] ${toast.type === "success"
                  ? "bg-emerald-400/50"
                  : "bg-rose-400/50"
                }`}
            />
          </div>
        )}
      </div>

      {/* Back */}
      <Link
        href="/client/invoices"
        className="mb-6 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to invoices
      </Link>

      {/* Header */}
      <div className="mb-8">
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
                Invoice Details
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {invoice.id}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Complete billing information and
              payment status.
            </p>
          </div>

          <Badge status={invoice.status}>
            {getStatusLabel(invoice.status)}
          </Badge>
        </div>
      </div>

      {/* Invoice Hero */}
      <Card className="mb-6 overflow-hidden p-0">
        <div className="border-b border-white/[0.06] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-600">
                Amount Due
              </p>

              <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
                {formatAmount(invoice.amount)}
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <CalendarDays size={14} />

                Due on{" "}
                {formatDate(invoice.dueDate)}
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                <CircleDollarSign
                  size={28}
                  className="text-violet-400"
                />
              </div>

              {/* Document + Payment Actions */}
              <div className="flex flex-wrap justify-end gap-3">

                {/* Download PDF */}
                <Button
                  onClick={handleDownloadPdf}
                  disabled={pdfLoading}
                  variant="secondary"
                  className="min-w-[170px]"
                >
                  {pdfLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500/30 border-t-slate-200" />
                      Preparing PDF...
                    </>
                  ) : (
                    <>
                      <Download size={17} />
                      Download PDF
                    </>
                  )}
                </Button>

                {/* Pay Invoice */}
                {invoice.status !== "paid" &&
                  invoice.status !== "processing" &&
                  !invoice.payment?.reference && (
                    <div className="flex flex-col items-end">
                      <Button
                        onClick={handlePayment}
                        loading={paymentLoading}
                        disabled={
                          invoice.status === "paid" ||
                          invoice.status === "processing" ||
                          Boolean(
                            invoice.payment?.reference
                          ) ||
                          paymentLoading
                        }
                        className="min-w-[170px]"
                      >
                        {!paymentLoading && (
                          <CreditCard size={17} />
                        )}

                        {paymentLoading
                          ? "Redirecting..."
                          : "Pay Invoice"}
                      </Button>

                      {paymentError && (
                        <p className="mt-3 max-w-[260px] text-right text-xs leading-5 text-rose-400">
                          {paymentError}
                        </p>
                      )}
                    </div>
                  )}
              </div>

              {pdfError && (
                <p className="max-w-[300px] text-right text-xs leading-5 text-rose-400">
                  {pdfError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className="border-b border-white/[0.06] bg-white/[0.015] px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            {invoice.status === "paid" ? (
              <CheckCircle2
                size={20}
                className="text-emerald-400"
              />
            ) : (
              <Clock3
                size={20}
                className="text-amber-400"
              />
            )}

            <div>
              <p className="text-sm font-medium text-white">
                {getStatusLabel(invoice.status)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {invoice.status === "paid"
                  ? "This invoice has been successfully paid."
                  : invoice.status === "processing"
                    ? "Payment is currently being processed."
                    : "Payment for this invoice is still outstanding."}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Information Grid */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Client Information */}
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <UserRound
                size={18}
                className="text-violet-400"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-slate-600">
                Billed To
              </p>

              <h2 className="mt-1 font-semibold text-white">
                Client Information
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-600">
                Company
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {client?.company ||
                  invoice.clientCompany ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-600">
                Contact
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {client?.name ||
                  invoice.clientName ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-600">
                Email
              </p>

              <div className="mt-1 flex items-center gap-2">
                <Mail
                  size={14}
                  className="text-slate-600"
                />

                <p className="truncate text-sm text-slate-300">
                  {client?.email ||
                    invoice.clientEmail ||
                    "—"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Invoice Information */}
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <FileText
                size={18}
                className="text-blue-400"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-slate-600">
                Billing
              </p>

              <h2 className="mt-1 font-semibold text-white">
                Invoice Information
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-600">
                Invoice ID
              </span>

              <span className="text-sm font-medium text-white">
                {invoice.id}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-600">
                Issue Date
              </span>

              <span className="text-sm text-slate-300">
                {formatDate(invoice.issueDate)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-600">
                Due Date
              </span>

              <span className="text-sm text-slate-300">
                {formatDate(invoice.dueDate)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-600">
                Status
              </span>

              <Badge status={invoice.status}>
                {getStatusLabel(invoice.status)}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Description */}
      <Card className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
            <FileText
              size={18}
              className="text-slate-400"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-slate-600">
              Description
            </p>

            <h2 className="mt-1 font-semibold text-white">
              Billing Details
            </h2>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-sm leading-6 text-slate-400">
            {invoice.description ||
              "No additional billing description was provided for this invoice."}
          </p>
        </div>
      </Card>

      {/* Payment Information */}
      {invoice.payment && (
        <Card className="mt-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <WalletCards
                size={18}
                className="text-emerald-400"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-slate-600">
                Payment
              </p>

              <h2 className="mt-1 font-semibold text-white">
                Payment Information
              </h2>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-600">
                Amount Paid
              </p>

              <p className="mt-1 text-sm font-medium text-emerald-400">
                {formatAmount(
                  invoice.payment.amount
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-600">
                Payment Date
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {formatDate(
                  invoice.payment.paymentDate
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-600">
                Payment Method
              </p>

              <p className="mt-1 text-sm capitalize text-slate-300">
                {invoice.payment.method || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-600">
                Reference
              </p>

              <p className="mt-1 truncate text-sm text-slate-300">
                {invoice.payment.reference || "—"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Security Footer */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
        <ShieldCheck size={14} />

        <span>
          This invoice is protected by
          VaultPay client access controls.
        </span>
      </div>
    </div>
  );
}