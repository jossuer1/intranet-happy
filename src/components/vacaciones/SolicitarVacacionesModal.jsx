import ModalDialog from "../ui/ModalDialog";
import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { crearSolicitudVacacion } from "../../services/vacacionesService";
import { hoyEC } from "../../utils/fechasEcuador";

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
  const [cobertura, setCobertura] = useState("persona");
  const [nombreEncargado, setNombreEncargado] = useState("");
  const [areaEncargado, setAreaEncargado] = useState("");
  const [actividades, setActividades] = useState("");
  const [enviando, setEnviando] = useState(false);

  const mensaje = cobertura === "persona"
    ? `Durante mis vacaciones, ${nombreEncargado.trim()} (${areaEncargado.trim()}) quedará a cargo de: ${actividades.trim()}.`
    : motivo.trim();
  const coberturaCompleta = cobertura === "otra" || (
    nombreEncargado.trim().length >= 3 && areaEncargado.trim().length >= 2 && actividades.trim().length >= 3
  );

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
    coberturaCompleta && mensaje.length >= 3 && mensaje.length <= 200 && fechaInicio >= hoyEC() &&
    !rangoInvalido &&
    !excedeSaldo &&
    diasSolicitados > 0;

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    if (!puedeEnviar || enviando) return;

    try {
      setEnviando(true);
      await crearSolicitudVacacion({
        fechaInicio,
        fechaFin,
        motivo: mensaje,
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
    <ModalDialog titulo="Solicitar vacaciones" onClose={onClose} ocupado={enviando}
      subtitulo="Tu jefe directo revisará la solicitud. Si la aprueba, se generarán los documentos y se notificará a RRHH.">
          <form onSubmit={enviarSolicitud}>
            <div className="row g-3">
              <div className="col-6">
                <label htmlFor="vacaciones-desde" className="form-label small fw-semibold">Desde</label>
                <input
                  id="vacaciones-desde"
                  type="date"
                  className="form-control"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                  min={hoyEC()}
                />
              </div>
              <div className="col-6">
                <label htmlFor="vacaciones-hasta" className="form-label small fw-semibold">Hasta</label>
                <input
                  id="vacaciones-hasta"
                  type="date"
                  className="form-control"
                  value={fechaFin}
                  min={fechaInicio || hoyEC()}
                  onChange={(e) => setFechaFin(e.target.value)}
                  required
                />
              </div>
              <div className="col-12">
                <fieldset disabled={enviando}>
                  <legend className="form-label small fw-semibold">Cobertura durante tu ausencia</legend>
                  <div className="d-flex flex-wrap gap-3">
                    <div className="form-check">
                      <input id="cobertura-persona" className="form-check-input" type="radio" name="cobertura" checked={cobertura === "persona"} onChange={() => setCobertura("persona")} />
                      <label className="form-check-label small" htmlFor="cobertura-persona">Una persona quedará encargada</label>
                    </div>
                    <div className="form-check">
                      <input id="cobertura-otra" className="form-check-input" type="radio" name="cobertura" checked={cobertura === "otra"} onChange={() => setCobertura("otra")} />
                      <label className="form-check-label small" htmlFor="cobertura-otra">Otra situación</label>
                    </div>
                  </div>
                </fieldset>
              </div>
              {cobertura === "persona" ? <>
                <div className="col-12 col-md-6">
                  <label htmlFor="cobertura-nombre" className="form-label small fw-semibold">Nombre de la persona encargada</label>
                  <input id="cobertura-nombre" className="form-control" placeholder="Ej. Ariana Jácome" value={nombreEncargado} onChange={e => setNombreEncargado(e.target.value)} minLength={3} maxLength={80} required disabled={enviando} />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="cobertura-area" className="form-label small fw-semibold">Área de la persona encargada</label>
                  <input id="cobertura-area" className="form-control" placeholder="Ej. Finanzas" value={areaEncargado} onChange={e => setAreaEncargado(e.target.value)} minLength={2} maxLength={60} required disabled={enviando} />
                </div>
                <div className="col-12">
                  <label htmlFor="cobertura-actividades" className="form-label small fw-semibold">Actividades que atenderá</label>
                  <textarea id="cobertura-actividades" className="form-control" rows={3} placeholder="Ej. Seguimiento de pagos y atención de consultas pendientes" value={actividades} onChange={e => setActividades(e.target.value)} minLength={3} maxLength={150} required disabled={enviando} />
                  <p className="text-muted small mt-2 mb-0">La cobertura propuesta será revisada por tu jefe directo.</p>
                </div>
              </> : <div className="col-12">
                <label htmlFor="vacaciones-motivo" className="form-label small fw-semibold">Motivo u organización de actividades</label>
                <textarea id="vacaciones-motivo" className="form-control" rows={3} placeholder="Explica el motivo o cómo se organizarán tus actividades durante tu ausencia." value={motivo} onChange={e => setMotivo(e.target.value)} required minLength={3} maxLength={200} disabled={enviando} />
                <small className="text-muted d-block mt-1" aria-live="polite">{mensaje.length}/200 caracteres</small>
              </div>}
              {cobertura === "persona" && <div className="col-12">
                <div className="bg-light border rounded-3 p-3">
                  <h3 className="small fw-semibold mb-2">Vista previa del mensaje</h3>
                  <p className="small mb-2" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{coberturaCompleta && mensaje ? mensaje : "Completa la información para ver el mensaje que recibirá tu jefe."}</p>
                  <small className={mensaje.length > 200 ? "text-danger" : "text-muted"} aria-live="polite">{mensaje.length}/200 caracteres{mensaje.length > 200 ? ". Resume la información para poder enviar la solicitud." : ""}</small>
                </div>
              </div>}
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
    </ModalDialog>
  );
}

export default SolicitarVacacionesModal;
