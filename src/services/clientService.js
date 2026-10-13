const STORAGE_KEY = "vaultpay_clients";

const defaultClients = [
  {
    id: "client-001",
    name: "Atlas Consulting",
    email: "billing@atlasconsulting.com",
    company: "Atlas Consulting",
  },
  {
    id: "client-002",
    name: "Northstar Labs",
    email: "finance@northstarlabs.com",
    company: "Northstar Labs",
  },
  {
    id: "client-003",
    name: "Vertex Group",
    email: "accounts@vertexgroup.com",
    company: "Vertex Group",
  },
  {
    id: "client-004",
    name: "Summit Holdings",
    email: "billing@summitholdings.com",
    company: "Summit Holdings",
  },
  {
    id: "client-005",
    name: "BluePeak Systems",
    email: "finance@bluepeaksystems.com",
    company: "BluePeak Systems",
  },
];

export function getClients() {
  if (typeof window === "undefined") {
    return defaultClients;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultClients)
      );

      return defaultClients;
    }

    const clients = JSON.parse(stored);

    if (!Array.isArray(clients)) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultClients)
      );

      return defaultClients;
    }

    return clients;
  } catch (error) {
    console.error("Failed to load clients:", error);

    return defaultClients;
  }
}

export function saveClients(clients) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(clients)
  );
}

export function createClient(clientData) {
  const clients = getClients();

  const highestNumber = clients.reduce(
    (max, client) => {
      const number = Number(
        String(client.id).replace("client-", "")
      );

      return Number.isFinite(number)
        ? Math.max(max, number)
        : max;
    },
    0
  );

  const nextNumber = String(
    highestNumber + 1
  ).padStart(3, "0");

  const client = {
    id: `client-${nextNumber}`,
    name: clientData.name.trim(),
    email: clientData.email.trim().toLowerCase(),
    company: clientData.company.trim(),
  };

  const updatedClients = [
    ...clients,
    client,
  ];

  saveClients(updatedClients);

  return client;
}

export function getClientById(id) {
  const clients = getClients();

  return clients.find(
    (client) => client.id === id
  );
}