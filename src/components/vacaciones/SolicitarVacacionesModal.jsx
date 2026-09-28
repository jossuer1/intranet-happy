import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { crearSolicitudVacacion } from "../../services/vacacionesService";

// Mismo criterio de conteo que usa el backend y GestionVacaciones.jsx:
// días calendario, inclusivo (lunes a viernes de la misma semana = 5 días).
function calcularDiasRango(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return 0;
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffTime = fin - inicio;
  if (diffTime < 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Cuadro flotante para que el empleado solicite vacaciones, mostrando en vivo
 * cuántos días le va a descontar la solicitud y cuántos le quedarían.
 *
 * @param {number} diasDisponibles - Saldo actual del empleado (ya cargado por el padre).
 * @param {() => void} onClose - Cierra el modal sin enviar nada.
 * @param {() => void} onCreada - Se llama tras enviar con éxito (refrescar listas y cerrar).
 */
function SolicitarVacacionesModal({ diasDisponibles, onClose, onCreada }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const diasSolicitados = useMemo(
    () => calcularDiasRango(fechaInicio, fechaFin),
    [fechaInicio, fechaFin],
  );

  const rangoInvalido =
    fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio);

  const excedeSaldo =
    diasSolicitados > 0 &&
    typeof diasDisponibles === "number" &&
    diasSolicitados > diasDisponibles;

  const diasRestantes =
    typeof diasDisponibles === "number"
      ? diasDisponibles - diasSolicitados
      : null;

  const puedeEnviar =
    fechaInicio &&
    fechaFin &&
    motivo.trim() &&
    !rangoInvalido &&
    !excedeSaldo &&
    diasSolicitados > 0;

  // Cerrar con Escape, igual que UsuarioInfoModal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    if (!puedeEnviar) return;

    try {
      setEnviando(true);
      await crearSolicitudVacacion({
        fechaInicio,
        fechaFin,
        motivo: motivo.trim(),
      });
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Solicitud enviada. Ahora la revisará tu jefe directo.",
        showConfirmButton: false,
        timer: 2200,
      });
      onCreada();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo enviar la solicitud",
        text: err.message || "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="card shadow-lg border-0"
        style={{ width: "min(480px, 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <h5 className="fw-bold mb-0">
              <i className="bi bi-calendar-plus text-brand me-2"></i>
              Solicitar vacaciones
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={onClose}
            ></button>
          </div>
          <p className="text-muted small mb-4">
            Tu jefe directo revisará esta solicitud primero; si la aprueba,
            pasa a RRHH para el visto bueno final.
          </p>

          <form onSubmit={enviarSolicitud}>
            <div className="row g-3">
              <div className="col-6">
                <label className="form-label small fw-semibold">Desde</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                />
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold">Hasta</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaFin}
                  min={fechaInicio || undefined}
                  onChange={(e) => setFechaFin(e.target.value)}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Motivo</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Viaje familiar"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Resumen en vivo: cuántos días le va a quitar y cuántos le quedan */}
            {rangoInvalido ? (
              <div className="alert alert-warning small mt-3 mb-0 py-2">
                La fecha "Hasta" no puede ser anterior a "Desde".
              </div>
            ) : diasSolicitados > 0 ? (
              <div
                className={`alert small mt-3 mb-0 py-2 ${
                  excedeSaldo ? "alert-danger" : "alert-info"
                }`}
              >
                {excedeSaldo ? (
                  <>
                    Estás pidiendo <strong>{diasSolicitados}</strong> día(s),
                    pero solo tienes{" "}
                    <strong>{diasDisponibles}</strong> disponible(s).
                  </>
                ) : (
                  <>
                    Esta solicitud descuenta{" "}
                    <strong>{diasSolicitados}</strong> día(s) de tus{" "}
                    <strong>{diasDisponibles}</strong> disponibles. Te
                    quedarían <strong>{diasRestantes}</strong> día(s).
                  </>
                )}
              </div>
            ) : null}

            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-brand flex-grow-1"
                disabled={!puedeEnviar || enviando}
              >
                {enviando ? "Enviando..." : "Enviar solicitud"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={enviando}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SolicitarVacacionesModal;
