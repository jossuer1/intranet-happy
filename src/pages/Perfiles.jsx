import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "../components/layout/AppLayout";
import SectionHeader from "../components/layout/SectionHeader";
import { getPorId } from "../services/usuariosService";
import { useAuthStore } from "../store/useAuthStore";
import {
  calcularEdad,
  obtenerGeneracion,
  formatearFecha,
} from "../utils/dateUtils";

const fechaODash = (f) => (f ? formatearFecha(f) : "—");

/**
 * Perfiles: Ficha COMPLETA para RRHH con maquetación "Perfil lateral + Familia ancha abajo" (Opción 3).
 */
function Perfiles() {
  const { idUsuario } = useParams();
  const usuarioLogueado = useAuthStore((state) => state.user);

  const {
    data: info,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["perfil-completo", idUsuario],
    queryFn: () => getPorId(idUsuario),
    staleTime: 1000 * 30,
    enabled: Boolean(idUsuario),
  });

  const rol = String(usuarioLogueado?.rol ?? "").toUpperCase();
  if (usuarioLogueado && rol !== "RRHH") {
    return <Navigate to="/dashboard" replace />;
  }

  const encabezado = (
    <SectionHeader
      titulo="Perfil del Colaborador"
      volverA="/gestion-usuarios"
    />
  );

  if (isLoading) {
    return (
      <AppLayout>
        {encabezado}
        <div className="container my-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError || !info) {
    return (
      <AppLayout>
        {encabezado}
        <div className="container my-5">
          <div className="alert alert-danger" role="alert">
            {error?.message || "No se encontró la información del usuario."}
          </div>
        </div>
      </AppLayout>
    );
  }

  const nombreCompleto = `${info.nombre || ""} ${info.apellido || ""}`.trim();
  const iniciales = (info.nombre || "??")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const edadCalculada = info.fechaNacimiento
    ? `${calcularEdad(info.fechaNacimiento)} años`
    : null;
  const generacionCalculada = info.fechaNacimiento
    ? obtenerGeneracion(info.fechaNacimiento)
    : null;

  const antiguedad = (fechaIngreso) => {
    if (!fechaIngreso) return "—";

    const inicio = new Date(fechaIngreso);
    const hoy = new Date();

    if (Number.isNaN(inicio.getTime()) || inicio > hoy) return "—";

    let anios = hoy.getFullYear() - inicio.getFullYear();
    let meses = hoy.getMonth() - inicio.getMonth();

    if (hoy.getDate() < inicio.getDate()) meses--;

    if (meses < 0) {
      anios--;
      meses += 12;
    }

    if (anios === 0 && meses === 0) return "Menos de 1 mes";
    if (anios === 0) return `${meses} ${meses === 1 ? "mes" : "meses"}`;
    if (meses === 0) return `${anios} ${anios === 1 ? "año" : "años"}`;

    return `${anios} ${anios === 1 ? "año" : "años"} y ${meses} ${
      meses === 1 ? "mes" : "meses"
    }`;
  };

  const cantidadFamiliares = info.familiares?.length ?? 0;

  return (
    <AppLayout>
      {encabezado}

      <div className="container-fluid px-4 pb-4">
        {/* =========================================================
            1. ENCABEZADO DEL COLABORADOR
            ========================================================= */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body p-3 p-lg-4">
            <div className="d-flex flex-column flex-xl-row align-items-xl-center gap-3">
              <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                {info.urlImagenPerfil || info.fotoUrl ? (
                  <img
                    src={info.urlImagenPerfil || info.fotoUrl}
                    alt="Foto de perfil"
                    className="rounded-circle object-fit-cover border border-2 border-primary shadow-sm flex-shrink-0"
                    style={{ width: "78px", height: "78px" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-brand-soft text-brand d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                    style={{
                      width: "78px",
                      height: "78px",
                      fontSize: "1.7rem",
                    }}
                  >
                    {iniciales}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <h4 className="fw-bold mb-0 text-dark">{nombreCompleto}</h4>
                    <span
                      className={`badge rounded-pill ${
                        info.estado ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      <i
                        className="bi bi-circle-fill me-1"
                        style={{ fontSize: "0.45rem" }}
                      ></i>
                      {info.estado ? "Activo" : "Inactivo"}
                    </span>
                    {info.esJefe && (
                      <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle">
                        Jefe
                      </span>
                    )}
                  </div>

                  <div className="text-muted">
                    {info.cargo || "Colaborador"}
                    {info.departamento && (
                      <span className="text-brand fw-semibold">
                        {" "}
                        · {info.departamento}
                      </span>
                    )}
                  </div>

                  <div className="d-flex flex-wrap gap-3 mt-2 small text-muted">
                    <span>
                      <i className="bi bi-envelope me-1 text-brand"></i>
                      {info.correoEmpresa || "Sin correo institucional"}
                    </span>
                    {info.celularEmpresa && (
                      <span>
                        <i className="bi bi-telephone me-1 text-brand"></i>
                        {info.celularEmpresa}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-3 border-xl-start ps-xl-4">
                <div className="small">
                  <span className="text-muted d-block">Fecha de ingreso</span>
                  <span className="fw-semibold text-dark">
                    {fechaODash(info.fechaIngreso)}
                  </span>
                </div>

                <div className="small">
                  <span className="text-muted d-block">Tipo de contrato</span>
                  <span className="fw-semibold text-dark">
                    {info.tipoContrato || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            2. MÉTRICAS RÁPIDAS
            ========================================================= */}
        <div className="row g-3 mb-3">
          <div className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div
                  className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "42px", height: "42px" }}
                >
                  <i className="bi bi-umbrella fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block">Vacaciones</span>
                  <span className="fw-bold text-dark">
                    {info.diasVacacionesAsignados
                      ? `${info.diasVacacionesAsignados} días`
                      : "0 días"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div
                  className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "42px", height: "42px" }}
                >
                  <i className="bi bi-clock-history fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block">Antigüedad</span>
                  <span className="fw-bold text-dark">
                    {antiguedad(info.fechaIngreso)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div
                  className="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "42px", height: "42px" }}
                >
                  <i className="bi bi-droplet-fill fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block">
                    Tipo de sangre
                  </span>
                  <span className="fw-bold text-dark">
                    {info.tipoSangre || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div
                  className="rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "42px", height: "42px" }}
                >
                  <i className="bi bi-people fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block">
                    Carga familiar
                  </span>
                  <span className="fw-bold text-dark">
                    {cantidadFamiliares}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            3. INFORMACIÓN PRINCIPAL
            Laborales ocupa más espacio y usa una cuadrícula compacta
            para evitar el "hueco" de la versión anterior.
            ========================================================= */}
        <div className="row g-3">
          {/* DATOS LABORALES */}
          <div className="col-12 col-xl-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3 p-lg-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-briefcase fs-5 text-brand"></i>
                  <h6 className="fw-bold mb-0 text-dark">Datos Laborales</h6>
                </div>

                <div className="row g-0 border rounded overflow-hidden">
                  <div className="col-12 col-md-6 col-xxl-4 p-3 border-bottom border-end-xxl">
                    <span className="text-muted small d-block mb-1">
                      Jefe Directo
                    </span>
                    <span className="fw-semibold text-dark">
                      {info.jefeDirecto || "Sin asignar"}
                    </span>
                  </div>

                  <div className="col-6 col-md-3 col-xxl-2 p-3 border-bottom border-end">
                    <span className="text-muted small d-block mb-1">
                      Ingreso
                    </span>
                    <span className="fw-semibold text-dark">
                      {fechaODash(info.fechaIngreso)}
                    </span>
                  </div>

                  <div className="col-6 col-md-3 col-xxl-2 p-3 border-bottom border-end-xxl">
                    <span className="text-muted small d-block mb-1">
                      Contrato
                    </span>
                    <span className="fw-semibold text-dark">
                      {info.tipoContrato || "—"}
                    </span>
                  </div>

                  <div className="col-6 col-md-3 col-xxl-2 p-3 border-bottom border-end">
                    <span className="text-muted small d-block mb-1">
                      Fin contrato
                    </span>
                    <span className="fw-semibold text-dark">
                      {info.fechaFinContrato
                        ? formatearFecha(info.fechaFinContrato)
                        : "No aplica"}
                    </span>
                  </div>

                  <div className="col-6 col-md-3 col-xxl-2 p-3 border-bottom">
                    <span className="text-muted small d-block mb-1">
                      Jornada
                    </span>
                    <span className="fw-semibold text-dark">
                      {info.jornada || "—"}
                    </span>
                  </div>

                  <div className="col-6 col-md-4 col-xxl-4 p-3 border-end">
                    <span className="text-muted small d-block mb-1">
                      Cargo IESS
                    </span>
                    <span className="fw-semibold text-dark">
                      {info.cargoIess || "—"}
                    </span>
                  </div>

                  <div className="col-6 col-md-4 col-xxl-4 p-3 border-end">
                    <span className="text-muted small d-block mb-1">
                      Sectorial
                    </span>
                    <span className="fw-semibold text-dark">
                      {info.sectorial || "—"}
                    </span>
                  </div>

                  <div className="col-6 col-md-4 col-xxl-3 p-3 border-end">
                    <span className="text-muted small d-block mb-1">
                      Vacaciones
                    </span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                      {info.diasVacacionesAsignados
                        ? `${info.diasVacacionesAsignados} días`
                        : "0 días"}
                    </span>
                  </div>

                  <div className="col-12 col-md-4 col-xxl-5 p-3">
                    <span className="text-muted small d-block mb-1">
                      Ciudad y dirección
                    </span>
                    <span className="fw-semibold text-dark">
                      {info.ciudad || "—"}
                      {info.direccion ? ` · ${info.direccion}` : ""}
                    </span>
                  </div>

                  {info.periodosIess && info.periodosIess.length > 0 && (
                    <div className="col-12 p-3 border-top">
                      <span className="text-muted small d-block mb-2">
                        Historial de contratos
                      </span>
                      <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0 small">
                          <thead>
                            <tr className="text-muted">
                              <th>Inicio</th>
                              <th>Fin</th>
                              <th>Cargo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {info.periodosIess.map((per, idx) => (
                              <tr key={per.idPeriodoIess || idx}>
                                <td>{formatearFecha(per.fechaIngreso)}</td>
                                <td>
                                  {per.fechaSalida ? (
                                    formatearFecha(per.fechaSalida)
                                  ) : (
                                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                                      Vigente
                                    </span>
                                  )}
                                </td>
                                <td>{per.cargoIess || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN PERSONAL */}
          <div className="col-12 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3 p-lg-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-person-vcard fs-5 text-brand"></i>
                  <h6 className="fw-bold mb-0 text-dark">
                    Información Personal
                  </h6>
                </div>

                <div className="row g-3 small">
                  <div className="col-6">
                    <span className="text-muted d-block">Cédula / ID</span>
                    <span className="fw-semibold text-dark">
                      {info.cedula || "—"}
                    </span>
                  </div>

                  <div className="col-6">
                    <span className="text-muted d-block">Nacionalidad</span>
                    <span className="fw-semibold text-dark">
                      {info.nacionalidad
                        ? info.nacionalidad.charAt(0) +
                          info.nacionalidad.slice(1).toLowerCase()
                        : "—"}
                    </span>
                  </div>

                  <div className="col-6">
                    <span className="text-muted d-block">Género</span>
                    <span className="fw-semibold text-dark">
                      {info.genero || "—"}
                    </span>
                  </div>

                  <div className="col-12">
                    <span className="text-muted d-block">
                      Fecha de nacimiento
                    </span>
                    <span className="fw-semibold text-dark">
                      {info.fechaNacimiento
                        ? formatearFecha(info.fechaNacimiento)
                        : "—"}
                      {edadCalculada ? ` (${edadCalculada})` : ""}
                    </span>
                  </div>

                  <div className="col-6">
                    <span className="text-muted d-block">Estado civil</span>
                    <span className="fw-semibold text-dark">
                      {info.estadoCivil || "—"}
                    </span>
                  </div>

                  <div className="col-6">
                    <span className="text-muted d-block">Generación</span>
                    <span className="fw-semibold text-dark">
                      {generacionCalculada || "—"}
                    </span>
                  </div>

                  <div className="col-6">
                    <span className="text-muted d-block">Tipo de sangre</span>
                    {info.tipoSangre ? (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle mt-1">
                        <i className="bi bi-droplet-fill me-1"></i>
                        {info.tipoSangre}
                      </span>
                    ) : (
                      <span className="fw-semibold">—</span>
                    )}
                  </div>

                  <div className="col-6">
                    <span className="text-muted d-block">Etnia</span>
                    <span className="fw-semibold text-dark">
                      {info.etnia || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BANCARIOS */}
          <div className="col-12 col-lg-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3 p-lg-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-bank fs-5 text-brand"></i>
                  <h6 className="fw-bold mb-0 text-dark">Datos Bancarios</h6>
                </div>

                {info.datosBancarios && info.datosBancarios.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {info.datosBancarios.map((b, idx) => (
                      <div
                        key={b.idDatoBancario || idx}
                        className="d-flex justify-content-between align-items-center bg-light p-3 rounded border"
                      >
                        <div>
                          <div className="fw-bold text-dark">
                            {b.banco || b.idBanco}
                          </div>
                          <div className="text-muted small">
                            N° {b.numeroCuenta}
                          </div>
                        </div>
                        <span className="badge bg-brand text-white">
                          {b.tipoCuenta}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    Sin registros bancarios.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FORMACIÓN */}
          <div className="col-12 col-lg-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3 p-lg-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-mortarboard fs-5 text-brand"></i>
                  <h6 className="fw-bold mb-0 text-dark">
                    Formación Académica
                  </h6>
                </div>

                {info.titulos && info.titulos.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {info.titulos.map((t, idx) => (
                      <div
                        key={t.idTitulo || idx}
                        className="bg-light p-3 rounded border"
                      >
                        <div className="fw-bold text-dark">
                          {t.nombreTitulo}
                        </div>
                        <div className="text-muted small mt-1">
                          {t.institucion || "N/A"}
                          {" · "}
                          {fechaODash(t.fechaObtencion)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    Sin títulos académicos.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTACTO Y BENEFICIOS (una sola tarjeta, junto a Formación) */}
          <div className="col-12 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3 p-lg-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-person-lines-fill fs-5 text-brand"></i>
                  <h6 className="fw-bold mb-0 text-dark">
                    Contacto y Beneficios
                  </h6>
                </div>

                <div className="d-flex flex-column gap-3 small">
                  <div>
                    <span className="text-muted d-block">Correo personal</span>
                    <span className="fw-semibold text-dark text-break">
                      {info.correoPersonal || "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted d-block">
                      Teléfono personal
                    </span>
                    <span className="fw-semibold text-dark">
                      {info.celularPersonal || "—"}
                    </span>
                  </div>

                  <hr className="my-1 text-muted opacity-25" />

                  <div>
                    <span className="text-muted d-block mb-2">
                      Beneficios y pagos
                    </span>
                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge bg-light text-dark border py-2 px-3">
                        Comisiones:{" "}
                        <strong>{info.recibeComisiones ? "Sí" : "No"}</strong>
                      </span>
                      <span className="badge bg-light text-dark border py-2 px-3">
                        Décimos:{" "}
                        <strong>
                          {info.acumulaDecimos ? "Acumulado" : "Mensualizado"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACTOS Y FAMILIA */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3 p-lg-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-people fs-5 text-brand"></i>
                  <h6 className="fw-bold mb-0 text-dark">
                    Carga Familiar y Emergencias
                  </h6>
                </div>

                <div className="row g-3">
                  {/* CONTACTO DE EMERGENCIA */}
                  <div className="col-12 col-xl-5">
                    <div className="border rounded p-3 h-100">
                      <span
                        className="text-muted d-block fw-bold text-uppercase mb-2"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Contacto de emergencia
                      </span>

                      {info.contactosEmergencia &&
                      info.contactosEmergencia.length > 0 ? (
                        <div className="d-flex flex-column gap-2">
                          {info.contactosEmergencia.map((c, idx) => (
                            <div
                              key={c.idContacto || idx}
                              className="bg-light p-3 rounded border"
                            >
                              <div className="fw-semibold text-dark">
                                {(c.nombre || "") + " " + (c.apellido || "")}
                                <span className="badge bg-secondary-subtle text-secondary ms-2">
                                  {c.parentesco || "N/A"}
                                </span>
                              </div>

                              <div className="text-muted small mt-2">
                                <i className="bi bi-telephone me-1 text-brand"></i>
                                {c.telefono || "—"}
                              </div>

                              {c.direccion && (
                                <div className="text-muted small mt-1">
                                  <i className="bi bi-geo-alt me-1 text-brand"></i>
                                  {c.direccion}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted opacity-75 mb-0 small">
                          Sin contactos de emergencia.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* FAMILIARES */}
                  <div className="col-12 col-xl-7">
                    <div className="border rounded p-3 h-100">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span
                          className="text-muted d-block fw-bold text-uppercase"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Familiares registrados
                        </span>
                        <span className="badge bg-light text-dark border">
                          {cantidadFamiliares} registrados
                        </span>
                      </div>

                      {info.familiares && info.familiares.length > 0 ? (
                        <div className="row g-2">
                          {info.familiares.map((fam, idx) => {
                            const esConyuge = [
                              "CONYUGE",
                              "CÓNYUGE",
                              "ESPOSO",
                              "ESPOSA",
                              "CONVIVIENTE",
                            ].includes((fam.parentesco || "").toUpperCase());

                            const fechaReferencia = esConyuge
                              ? fam.fechaUnion ||
                                fam.fechaMatrimonio ||
                                fam.fecha
                              : fam.fechaNacimiento || fam.fecha;

                            const anos = fechaReferencia
                              ? calcularEdad(fechaReferencia)
                              : null;

                            return (
                              <div
                                key={fam.idFamiliar || idx}
                                className="col-12 col-md-6"
                              >
                                <div className="bg-light p-3 rounded border h-100 d-flex justify-content-between align-items-center gap-2">
                                  <div>
                                    <div className="fw-semibold text-dark">
                                      {(fam.nombre || "") +
                                        " " +
                                        (fam.apellido || "")}
                                    </div>

                                    {fam.cedula && (
                                      <div
                                        className="text-muted small mt-1"
                                        style={{ fontSize: "0.75rem" }}
                                      >
                                        <i className="bi bi-person-vcard me-1"></i>
                                        C.I: {fam.cedula}
                                      </div>
                                    )}

                                    {fechaReferencia && (
                                      <>
                                        <div
                                          className="text-muted small mt-1"
                                          style={{ fontSize: "0.75rem" }}
                                        >
                                          <i className="bi bi-calendar-event me-1"></i>
                                          {esConyuge
                                            ? "Boda/Unión: "
                                            : "Nacimiento: "}
                                          {formatearFecha(fechaReferencia)}
                                        </div>

                                        {anos !== null && (
                                          <div
                                            className="fw-semibold text-brand mt-1"
                                            style={{ fontSize: "0.75rem" }}
                                          >
                                            {anos}{" "}
                                            {esConyuge
                                              ? "años de casado"
                                              : "años"}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  <span className="badge bg-white text-dark border flex-shrink-0">
                                    {fam.parentesco || "Familiar"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted opacity-75 mb-0 small">
                          Sin familiares registrados.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Perfiles;
