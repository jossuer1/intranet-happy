import React, { useEffect, useState } from "react";
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
} from "../../services/catalogosService.js";

const UsuarioFormCard = ({ usuarioOriginal = null, onGuardar, onCancelar }) => {
  const esEdicion = Boolean(usuarioOriginal?.idUsuario);

  // Wizard paso a paso: solo aplica en modo creación.
  // En edición se muestra el formulario completo en una sola página.
  const PASOS_WIZARD = [
    { numero: 1, titulo: "Personal", icono: "bi-person" },
    { numero: 2, titulo: "Laboral", icono: "bi-briefcase" },
    { numero: 3, titulo: "Familia", icono: "bi-house-heart" },
    { numero: 4, titulo: "Banco", icono: "bi-bank" },
    { numero: 5, titulo: "Títulos", icono: "bi-journal-bookmark" },
  ];
  const [step, setStep] = useState(1);
  const handleNext = () => setStep((s) => Math.min(s + 1, PASOS_WIZARD.length));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  // Evita que Enter en un input dispare el submit antes del último paso del wizard
  const handleFormKeyDown = (e) => {
    if (!esEdicion && e.key === "Enter" && step < PASOS_WIZARD.length) {
      e.preventDefault();
    }
  };

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
      ] = await Promise.all([
        fetchSeguro(getAreas),
        fetchSeguro(getCargos),
        fetchSeguro(getBancos),
        fetchSeguro(getCiudades),
        fetchSeguro(getEtnias),
        fetchSeguro(getEstadosCiviles),
        fetchSeguro(getGeneros),
      ]);

      setCatalogos({
        areas: resAreas,
        cargos: resCargos,
        bancos: resBancos,
        ciudades: resCiudades,
        etnias: resEtnias,
        estadosCiviles: resEstadosCiviles,
        generos: resGeneros,
      });
    };

    cargarCatalogos();
  }, []);

  // Si es edición, precargar los datos del usuario original.
  // Si es creación, no hay nada que precargar (el hook ya arranca vacío).
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
        idArea: usuarioOriginal.idArea || "",
        idCargo: usuarioOriginal.idCargo || "",
        idCiudad: usuarioOriginal.idCiudad || "",
        // El backend expone la foto guardada como urlImagenPerfil (PerfilDto)
        foto: usuarioOriginal.urlImagenPerfil || "",
        tieneVacaciones: usuarioOriginal.tieneVacaciones ?? true,
        diasVacacionesAsignados: usuarioOriginal.diasVacacionesAsignados ?? 15,
        titulos: usuarioOriginal.titulos || [],
        familiares: usuarioOriginal.familiares || [],
        contactosEmergencia: usuarioOriginal.contactosEmergencia || [],
        datosBancarios: usuarioOriginal.datosBancarios || [],
        // Listas de eliminación: solo tienen sentido en edición
        titulosAEliminar: [],
        familiaresAEliminar: [],
        contactosEmergenciaAEliminar: [],
        datosBancariosAEliminar: [],
      };
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [usuarioOriginal, setFormData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payloadBase = {
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
        idArea: formData.idArea ? Number(formData.idArea) : null,
        idCargo: formData.idCargo ? Number(formData.idCargo) : null,
        idCiudad: formData.idCiudad ? Number(formData.idCiudad) : null,
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
            titulos: formData.titulos.map((t) => ({
              idTitulo: t.idTitulo || null,
              nombreTitulo: t.nombreTitulo,
              institucion: t.institucion || null,
              fechaObtencion: t.fechaObtencion
                ? new Date(t.fechaObtencion).toISOString()
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
            datosBancarios: formData.datosBancarios.map((b) => ({
              idDatoBancario: b.idDatoBancario || null,
              idBanco: Number(b.idBanco),
              tipoCuenta: b.tipoCuenta,
              numeroCuenta: b.numeroCuenta,
            })),
            titulosAEliminar: formData.titulosAEliminar,
            familiaresAEliminar: formData.familiaresAEliminar,
            contactosEmergenciaAEliminar: formData.contactosEmergenciaAEliminar,
            datosBancariosAEliminar: formData.datosBancariosAEliminar,
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
    <div className="card shadow-sm border-0 rounded-3">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
        <h5 className="card-title mb-0 fw-bold">
          <i
            className={`bi ${esEdicion ? "bi-person-gear" : "bi-person-plus"} me-2`}
          ></i>
          {esEdicion ? "Editar Ficha de Usuario" : "Crear Nuevo Usuario"}
        </h5>
        {onCancelar && (
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onCancelar}
            aria-label="Cerrar"
          ></button>
        )}
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
        <div className="card-body p-4 bg-light">
          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Barra de progreso del wizard: solo en creación */}
          {!esEdicion && (
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                {PASOS_WIZARD.map((paso) => {
                  const esCompletado = step > paso.numero;
                  const esActual = step === paso.numero;
                  return (
                    <span
                      key={paso.numero}
                      className={`fw-bold d-inline-flex align-items-center gap-1 ${
                        esActual || esCompletado
                          ? "text-primary"
                          : "text-muted opacity-75"
                      }`}
                    >
                      <i
                        className={`bi ${
                          esCompletado
                            ? "bi-check-circle-fill text-success"
                            : esActual
                              ? `${paso.icono}-fill text-primary`
                              : paso.icono
                        }`}
                      ></i>
                      <span className="small">
                        {paso.numero}. {paso.titulo}
                      </span>
                    </span>
                  );
                })}
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <div
                  className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${(step / PASOS_WIZARD.length) * 100}%` }}
                  aria-valuenow={step}
                  aria-valuemin={1}
                  aria-valuemax={PASOS_WIZARD.length}
                ></div>
              </div>
            </div>
          )}

          {/* MODO EDICIÓN: todas las secciones en una sola página */}
          {esEdicion && (
            <>
              <DatosPersonales
                formData={formData}
                handleChange={handleChange}
                handleFotoChange={handleFotoChange}
                catalogos={catalogos}
              />
              <DatosLaborales
                formData={formData}
                handleChange={handleChange}
                catalogos={catalogos}
              />
              <Familiares
                familiares={formData.familiares}
                handleItemChange={handleItemChange}
                handleAddItem={handleAddItem}
                handleRemoveItem={handleRemoveItem}
              />
              <ContactosEmergencia
                contactos={formData.contactosEmergencia}
                handleItemChange={handleItemChange}
                handleAddItem={handleAddItem}
                handleRemoveItem={handleRemoveItem}
              />
              <DatosBancarios
                cuentas={formData.datosBancarios}
                handleItemChange={handleItemChange}
                handleAddItem={handleAddItem}
                handleRemoveItem={handleRemoveItem}
                catalogos={catalogos}
              />
              <Titulos
                titulos={formData.titulos}
                handleItemChange={handleItemChange}
                handleAddItem={handleAddItem}
                handleRemoveItem={handleRemoveItem}
              />
            </>
          )}

          {/* MODO CREACIÓN: wizard, una sección (o dos, en el paso 3) por vez */}
          {!esEdicion && (
            <>
              {step === 1 && (
                <DatosPersonales
                  formData={formData}
                  handleChange={handleChange}
                  handleFotoChange={handleFotoChange}
                  catalogos={catalogos}
                />
              )}
              {step === 2 && (
                <DatosLaborales
                  formData={formData}
                  handleChange={handleChange}
                  catalogos={catalogos}
                />
              )}
              {step === 3 && (
                <>
                  <Familiares
                    familiares={formData.familiares}
                    handleItemChange={handleItemChange}
                    handleAddItem={handleAddItem}
                    handleRemoveItem={handleRemoveItem}
                  />
                  <ContactosEmergencia
                    contactos={formData.contactosEmergencia}
                    handleItemChange={handleItemChange}
                    handleAddItem={handleAddItem}
                    handleRemoveItem={handleRemoveItem}
                  />
                </>
              )}
              {step === 4 && (
                <DatosBancarios
                  cuentas={formData.datosBancarios}
                  handleItemChange={handleItemChange}
                  handleAddItem={handleAddItem}
                  handleRemoveItem={handleRemoveItem}
                  catalogos={catalogos}
                />
              )}
              {step === 5 && (
                <Titulos
                  titulos={formData.titulos}
                  handleItemChange={handleItemChange}
                  handleAddItem={handleAddItem}
                  handleRemoveItem={handleRemoveItem}
                />
              )}
            </>
          )}
        </div>

        <div className="card-footer bg-white d-flex justify-content-end gap-2 py-3 border-top">
          {onCancelar && (
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={onCancelar}
              disabled={loading}
            >
              Cancelar
            </button>
          )}

          {/* Navegación del wizard: solo en creación */}
          {!esEdicion && step > 1 && (
            <button
              type="button"
              className="btn btn-outline-primary px-4"
              onClick={handlePrev}
              disabled={loading}
            >
              Anterior
            </button>
          )}
          {!esEdicion && step < PASOS_WIZARD.length && (
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={handleNext}
              disabled={loading}
            >
              Siguiente
            </button>
          )}

          {/* Botón de guardar: en edición siempre visible, en creación solo en el último paso */}
          {(esEdicion || step === PASOS_WIZARD.length) && (
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={loading}
            >
              {loading
                ? esEdicion
                  ? "Guardando..."
                  : "Creando..."
                : esEdicion
                  ? "Guardar Cambios"
                  : "Crear Usuario"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UsuarioFormCard;
