import { api } from "./client.js";

export const taxisApi = {
  getAll: () => api.get("/taxis"),
  create: (data) => api.post("/taxis", data),
  update: (id, data) => api.put(`/taxis/${id}`, data),
  delete: (id) => api.delete(`/taxis/${id}`),
};
