"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  Plus,
  Search,
  Users,
  ArrowUpRight,
  FileText,
  X,
} from "lucide-react";

import {
  getClients,
  createClient,
} from "@/services/clientService";

import { getInvoices } from "@/services/invoiceService";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ClientsPage() {
  const router = useRouter();

  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);

  const [clientName, setClientName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");

  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setClients(getClients());
    setInvoices(getInvoices());
  }, []);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return clients;
    }

    return clients.filter((client) =>
      [
        client.name,
        client.company,
        client.email,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [clients, search]);

  const getClientInvoices = (clientId) => {
    return invoices.filter(
      (invoice) => invoice.clientId === clientId
    );
  };

  const totalClients = clients.length;

  const activeClients = clients.filter((client) =>
    invoices.some(
      (invoice) =>
        invoice.clientId === client.id &&
        invoice.status !== "paid"
    )
  ).length;

  const totalOutstanding = invoices
    .filter(
      (invoice) =>
        invoice.status !== "paid"
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const handleAddClient = () => {
    setFormError("");

    if (!clientName.trim()) {
      setFormError("Client name is required.");
      return;
    }

    if (!company.trim()) {
      setFormError("Company name is required.");
      return;
    }

    if (!email.trim()) {
      setFormError("Email address is required.");
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }

    try {
      setFormLoading(true);

      const newClient = createClient({
        name: clientName,
        company,
        email,
      });

      setClients((currentClients) => [
        ...currentClients,
        newClient,
      ]);

      setClientName("");
      setCompany("");
      setEmail("");

      setShowAddClient(false);

      setSuccessMessage(
        `${newClient.name} has been added successfully.`
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (error) {
      console.error("Failed to create client:", error);

      setFormError(
        "Unable to create client. Please try again."
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">

      {/* Success Message */}
      {successMessage && (
        <div className="fixed right-5 top-5 z-[100] flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-500/20 bg-[#0b1511]/95 px-5 py-4 shadow-2xl backdrop-blur-xl">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <Users size={17} />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Client added
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
              Client Management
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Clients
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Manage corporate clients, billing relationships,
              and invoice activity from one place.
            </p>
          </div>

          <Button
            onClick={() => {
              setFormError("");
              setShowAddClient(true);
            }}
          >
            <Plus size={17} />
            Add Client
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Clients
                </p>

                <p className="mt-2 text-2xl font-semibold text-white">
                  {totalClients}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <Users size={19} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Registered corporate accounts
            </p>
          </Card>

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Active Clients
                </p>

                <p className="mt-2 text-2xl font-semibold text-white">
                  {activeClients}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <ArrowUpRight size={19} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Clients with outstanding invoices
            </p>
          </Card>

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Outstanding
                </p>

                <p className="mt-2 text-2xl font-semibold text-white">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(totalOutstanding)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                <FileText size={19} />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Unpaid invoice value
            </p>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6 p-3">
          <div className="flex items-center gap-3 px-2">
            <Search
              size={18}
              className="shrink-0 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search clients by name, company or email..."
              className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-slate-600"
            />
          </div>
        </Card>

        {/* Client Grid */}
        {filteredClients.length === 0 ? (
          <Card className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-500">
              <Users size={22} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-white">
              No clients found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search query.
            </p>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredClients.map((client) => {
              const clientInvoices =
                getClientInvoices(client.id);

              const outstanding = clientInvoices
                .filter(
                  (invoice) =>
                    invoice.status !== "paid"
                )
                .reduce(
                  (total, invoice) =>
                    total + Number(invoice.amount || 0),
                  0
                );

              return (
                <Card
                  key={client.id}
                  hover
                  className="group cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/admin/clients/${client.id}`
                    )
                  }
                >
                  {/* Client Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-sm font-semibold text-violet-300">
                        {client.name
                          .split(" ")
                          .map((word) => word[0])
                          .slice(0, 2)
                          .join("")}
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          {client.name}
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {client.id}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`Open ${client.name}`}
                      onClick={(event) => {
                        event.stopPropagation();

                        router.push(
                          `/admin/clients/${client.id}`
                        );
                      }}
                      className="rounded-lg p-2 text-slate-600 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </div>

                  {/* Company */}
                  <div className="mt-6 flex items-center gap-3">
                    <Building2
                      size={16}
                      className="text-slate-500"
                    />

                    <span className="text-sm text-slate-300">
                      {client.company}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="mt-3 flex items-center gap-3">
                    <Mail
                      size={16}
                      className="text-slate-500"
                    />

                    <span className="truncate text-sm text-slate-400">
                      {client.email}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <p className="text-xs text-slate-500">
                        Invoices
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {clientInvoices.length}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <p className="text-xs text-slate-500">
                        Outstanding
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }).format(outstanding)}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <span className="text-xs text-slate-600">
                      VaultPay client
                    </span>

                    <span className="text-xs font-medium text-emerald-400">
                      Active
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0e13] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/[0.07] p-6">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <Users size={19} />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Add New Client
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new corporate client profile.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddClient(false);
                  setFormError("");
                }}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5 p-6">

              {/* Client Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Client Name
                </label>

                <input
                  type="text"
                  value={clientName}
                  onChange={(event) =>
                    setClientName(event.target.value)
                  }
                  placeholder="e.g. Acme Corporation"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              {/* Company */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Company
                </label>

                <input
                  type="text"
                  value={company}
                  onChange={(event) =>
                    setCompany(event.target.value)
                  }
                  placeholder="e.g. Acme Corporation"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Billing Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="billing@company.com"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-sm text-rose-300">
                  {formError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] p-6 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddClient(false);
                  setFormError("");
                }}
                disabled={formLoading}
              >
                Cancel
              </Button>

              <Button
                onClick={handleAddClient}
                loading={formLoading}
              >
                <Plus size={16} />
                Create Client
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}