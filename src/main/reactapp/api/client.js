/**
 * api/client.js — Cliente HTTP base
 * Centraliza la URL del backend y el manejo de errores HTTP.
 *
 * PRODUCCIÓN: VITE_API_URL no está definida → BASE_URL = "" (URL relativa)
 *             Las llamadas van al mismo host que sirve el frontend (Spring Boot)
 * DESARROLLO: VITE_API_URL=http://localhost:8080 en .env.local
 */

const _envUrl = import.meta.env.VITE_API_URL;
// Vite puede inyectar el string literal "undefined" si la var no está definida en build time
const BASE_URL = (_envUrl && _envUrl !== "undefined") ? _envUrl : "";

/**
 * Wrapper de fetch que agrega la base URL y parsea JSON automáticamente.
 * Lanza un Error si el servidor responde con status >= 400.
 */
export async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message ?? data?.error ?? `Error ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (path) => apiRequest(path, { method: "GET" }),
  post: (path, body) => apiRequest(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => apiRequest(path, { method: "DELETE" }),
};
