import React, { useEffect, useState } from "react";
import { getPorId } from "../../services/usuariosService";
import {
  calcularEdad,
  obtenerGeneracion,
  formatearFecha,
} from "../../utils/dateUtils";

function InfoItem({ label, valor }) {
  return (
    <div className="col-12 col-sm-6 mb-3">
      <p className="text-uppercase text-muted fw-bold small mb-1">{label}</p>
      <p className="mb-0 text-dark fw-medium">{valor || "N/A"}</p>
    </div>
  );
}

function SeccionTitulo({ children }) {
  return <h6 className="fw-bold text-primary mb-3 mt-1">{children}</h6>;
}

function TablaMini({ headers, children }) {
  return (
    <div className="table-responsive mb-1">
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

/**
 * Tarjeta flotante con la información general de un usuario.
 * Pensada para RRHH: se abre desde TablaUsuarios sin navegar a otra página.
 * Recibe la fila resumida (usuario) y pide el detalle completo a la API,
 * igual que hace GestionUsuarios al abrir el formulario de edición.
 */
function UsuarioInfoModal({ usuario, onClose }) {
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!usuario?.idUsuario) return;

    let activo = true;
    setCargando(true);
    setError(null);
    setDetalle(null);

    getPorId(usuario.idUsuario)
      .then((data) => {
        if (activo) setDetalle(data);
      })
      .catch((err) => {
        if (activo) {
          setError(
            err.message || "No se pudo cargar la información del usuario.",
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [usuario?.idUsuario]);

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!usuario) return null;

  // Mientras carga el detalle, usamos lo que ya trae la fila de la tabla
  // para no mostrar la tarjeta vacía.
  const info = detalle || usuario;

  const iniciales = (info.nombres || info.nombre || "??")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const esActivo =
    info.estado === "Activo" ||
    info.estado === 1 ||
    info.estado === true ||
    info.idEstado === 1;

  const edadCalculada = info.fechaNacimiento
    ? `${calcularEdad(info.fechaNacimiento)} años`
    : null;

  const generacionCalculada = info.fechaNacimiento
    ? obtenerGeneracion(info.fechaNacimiento)
    : null;

  const acumulaDecimos =
    String(info.acumulaDecimos) === "1" || info.acumulaDecimos === 1;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          width: "min(760px, 100%)",
          maxHeight: "88vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-body p-4">
          {/* ENCABEZADO */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="d-flex align-items-center gap-3">
              {info.fotoUrl || info.fotoPreview ? (
                <img
                  src={info.fotoPreview || info.fotoUrl}
                  alt="Foto de perfil"
                  className="rounded-circle object-fit-cover border border-2 border-primary shadow-sm"
                  style={{ width: "56px", height: "56px" }}
                />
              ) : (
                <div
                  className="rounded-circle bg-brand-soft text-brand d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: "56px", height: "56px", fontSize: "1.2rem" }}
                >
                  {iniciales}
                </div>
              )}
              <div>
                <h5 className="fw-bold mb-0">
                  {`${info.nombres || info.nombre || "Usuario"} ${info.apellidos || info.apellido || ""}`.trim()}
                </h5>
                <p className="text-muted mb-0 small">
                  {info.cargo || info.nombreCargo || "N/A"}
                  {info.departamento ? ` · ${info.departamento}` : ""}
                </p>
                <div className="d-flex flex-wrap gap-2 mt-1">
                  <span
                    className={`badge ${esActivo ? "bg-success" : "bg-secondary"}`}
                  >
                    {esActivo ? "Activo" : "Inactivo"}
                  </span>
                  <span
                    className={`badge ${
                      info.tieneVacaciones === false
                        ? "bg-light text-muted border"
                        : "bg-info-subtle text-info-emphasis border border-info-subtle"
                    }`}
                  >
                    {info.tieneVacaciones === false
                      ? "Vacaciones: no aplica"
                      : "Vacaciones: habilitadas"}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={onClose}
            ></button>
          </div>

          <hr className="text-muted opacity-25" />

          {/* CONTENIDO */}
          {cargando ? (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger mb-0" role="alert">
              {error}
            </div>
          ) : (
            <>
              {/* 1. INFORMACIÓN PERSONAL */}
              <SeccionTitulo>Información Personal</SeccionTitulo>
              <div className="row">
                <InfoItem label="Cédula" valor={info.cedula} />
                <InfoItem
                  label="Fecha de nacimiento"
                  valor={formatearFecha(info.fechaNacimiento)}
                />
                <InfoItem label="Edad" valor={edadCalculada} />
                <InfoItem label="Generación" valor={generacionCalculada} />
                <InfoItem label="Correo personal" valor={info.correoPersonal} />
                <InfoItem
                  label="Celular personal"
                  valor={info.celularPersonal}
                />
                <InfoItem label="Género" valor={info.genero || info.idGenero} />
                <InfoItem
                  label="Estado civil"
                  valor={info.estadoCivil || info.idEstadoCivil}
                />
                <InfoItem label="Etnia" valor={info.etnia || info.idEtnia} />
              </div>

              <hr className="my-3 text-muted opacity-25" />

              {/* 2. DATOS LABORALES Y UBICACIÓN */}
              <SeccionTitulo>Datos Laborales y Ubicación</SeccionTitulo>
              <div className="row">
                <InfoItem
                  label="Correo empresa"
                  valor={info.correoEmpresa || info.correo}
                />
                <InfoItem label="Celular empresa" valor={info.celularEmpresa} />
                <InfoItem
                  label="Cargo"
                  valor={info.cargo || info.nombreCargo}
                />
                <InfoItem label="Departamento" valor={info.departamento} />
                <InfoItem
                  label="Fecha de ingreso"
                  valor={formatearFecha(info.fechaIngreso)}
                />
                <InfoItem label="Ciudad" valor={info.ciudad || info.idCiudad} />
                <InfoItem
                  label="Dirección de domicilio"
                  valor={info.direccion}
                />
              </div>

              <hr className="my-3 text-muted opacity-25" />

              {/* 3. FAMILIARES Y CONTACTOS */}
              <SeccionTitulo>Información Familiar y Contactos</SeccionTitulo>

              <div className="mb-3">
                <p className="text-uppercase text-muted fw-bold small mb-2">
                  Hijos registrados
                </p>
                {info.familiares && info.familiares.length > 0 ? (
                  <TablaMini
                    headers={["Nombre del hijo/a", "Fecha de nacimiento"]}
                  >
                    {info.familiares.map((fam, idx) => (
                      <tr key={fam.idFamiliar || idx}>
                        <td className="fw-medium">
                          {fam.nombre} {fam.apellido || ""}
                        </td>
                        <td>{formatearFecha(fam.fechaNacimiento)}</td>
                      </tr>
                    ))}
                  </TablaMini>
                ) : (
                  <p className="small text-muted mb-0">No registra hijos.</p>
                )}
              </div>

              <div className="mb-1">
                <p className="text-uppercase text-muted fw-bold small mb-2">
                  Contactos de emergencia
                </p>
                {info.contactosEmergencia &&
                info.contactosEmergencia.length > 0 ? (
                  <TablaMini
                    headers={["Nombre", "Parentesco / Relación", "Teléfono"]}
                  >
                    {info.contactosEmergencia.map((c, idx) => (
                      <tr key={c.idContacto || idx}>
                        <td className="fw-medium">{c.nombre}</td>
                        <td>{c.parentesco}</td>
                        <td>{c.telefono}</td>
                      </tr>
                    ))}
                  </TablaMini>
                ) : (
                  <p className="small text-muted mb-0">
                    No registra contactos de emergencia.
                  </p>
                )}
              </div>

              <hr className="my-3 text-muted opacity-25" />

              {/* 4. DATOS BANCARIOS Y DÉCIMOS */}
              <SeccionTitulo>Datos Bancarios</SeccionTitulo>
              <p className="text-uppercase text-muted fw-bold small mb-2">
                Cuentas bancarias
              </p>
              {info.datosBancarios && info.datosBancarios.length > 0 ? (
                <TablaMini
                  headers={["Banco", "N° de cuenta", "Tipo de cuenta"]}
                >
                  {info.datosBancarios.map((b, idx) => (
                    <tr key={b.idDatoBancario || idx}>
                      <td className="fw-medium">{b.banco || b.idBanco}</td>
                      <td>{b.numeroCuenta}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {b.tipoCuenta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </TablaMini>
              ) : (
                <p className="small text-muted mb-0">
                  No registra cuentas bancarias.
                </p>
              )}

              <hr className="my-3 text-muted opacity-25" />

              {/* 5. FORMACIÓN ACADÉMICA */}
              <SeccionTitulo>Formación Académica</SeccionTitulo>
              {info.titulos && info.titulos.length > 0 ? (
                <TablaMini
                  headers={[
                    "Título obtenido",
                    "Institución educativa superior",
                  ]}
                >
                  {info.titulos.map((t, idx) => (
                    <tr key={t.idTitulo || idx}>
                      <td className="fw-medium">{t.nombreTitulo}</td>
                      <td>{t.institucion || "N/A"}</td>
                    </tr>
                  ))}
                </TablaMini>
              ) : (
                <p className="small text-muted mb-0">
                  No registra títulos académicos.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UsuarioInfoModal;
