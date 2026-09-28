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

function Campo({ label, valor }) {
  return (
    <div className="col-12 col-md-6 col-lg-4 mb-3">
      <p className="text-uppercase text-muted fw-bold small mb-1">{label}</p>
      <p className="mb-0 text-dark fw-medium">{valor || "N/A"}</p>
    </div>
  );
}

function Seccion({ titulo, children }) {
  return (
    <>
      <hr className="my-4 text-muted opacity-25" />
      <h6 className="fw-bold text-primary mb-3">{titulo}</h6>
      {children}
    </>
  );
}

function Tabla({ headers, children }) {
  return (
    <div className="table-responsive mb-2">
      <table className="table table-sm table-borderless bg-light rounded align-middle mb-0">
        <thead>
          <tr className="text-muted small border-bottom">
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const siNo = (v) => (v ? "Sí" : "No");
const fechaODash = (f) => (f ? formatearFecha(f) : "—");

// Días que faltan para que termine el contrato (negativo = ya venció)
const diasParaFin = (fechaFin) => {
  if (!fechaFin) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaFin);
  fin.setHours(0, 0, 0, 0);
  return Math.round((fin - hoy) / (1000 * 60 * 60 * 24));
};

/**
 * Perfiles: ficha COMPLETA de un colaborador, solo para RRHH.
 * Incluye la condición laboral (tipo de contrato, fin de contrato, IESS,
 * jornada, comisiones, décimos) que el empleado no ve en "Mi Perfil".
 * Se abre desde el ojito de Gestión de Usuarios: /perfiles/:idUsuario
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

  // Si ya sabemos quién es el usuario logueado y no es RRHH, fuera.
  // (El backend igual bloquea la consulta de otros perfiles con 403.)
  const rol = String(usuarioLogueado?.rol ?? "").toUpperCase();
  if (usuarioLogueado && rol !== "RRHH") {
    return <Navigate to="/dashboard" replace />;
  }

  const encabezado = <SectionHeader titulo="Perfil del colaborador" volverA="/gestion-usuarios" />;

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

  const edad = info.fechaNacimiento
    ? `${calcularEdad(info.fechaNacimiento)} años`
    : null;
  const generacion = info.fechaNacimiento
    ? obtenerGeneracion(info.fechaNacimiento)
    : null;

  const dias = diasParaFin(info.fechaFinContrato);
  let avisoContrato = null;
  if (dias !== null) {
    if (dias < 0) avisoContrato = { clase: "bg-danger", texto: "Contrato vencido" };
    else if (dias <= 30)
      avisoContrato = {
        clase: "bg-warning text-dark",
        texto: `Contrato vence en ${dias} día(s)`,
      };
  }

  return (
    <AppLayout>
      {encabezado}

      <div className="container my-4 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                {/* ENCABEZADO */}
                <div className="d-flex align-items-center gap-3 mb-2">
                  {info.urlImagenPerfil ? (
                    <img
                      src={info.urlImagenPerfil}
                      alt="Foto de perfil"
                      className="rounded-circle object-fit-cover border border-2 border-primary shadow-sm"
                      style={{ width: "72px", height: "72px" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-brand-soft text-brand d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: "72px", height: "72px", fontSize: "1.5rem" }}
                    >
                      {iniciales}
                    </div>
                  )}
                  <div>
                    <h5 className="fw-bold mb-0">{nombreCompleto}</h5>
                    <p className="text-muted mb-1 small">
                      {info.cargo || "N/A"}
                      {info.departamento ? ` · ${info.departamento}` : ""}
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      <span className={`badge ${info.estado ? "bg-success" : "bg-secondary"}`}>
                        {info.estado ? "Activo" : "Inactivo"}
                      </span>
                      {info.tipoContrato && (
                        <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                          Contrato {info.tipoContrato}
                        </span>
                      )}
                      {avisoContrato && (
                        <span className={`badge ${avisoContrato.clase}`}>
                          {avisoContrato.texto}
                        </span>
                      )}
                      {info.esJefe && <span className="badge bg-primary">Jefe</span>}
                    </div>
                  </div>
                </div>

                {/* 1. PERSONAL */}
                <Seccion titulo="1. Información Personal">
                  <div className="row">
                    <Campo label="Nombres completos" valor={nombreCompleto} />
                    <Campo label="Cédula" valor={info.cedula} />
                    <Campo label="Fecha de nacimiento" valor={formatearFecha(info.fechaNacimiento)} />
                    <Campo label="Edad" valor={edad} />
                    <Campo label="Generación" valor={generacion} />
                    <Campo label="Correo personal" valor={info.correoPersonal} />
                    <Campo label="Celular personal" valor={info.celularPersonal} />
                    <Campo label="Género" valor={info.genero} />
                    <Campo label="Estado civil" valor={info.estadoCivil} />
                    <Campo label="Etnia" valor={info.etnia} />
                    <Campo label="Tipo de sangre" valor={info.tipoSangre} />
                    <Campo label="Ciudad" valor={info.ciudad} />
                    <Campo label="Dirección de domicilio" valor={info.direccion} />
                  </div>
                </Seccion>

                {/* 2. LABORAL */}
                <Seccion titulo="2. Datos Laborales">
                  <div className="row">
                    <Campo label="Correo empresa" valor={info.correoEmpresa} />
                    <Campo label="Celular empresa" valor={info.celularEmpresa} />
                    <Campo label="Cargo" valor={info.cargo} />
                    <Campo label="Departamento" valor={info.departamento} />
                    <Campo label="Jefe directo" valor={info.jefeDirecto || "Sin asignar"} />
                    <Campo label="Fecha de ingreso" valor={formatearFecha(info.fechaIngreso)} />
                    <Campo label="Tiene derecho a vacaciones" valor={siNo(info.tieneVacaciones)} />
                    <Campo
                      label="Días de vacaciones asignados"
                      valor={`${info.diasVacacionesAsignados ?? 0} días`}
                    />
                  </div>
                </Seccion>

                {/* 3. CONDICIÓN LABORAL (solo RRHH) */}
                <Seccion titulo="3. Condición Laboral (solo RRHH)">
                  <div className="row">
                    <Campo label="Tipo de contrato" valor={info.tipoContrato} />
                    <Campo
                      label="Fin de contrato"
                      valor={info.fechaFinContrato ? formatearFecha(info.fechaFinContrato) : "No aplica"}
                    />
                    <Campo label="Jornada" valor={info.jornada} />
                    <Campo label="Cargo IESS" valor={info.cargoIess} />
                    <Campo label="Recibe comisiones" valor={siNo(info.recibeComisiones)} />
                    <Campo label="Acumula décimos" valor={siNo(info.acumulaDecimos)} />
                    <Campo label="Es jefe" valor={siNo(info.esJefe)} />
                  </div>
                </Seccion>

                {/* 4. FAMILIA Y CONTACTOS */}
                <Seccion titulo="4. Información Familiar y Contactos">
                  <p className="text-uppercase text-muted fw-bold small mb-2">
                    Familiares registrados
                  </p>
                  {info.familiares?.length > 0 ? (
                    <Tabla headers={["Nombre Completo", "Parentesco", "Fecha de nacimiento", "Fecha de unión"]}>
                      {info.familiares.map((f, i) => (
                        <tr key={f.idFamiliar || i}>
                          <td className="fw-medium">{`${f.nombre || ""} ${f.apellido || ""}`.trim()}</td>
                          <td>{f.parentesco || "N/A"}</td>
                          <td>{fechaODash(f.fechaNacimiento)}</td>
                          <td>{fechaODash(f.fechaUnion)}</td>
                        </tr>
                      ))}
                    </Tabla>
                  ) : (
                    <p className="small text-muted mb-3">No registra familiares.</p>
                  )}

                  <p className="text-uppercase text-muted fw-bold small mb-2 mt-3">
                    Contactos de emergencia
                  </p>
                  {info.contactosEmergencia?.length > 0 ? (
                    <Tabla headers={["Nombre Completo", "Parentesco / Relación", "Teléfono", "Dirección"]}>
                      {info.contactosEmergencia.map((c, i) => (
                        <tr key={c.idContacto || i}>
                          <td className="fw-medium">{`${c.nombre || ""} ${c.apellido || ""}`.trim()}</td>
                          <td>{c.parentesco || "N/A"}</td>
                          <td>{c.telefono || "N/A"}</td>
                          <td>{c.direccion || "N/A"}</td>
                        </tr>
                      ))}
                    </Tabla>
                  ) : (
                    <p className="small text-muted mb-0">No registra contactos de emergencia.</p>
                  )}
                </Seccion>

                {/* 5. BANCARIOS */}
                <Seccion titulo="5. Datos Bancarios">
                  {info.datosBancarios?.length > 0 ? (
                    <Tabla headers={["Banco", "N° de cuenta", "Tipo de cuenta"]}>
                      {info.datosBancarios.map((b, i) => (
                        <tr key={b.idDatoBancario || i}>
                          <td className="fw-medium">{b.banco || b.idBanco}</td>
                          <td>{b.numeroCuenta}</td>
                          <td>
                            <span className="badge bg-secondary">{b.tipoCuenta}</span>
                          </td>
                        </tr>
                      ))}
                    </Tabla>
                  ) : (
                    <p className="small text-muted mb-0">No registra cuentas bancarias.</p>
                  )}
                </Seccion>

                {/* 6. FORMACIÓN */}
                <Seccion titulo="6. Formación Académica">
                  {info.titulos?.length > 0 ? (
                    <Tabla headers={["Título obtenido", "Institución", "Fecha de obtención"]}>
                      {info.titulos.map((t, i) => (
                        <tr key={t.idTitulo || i}>
                          <td className="fw-medium">{t.nombreTitulo}</td>
                          <td>{t.institucion || "N/A"}</td>
                          <td>{fechaODash(t.fechaObtencion)}</td>
                        </tr>
                      ))}
                    </Tabla>
                  ) : (
                    <p className="small text-muted mb-0">No registra títulos académicos.</p>
                  )}
                </Seccion>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Perfiles;
