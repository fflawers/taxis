import { api } from "./client.js";

export const usuariosApi = {
  getAll: () => api.get("/usuarios"),
  getTaxistas: () => api.get("/usuarios/taxistas"),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post("/usuarios", data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
};
