import ModalDialog from "../components/ui/ModalDialog";
import { estilosTabla as customStyles } from "../components/catalogos/tablaEstilos";
import PersonaCelda from "../components/ui/PersonaCelda";
import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import AppLayout from "../components/layout/AppLayout";
import SectionHeader from "../components/layout/SectionHeader";
import ComparativoSolicitud, {
  BadgeEstado,
} from "../components/solicitudes/ComparativoSolicitud";
import { solicitudesPerfilService } from "../services/solicitudesPerfilService";
import EnvioActualizacionTab from "../components/solicitudes/EnvioActualizacionTab";
import { getUsuarios } from "../services/usuariosService";
import { useAuthStore } from "../store/useAuthStore";
import { Toast, toastError, toastExito } from "../utils/toast";
import { formatearFechaHoraEC } from "../utils/fechasEcuador";


const paginationComponentOptions = {
  rowsPerPageText: "Filas por página:",
  rangeSeparatorText: "de",
};

// Pide el motivo del rechazo. Es obligatorio: si llega vacío se avisa con toast
// y se vuelve a abrir el cuadro. Devuelve el motivo o null si cancela.
const pedirMotivoRechazo = async () => {
  for (;;) {
    const r = await Swal.fire({
      icon: "warning",
      title: "Rechazar solicitud",
      text: "El empleado recibirá este motivo, podrá corregir y volver a enviar.",
      input: "textarea",
      inputLabel: "Motivo del rechazo",
      inputPlaceholder: "Explica qué debe corregir...",
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      confirmButtonColor: "#dc3545",
      cancelButtonText: "Cancelar",
    });
    if (!r.isConfirmed) return null;
    const motivo = (r.value || "").trim();
    if (motivo) return motivo;
    await Toast.fire({
      icon: "error",
      title: "El motivo del rechazo es obligatorio.",
      timer: 1800,
    });
  }
};

