import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useUsuarioForm } from "../../hooks/useUsuarioForm";
import DatosPersonales from "./secciones/DatosPersonales";
import DatosLaborales from "./secciones/DatosLaborales";
import Familiares from "./secciones/Familiares";
import ContactosEmergencia from "./secciones/ContactosEmergencia";
import DatosBancarios from "./secciones/DatosBancarios";
import Titulos from "./secciones/Titulos";
import {
  getAreas,
  getCargos,
  getBancos,
  getCiudades,
  getEtnias,
  getEstadosCiviles,
  getGeneros,
  getTiposSangre,
} from "../../services/catalogosService.js";
import "./UsuarioFormCard.css";

// <input type="date"> solo muestra valores "yyyy-MM-dd". Si el backend manda
// "2015-03-04T00:00:00", el input queda vacío aunque el dato exista.
const aFechaInput = (valor) => (valor ? String(valor).split("T")[0] : "");

const normalizarTexto = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase();

// Si el perfil trae el nombre ("etnia": "Mestizo") pero no el id, se busca
// el id en el catálogo para que el select no quede en "Seleccione...".
const CAMPOS_ID_DESDE_NOMBRE = [
  {
    campo: "idGenero",
    texto: "genero",
    catalogo: "generos",
    nombres: ["nombreGenero", "nombre"],
  },
  {
    campo: "idEstadoCivil",
    texto: "estadoCivil",
    catalogo: "estadosCiviles",
    nombres: ["nombreEstadoCivil", "nombre"],
  },
  {
    campo: "idEtnia",
    texto: "etnia",
    catalogo: "etnias",
    nombres: ["nombreEtnia", "nombre"],
  },
  {
    campo: "idTipoSangre",
    texto: "tipoSangre",
    catalogo: "tiposSangre",
    nombres: ["nombreTipoSangre", "nombre"],
  },
];

// Campos que el propio empleado NO puede tocar cuando entra en modo
// autogestión (RRHH ya los definió). Solo aplica dentro de Datos Personales;
// Datos Laborales, Bancarios y Títulos se ocultan por completo en ese modo.
const CAMPOS_SENSIBLES_AUTOGESTION = [
  "nombre",
  "apellido",
  "cedula",
  "fechaNacimiento",
  "idGenero",
  "idEstadoCivil",
  "idEtnia",
  "idTipoSangre",
];

