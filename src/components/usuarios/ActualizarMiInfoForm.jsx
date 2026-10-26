import { useState } from "react";
import Swal from "sweetalert2";
import Familiares from "./secciones/Familiares";
import ContactosEmergencia from "./secciones/ContactosEmergencia";
import Titulos from "./secciones/Titulos";
import { useCatalogosFormulario } from "../../hooks/useCatalogo";
import { usuariosService } from "../../services/usuariosService";
import { useAuthStore } from "../../store/useAuthStore";
import { toastError, toastExito } from "../../utils/toast";

const aFechaInput = (v) => (v ? String(v).split("T")[0] : "");
const txt = (v) => (v === null || v === undefined ? "" : String(v).trim());

// Campo → id (clave del registro) por lista
const ID_KEY = {
  familiares: "idFamiliar",
  contactosEmergencia: "idContacto",
  titulos: "idTitulo",
};

// Valores que definen si un item cambió (comparación original vs actual)
const firma = (lista, it) => {
  if (lista === "familiares") {
    const conyuge = it.parentesco === "CONYUGE";
    return JSON.stringify([
      txt(it.nombre),
      txt(it.apellido),
      txt(it.parentesco),
      txt(it.cedula),
      conyuge ? aFechaInput(it.fechaUnion) : aFechaInput(it.fechaNacimiento),
    ]);
  }
  if (lista === "contactosEmergencia") {
    return JSON.stringify([
      txt(it.nombre),
      txt(it.apellido),
      txt(it.parentesco),
      txt(it.telefono),
      txt(it.direccion),
    ]);
  }
  const culminado = it.culminado !== false;
  return JSON.stringify([
    txt(it.nombreTitulo),
    txt(it.institucion),
    culminado,
    culminado ? aFechaInput(it.fechaObtencion) : "",
  ]);
};

// Item nuevo sin nada escrito: se ignora
const estaVacio = (lista, it) => {
  if (lista === "familiares")
    return ![it.nombre, it.apellido, it.cedula, it.fechaNacimiento, it.fechaUnion].some(
      txt,
    );
  if (lista === "contactosEmergencia")
    return ![it.nombre, it.apellido, it.parentesco, it.telefono, it.direccion].some(
      txt,
    );
  return ![it.nombreTitulo, it.institucion, it.fechaObtencion].some(txt);
};

// Item listo para enviar al backend
const armarItem = (lista, it) => {
  const id = Number(it[ID_KEY[lista]]);
  const base = id > 0 ? { [ID_KEY[lista]]: id } : {};

  if (lista === "familiares") {
    const conyuge = it.parentesco === "CONYUGE";
    return {
      ...base,
      nombre: txt(it.nombre),
      apellido: txt(it.apellido),
      parentesco: it.parentesco,
      cedula: txt(it.cedula) || null,
      fechaNacimiento: !conyuge ? aFechaInput(it.fechaNacimiento) || null : null,
      fechaUnion: conyuge ? aFechaInput(it.fechaUnion) || null : null,
    };
  }
  if (lista === "contactosEmergencia") {
    return {
      ...base,
      nombre: txt(it.nombre),
      apellido: txt(it.apellido),
      parentesco: txt(it.parentesco),
      telefono: txt(it.telefono),
      direccion: txt(it.direccion),
    };
  }
  const culminado = it.culminado !== false;
  return {
    ...base,
    nombreTitulo: txt(it.nombreTitulo),
    institucion: txt(it.institucion),
    culminado,
    fechaObtencion: culminado ? aFechaInput(it.fechaObtencion) || null : null,
  };
};

const estadoInicial = (u) => ({
  celularPersonal: u.celularPersonal || "",
  celularEmpresa: u.celularEmpresa || "",
  direccion: u.direccion || "",
  correoPersonal: u.correoPersonal || "",
  idEstadoCivil: u.idEstadoCivil ? String(u.idEstadoCivil) : "",
  familiares: (u.familiares || []).map((f) => ({
    ...f,
    cedula: f.cedula || "",
    fechaNacimiento: aFechaInput(f.fechaNacimiento),
    fechaUnion: aFechaInput(f.fechaUnion),
  })),
  contactosEmergencia: (u.contactosEmergencia || []).map((c) => ({ ...c })),
  titulos: (u.titulos || []).map((t) => ({
    ...t,
    fechaObtencion: aFechaInput(t.fechaObtencion),
  })),
  familiaresAEliminar: [],
  contactosEmergenciaAEliminar: [],
  titulosAEliminar: [],
});

