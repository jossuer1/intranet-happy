import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AppLayout from "../../components/layout/AppLayout";
import SectionHeader from "../../components/layout/SectionHeader";
import {
  getSolicitudesPendientesJefe,
  responderSolicitudComoJefe,
} from "../../services/vacacionesService";

function AprobarVacaciones() {
  const {
    data: solicitudes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vacaciones", "pendientes-jefe"],
    queryFn: getSolicitudesPendientesJefe,
    staleTime: 1000 * 30,
    select: (data) => (Array.isArray(data) ? data : []),
  });

  const [procesandoId, setProcesandoId] = useState(null);

  const responder = async (solicitud, aprobar) => {
    const confirmacion = await Swal.fire({
      icon: "question",
      title: aprobar ? "¿Aprobar esta solicitud?" : "¿Rechazar esta solicitud?",
      html:
        `<b>${solicitud.solicitanteNombre}</b><br/>${new Date(
          solicitud.fechaInicio,
        ).toLocaleDateString()} — ${new Date(solicitud.fechaFin).toLocaleDateString()}` +
        (aprobar
          ? "<br/><small>Se descontarán los días del saldo y se enviarán los 3 documentos por correo.</small>"
          : ""),
      input: "text",
      inputLabel: "Observación (opcional)",
      inputPlaceholder: "Ej. Aprobado, coordinar entrega de pendientes",
      showCancelButton: true,
      confirmButtonText: aprobar ? "Sí, aprobar" : "Sí, rechazar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmacion.isConfirmed) return;

    try {
      setProcesandoId(solicitud.idSolicitud);
      await responderSolicitudComoJefe(
        solicitud.idSolicitud,
        aprobar,
        confirmacion.value || null,
      );
      await refetch();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: aprobar
          ? "Solicitud aprobada. Los documentos se enviaron por correo"
          : "Solicitud rechazada",
        showConfirmButton: false,
        timer: 2800,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar tu respuesta",
        text: err.message || "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <AppLayout>
      <SectionHeader titulo="Aprobar Vacaciones" volverA="/dashboard" />
      <div className="container my-4 flex-grow-1">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h5 className="card-title fw-bold mb-1">
              Solicitudes de tu equipo
            </h5>
            <p className="text-muted small mb-4">
              Aquí aparecen las solicitudes de vacaciones de las personas que
              te tienen asignado como jefe directo.
            </p>

            {isLoading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : isError ? (
              <div className="alert alert-danger" role="alert">
                {error?.message ||
                  "No se pudieron cargar las solicitudes pendientes."}
              </div>
            ) : solicitudes.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-check2-circle fs-1 d-block mb-3"></i>
                No tienes solicitudes pendientes por revisar.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Empleado</th>
                      <th>Desde</th>
                      <th>Hasta</th>
                      <th>Días</th>
                      <th>Motivo</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((s) => (
                      <tr key={s.idSolicitud}>
                        <td className="fw-semibold">{s.solicitanteNombre}</td>
                        <td>{new Date(s.fechaInicio).toLocaleDateString()}</td>
                        <td>{new Date(s.fechaFin).toLocaleDateString()}</td>
                        <td>{s.diasSolicitados}</td>
                        <td className="small text-muted">{s.motivo}</td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success me-2"
                            disabled={procesandoId === s.idSolicitud}
                            onClick={() => responder(s, true)}
                          >
                            <i className="bi bi-check-lg"></i> Aprobar
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={procesandoId === s.idSolicitud}
                            onClick={() => responder(s, false)}
                          >
                            <i className="bi bi-x-lg"></i> Rechazar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default AprobarVacaciones;
