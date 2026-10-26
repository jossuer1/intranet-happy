import { formatearFechaHoraEC } from "../../utils/fechasEcuador";

const ESTILO_ESTADO = {
  PENDIENTE: "bg-warning-subtle text-warning-emphasis border border-warning-subtle",
  APROBADA: "bg-success-subtle text-success-emphasis border border-success-subtle",
  RECHAZADA: "bg-danger-subtle text-danger-emphasis border border-danger-subtle",
  SIN_CAMBIOS: "bg-info-subtle text-info-emphasis border border-info-subtle",
};

export const BadgeEstado = ({ estado }) => (
  <span className={`badge ${ESTILO_ESTADO[estado] || "bg-light text-muted border"}`}>
    {String(estado || "").replace("_", " ")}
  </span>
);

const ESTILO_ACCION = {
  AGREGAR: "bg-success-subtle text-success-emphasis border border-success-subtle",
  EDITAR: "bg-warning-subtle text-warning-emphasis border border-warning-subtle",
  ELIMINAR: "bg-danger-subtle text-danger-emphasis border border-danger-subtle",
};

// Borde de color del panel "nuevo" según la acción
const BORDE_NUEVO = {
  AGREGAR: "border-success",
  EDITAR: "border-warning",
  ELIMINAR: "border-danger",
};

const ETIQUETA_CAMPO = {
  celularPersonal: "Celular personal",
  celularEmpresa: "Celular de empresa",
  direccion: "Dirección",
  correoPersonal: "Correo personal",
  idEstadoCivil: "Estado civil",
  estadoCivil: "Estado civil",
};

// El backend manda cada registro ya descrito en texto: "NOMBRE · PARENTESCO · C.I. ... · ..."
const aTexto = (v) => {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "object")
    return Object.entries(v)
      .filter(([k, val]) => !/^id[A-Z]/.test(k) && val !== null && val !== "")
      .map(([, val]) => String(val))
      .join(" · ");
  return String(v);
};
const partir = (t) =>
  aTexto(t)
    .split(" · ")
    .map((s) => s.trim())
    .filter(Boolean);
const norm = (t) => partir(t).join(" · ").toUpperCase();

// Lista un registro en líneas y resalta lo que no está en el otro lado
function Ficha({ texto, otro, lado }) {
  const piezas = partir(texto);
  if (piezas.length === 0) return <span className="text-muted">—</span>;

  const delOtro = new Set(partir(otro));
  const compara = otro !== undefined && otro !== null;

  return (
    <ul className="list-unstyled mb-0">
      {piezas.map((p, i) => {
        const cambia = compara && !delOtro.has(p);
        const clase =
          cambia && lado === "antes"
            ? "bg-warning bg-opacity-25 text-decoration-line-through text-muted"
            : cambia
              ? "bg-warning bg-opacity-50 fw-semibold"
              : "";
        return (
          <li
            key={`${p}-${i}`}
            className={`${i === 0 ? "fw-bold" : "small"} ${
              cambia ? "d-inline-block rounded px-2 py-1 mb-1" : "mb-1"
            } ${clase}`}
            style={cambia ? { display: "table" } : undefined}
          >
            {p}
          </li>
        );
      })}
    </ul>
  );
}

const Etiqueta = ({ children }) => (
  <div className="small text-muted fw-semibold text-uppercase mb-2" style={{ fontSize: "0.7rem" }}>
    {children}
  </div>
);

// Una fila: izquierda = información actual, derecha = información nueva
function Fila({ etiqueta, accion, izquierda, derecha, resuelta }) {
  return (
    <div className="border rounded-3 mb-3 overflow-hidden">
      {(etiqueta || accion) && (
        <div className="d-flex align-items-center gap-2 px-3 py-2 bg-light border-bottom">
          {accion && (
            <span className={`badge ${ESTILO_ACCION[accion] || "bg-light text-muted border"}`}>
              {accion}
            </span>
          )}
          {etiqueta && <span className="small fw-semibold">{etiqueta}</span>}
        </div>
      )}
      <div className="row g-0">
        {!resuelta && (
          <div className="col-md-6 p-3 bg-body-tertiary border-end">
            <div className="d-md-none">
              <Etiqueta>Información actual</Etiqueta>
            </div>
            {izquierda}
          </div>
        )}
        <div
          className={`${resuelta ? "col-12" : "col-md-6"} p-3 border-start border-4 ${
            BORDE_NUEVO[accion] || "border-warning"
          }`}
        >
          <div className={resuelta ? "" : "d-md-none"}>
            <Etiqueta>{resuelta ? "Lo propuesto" : "Información nueva"}</Etiqueta>
          </div>
          {derecha}
        </div>
      </div>
    </div>
  );
}

