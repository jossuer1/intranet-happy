import React, { useState, useEffect } from "react";
import { useUsuarioForm } from "./hooks/useUsuarioForm";
import Paso1Personal from "./pasos/Paso1Personal";
import Paso2Laboral from "./pasos/Paso2Laboral";
import Paso3Familia from "./pasos/Paso3Familia";
import Paso4Bancarios from "./pasos/Paso4Bancarios";
import Paso5Titulos from "./pasos/Paso5Titulos";
import { getCatalogos } from "../../services/catalogosService";

const CrearUsuarioWizard = ({ onCrear, onCancelar }) => {
  const {
    formData,
    handleChange,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
  } = useUsuarioForm();
  const [catalogos, setCatalogos] = useState({});
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar catálogos
    const cargar = async () => {
      const data = await getCatalogos(); // función que obtiene todos los catálogos
      setCatalogos(data);
    };
    cargar();
  }, []);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Construir payload similar al de edición (sin listas de eliminación)
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
      await onCrear(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Renderizado de pasos según step */}
      {step === 1 && (
        <Paso1Personal
          formData={formData}
          handleChange={handleChange}
          catalogos={catalogos}
        />
      )}
      {step === 2 && (
        <Paso2Laboral
          formData={formData}
          handleChange={handleChange}
          catalogos={catalogos}
        />
      )}
      {step === 3 && (
        <Paso3Familia
          formData={formData}
          handleItemChange={handleItemChange}
          handleAddItem={handleAddItem}
          handleRemoveItem={handleRemoveItem}
        />
      )}
      {step === 4 && (
        <Paso4Bancarios
          formData={formData}
          handleItemChange={handleItemChange}
          handleAddItem={handleAddItem}
          handleRemoveItem={handleRemoveItem}
          catalogos={catalogos}
        />
      )}
      {step === 5 && (
        <Paso5Titulos
          formData={formData}
          handleItemChange={handleItemChange}
          handleAddItem={handleAddItem}
          handleRemoveItem={handleRemoveItem}
        />
      )}
      <div className="d-flex justify-content-between mt-4">
        {step > 1 && <button onClick={handlePrev}>Anterior</button>}
        {step < 5 && <button onClick={handleNext}>Siguiente</button>}
        {step === 5 && (
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creando..." : "Crear Usuario"}
          </button>
        )}
        {onCancelar && <button onClick={onCancelar}>Cancelar</button>}
      </div>
    </div>
  );
};
