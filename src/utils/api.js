import { getToken, logout } from "./auth";

const baseURL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${baseURL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // if token expired -> force logout
  if (res.status === 401) {
    logout();
    window.location.href = "/";
    return;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) throw new Error(data?.message || "Request failed");

  return data;
}
