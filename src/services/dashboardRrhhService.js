import { apiClient } from "./apiClient";

export const dashboardRrhhService = {
  resumen: () => apiClient.get("/dashboard/rrhh"),
  proximos: (dias = 30) => apiClient.get(`/cumpleanos/proximos?dias=${dias}`),
  felicitar: (idUsuario) => apiClient.post(`/cumpleanos/${idUsuario}/felicitar`, {}),
};
