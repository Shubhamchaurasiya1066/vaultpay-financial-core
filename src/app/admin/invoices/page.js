"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
  Building2,
  Mail,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

import {
  createInvoice,
  getInvoices,
  saveInvoices,
} from "@/services/invoiceService";

import { getClients } from "@/services/clientService";

export default function AdminInvoicesPage() {
  const router = useRouter();

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [invoices, setInvoices] = useState([]);

  const [form, setForm] = useState({
    clientId: "",
    amount: "",
    dueDate: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] =
    useState("");

  // Load clients and invoices
  useEffect(() => {
    const savedClients = getClients();
    const savedInvoices = getInvoices();

    setClients(savedClients);
    setInvoices(savedInvoices);
  }, []);

  // Update form fields
  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
      submit: "",
    }));
  }

  // Selected client
  const selectedClient = useMemo(() => {
    return clients.find(
      (client) => client.id === form.clientId
    );
  }, [clients, form.clientId]);

  // Validate form
  function validate() {
    const nextErrors = {};

    if (!form.clientId) {
      nextErrors.clientId =
        "Please select a client.";
    }

    if (!form.amount) {
      nextErrors.amount =
        "Invoice amount is required.";
    } else if (Number(form.amount) <= 0) {
      nextErrors.amount =
        "Amount must be greater than zero.";
    }

    if (!form.dueDate) {
      nextErrors.dueDate =
        "Due date is required.";
    }

    return nextErrors;
  }

  // Create invoice
  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!selectedClient) {
      setErrors({
        clientId: "Selected client was not found.",
      });

      return;
    }

    try {
      const newInvoice = createInvoice({
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientCompany: selectedClient.company,
        clientEmail: selectedClient.email,
        amount: form.amount,
        dueDate: form.dueDate,
        description:
          form.description.trim() ||
          "Corporate billing services",
      });

      setInvoices((current) => [
        newInvoice,
        ...current,
      ]);

      setForm({
        clientId: "",
        amount: "",
        dueDate: "",
        description: "",
      });

      setErrors({});
      setShowForm(false);

      setSuccessMessage(
        `${newInvoice.id} created successfully for ${selectedClient.name}.`
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (error) {
      console.error(
        "Failed to create invoice:",
        error
      );

      setErrors({
        submit:
          "Unable to create invoice. Please try again.",
      });
    }
  }

  // Delete invoice
  function handleDelete(invoiceId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmed) {
      return;
    }

    const updatedInvoices = invoices.filter(
      (invoice) => invoice.id !== invoiceId
    );

    saveInvoices(updatedInvoices);
    setInvoices(updatedInvoices);

    setSuccessMessage(
      `${invoiceId} deleted successfully.`
    );

    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);
  }

  // Search invoices
  const filteredInvoices = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return invoices;
    }

    return invoices.filter((invoice) => {
      return (
        invoice.id
          ?.toLowerCase()
          .includes(query) ||
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

  // Format currency
  function formatAmount(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  }

  // Format date
  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  }

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
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
                Invoice Management
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Invoices
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Create, manage and track all corporate
              billing records from one place.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() =>
              setShowForm((current) => !current)
            }
          >
            {showForm ? (
              <>
                <X size={16} />
                Close Form
              </>
            ) : (
              <>
                <Plus size={16} />
                New Invoice
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
          <CheckCircle2
            size={18}
            className="shrink-0 text-emerald-400"
          />

          <p className="text-sm text-emerald-300">
            {successMessage}
          </p>
        </div>
      )}

      {/* Create Invoice Form */}
      {showForm && (
        <Card className="mb-8 p-6 sm:p-8">

          <div className="mb-7">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-violet-400">
              New billing record
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Create Invoice
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the billing information below.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Client */}
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Client
              </label>

              <div className="relative">
                <UserRound
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <select
                  value={form.clientId}
                  onChange={(event) =>
                    updateField(
                      "clientId",
                      event.target.value
                    )
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-10 text-sm text-white outline-none transition focus:border-violet-500/40"
                >
                  <option
                    value=""
                    className="bg-[#0b111b]"
                  >
                    Select client
                  </option>

                  {clients.map((client) => (
                    <option
                      key={client.id}
                      value={client.id}
                      className="bg-[#0b111b]"
                    >
                      {client.name} — {client.company}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"
                />
              </div>

              {errors.clientId && (
                <p className="mt-2 text-xs text-red-400">
                  {errors.clientId}
                </p>
              )}

              {/* Selected Client Preview */}
              {selectedClient && (
                <div className="mt-3 rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-4">

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      <Building2 size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {selectedClient.company}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {selectedClient.name}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={14} />

                    <span className="truncate">
                      {selectedClient.email}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Amount + Due Date */}
            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Invoice Amount
                </label>

                <div className="relative">
                  <CircleDollarSign
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      updateField(
                        "amount",
                        event.target.value
                      )
                    }
                    placeholder="0.00"
                    className="h-12 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/40"
                  />
                </div>

                {errors.amount && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Due Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      updateField(
                        "dueDate",
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition focus:border-violet-500/40"
                  />
                </div>

                {errors.dueDate && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.dueDate}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Add invoice description or billing notes..."
                className="w-full resize-none rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/40"
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
                <p className="text-xs text-red-400">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:justify-end">

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setErrors({});
                }}
              >
                Cancel
              </Button>

              <Button type="submit">
                <Plus size={16} />
                Create Invoice
              </Button>

            </div>
          </form>
        </Card>
      )}

      {/* Invoice Search */}
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
            placeholder="Search invoice ID, client, company, status..."
            className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/40"
          />
        </div>
      </Card>

      {/* Invoice Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Card className="p-5">
          <p className="text-xs text-slate-500">
            Total Invoices
          </p>

          <p className="mt-2 text-2xl font-semibold text-white">
            {invoices.length}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-slate-500">
            Paid
          </p>

          <p className="mt-2 text-2xl font-semibold text-emerald-400">
            {
              invoices.filter(
                (invoice) =>
                  invoice.status === "paid"
              ).length
            }
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-slate-500">
            Pending
          </p>

          <p className="mt-2 text-2xl font-semibold text-amber-400">
            {
              invoices.filter(
                (invoice) =>
                  invoice.status === "pending"
              ).length
            }
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-slate-500">
            Total Value
          </p>

          <p className="mt-2 text-2xl font-semibold text-violet-400">
            {formatAmount(
              invoices.reduce(
                (total, invoice) =>
                  total +
                  Number(invoice.amount || 0),
                0
              )
            )}
          </p>
        </Card>
      </div>

      {/* Invoice List */}
      <Card className="overflow-hidden p-0">

        <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white">
                Invoice Records
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredInvoices.length} record
                {filteredInvoices.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>
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
              Create a new invoice or change your
              search.
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
                    Client
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
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map(
                  (invoice) => (
                    <tr
                      key={invoice.id}
                      onClick={() =>
                        router.push(
                          `/admin/invoices/${invoice.id}`
                        )
                      }
                      className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                    >

                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {invoice.id}
                          </p>

                          <p className="mt-1 max-w-[220px] truncate text-xs text-slate-600">
                            {invoice.description ||
                              "No description"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm text-slate-300">
                            {invoice.clientName}
                          </p>

                          {invoice.clientCompany && (
                            <p className="mt-1 text-xs text-slate-600">
                              {invoice.clientCompany}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-white">
                          {formatAmount(
                            invoice.amount
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-400">
                        {formatDate(
                          invoice.issueDate
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-400">
                        {formatDate(
                          invoice.dueDate
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <Badge
                          status={
                            invoice.status
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();

                            handleDelete(
                              invoice.id
                            );
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-500/10 hover:text-red-400"
                          title="Delete invoice"
                        >
                          <Trash2 size={16} />
                        </button>
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