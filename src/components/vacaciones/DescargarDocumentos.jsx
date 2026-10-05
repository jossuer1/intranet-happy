import { useState } from "react";
import Swal from "sweetalert2";
import {
  descargarDocumentoSolicitud,
  descargarDocumentosSolicitud,
} from "../../services/vacacionesService";
import { guardarArchivo } from "../../utils/descargas";

// Los 3 documentos que se generan al aprobarse una solicitud de vacaciones.
// Los números coinciden con GET /vacaciones/solicitudes/{id}/documentos/{numero}.
const DOCUMENTOS = [
  {
    numero: 1,
    titulo: "Solicitud de vacaciones",
    archivo: "1-solicitud-de-vacaciones.pdf",
  },
  {
    numero: 2,
    titulo: "Acta de vacaciones",
    archivo: "2-acta-de-vacaciones.pdf",
  },
  {
    numero: 3,
    titulo: "Declaración de goce y pago de vacaciones",
    archivo: "3-declaracion-goce-y-pago-de-vacaciones.pdf",
  },
];

// Botones para bajar los 3 PDFs (uno por uno) o todos juntos en un ZIP.
// Props:
//  - idSolicitud: id de la solicitud (debe estar APROBADA)
//  - prefijo: texto opcional para anteponer al nombre del archivo
//             (ej. "juan-perez" -> "juan-perez-2-acta-de-vacaciones.pdf")
//  - variante: color bootstrap del borde de los botones ("primary" | "danger"...)
function DescargarDocumentos({
  idSolicitud,
  prefijo = "",
  variante = "primary",
}) {
  // null | "zip" | 1 | 2 | 3  -> qué se está descargando ahora mismo
  const [descargando, setDescargando] = useState(null);

  const conPrefijo = (nombre) => (prefijo ? `${prefijo}-${nombre}` : nombre);

  const descargar = async (clave) => {
    try {
      setDescargando(clave);
      if (clave === "zip") {
        const { blob, nombre } = await descargarDocumentosSolicitud(idSolicitud);
        guardarArchivo(
          blob,
          conPrefijo(nombre || `documentos-vacaciones-${idSolicitud}.zip`),
        );
      } else {
        const doc = DOCUMENTOS.find((d) => d.numero === clave);
        const { blob, nombre } = await descargarDocumentoSolicitud(
          idSolicitud,
          clave,
        );
        guardarArchivo(blob, conPrefijo(nombre || doc.archivo));
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo descargar el documento",
        text: err.message || "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setDescargando(null);
    }
  };

  const ocupado = descargando !== null;

  return (
    <div className="btn-group btn-group-sm" role="group" aria-label="Documentos">
      {DOCUMENTOS.map((doc) => (
        <button
          key={doc.numero}
          type="button"
          className={`btn btn-outline-${variante}`}
          disabled={ocupado}
          onClick={() => descargar(doc.numero)}
          title={`${doc.numero}. ${doc.titulo} (PDF)`}
        >
          {descargando === doc.numero ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <>
              <i className="bi bi-file-earmark-pdf me-1"></i>
              {doc.numero}
            </>
          )}
        </button>
      ))}
      <button
        type="button"
        className={`btn btn-${variante}`}
        disabled={ocupado}
        onClick={() => descargar("zip")}
        title="Descargar los 3 documentos (ZIP)"
      >
        {descargando === "zip" ? (
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
        ) : (
          <i className="bi bi-file-earmark-zip"></i>
        )}
      </button>
    </div>
  );
}

export default DescargarDocumentos;
