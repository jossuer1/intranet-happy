// Datos quemados temporales. Cuando exista backend, esto se reemplaza
// por el fetch al endpoint del usuario autenticado (ej. GET /api/usuarios/me).

export const usuarioActualMock = {
  nombres: "María López",
  cedula: "1723456789",
  correoEmpresa: "maria.lopez@empresa.com",
  correoPersonal: "maria.lopez@gmail.com",
  celularPersonal: "0991234567",
  celularEmpresa: "0987654321",
  cargo: "Analista de Soporte",
  departamento: "Tecnología",
  fechaIngreso: "2023-03-15",
  ciudad: "Quito",
  estadoCivil: "Soltera",
};

export const vacacionesMock = {
  diasDisponibles: 8,
  diasTomados: 7,
  diasPendientesAprobacion: 2,
  diasTotalesAnio: 15,
  solicitudes: [
    {
      id: 1,
      fechaInicio: "2026-01-05",
      fechaFin: "2026-01-09",
      dias: 5,
      estado: "Aprobado",
    },
    {
      id: 2,
      fechaInicio: "2025-07-14",
      fechaFin: "2025-07-15",
      dias: 2,
      estado: "Aprobado",
    },
    {
      id: 3,
      fechaInicio: "2026-08-20",
      fechaFin: "2026-08-21",
      dias: 2,
      estado: "Pendiente",
    },
  ],
};
