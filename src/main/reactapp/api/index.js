import { api } from "./client.js";

export const incidenciasApi = {
  getAll: (estado) => api.get(`/incidencias${estado ? `?estado=${estado}` : ""}`),
  create: (data) => api.post("/incidencias", data),
  update: (id, data) => api.put(`/incidencias/${id}`, data),
  delete: (id) => api.delete(`/incidencias/${id}`),
  resolver: (id, descripcion) => api.post(`/incidencias/${id}/resolver`, { descripcion }),
};

export const acuerdosApi = {
  getAll: () => api.get("/acuerdos"),
  getByTaxista: (id) => api.get(`/acuerdos/taxista/${id}`),
  create: (data) => api.post("/acuerdos", data),
  update: (id, data) => api.put(`/acuerdos/${id}`, data),
  delete: (id) => api.delete(`/acuerdos/${id}`),
};

export const reportesApi = {
  getAll: () => api.get("/reportes"),
  getByTaxista: (id) => api.get(`/reportes/taxista/${id}`),
  create: (data) => api.post("/reportes", data),
  update: (id, data) => api.put(`/reportes/${id}`, data),
  delete: (id) => api.delete(`/reportes/${id}`),
};

export const ingresosApi = {
  registrar: (data) => api.post("/ingresos", data),
  resumenTaxista: (id, mes, anio) =>
    api.get(`/ingresos/taxista/${id}?mes=${mes}&anio=${anio}`),
};

export const dashboardApi = {
  resumen30dias: () => api.get("/dashboard/analisis/resumen_30_dias"),
  ingresosMensuales: () => api.get("/dashboard/ingresos-mensuales"),
  viajesTop: () => api.get("/dashboard/viajes-top"),
};
