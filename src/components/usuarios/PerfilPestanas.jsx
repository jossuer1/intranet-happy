import { useState } from "react";
import {
  calcularEdad,
  obtenerGeneracion,
  formatearFecha,
} from "../../utils/dateUtils";

const fechaODash = (f) => (f ? formatearFecha(f) : "—");

const PARENTESCOS_CONYUGE = [
  "CONYUGE",
  "CÓNYUGE",
  "ESPOSO",
  "ESPOSA",
  "CONVIVIENTE",
];

// Un dato: etiqueta gris arriba, valor debajo.
function Campo({ etiqueta, children, className = "col-6 col-lg-4" }) {
  return (
    <div className={className}>
      <span className="text-muted small d-block mb-1">{etiqueta}</span>
      <span className="fw-semibold text-dark text-break">
        {children || "—"}
      </span>
    </div>
  );
}

function Vacio({ icono = "bi-info-circle", texto }) {
  return (
    <div className="text-muted small py-4 text-center">
      <i className={`bi ${icono} d-block fs-3 mb-2 opacity-50`}></i>
      {texto}
    </div>
  );
}

/* ----------------------------- PANELES ----------------------------- */

// Cuadro con título para agrupar datos (se usan dos por pestaña, lado a lado).
// className: por defecto "h-100" (ocupa toda la altura de su columna). Si dos
// cuadros van apilados en una misma columna, se les pasa "" o "flex-grow-1".
function Cuadro({ titulo, icono, children, className = "h-100" }) {
  return (
    <div className={`border rounded-3 p-3 p-lg-4 ${className}`}>
      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
        <i className={`bi ${icono} text-brand`}></i>
        <h6 className="fw-bold mb-0 text-dark small text-uppercase">
          {titulo}
        </h6>
      </div>
      {children}
    </div>
  );
}

function PanelPersonal({ info, esRRHH }) {
  const edad = info.fechaNacimiento
    ? `${calcularEdad(info.fechaNacimiento)} años`
    : null;
  const generacion = info.fechaNacimiento
    ? obtenerGeneracion(info.fechaNacimiento)
    : null;

  return (
    <div className="row g-3">
      {/* Cuadro 1: datos de identidad */}
      <div className="col-12 col-lg-6">
        <Cuadro titulo="Información principal" icono="bi-person-vcard">
          <div className="row g-3">
            <Campo etiqueta="Cédula / ID" className="col-12 col-sm-6">
              {info.cedula}
            </Campo>
            <Campo etiqueta="Nacionalidad" className="col-12 col-sm-6">
              {info.nacionalidad
                ? info.nacionalidad.charAt(0) +
                  info.nacionalidad.slice(1).toLowerCase()
                : null}
            </Campo>
            <Campo etiqueta="Fecha de nacimiento" className="col-12 col-sm-6">
              {info.fechaNacimiento
                ? `${formatearFecha(info.fechaNacimiento)}${edad ? ` (${edad})` : ""}`
                : null}
            </Campo>
            <Campo etiqueta="Generación" className="col-12 col-sm-6">
              {generacion}
            </Campo>
            <Campo etiqueta="Estado civil" className="col-12 col-sm-6">
              {info.estadoCivil}
            </Campo>
          </div>
        </Cuadro>
      </div>

      {/* Cuadro 2: datos complementarios y de contacto */}
      <div className="col-12 col-lg-6">
        <Cuadro titulo="Contacto y otros datos" icono="bi-person-lines-fill">
          <div className="row g-3">
            <Campo etiqueta="Género" className="col-12 col-sm-6">
              {info.genero}
            </Campo>
            <Campo etiqueta="Etnia" className="col-12 col-sm-6">
              {info.etnia}
            </Campo>
            <Campo etiqueta="Correo personal" className="col-12 col-sm-6">
              {info.correoPersonal}
            </Campo>
            <Campo etiqueta="Teléfono personal" className="col-12 col-sm-6">
              {info.celularPersonal}
            </Campo>

            {esRRHH && (
              <div className="col-12">
                <span className="text-muted small d-block mb-2">
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
            )}
          </div>
        </Cuadro>
      </div>
    </div>
  );
}

