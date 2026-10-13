const STORAGE_KEY = "vaultpay_invoices";

const defaultInvoices = [
  {
    id: "INV-1048",
    clientId: "client-001",
    clientName: "Atlas Consulting",
    amount: 18500,
    status: "paid",
    issueDate: "2026-09-28",
    dueDate: "2026-10-12",
    description: "September corporate consulting services",
  },
  {
    id: "INV-1047",
    clientId: "client-002",
    clientName: "Northstar Labs",
    amount: 9800,
    status: "pending",
    issueDate: "2026-09-27",
    dueDate: "2026-10-11",
    description: "Financial technology consulting",
  },
  {
    id: "INV-1046",
    clientId: "client-003",
    clientName: "Vertex Group",
    amount: 24000,
    status: "processing",
    issueDate: "2026-09-26",
    dueDate: "2026-10-10",
    description: "Enterprise infrastructure services",
  },
  {
    id: "INV-1045",
    clientId: "client-004",
    clientName: "Summit Holdings",
    amount: 13750,
    status: "paid",
    issueDate: "2026-09-25",
    dueDate: "2026-10-09",
    description: "Monthly financial operations",
  },
  {
    id: "INV-1044",
    clientId: "client-005",
    clientName: "BluePeak Systems",
    amount: 7420,
    status: "overdue",
    issueDate: "2026-09-23",
    dueDate: "2026-09-28",
    description: "Technology advisory services",
  },
];

export function getInvoices() {
  if (typeof window === "undefined") {
    return defaultInvoices;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultInvoices)
      );

      return defaultInvoices;
    }

    const invoices = JSON.parse(stored);

    if (!Array.isArray(invoices)) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultInvoices)
      );

      return defaultInvoices;
    }

    // Remove duplicate invoice IDs
    const uniqueInvoices = Array.from(
      new Map(
        invoices.map((invoice) => [invoice.id, invoice])
      ).values()
    );

    // Keep localStorage clean
    if (uniqueInvoices.length !== invoices.length) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(uniqueInvoices)
      );
    }

    return uniqueInvoices;
  } catch (error) {
    console.error("Failed to load invoices:", error);

    return defaultInvoices;
  }
}

export function saveInvoices(invoices) {
  if (typeof window === "undefined") {
    return;
  }

  // Remove duplicate IDs before saving
  const uniqueInvoices = Array.from(
    new Map(
      invoices.map((invoice) => [invoice.id, invoice])
    ).values()
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(uniqueInvoices)
  );
}

export function createInvoice(invoiceData) {
  const invoices = getInvoices();

  const highestNumber = invoices.reduce(
    (max, invoice) => {
      const number = Number(
        String(invoice.id).replace("INV-", "")
      );

      return Number.isFinite(number)
        ? Math.max(max, number)
        : max;
    },
    1043
  );

  const nextNumber = highestNumber + 1;

  const invoice = {
    id: `INV-${nextNumber}`,
    ...invoiceData,
    amount: Number(invoiceData.amount),
    status: "pending",
    issueDate: new Date()
      .toISOString()
      .split("T")[0],
  };

  const updatedInvoices = [
    invoice,
    ...invoices,
  ];

  saveInvoices(updatedInvoices);

  return invoice;
}

export function getInvoiceById(id) {
  const invoices = getInvoices();

  return invoices.find(
    (invoice) => invoice.id === id
  );
}
export function recordPayment(invoiceId, paymentData) {
  const invoices = getInvoices();

  const invoiceIndex = invoices.findIndex(
    (invoice) => invoice.id === invoiceId
  );

  if (invoiceIndex === -1) {
    throw new Error("Invoice not found");
  }

  const invoice = invoices[invoiceIndex];

  const updatedInvoice = {
    ...invoice,
    status: "paid",
    payment: {
      amount: Number(paymentData.amount),
      paymentDate: paymentData.paymentDate,
      method: paymentData.method,
      reference: paymentData.reference || "",
    },
    paidAt: paymentData.paymentDate,
  };

  const updatedInvoices = [...invoices];

  updatedInvoices[invoiceIndex] = updatedInvoice;

  saveInvoices(updatedInvoices);

  return updatedInvoice;
}