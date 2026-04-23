import { api } from "./client.js";

export const authApi = {
  login: (noLista, contrasena) => api.post("/login", { noLista, contrasena }),
};