function Seccion({ titulo, icono, cantidad, resuelta, vacia, children, sinDiferencias = [] }) {
  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body p-3 p-lg-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <h6 className="fw-bold mb-0">
            <i className={`bi ${icono} me-2 text-brand`}></i>
            {titulo}
          </h6>
          <span
            className={`badge rounded-pill ${
              cantidad > 0
                ? "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                : "bg-light text-muted border"
            }`}
          >
            {cantidad > 0 ? `${cantidad} ${cantidad === 1 ? "cambio" : "cambios"}` : "Sin cambios"}
          </span>
        </div>

        {!resuelta && cantidad > 0 && (
          <div className="row g-3 mb-2 d-none d-md-flex">
            <div className="col-md-6">
              <Etiqueta>
                <i className="bi bi-clock-history me-1"></i>Información actual
              </Etiqueta>
            </div>
            <div className="col-md-6">
              <Etiqueta>
                <i className="bi bi-pencil-square me-1"></i>Información nueva
              </Etiqueta>
            </div>
          </div>
        )}

        {vacia ? (
          <div className="text-muted small bg-light rounded-3 px-3 py-3 text-center">
            El empleado no propuso cambios en esta sección.
          </div>
        ) : (
          children
        )}

        {sinDiferencias.length > 0 && (
          <details className="mt-1">
            <summary className="small text-muted" style={{ cursor: "pointer" }}>
              {sinDiferencias.length}{" "}
              {sinDiferencias.length === 1
                ? "registro reenviado sin diferencias"
                : "registros reenviados sin diferencias"}
            </summary>
            <ul className="small text-muted mt-2 mb-0">
              {sinDiferencias.map((it, i) => (
                <li key={`${it.idRegistro ?? "n"}-${i}`}>{aTexto(it.nuevo)}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}

const SECCIONES = [
  { clave: "familiares", titulo: "Familiares", icono: "bi-people" },
  { clave: "contactosEmergencia", titulo: "Contactos de emergencia", icono: "bi-telephone-forward" },
  { clave: "titulos", titulo: "Estudios", icono: "bi-mortarboard" },
];

function SeccionItems({ def, items, resuelta }) {
  // Un EDITAR cuyo antes y ahora son iguales no cambia nada: se agrupa aparte.
  const esSinDiferencias = (it) =>
    !resuelta && it.accion === "EDITAR" && norm(it.anterior) === norm(it.nuevo);

  const reales = items.filter((it) => !esSinDiferencias(it));
  const sinDiferencias = items.filter(esSinDiferencias);

  return (
    <Seccion
      titulo={def.titulo}
      icono={def.icono}
      cantidad={reales.length}
      resuelta={resuelta}
      vacia={reales.length === 0}
      sinDiferencias={sinDiferencias}
    >
      {reales.map((it, i) => (
        <Fila
          key={`${it.idRegistro ?? "n"}-${i}`}
          accion={it.accion}
          resuelta={resuelta}
          izquierda={
            it.accion === "AGREGAR" ? (
              <span className="text-muted small">Registro nuevo</span>
            ) : (
              <Ficha
                texto={it.anterior}
                otro={it.accion === "EDITAR" ? it.nuevo : null}
                lado="antes"
              />
            )
          }
          derecha={
            it.accion === "ELIMINAR" ? (
              resuelta ? (
                <Ficha texto={it.anterior} />
              ) : (
                <span className="text-danger small fw-semibold">
                  <i className="bi bi-trash me-1"></i>Se eliminará este registro
                </span>
              )
            ) : (
              <Ficha
                texto={it.nuevo}
                otro={!resuelta && it.accion === "EDITAR" ? it.anterior : null}
                lado="ahora"
              />
            )
          }
        />
      ))}
    </Seccion>
  );
}

function ComparativoSolicitud({ solicitud }) {
  const resuelta = solicitud.estado !== "PENDIENTE";
  const campos = solicitud.campos || [];

  const conteo = {
    campos: campos.length,
    ...Object.fromEntries(
      SECCIONES.map((s) => [
        s.clave,
        (solicitud[s.clave] || []).filter(
          (it) =>
            !(
              !resuelta &&
              it.accion === "EDITAR" &&
              norm(it.anterior) === norm(it.nuevo)
            ),
        ).length,
      ]),
    ),
  };

  return (
    <>
      {solicitud.estado === "SIN_CAMBIOS" && (
        <div className="alert alert-info shadow-sm">
          <div className="fw-bold mb-1">Sin cambios</div>
          <div className="small">
            El empleado revisó su información y confirmó que está al día
            {solicitud.fechaRevision && <> · {formatearFechaHoraEC(solicitud.fechaRevision)}</>}.
          </div>
        </div>
      )}

      {resuelta && solicitud.estado !== "SIN_CAMBIOS" && (
        <div
          className={`alert ${
            solicitud.estado === "RECHAZADA" ? "alert-danger" : "alert-success"
          } shadow-sm`}
        >
          <div className="fw-bold mb-1">
            Solicitud {solicitud.estado === "RECHAZADA" ? "rechazada" : "aprobada"}
          </div>
          <div className="small">
            Revisor: <b>{solicitud.revisor || "—"}</b>
            {solicitud.fechaRevision && <> · {formatearFechaHoraEC(solicitud.fechaRevision)}</>}
          </div>
          {solicitud.observacionRrhh && (
            <div className="mt-1">Observación: {solicitud.observacionRrhh}</div>
          )}
        </div>
      )}

      {solicitud.estado !== "SIN_CAMBIOS" && (
        <>
          {/* Resumen rápido de qué cambia */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {[
              ["Información personal", conteo.campos],
              ["Familiares", conteo.familiares],
              ["Contactos de emergencia", conteo.contactosEmergencia],
              ["Estudios", conteo.titulos],
            ].map(([nombre, n]) => (
              <span
                key={nombre}
                className={`badge ${
                  n > 0
                    ? "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                    : "bg-light text-muted border"
                }`}
              >
                {nombre}: {n > 0 ? n : "sin cambios"}
              </span>
            ))}
          </div>

          {/* Información personal (campos escalares) */}
          <Seccion
            titulo="Información personal"
            icono="bi-person-lines-fill"
            cantidad={campos.length}
            resuelta={resuelta}
            vacia={campos.length === 0}
          >
            {campos.map((c, i) => (
              <Fila
                key={`${c.campo}-${i}`}
                etiqueta={ETIQUETA_CAMPO[c.campo] || c.campo}
                accion="EDITAR"
                resuelta={resuelta}
                izquierda={
                  aTexto(c.anterior) ? (
                    <span className="bg-warning bg-opacity-25 text-decoration-line-through text-muted rounded px-2 py-1">
                      {aTexto(c.anterior)}
                    </span>
                  ) : (
                    <span className="text-muted">— (vacío)</span>
                  )
                }
                derecha={
                  aTexto(c.nuevo) ? (
                    <span className="bg-warning bg-opacity-50 fw-semibold rounded px-2 py-1">
                      {aTexto(c.nuevo)}
                    </span>
                  ) : (
                    <span className="text-muted">— (se vaciará)</span>
                  )
                }
              />
            ))}
          </Seccion>

          {SECCIONES.map((def) => (
            <SeccionItems
              key={def.clave}
              def={def}
              items={solicitud[def.clave] || []}
              resuelta={resuelta}
            />
          ))}
        </>
      )}
    </>
  );
}

export default ComparativoSolicitud;