// Campo de solo lectura (gris, con candado)
const CampoBloqueado = ({ etiqueta, valor }) => (
  <div className="col-md-4">
    <label className="form-label text-muted small mb-1">{etiqueta}</label>
    <div className="input-group">
      <span className="input-group-text bg-light text-muted">
        <i className="bi bi-lock-fill"></i>
      </span>
      <input
        type="text"
        className="form-control bg-light text-muted"
        value={valor || "—"}
        readOnly
        disabled
      />
    </div>
  </div>
);

function ActualizarMiInfoForm({ usuario, onEnviado }) {
  const fetchPerfil = useAuthStore((s) => s.fetchPerfil);
  const { data: catalogos } = useCatalogosFormulario();
  const estadosCiviles = catalogos?.estadosCiviles ?? [];
  const parentescos = catalogos?.opcionesFijas?.parentescosFamiliar ?? [];

  // Datos originales: no cambian mientras el formulario está abierto.
  const [original] = useState(() => estadoInicial(usuario));
  const [form, setForm] = useState(original);
  const [enviando, setEnviando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(
    usuario.urlImagenPerfil || usuario.fotoUrl || "",
  );

  // El id del estado civil puede venir solo como texto: se resuelve con el catálogo.
  const idEstadoCivilResuelto =
    form.idEstadoCivil ||
    String(
      estadosCiviles.find(
        (e) =>
          txt(e.nombreEstadoCivil || e.nombre).toLowerCase() ===
          txt(usuario.estadoCivil).toLowerCase(),
      )?.idEstadoCivil ?? "",
    );
  const idEstadoCivilOriginal =
    original.idEstadoCivil ||
    String(
      estadosCiviles.find(
        (e) =>
          txt(e.nombreEstadoCivil || e.nombre).toLowerCase() ===
          txt(usuario.estadoCivil).toLowerCase(),
      )?.idEstadoCivil ?? "",
    );

  const cambiarCampo = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Mismas firmas que usan las secciones de Familiares / Contactos / Títulos
  const handleItemChange = (lista, index, campoOEvento, valor) => {
    setForm((prev) => {
      const copia = [...prev[lista]];
      let campo, val;
      if (typeof campoOEvento === "object" && campoOEvento.target) {
        const { name, value, type, checked } = campoOEvento.target;
        campo = name;
        val = type === "checkbox" ? checked : value;
      } else {
        campo = campoOEvento;
        val = valor;
      }
      copia[index] = { ...copia[index], [campo]: val };
      return { ...prev, [lista]: copia };
    });
  };

  const handleAddItem = (lista, nuevo = {}) =>
    setForm((p) => ({ ...p, [lista]: [...p[lista], nuevo] }));

  const handleRemoveItem = (lista, index, idKey = null) =>
    setForm((prev) => {
      const item = prev[lista][index];
      const claveEliminar = `${lista}AEliminar`;
      let eliminar = prev[claveEliminar];
      if (idKey && item?.[idKey] && !eliminar.includes(item[idKey])) {
        eliminar = [...eliminar, item[idKey]];
      }
      return {
        ...prev,
        [lista]: prev[lista].filter((_, i) => i !== index),
        [claveEliminar]: eliminar,
      };
    });

  // Resalta en ámbar lo que el empleado ya modificó
  const cambiado = {
    celularPersonal: txt(form.celularPersonal) !== txt(original.celularPersonal),
    celularEmpresa: txt(form.celularEmpresa) !== txt(original.celularEmpresa),
    direccion: txt(form.direccion) !== txt(original.direccion),
    correoPersonal: txt(form.correoPersonal) !== txt(original.correoPersonal),
    idEstadoCivil: idEstadoCivilResuelto !== idEstadoCivilOriginal,
  };
  const ambar = (k) => (cambiado[k] ? " border-warning bg-warning-subtle" : "");

  // Solo lo que cambió
  const armarPayload = () => {
    const payload = {};

    ["celularPersonal", "celularEmpresa", "direccion", "correoPersonal"].forEach(
      (k) => {
        if (cambiado[k]) payload[k] = txt(form[k]);
      },
    );
    if (cambiado.idEstadoCivil && idEstadoCivilResuelto) {
      payload.idEstadoCivil = Number(idEstadoCivilResuelto);
    }

    Object.keys(ID_KEY).forEach((lista) => {
      const originales = new Map(
        original[lista].map((it) => [Number(it[ID_KEY[lista]]), firma(lista, it)]),
      );
      const items = form[lista].filter((it) => {
        const id = Number(it[ID_KEY[lista]]);
        if (id > 0) return originales.get(id) !== firma(lista, it); // editado
        return !estaVacio(lista, it); // nuevo
      });
      if (items.length) payload[lista] = items.map((it) => armarItem(lista, it));

      const eliminar = form[`${lista}AEliminar`];
      if (eliminar.length) payload[`${lista}AEliminar`] = eliminar;
    });

    return payload;
  };

  // Confirma "sin cambios" en el backend (cierra la ventana y queda registrado).
  const registrarAlDia = async () => {
    try {
      setEnviando(true);
      const r = await usuariosService.confirmarSinCambios();
      await Swal.fire({
        icon: "success",
        title: "¡Gracias!",
        text: r?.mensaje || "Registramos que tu información está al día.",
        confirmButtonText: "Entendido",
      });
      await onEnviado?.();
    } catch (err) {
      toastError(err.message || "No se pudo registrar tu confirmación");
    } finally {
      setEnviando(false);
    }
  };

  const confirmarAlDia = async () => {
    const hayCambios = Object.keys(armarPayload()).length > 0;
    const r = await Swal.fire({
      icon: "question",
      title: "¿Tu información está al día?",
      text: hayCambios
        ? "Tienes cambios sin enviar: si confirmas que está al día, se descartarán."
        : "RRHH sabrá que revisaste tu información y que no tienes nada que cambiar.",
      showCancelButton: true,
      confirmButtonText: "Sí, está al día",
      cancelButtonText: "Cancelar",
    });
    if (r.isConfirmed) await registrarAlDia();
  };

  const enviar = async () => {
    const payload = armarPayload();

    // Sin cambios: no se llama a enviar, pero se ofrece confirmar que está al día
    // para que RRHH sepa que respondió y se levante el bloqueo.
    if (Object.keys(payload).length === 0) {
      const r = await Swal.fire({
        icon: "info",
        title: "No hiciste ningún cambio",
        text: "Si tu información ya está al día, puedes confirmarlo y RRHH lo sabrá.",
        showCancelButton: true,
        confirmButtonText: "Mi información está al día",
        cancelButtonText: "Seguir editando",
      });
      if (r.isConfirmed) await registrarAlDia();
      return;
    }

    const confirmacion = await Swal.fire({
      icon: "question",
      title: "¿Enviar tus cambios?",
      text: "Tus cambios serán revisados por RRHH antes de aplicarse.",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Revisar de nuevo",
    });
    if (!confirmacion.isConfirmed) return;

    try {
      setEnviando(true);
      const r = await usuariosService.enviarMiPerfil(payload);
      await Swal.fire({
        icon: "success",
        title: "Solicitud enviada",
        text:
          r?.mensaje ||
          "RRHH revisará tus cambios y te avisará cuando estén resueltos.",
        confirmButtonText: "Entendido",
      });
      await onEnviado?.();
    } catch (err) {
      toastError(err.message || "No se pudo enviar la solicitud");
    } finally {
      setEnviando(false);
    }
  };

  // La foto NO pasa por revisión: se sube al instante.
  const cambiarFoto = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    try {
      setSubiendoFoto(true);
      await usuariosService.subirFotoPerfil(usuario.idUsuario, archivo);
      setFotoUrl(URL.createObjectURL(archivo));
      await fetchPerfil();
      toastExito("Foto actualizada");
    } catch (err) {
      toastError(err.message || "No se pudo subir la foto");
    } finally {
      setSubiendoFoto(false);
    }
  };

  const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
  const iniciales = (usuario.nombre || "?")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div>
      {/* Foto (instantánea) */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body d-flex align-items-center gap-3">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt="Foto de perfil"
              className="rounded-circle object-fit-cover border shadow-sm"
              style={{ width: "64px", height: "64px" }}
            />
          ) : (
            <div
              className="rounded-circle bg-brand-soft text-brand d-flex align-items-center justify-content-center fw-bold"
              style={{ width: "64px", height: "64px" }}
            >
              {iniciales}
            </div>
          )}
          <div>
            <label
              className={`btn btn-sm btn-outline-secondary mb-1 ${
                subiendoFoto ? "disabled" : ""
              }`}
            >
              <i className="bi bi-camera me-1"></i>
              {subiendoFoto ? "Subiendo..." : "Cambiar foto"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={cambiarFoto}
              />
            </label>
            <div className="small text-muted">
              La foto se actualiza al instante, no necesita aprobación.
            </div>
          </div>
        </div>
      </div>

      {/* Solo lectura */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <h6 className="fw-bold text-muted mb-1">
            <i className="bi bi-lock-fill me-2"></i>Datos que no puedes modificar
          </h6>
          <p className="small text-muted mb-3">
            Si alguno es incorrecto, comunícate con RRHH.
          </p>
          <div className="row g-3">
            <CampoBloqueado etiqueta="Nombre" valor={nombreCompleto} />
            <CampoBloqueado etiqueta="Cédula" valor={usuario.cedula} />
            <CampoBloqueado etiqueta="Cargo" valor={usuario.cargo} />
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <h6 className="fw-bold mb-3">
            <i className="bi bi-telephone me-2 text-brand"></i>Contacto
          </h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Celular personal</label>
              <input
                type="text"
                name="celularPersonal"
                className={`form-control${ambar("celularPersonal")}`}
                value={form.celularPersonal}
                onChange={cambiarCampo}
                inputMode="tel"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Celular de empresa</label>
              <input
                type="text"
                name="celularEmpresa"
                className={`form-control${ambar("celularEmpresa")}`}
                value={form.celularEmpresa}
                onChange={cambiarCampo}
                inputMode="tel"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Correo personal</label>
              <input
                type="email"
                name="correoPersonal"
                className={`form-control${ambar("correoPersonal")}`}
                value={form.correoPersonal}
                onChange={cambiarCampo}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Estado civil</label>
              <select
                name="idEstadoCivil"
                className={`form-select${ambar("idEstadoCivil")}`}
                value={idEstadoCivilResuelto}
                onChange={cambiarCampo}
              >
                <option value="">Seleccione...</option>
                {estadosCiviles.map((e) => (
                  <option key={e.idEstadoCivil} value={e.idEstadoCivil}>
                    {e.nombreEstadoCivil || e.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                name="direccion"
                className={`form-control${ambar("direccion")}`}
                value={form.direccion}
                onChange={cambiarCampo}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Familiares */}
      <h6 className="fw-bold mt-4 mb-2">
        <i className="bi bi-people me-2 text-brand"></i>Familiares
      </h6>
      <Familiares
        familiares={form.familiares}
        parentescos={parentescos}
        handleItemChange={handleItemChange}
        handleAddItem={handleAddItem}
        handleRemoveItem={handleRemoveItem}
      />

      {/* Contactos de emergencia */}
      <h6 className="fw-bold mt-4 mb-2">
        <i className="bi bi-telephone-forward me-2 text-brand"></i>
        Contactos de emergencia
      </h6>
      <ContactosEmergencia
        contactos={form.contactosEmergencia}
        handleItemChange={handleItemChange}
        handleAddItem={handleAddItem}
        handleRemoveItem={handleRemoveItem}
      />

      {/* Títulos */}
      <h6 className="fw-bold mt-4 mb-2">
        <i className="bi bi-mortarboard me-2 text-brand"></i>Títulos
      </h6>
      <div className="card border-0 bg-white p-3 shadow-sm rounded-3">
        <Titulos
          titulos={form.titulos}
          handleItemChange={handleItemChange}
          handleAddItem={handleAddItem}
          handleRemoveItem={handleRemoveItem}
        />
      </div>

      <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary px-4"
          disabled={enviando}
          onClick={confirmarAlDia}
        >
          <i className="bi bi-check2-circle me-2"></i>Mi información está al día
        </button>
        <button
          type="button"
          className="btn btn-brand px-4"
          disabled={enviando}
          onClick={enviar}
        >
          {enviando ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Enviando...
            </>
          ) : (
            <>
              <i className="bi bi-send me-2"></i>Enviar a RRHH
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ActualizarMiInfoForm;
