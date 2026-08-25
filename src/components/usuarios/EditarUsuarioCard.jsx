import React, { useEffect, useState } from "react";
import { useUsuarioForm } from "./useUsuarioForm";
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

const EditarUsuarioCard = ({ usuarioOriginal, onGuardar, onCancelar }) => {
  const {
    formData,
    setFormData,
    handleChange,
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

  // Cargar datos del usuario original
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
        idCargo: usuarioOriginal.idCargo || "",
        idCiudad: usuarioOriginal.idCiudad || "",
        tieneVacaciones: usuarioOriginal.tieneVacaciones ?? true,
        diasVacacionesAsignados: usuarioOriginal.diasVacacionesAsignados ?? 15,
        titulos: usuarioOriginal.titulos || [],
        familiares: usuarioOriginal.familiares || [],
        contactosEmergencia: usuarioOriginal.contactosEmergencia || [],
        datosBancarios: usuarioOriginal.datosBancarios || [],
        // Inicializar listas de eliminación vacías
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
      const payload = {
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
        idCargo: formData.idCargo ? Number(formData.idCargo) : null,
        idCiudad: formData.idCiudad ? Number(formData.idCiudad) : null,
        tieneVacaciones: formData.tieneVacaciones,
        diasVacacionesAsignados: Number(formData.diasVacacionesAsignados),
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
      };

      await onGuardar(usuarioOriginal.idUsuario, payload);
    } catch (err) {
      setError(err.message || "Error al actualizar la información del usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-3">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
        <h5 className="card-title mb-0 fw-bold">
          <i className="bi bi-person-gear me-2"></i>Editar Ficha de Usuario
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

      <form onSubmit={handleSubmit}>
        <div className="card-body p-4 bg-light">
          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {error}
            </div>
          )}

          <DatosPersonales
            formData={formData}
            handleChange={handleChange}
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
          <button
            type="submit"
            className="btn btn-primary px-4"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarUsuarioCard;