function PanelLaboral({ info, esRRHH }) {
  const tienePeriodos = esRRHH && info.periodosIess?.length > 0;

  return (
    <div className="row g-3">
      {/* Cuadro izquierdo: datos del puesto */}
      <div className="col-12 col-lg-6">
        <Cuadro titulo="Datos laborales" icono="bi-briefcase">
          <div className="row g-3">
            <Campo etiqueta="Jefe directo" className="col-12 col-sm-6">
              {info.jefeDirecto || "Sin asignar"}
            </Campo>
            <Campo etiqueta="Fecha de ingreso" className="col-12 col-sm-6">
              {info.fechaIngreso ? formatearFecha(info.fechaIngreso) : null}
            </Campo>
            <Campo etiqueta="Jornada" className="col-12 col-sm-6">
              {info.jornada}
            </Campo>
            {esRRHH && (
              <>
                <Campo etiqueta="Tipo de contrato" className="col-12 col-sm-6">
                  {info.tipoContrato}
                </Campo>
                <Campo etiqueta="Fin de contrato" className="col-12 col-sm-6">
                  {info.fechaFinContrato
                    ? formatearFecha(info.fechaFinContrato)
                    : "No aplica"}
                </Campo>
                <Campo etiqueta="Cargo IESS" className="col-12 col-sm-6">
                  {info.cargoIess}
                </Campo>
                <Campo etiqueta="Sectorial" className="col-12 col-sm-6">
                  {info.sectorial}
                </Campo>
              </>
            )}
          </div>
        </Cuadro>
      </div>

      {/* Columna derecha: Ubicación y, justo debajo, el Historial de contratos.
          Así el historial sube y comparte la altura del cuadro de la izquierda
          en vez de ocupar una fila entera más abajo. */}
      <div className="col-12 col-lg-6 d-flex flex-column gap-3">
        {/* Si no hay historial, Ubicación rellena toda la columna */}
        <Cuadro
          titulo="Ubicación"
          icono="bi-geo-alt"
          className={tienePeriodos ? "" : "flex-grow-1"}
        >
          {/* 2 × 2: Región | Provincia  /  Ciudad | Dirección (sin huecos) */}
          <div className="row g-3">
            <Campo etiqueta="Región" className="col-12 col-sm-6">
              {info.region}
            </Campo>
            <Campo etiqueta="Provincia" className="col-12 col-sm-6">
              {info.provincia}
            </Campo>
            <Campo etiqueta="Ciudad" className="col-12 col-sm-6">
              {info.ciudad}
            </Campo>
            <Campo etiqueta="Dirección" className="col-12 col-sm-6">
              {info.direccion}
            </Campo>
          </div>
        </Cuadro>

        {/* Historial de contratos: solo si existe. flex-grow-1 = rellena el
            alto sobrante si la columna izquierda es más alta. */}
        {tienePeriodos && (
          <Cuadro
            titulo="Historial de contratos"
            icono="bi-clock-history"
            className="flex-grow-1"
          >
            <div
              className="table-responsive"
              style={{ maxHeight: "180px", overflowY: "auto" }}
            >
              <table className="table table-sm align-middle mb-0 small">
                <thead className="table-light sticky-top">
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
          </Cuadro>
        )}
      </div>
    </div>
  );
}