const UsuarioFormCard = ({
  usuarioOriginal = null,
  usuariosDisponibles = [],
  onGuardar,
  onCancelar,
  // true = vista de autogestión del empleado (activada por RRHH vía
  // puedeActualizarPerfil). Solo deja editar contacto, familiares y
  // contactos de emergencia; oculta laborales/bancarios/títulos y bloquea
  // los campos sensibles de Datos Personales.
  modoAutogestion = false,
}) => {
  const esEdicion = Boolean(usuarioOriginal?.idUsuario);
  const fetchPerfil = useAuthStore((state) => state.fetchPerfil);

  const {
    formData,
    setFormData,
    handleChange,
    handleFotoChange,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
  } = useUsuarioForm();

  const [catalogos, setCatalogos] = useState({
    areas: [],
    cargos: [],
    bancos: [],
    ciudades: [],
    etnias: [],
    estadosCiviles: [],
    generos: [],
    tiposSangre: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Carga de catálogos
  useEffect(() => {
    const cargarCatalogos = async () => {
      const fetchSeguro = async (fn) => {
        try {
          const res = await fn();
          return res || [];
        } catch (err) {
          console.warn("Error al obtener catálogo:", err);
          return [];
        }
      };

      const [
        resAreas,
        resCargos,
        resBancos,
        resCiudades,
        resEtnias,
        resEstadosCiviles,
        resGeneros,
        resTiposSangre,
      ] = await Promise.all([
        fetchSeguro(getAreas),
        fetchSeguro(getCargos),
        fetchSeguro(getBancos),
        fetchSeguro(getCiudades),
        fetchSeguro(getEtnias),
        fetchSeguro(getEstadosCiviles),
        fetchSeguro(getGeneros),
        fetchSeguro(getTiposSangre),
      ]);

      setCatalogos({
        areas: resAreas,
        cargos: resCargos,
        bancos: resBancos,
        ciudades: resCiudades,
        etnias: resEtnias,
        estadosCiviles: resEstadosCiviles,
        generos: resGeneros,
        tiposSangre: resTiposSangre,
      });
    };

    cargarCatalogos();
  }, []);

  // Cargar datos originales si es edición
  useEffect(() => {
    if (usuarioOriginal) {
      const initialData = {
        nombre: usuarioOriginal.nombre || "",
        apellido: usuarioOriginal.apellido || "",
        cedula: usuarioOriginal.cedula || "",
        correoPersonal: usuarioOriginal.correoPersonal || "",
        correoEmpresa: usuarioOriginal.correoEmpresa || "",
        celularPersonal: usuarioOriginal.celularPersonal || "",
        celularEmpresa: usuarioOriginal.celularEmpresa || "",
        direccion: usuarioOriginal.direccion || "",
        fechaNacimiento: usuarioOriginal.fechaNacimiento
          ? usuarioOriginal.fechaNacimiento.split("T")[0]
          : "",
        fechaIngreso: usuarioOriginal.fechaIngreso
          ? usuarioOriginal.fechaIngreso.split("T")[0]
          : "",
        idGenero: usuarioOriginal.idGenero || "",
        idEstadoCivil: usuarioOriginal.idEstadoCivil || "",
        idEtnia: usuarioOriginal.idEtnia || "",
        idTipoSangre: usuarioOriginal.idTipoSangre || "",
        idArea: usuarioOriginal.idArea || "",
        idCargo: usuarioOriginal.idCargo || "",
        idCiudad: usuarioOriginal.idCiudad || "",
        idJefeDirecto: usuarioOriginal.idJefeDirecto || "",
        foto: usuarioOriginal.urlImagenPerfil || "",
        tieneVacaciones: usuarioOriginal.tieneVacaciones ?? true,
        diasVacacionesAsignados: usuarioOriginal.diasVacacionesAsignados ?? 15,
        titulos: (usuarioOriginal.titulos || []).map((t) => ({
          ...t,
          fechaObtencion: aFechaInput(t.fechaObtencion),
        })),
        familiares: (usuarioOriginal.familiares || []).map((f) => ({
          ...f,
          fechaNacimiento: aFechaInput(f.fechaNacimiento),
        })),
        contactosEmergencia: usuarioOriginal.contactosEmergencia || [],
        datosBancarios: usuarioOriginal.datosBancarios || [],
        titulosAEliminar: [],
        familiaresAEliminar: [],
        contactosEmergenciaAEliminar: [],
        datosBancariosAEliminar: [],
      };
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [usuarioOriginal, setFormData]);

  // Completa ids que el perfil no trajo (solo si vienen vacíos en el form).
  useEffect(() => {
    if (!usuarioOriginal) return;
    setFormData((prev) => {
      const cambios = {};
      CAMPOS_ID_DESDE_NOMBRE.forEach(({ campo, texto, catalogo, nombres }) => {
        if (prev[campo]) return;
        const nombre = normalizarTexto(usuarioOriginal[texto]);
        if (!nombre) return;
        const item = (catalogos[catalogo] || []).find((c) =>
          nombres.some((k) => normalizarTexto(c[k]) === nombre),
        );
        if (item && item[campo] !== undefined) cambios[campo] = item[campo];
      });
      return Object.keys(cambios).length ? { ...prev, ...cambios } : prev;
    });
  }, [catalogos, usuarioOriginal, setFormData]);

  // VALIDACIONES EN TIEMPO REAL PARA ESTADO DE CADA SECCIÓN
  const esDatosPersonalesValido = Boolean(
    formData.nombre?.trim() &&
    formData.apellido?.trim() &&
    formData.cedula?.trim(),
  );

  const esDatosLaboralesValido = Boolean(
    formData.idArea && formData.idCargo && formData.fechaIngreso,
  );

  const esDatosBancariosValido = formData.datosBancarios.length > 0;
  const esTitulosValido = formData.titulos.length > 0;
  const esContactosValido = formData.contactosEmergencia.length > 0;
  const esFamiliaresValido = formData.familiares.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !esDatosPersonalesValido ||
      (!modoAutogestion && !esDatosLaboralesValido)
    ) {
      setError(
        "Por favor complete todos los campos obligatorios en Datos Personales y Datos Laborales.",
      );
      return;
    }

    setLoading(true);

    try {
      // En modo autogestión SOLO viajan campos no sensibles: contacto
      // personal, familiares y contactos de emergencia. Nada de identidad
      // (nombre/apellido/cédula/fecha nacimiento/género/etc.), nada de
      // laborales, nada de bancarios ni títulos, aunque esos valores sigan
      // presentes (sin cambios) en formData.
      //
      // IMPORTANTE: esto es una restricción de FRONTEND. Si el endpoint que
      // recibe este payload es el mismo que usa RRHH para editar a otros
      // usuarios, confirmar con backend que:
      //   a) acepta un payload parcial sin romper los campos no enviados, y
      //   b) igual valida ahí que el propio usuario no pueda mandar cambios
      //      a campos sensibles (por si alguien arma el request a mano).
      const payloadBase = modoAutogestion
        ? {
            correoPersonal: formData.correoPersonal || null,
            celularPersonal: formData.celularPersonal || null,
            direccion: formData.direccion || null,
          }
        : {
            nombre: formData.nombre || null,
            apellido: formData.apellido || null,
            cedula: formData.cedula || null,
            correoEmpresa: formData.correoEmpresa || null,
            correoPersonal: formData.correoPersonal || null,
            celularEmpresa: formData.celularEmpresa || null,
            celularPersonal: formData.celularPersonal || null,
            direccion: formData.direccion || null,
            fechaNacimiento: formData.fechaNacimiento
              ? new Date(formData.fechaNacimiento).toISOString()
              : null,
            fechaIngreso: formData.fechaIngreso
              ? new Date(formData.fechaIngreso).toISOString()
              : null,
            idGenero: formData.idGenero ? Number(formData.idGenero) : null,
            idEstadoCivil: formData.idEstadoCivil
              ? Number(formData.idEstadoCivil)
              : null,
            idEtnia: formData.idEtnia ? Number(formData.idEtnia) : null,
            idTipoSangre: formData.idTipoSangre
              ? Number(formData.idTipoSangre)
              : null,
            idArea: formData.idArea ? Number(formData.idArea) : null,
            idCargo: formData.idCargo ? Number(formData.idCargo) : null,
            idCiudad: formData.idCiudad ? Number(formData.idCiudad) : null,
            idJefeDirecto: formData.idJefeDirecto
              ? Number(formData.idJefeDirecto)
              : null,
            tieneVacaciones: formData.tieneVacaciones,
            diasVacacionesAsignados: formData.tieneVacaciones
              ? Number(formData.diasVacacionesAsignados || 15)
              : null,
          };

      const payload = esEdicion
        ? {
            ...payloadBase,
            familiares: formData.familiares.map((f) => ({
              idFamiliar: f.idFamiliar || null,
              nombre: f.nombre,
              apellido: f.apellido || null,
              parentesco: f.parentesco || null,
              fechaNacimiento: f.fechaNacimiento
                ? new Date(f.fechaNacimiento).toISOString()
                : null,
            })),
            contactosEmergencia: formData.contactosEmergencia.map((c) => ({
              idContacto: c.idContacto || null,
              nombre: c.nombre,
              apellido: c.apellido || null,
              parentesco: c.parentesco || null,
              telefono: c.telefono || null,
              direccion: c.direccion || null,
            })),
            familiaresAEliminar: formData.familiaresAEliminar,
            contactosEmergenciaAEliminar: formData.contactosEmergenciaAEliminar,
            // Títulos y datos bancarios no se tocan en modo autogestión.
            ...(!modoAutogestion && {
              titulos: formData.titulos.map((t) => ({
                idTitulo: t.idTitulo || null,
                nombreTitulo: t.nombreTitulo,
                institucion: t.institucion || null,
                fechaObtencion: t.fechaObtencion
                  ? new Date(t.fechaObtencion).toISOString()
                  : null,
              })),
              datosBancarios: formData.datosBancarios.map((b) => ({
                idDatoBancario: b.idDatoBancario || null,
                idBanco: Number(b.idBanco),
                tipoCuenta: b.tipoCuenta,
                numeroCuenta: b.numeroCuenta,
              })),
              titulosAEliminar: formData.titulosAEliminar,
              datosBancariosAEliminar: formData.datosBancariosAEliminar,
            }),
          }
        : {
            ...payloadBase,
            familiares: formData.familiares.map((f) => ({
              nombre: f.nombre,
              apellido: f.apellido || null,
              parentesco: f.parentesco || null,
              fechaNacimiento: f.fechaNacimiento
                ? new Date(f.fechaNacimiento).toISOString()
                : null,
            })),
            titulos: formData.titulos.map((t) => ({
              nombreTitulo: t.nombreTitulo,
              institucion: t.institucion || null,
              fechaObtencion: t.fechaObtencion
                ? new Date(t.fechaObtencion).toISOString()
                : null,
            })),
            contactosEmergencia: formData.contactosEmergencia.map((c) => ({
              nombre: c.nombre,
              apellido: c.apellido || null,
              parentesco: c.parentesco || null,
              telefono: c.telefono || null,
              direccion: c.direccion || null,
            })),
            datosBancarios: formData.datosBancarios.map((b) => ({
              idBanco: Number(b.idBanco),
              tipoCuenta: b.tipoCuenta,
              numeroCuenta: b.numeroCuenta,
            })),
          };

      await onGuardar(
        esEdicion ? usuarioOriginal.idUsuario : null,
        payload,
        formData.fotoArchivo || null,
      );

      // El backend debe apagar puedeActualizarPerfil al recibir este
      // guardado. Volvemos a pedir el perfil para reflejarlo de inmediato y
      // que AppLayout deje de bloquear la navegación.
      if (modoAutogestion) {
        await fetchPerfil();
      }
    } catch (err) {
      setError(
        err.message ||
          (esEdicion
            ? "Error al actualizar la información del usuario"
            : "Error al crear el usuario"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-usuario-wrapper">
      <form onSubmit={handleSubmit}>
        {/* ENCABEZADO */}
        <div className="form-header-card mb-4">
          <h4 className="fw-bold m-0 d-flex align-items-center gap-2">
            <i
              className={`bi ${
                esEdicion
                  ? "bi-person-gear text-warning"
                  : "bi-person-plus-fill"
              }`}
            ></i>
            {esEdicion
              ? "Editar Registro de Usuario"
              : "Crear Nuevo Registro de Usuario"}
          </h4>
          <span className="text-muted small">
            Despliega o colapse cada sección. Los indicadores visuales muestran
            el estado de llenado.
          </span>
        </div>

        {error && (
          <div className="alert alert-danger shadow-sm mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {/* CONTENEDOR TIPO ACORDEÓN */}
        <div className="accordion accordion-custom mb-5" id="accordionUsuario">
          {/* 1. DATOS PERSONALES */}
          <div className="accordion-item shadow-sm mb-3">
            <h2 className="accordion-header" id="headingPersonales">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapsePersonales"
                aria-expanded="true"
                aria-controls="collapsePersonales"
              >
                <div className="d-flex align-items-center justify-content-between w-100 me-3">
                  <span className="fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-person-vcard text-primary"></i>
                    Datos Personales
                  </span>
                  <span
                    className={`badge rounded-pill d-flex align-items-center gap-1 ${
                      esDatosPersonalesValido
                        ? "bg-success-subtle text-success border border-success"
                        : "bg-warning-subtle text-warning-emphasis border border-warning"
                    }`}
                  >
                    <i
                      className={`bi ${
                        esDatosPersonalesValido
                          ? "bi-check-circle-fill"
                          : "bi-exclamation-circle-fill"
                      }`}
                    ></i>
                    {esDatosPersonalesValido ? "Completado" : "Requerido"}
                  </span>
                </div>
              </button>
            </h2>
            <div
              id="collapsePersonales"
              className="accordion-collapse collapse show"
              aria-labelledby="headingPersonales"
              data-bs-parent="#accordionUsuario"
            >
              <div className="accordion-body">
                <DatosPersonales
                  formData={formData}
                  handleChange={handleChange}
                  handleFotoChange={handleFotoChange}
                  catalogos={catalogos}
                  camposSoloLectura={
                    modoAutogestion ? CAMPOS_SENSIBLES_AUTOGESTION : []
                  }
                />
              </div>
            </div>
          </div>

          {/* 2. DATOS LABORALES (oculto en autogestión: el empleado no puede tocarlos) */}
          {!modoAutogestion && (
            <div className="accordion-item shadow-sm mb-3">
              <h2 className="accordion-header" id="headingLaborales">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseLaborales"
                  aria-expanded="false"
                  aria-controls="collapseLaborales"
                >
                  <div className="d-flex align-items-center justify-content-between w-100 me-3">
                    <span className="fw-bold d-flex align-items-center gap-2">
                      <i className="bi bi-briefcase text-primary"></i>
                      Datos Laborales
                    </span>
                    <span
                      className={`badge rounded-pill d-flex align-items-center gap-1 ${
                        esDatosLaboralesValido
                          ? "bg-success-subtle text-success border border-success"
                          : "bg-warning-subtle text-warning-emphasis border border-warning"
                      }`}
                    >
                      <i
                        className={`bi ${
                          esDatosLaboralesValido
                            ? "bi-check-circle-fill"
                            : "bi-exclamation-circle-fill"
                        }`}
                      ></i>
                      {esDatosLaboralesValido ? "Completado" : "Requerido"}
                    </span>
                  </div>
                </button>
              </h2>
              <div
                id="collapseLaborales"
                className="accordion-collapse collapse"
                aria-labelledby="headingLaborales"
                data-bs-parent="#accordionUsuario"
              >
                <div className="accordion-body">
                  <DatosLaborales
                    formData={formData}
                    handleChange={handleChange}
                    catalogos={catalogos}
                    usuariosDisponibles={usuariosDisponibles}
                    idUsuarioActual={usuarioOriginal?.idUsuario}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. INFORMACIÓN BANCARIA (oculta en autogestión) */}
          {!modoAutogestion && (
            <div className="accordion-item shadow-sm mb-3">
              <h2 className="accordion-header" id="headingBancarios">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseBancarios"
                  aria-expanded="false"
                  aria-controls="collapseBancarios"
                >
                  <div className="d-flex align-items-center justify-content-between w-100 me-3">
                    <span className="fw-bold d-flex align-items-center gap-2">
                      <i className="bi bi-credit-card-2-front text-primary"></i>
                      Información Bancaria
                    </span>
                    <span
                      className={`badge rounded-pill d-flex align-items-center gap-1 ${
                        esDatosBancariosValido
                          ? "bg-success-subtle text-success border border-success"
                          : "bg-light text-secondary border"
                      }`}
                    >
                      <i
                        className={`bi ${
                          esDatosBancariosValido
                            ? "bi-check-circle-fill"
                            : "bi-dash-circle"
                        }`}
                      ></i>
                      {esDatosBancariosValido
                        ? `${formData.datosBancarios.length} Cuenta(s)`
                        : "Opcional / Sin registros"}
                    </span>
                  </div>
                </button>
              </h2>
              <div
                id="collapseBancarios"
                className="accordion-collapse collapse"
                aria-labelledby="headingBancarios"
                data-bs-parent="#accordionUsuario"
              >
                <div className="accordion-body">
                  <DatosBancarios
                    cuentas={formData.datosBancarios}
                    handleItemChange={handleItemChange}
                    handleAddItem={handleAddItem}
                    handleRemoveItem={handleRemoveItem}
                    catalogos={catalogos}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. TÍTULOS ACADÉMICOS (ocultos en autogestión) */}
          {!modoAutogestion && (
            <div className="accordion-item shadow-sm mb-3">
              <h2 className="accordion-header" id="headingTitulos">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseTitulos"
                  aria-expanded="false"
                  aria-controls="collapseTitulos"
                >
                  <div className="d-flex align-items-center justify-content-between w-100 me-3">
                    <span className="fw-bold d-flex align-items-center gap-2">
                      <i className="bi bi-mortarboard text-primary"></i>
                      Títulos Académicos
                    </span>
                    <span
                      className={`badge rounded-pill d-flex align-items-center gap-1 ${
                        esTitulosValido
                          ? "bg-success-subtle text-success border border-success"
                          : "bg-light text-secondary border"
                      }`}
                    >
                      <i
                        className={`bi ${
                          esTitulosValido
                            ? "bi-check-circle-fill"
                            : "bi-dash-circle"
                        }`}
                      ></i>
                      {esTitulosValido
                        ? `${formData.titulos.length} Título(s)`
                        : "Opcional / Sin registros"}
                    </span>
                  </div>
                </button>
              </h2>
              <div
                id="collapseTitulos"
                className="accordion-collapse collapse"
                aria-labelledby="headingTitulos"
                data-bs-parent="#accordionUsuario"
              >
                <div className="accordion-body">
                  <Titulos
                    titulos={formData.titulos}
                    handleItemChange={handleItemChange}
                    handleAddItem={handleAddItem}
                    handleRemoveItem={handleRemoveItem}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. CONTACTOS DE EMERGENCIA */}
          <div className="accordion-item shadow-sm mb-3">
            <h2 className="accordion-header" id="headingContactos">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseContactos"
                aria-expanded="false"
                aria-controls="collapseContactos"
              >
                <div className="d-flex align-items-center justify-content-between w-100 me-3">
                  <span className="fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-telephone-plus text-primary"></i>
                    Contactos de Emergencia
                  </span>
                  <span
                    className={`badge rounded-pill d-flex align-items-center gap-1 ${
                      esContactosValido
                        ? "bg-success-subtle text-success border border-success"
                        : "bg-light text-secondary border"
                    }`}
                  >
                    <i
                      className={`bi ${
                        esContactosValido
                          ? "bi-check-circle-fill"
                          : "bi-dash-circle"
                      }`}
                    ></i>
                    {esContactosValido
                      ? `${formData.contactosEmergencia.length} Contacto(s)`
                      : "Opcional / Sin registros"}
                  </span>
                </div>
              </button>
            </h2>
            <div
              id="collapseContactos"
              className="accordion-collapse collapse"
              aria-labelledby="headingContactos"
              data-bs-parent="#accordionUsuario"
            >
              <div className="accordion-body">
                <ContactosEmergencia
                  contactos={formData.contactosEmergencia}
                  handleItemChange={handleItemChange}
                  handleAddItem={handleAddItem}
                  handleRemoveItem={handleRemoveItem}
                />
              </div>
            </div>
          </div>

          {/* 6. FAMILIARES / HIJOS */}
          <div className="accordion-item shadow-sm mb-3">
            <h2 className="accordion-header" id="headingFamiliares">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseFamiliares"
                aria-expanded="false"
                aria-controls="collapseFamiliares"
              >
                <div className="d-flex align-items-center justify-content-between w-100 me-3">
                  <span className="fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-people text-primary"></i>
                    Familiares / Hijos
                  </span>
                  <span
                    className={`badge rounded-pill d-flex align-items-center gap-1 ${
                      esFamiliaresValido
                        ? "bg-success-subtle text-success border border-success"
                        : "bg-light text-secondary border"
                    }`}
                  >
                    <i
                      className={`bi ${
                        esFamiliaresValido
                          ? "bi-check-circle-fill"
                          : "bi-dash-circle"
                      }`}
                    ></i>
                    {esFamiliaresValido
                      ? `${formData.familiares.length} Familiar(es)`
                      : "Opcional / Sin registros"}
                  </span>
                </div>
              </button>
            </h2>
            <div
              id="collapseFamiliares"
              className="accordion-collapse collapse"
              aria-labelledby="headingFamiliares"
              data-bs-parent="#accordionUsuario"
            >
              <div className="accordion-body">
                <Familiares
                  familiares={formData.familiares}
                  handleItemChange={handleItemChange}
                  handleAddItem={handleAddItem}
                  handleRemoveItem={handleRemoveItem}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ÚNICO BOTÓN DE GUARDAR FIJO ABAJO */}
        <div className="fixed-bottom-bar d-flex justify-content-end align-items-center gap-3">
          {onCancelar && (
            <button
              type="button"
              className="btn btn-hp-secondary px-4"
              onClick={onCancelar}
              disabled={loading}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="btn btn-hp-primary px-4 shadow-sm d-flex align-items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                {esEdicion ? "Guardando..." : "Creando..."}
              </>
            ) : (
              <>
                <i className="bi bi-floppy-fill"></i>
                {esEdicion ? "Guardar Cambios" : "Guardar Usuario Completo"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UsuarioFormCard;
