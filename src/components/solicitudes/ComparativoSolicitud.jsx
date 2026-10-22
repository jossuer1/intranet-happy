import { formatearFechaHoraEC } from "../../utils/fechasEcuador";
import { formatearFecha } from "../../utils/dateUtils";

const ESTILO_ESTADO = {
  PENDIENTE: "bg-warning-subtle text-warning-emphasis border border-warning-subtle",
  APROBADA: "bg-success-subtle text-success-emphasis border border-success-subtle",
  RECHAZADA: "bg-danger-subtle text-danger-emphasis border border-danger-subtle",
};

export const BadgeEstado = ({ estado }) => (
  <span className={`badge ${ESTILO_ESTADO[estado] || "bg-light text-muted border"}`}>
    {estado}
  </span>
);

const ESTILO_ACCION = {
  AGREGAR: "bg-success-subtle text-success-emphasis border border-success-subtle",
  EDITAR: "bg-warning-subtle text-warning-emphasis border border-warning-subtle",
  ELIMINAR: "bg-danger-subtle text-danger-emphasis border border-danger-subtle",
};

const ETIQUETA_CAMPO = {
  celularPersonal: "Celular personal",
  celularEmpresa: "Celular de empresa",
  direccion: "Dirección",
  correoPersonal: "Correo personal",
  idEstadoCivil: "Estado civil",
  estadoCivil: "Estado civil",
};

const ETIQUETA_PROP = {
  nombre: "Nombre",
  apellido: "Apellido",
  parentesco: "Parentesco",
  cedula: "Cédula",
  fechaNacimiento: "Fecha de nacimiento",
  fechaUnion: "Fecha de unión",
  telefono: "Teléfono",
  direccion: "Dirección",
  nombreTitulo: "Título",
  institucion: "Institución",
  culminado: "Estado",
  fechaObtencion: "Fecha de obtención",
};

const SECCIONES = [
  { clave: "familiares", titulo: "Familiares", icono: "bi-people" },
  {
    clave: "contactosEmergencia",
    titulo: "Contactos de emergencia",
    icono: "bi-telephone-forward",
  },
  { clave: "titulos", titulo: "Títulos", icono: "bi-mortarboard" },
];

const vacio = (v) =>
  v === null ||
  v === undefined ||
  v === "" ||
  (typeof v === "object" && Object.keys(v).length === 0);

// El backend puede mandar el valor como texto o como objeto (o JSON en texto).
const normalizar = (v) => {
  if (typeof v === "string" && v.trim().startsWith("{")) {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  return v;
};

const formatearPrimitivo = (clave, v) => {
  if (typeof v === "boolean")
    return clave === "culminado" ? (v ? "Culminado" : "En curso") : v ? "Sí" : "No";
  if (/^fecha/i.test(clave)) return formatearFecha(v) || String(v);
  return String(v);
};

// Muestra un valor (texto u objeto). `comparar` resalta en ámbar lo que cambió.
const Valor = ({ valor, comparar }) => {
  const v = normalizar(valor);
  if (vacio(v)) return <span className="text-muted">—</span>;

  if (typeof v !== "object") return <span>{formatearPrimitivo("", v)}</span>;

  const base = normalizar(comparar);
  const entradas = Object.entries(v).filter(
    ([k, val]) => !/^id[A-Z]/.test(k) && !vacio(val),
  );
  return (
    <ul className="list-unstyled mb-0 small">
      {entradas.map(([k, val]) => {
        const cambio =
          base && typeof base === "object" && String(base[k] ?? "") !== String(val);
        return (
          <li
            key={k}
            className={cambio ? "bg-warning-subtle rounded px-1" : undefined}
          >
            <span className="text-muted">{ETIQUETA_PROP[k] || k}: </span>
            <span className="fw-semibold">{formatearPrimitivo(k, val)}</span>
          </li>
        );
      })}
    </ul>
  );
};

function TablaCampos({ campos, resuelta }) {
  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th style={{ width: "25%" }}>Campo</th>
            {!resuelta && <th>Antes</th>}
            <th>{resuelta ? "Lo propuesto" : "Ahora"}</th>
          </tr>
        </thead>
        <tbody>
          {campos.map((c, i) => (
            <tr key={`${c.campo}-${i}`}>
              <td className="fw-semibold">{ETIQUETA_CAMPO[c.campo] || c.campo}</td>
              {!resuelta && (
                <td>
                  <Valor valor={c.anterior} />
                </td>
              )}
              <td className={resuelta ? "" : "bg-warning-subtle"}>
                <Valor valor={c.nuevo} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SeccionItems({ titulo, icono, items, resuelta }) {
  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body">
        <h6 className="fw-bold mb-3">
          <i className={`bi ${icono} me-2 text-brand`}></i>
          {titulo}
        </h6>
        <div className="d-flex flex-column gap-2">
          {items.map((it, i) => (
            <div key={`${it.idRegistro ?? "n"}-${i}`} className="border rounded-3 p-3">
              <span
                className={`badge mb-2 ${ESTILO_ACCION[it.accion] || "bg-light text-muted border"}`}
              >
                {it.accion}
              </span>
              <div className="row g-3">
                {!resuelta && it.accion !== "AGREGAR" && (
                  <div className="col-md-6">
                    <div className="small text-muted fw-semibold mb-1">Antes</div>
                    <Valor valor={it.anterior} />
                  </div>
                )}
                {it.accion !== "ELIMINAR" || resuelta ? (
                  <div className={!resuelta && it.accion !== "AGREGAR" ? "col-md-6" : "col-12"}>
                    <div className="small text-muted fw-semibold mb-1">
                      {resuelta ? "Lo propuesto" : "Ahora"}
                    </div>
                    <Valor
                      valor={it.nuevo ?? (resuelta ? it.anterior : null)}
                      comparar={!resuelta && it.accion === "EDITAR" ? it.anterior : null}
                    />
                  </div>
                ) : (
                  <div className="col-md-6">
                    <div className="small text-muted fw-semibold mb-1">Ahora</div>
                    <span className="text-danger small">Se eliminará este registro</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparativoSolicitud({ solicitud }) {
  const resuelta = solicitud.estado !== "PENDIENTE";
  const campos = solicitud.campos || [];
  const hayCambios =
    campos.length > 0 || SECCIONES.some((s) => (solicitud[s.clave] || []).length > 0);

  return (
    <>
      {resuelta && (
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
            {solicitud.fechaRevision && (
              <> · {formatearFechaHoraEC(solicitud.fechaRevision)}</>
            )}
          </div>
          {solicitud.observacionRrhh && (
            <div className="mt-1">Observación: {solicitud.observacionRrhh}</div>
          )}
        </div>
      )}

      {!hayCambios && (
        <div className="text-center text-muted py-4">
          Esta solicitud no contiene cambios.
        </div>
      )}

      {campos.length > 0 && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-person-lines-fill me-2 text-brand"></i>Campos
            </h6>
            <TablaCampos campos={campos} resuelta={resuelta} />
          </div>
        </div>
      )}

      {SECCIONES.map(
        (s) =>
          (solicitud[s.clave] || []).length > 0 && (
            <SeccionItems
              key={s.clave}
              titulo={s.titulo}
              icono={s.icono}
              items={solicitud[s.clave]}
              resuelta={resuelta}
            />
          ),
      )}
    </>
  );
}

export default ComparativoSolicitud;