function PanelFormacion({ info }) {
  const titulos = info.titulos || [];
  if (titulos.length === 0) return <Vacio texto="Sin títulos académicos." />;

  return (
    <div className="row g-3">
      {titulos.map((t, idx) => (
        <div key={t.idTitulo || idx} className="col-12 col-md-6 col-xl-4">
          <div className="bg-light p-3 rounded border h-100">
            <div className="fw-bold text-dark">{t.nombreTitulo}</div>
            <div className="text-muted small mt-1">
              {t.institucion || "N/A"}
              {t.culminado !== false && ` · ${fechaODash(t.fechaObtencion)}`}
            </div>
            <span
              className={`badge mt-2 ${
                t.culminado !== false
                  ? "bg-success-subtle text-success border border-success-subtle"
                  : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
              }`}
            >
              {t.culminado !== false ? "Culminado" : "En curso"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PanelFamiliares({ info, esRRHH }) {
  const familiares = info.familiares || [];
  if (familiares.length === 0)
    return <Vacio icono="bi-people" texto="Sin familiares registrados." />;

  return (
    <div className="row g-3">
      {familiares.map((fam, idx) => {
        const esConyuge = PARENTESCOS_CONYUGE.includes(
          (fam.parentesco || "").toUpperCase(),
        );
        const fechaReferencia = esConyuge
          ? fam.fechaUnion || fam.fechaMatrimonio || fam.fecha
          : fam.fechaNacimiento || fam.fecha;
        const anos = fechaReferencia ? calcularEdad(fechaReferencia) : null;

        return (
          <div key={fam.idFamiliar || idx} className="col-12 col-md-6 col-xl-4">
            <div className="bg-light p-3 rounded border h-100 d-flex justify-content-between align-items-start gap-2">
              <div>
                <div className="fw-semibold text-dark">
                  {(fam.nombre || "") + " " + (fam.apellido || "")}
                </div>
                {esRRHH && fam.cedula && (
                  <div className="text-muted small mt-1">
                    <i className="bi bi-person-vcard me-1"></i>
                    C.I: {fam.cedula}
                  </div>
                )}
                {fechaReferencia && (
                  <>
                    <div className="text-muted small mt-1">
                      <i className="bi bi-calendar-event me-1"></i>
                      {esConyuge ? "Boda/Unión: " : "Nacimiento: "}
                      {formatearFecha(fechaReferencia)}
                    </div>
                    {anos !== null && (
                      <div className="fw-semibold text-brand small mt-1">
                        {anos} {esConyuge ? "años de casado" : "años"}
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
  );
}

function PanelEmergencia({ info }) {
  const contactos = info.contactosEmergencia || [];
  if (contactos.length === 0)
    return <Vacio icono="bi-telephone" texto="Sin contactos de emergencia." />;

  return (
    <div className="row g-3">
      {contactos.map((c, idx) => (
        <div key={c.idContacto || idx} className="col-12 col-md-6 col-xl-4">
          <div className="bg-light p-3 rounded border h-100">
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
        </div>
      ))}
    </div>
  );
}

function PanelBancarios({ info }) {
  const cuentas = info.datosBancarios || [];
  if (cuentas.length === 0)
    return <Vacio icono="bi-bank" texto="Sin registros bancarios." />;

  return (
    <div className="row g-3">
      {cuentas.map((b, idx) => (
        <div key={b.idDatoBancario || idx} className="col-12 col-md-6 col-xl-4">
          <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded border h-100">
            <div>
              <div className="fw-bold text-dark">{b.banco || b.idBanco}</div>
              <div className="text-muted small">N° {b.numeroCuenta}</div>
            </div>
            <span className="badge bg-brand text-white">{b.tipoCuenta}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------- COMPONENTE PRINCIPAL ------------------------- */

/**
 * Pestañas con la información del colaborador. Se usa en "Mi Perfil" y en
 * "Perfiles" (RRHH). Solo se ve una sección a la vez, así la página no se
 * alarga: se cambia de sección tocando la pestaña.
 *
 * @param {object}  info    Datos del perfil.
 * @param {boolean} esRRHH  true = vista completa de RRHH (incluye datos extra).
 */
function PerfilPestanas({ info, esRRHH = false }) {
  const [activa, setActiva] = useState("personal");

  const pestanas = [
    {
      id: "personal",
      etiqueta: "Información personal",
      icono: "bi-person-vcard",
    },
    { id: "laboral", etiqueta: "Datos laborales", icono: "bi-briefcase" },
    {
      id: "formacion",
      etiqueta: "Formación",
      icono: "bi-mortarboard",
      cantidad: info.titulos?.length ?? 0,
    },
    {
      id: "familiares",
      etiqueta: "Familiares",
      icono: "bi-people",
      cantidad: info.familiares?.length ?? 0,
    },
    {
      id: "emergencia",
      etiqueta: "Emergencia",
      icono: "bi-telephone-plus",
      cantidad: info.contactosEmergencia?.length ?? 0,
    },
    {
      id: "bancarios",
      etiqueta: "Datos bancarios",
      icono: "bi-bank",
      cantidad: info.datosBancarios?.length ?? 0,
    },
  ];

  return (
    <div className="card border-0 shadow-sm">
      {/* Barra de pestañas (en pantallas chicas se desliza hacia el lado) */}
      <div className="card-header bg-white border-bottom p-3">
        <ul
          className="nav nav-pills flex-nowrap gap-2 overflow-auto pb-1"
          role="tablist"
        >
          {pestanas.map((p) => {
            const seleccionada = p.id === activa;
            return (
              <li
                className="nav-item flex-shrink-0"
                key={p.id}
                role="presentation"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={seleccionada}
                  className={`nav-link d-flex align-items-center gap-2 ${
                    seleccionada
                      ? "active bg-brand"
                      : "text-dark bg-white border"
                  }`}
                  onClick={() => setActiva(p.id)}
                >
                  <i className={`bi ${p.icono}`}></i>
                  {p.etiqueta}
                  {p.cantidad !== undefined && p.cantidad > 0 && (
                    <span
                      className={`badge rounded-pill ${
                        seleccionada
                          ? "bg-white text-dark"
                          : "bg-light text-dark border"
                      }`}
                    >
                      {p.cantidad}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Contenido de la pestaña seleccionada */}
      <div
        className="card-body p-3 p-lg-4"
        role="tabpanel"
        style={{ minHeight: "280px" }}
      >
        {activa === "personal" && <PanelPersonal info={info} esRRHH={esRRHH} />}
        {activa === "laboral" && <PanelLaboral info={info} esRRHH={esRRHH} />}
        {activa === "formacion" && <PanelFormacion info={info} />}
        {activa === "familiares" && (
          <PanelFamiliares info={info} esRRHH={esRRHH} />
        )}
        {activa === "emergencia" && <PanelEmergencia info={info} />}
        {activa === "bancarios" && <PanelBancarios info={info} />}
      </div>
    </div>
  );
}

export default PerfilPestanas;
