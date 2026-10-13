"use client";

const AUTH_KEY = "vaultpay_auth";

export const DEMO_USERS = {
  admin: {
    id: "admin-001",
    name: "Evelyn Croft",
    email: "admin@vaultpay.com",
    password: "admin123",
    role: "admin",
  },

  client: {
    id: "client-001",
    name: "Marcus Sterling",
    email: "client@vaultpay.com",
    password: "client123",
    role: "client",
  },
};

export function login(email, password) {
  const user = Object.values(DEMO_USERS).find(
    (account) =>
      account.email.toLowerCase() === email.toLowerCase() &&
      account.password === password
  );

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(session));

  return {
    success: true,
    user: session,
  };
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = localStorage.getItem(AUTH_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getCurrentUser());
}

export function hasRole(role) {
  const user = getCurrentUser();

  return user?.role === role;
}

export function getRedirectPath(role) {
  return role === "admin" ? "/admin" : "/client";
}