function SolicitudesPerfil() {
  const user = useAuthStore((s) => s.user);
  const rol = String(user?.rol ?? "").trim().toUpperCase();

  // Pestaña principal: ENVIO (lista de usuarios) | SOLICITUDES (revisión)
  const [pestana, setPestana] = useState("ENVIO");
  // Filtro de la pestaña de solicitudes: PENDIENTE | APROBADA | RECHAZADA | SIN_CAMBIOS
  const [estado, setEstado] = useState("PENDIENTE");
  const [idAbierto, setIdAbierto] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const usuarios = useQuery({
    queryKey: ["usuarios"],
    queryFn: getUsuarios,
  });

  const pendientes = useQuery({
    queryKey: ["solicitudesPerfil", "PENDIENTE"],
    queryFn: () => solicitudesPerfilService.listar("PENDIENTE"),
  });

  const otras = useQuery({
    queryKey: ["solicitudesPerfil", estado],
    queryFn: () => solicitudesPerfilService.listar(estado),
    enabled: estado !== "PENDIENTE",
  });

  const lista = estado === "PENDIENTE" ? pendientes : otras;

  const detalle = useQuery({
    queryKey: ["solicitudPerfil", idAbierto],
    queryFn: () => solicitudesPerfilService.detalle(idAbierto),
    enabled: idAbierto !== null,
  });

  // Más recientes primero
  const filas = useMemo(
    () =>
      [...(Array.isArray(lista.data) ? lista.data : [])].sort(
        (a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud),
      ),
    [lista.data],
  );

  // Para el contador de la pestaña 1: ventana abierta y sin responder
  const cantidadSinResponder = (Array.isArray(usuarios.data) ? usuarios.data : [])
    .filter((u) => u.puedeActualizarPerfil && !u.tieneSolicitudPendiente).length;

  // Solo RRHH (el backend igual lo protege). Si el usuario aún no cargó, no se redirige.
  if (user && rol !== "RRHH") return <Navigate to="/dashboard" replace />;

  const columnas = [
    {
      name: "Empleado",
      sortable: true,
      selector: (r) => r.empleado,
      cell: (r) => (
        <PersonaCelda nombre={r.empleado} detalle={r.cedula ? `C.I. ${r.cedula}` : undefined} />
      ),
    },
    {
      name: "Fecha de solicitud",
      sortable: true,
      selector: (r) => r.fechaSolicitud,
      cell: (r) => formatearFechaHoraEC(r.fechaSolicitud) || "—",
      width: "200px",
    },
    {
      name: "Estado",
      selector: (r) => r.estado,
      cell: (r) => <BadgeEstado estado={r.estado} />,
      width: "130px",
    },
    {
      name: "Revisor",
      selector: (r) => r.revisor || "—",
      width: "200px",
    },
    {
      name: "",
      width: "120px",
      ignoreRowClick: true,
      cell: (r) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => setIdAbierto(r.idSolicitud)}
        >
          {r.estado === "PENDIENTE" ? "Revisar" : "Ver"}
        </button>
      ),
    },
  ];

  const aprobar = async () => {
    const r = await Swal.fire({
      icon: "question",
      title: "Aprobar solicitud",
      text: "Los cambios se aplicarán al perfil del empleado.",
      input: "textarea",
      inputLabel: "Observación (opcional)",
      showCancelButton: true,
      confirmButtonText: "Aprobar",
      cancelButtonText: "Cancelar",
    });
    if (!r.isConfirmed) return;

    try {
      setProcesando(true);
      await solicitudesPerfilService.aprobar(idAbierto, (r.value || "").trim());
      toastExito("Solicitud aprobada");
      setIdAbierto(null);
    } catch (err) {
      toastError(err.message || "No se pudo aprobar la solicitud");
    } finally {
      setProcesando(false);
    }
  };

  const rechazar = async () => {
    const motivo = await pedirMotivoRechazo();
    if (!motivo) return;

    try {
      setProcesando(true);
      await solicitudesPerfilService.rechazar(idAbierto, motivo);
      toastExito("Solicitud rechazada");
      setIdAbierto(null);
    } catch (err) {
      toastError(err.message || "No se pudo rechazar la solicitud");
    } finally {
      setProcesando(false);
    }
  };

  // ───────────── Vista de detalle ─────────────
  const s = detalle.data;
  const modalDetalle = idAbierto !== null ? (
    <ModalDialog titulo="Solicitud de actualización" onClose={() => setIdAbierto(null)} size="xl" ocupado={procesando}>
          {detalle.isLoading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : detalle.isError || !s ? (
            <div className="alert alert-danger">
              {detalle.error?.message || "No se pudo cargar la solicitud."}
            </div>
          ) : (
            <>
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div>
                    <h5 className="fw-bold mb-1">{s.empleado}</h5>
                    <div className="small text-muted">
                      {s.cedula && <>C.I: {s.cedula} · </>}
                      Enviada el {formatearFechaHoraEC(s.fechaSolicitud) || "—"}
                    </div>
                  </div>
                  <BadgeEstado estado={s.estado} />
                </div>
              </div>

              <ComparativoSolicitud solicitud={s} />

              {s.estado === "PENDIENTE" && (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    disabled={procesando}
                    onClick={rechazar}
                  >
                    <i className="bi bi-x-circle me-1"></i>Rechazar
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    disabled={procesando}
                    onClick={aprobar}
                  >
                    <i className="bi bi-check-circle me-1"></i>Aprobar
                  </button>
                </div>
              )}
            </>
          )}

    </ModalDialog>
  ) : null;

  // ───────────── Listado ─────────────
  const pestanasSolicitudes = [
    { clave: "PENDIENTE", texto: "Pendientes", cantidad: pendientes.data?.length },
    { clave: "APROBADA", texto: "Aprobadas" },
    { clave: "RECHAZADA", texto: "Rechazadas" },
    { clave: "SIN_CAMBIOS", texto: "Sin cambios" },
  ];

  const pestanasPrincipales = [
    {
      clave: "ENVIO",
      texto: "Usuarios",
      icono: "bi-people",
      cantidad: cantidadSinResponder,
      ayuda: "sin responder",
    },
    {
      clave: "SOLICITUDES",
      texto: "Solicitudes recibidas",
      icono: "bi-inbox",
      cantidad: pendientes.data?.length,
      ayuda: "pendientes",
    },
  ];

  return (
    <AppLayout>
      <SectionHeader
        titulo="Solicitudes de actualización"
        volverA="/gestion-usuarios"
      />
      <div className="container-fluid px-4 pb-4"><div className="card border-0 shadow-sm"><div className="card-body p-4">
        {/* ───── Pestañas principales ───── */}
        <ul className="nav nav-tabs mb-3">
          {pestanasPrincipales.map((p) => (
            <li className="nav-item" key={p.clave}>
              <button
                type="button"
                className={`nav-link d-flex align-items-center gap-2 ${
                  pestana === p.clave ? "active fw-semibold" : "text-secondary"
                }`}
                onClick={() => setPestana(p.clave)}
              >
                <i className={`bi ${p.icono}`}></i>
                {p.texto}
                {p.cantidad > 0 && (
                  <span
                    className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                    title={`${p.cantidad} ${p.ayuda}`}
                  >
                    {p.cantidad}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* ───── Pestaña 1: usuarios (habilitar uno, varios o todos) ───── */}
        {pestana === "ENVIO" && <EnvioActualizacionTab />}

        {/* ───── Pestaña 2: solicitudes recibidas ───── */}
        {pestana === "SOLICITUDES" && (
          <div>
            <div>
              <ul className="nav nav-pills gap-1 mb-2">
                {pestanasSolicitudes.map((p) => (
                  <li className="nav-item" key={p.clave}>
                    <button
                      type="button"
                      className={`nav-link py-1 px-3 d-flex align-items-center gap-2 ${
                        estado === p.clave ? "active bg-brand" : "text-dark"
                      }`}
                      onClick={() => setEstado(p.clave)}
                    >
                      {p.texto}
                      {p.cantidad > 0 && (
                        <span
                          className={`badge rounded-pill ${
                            estado === p.clave
                              ? "bg-light text-dark"
                              : "bg-secondary-subtle text-secondary-emphasis"
                          }`}
                        >
                          {p.cantidad}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              <small className="text-muted d-block mb-3">
                {estado === "SIN_CAMBIOS"
                  ? "Empleados que revisaron su información y confirmaron que está al día."
                  : "Revisa los cambios que los empleados proponen a su información."}
              </small>

              {lista.isError ? (
                <div className="alert alert-danger">
                  {lista.error?.message || "No se pudo cargar la lista."}
                </div>
              ) : (
                <DataTable
                  columns={columnas}
                  data={filas}
                  customStyles={customStyles}
                  progressPending={lista.isLoading}
                  pagination
                  paginationComponentOptions={paginationComponentOptions}
                  highlightOnHover
                  pointerOnHover
                  responsive
                  onRowClicked={(r) => setIdAbierto(r.idSolicitud)}
                  noDataComponent={
                    <div className="p-4 text-muted">
                      No hay solicitudes para mostrar
                    </div>
                  }
                />
              )}
            </div>
          </div>
        )}
      </div></div></div>
      {modalDetalle}
    </AppLayout>
  );
}

export default SolicitudesPerfil;
