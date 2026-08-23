import { useState } from "react";
import Swal from "sweetalert2";

import WizardProgressBar from "../components/usuarios/WizardProgressBar";
import Paso1Personal from "../components/usuarios/Paso1Personal";
import Paso2Laboral from "../components/usuarios/Paso2Laboral";
import Paso3Familia from "../components/usuarios/Paso3Familia";
import Paso4Bancarios from "../components/usuarios/Paso4Bancarios";
import Paso5Titulos from "../components/usuarios/Paso5Titulos";
import { crearUsuario } from "../services/apiService";

function CrearUsuarioWizard({ onCancelar, onGuardarExitoso }) {
  const [pasoActual, setPasoActual] = useState(1);
  const [cargando, setCargando] = useState(false);

  const [formData, setFormData] = useState({
    fotoFile: null,
    fotoPreview: null,
    nombres: "",
    cedula: "",
    correoEmpresa: "",
    correoPersonal: "",
    fechaNacimiento: "",
    idGenero: "",
    idEtnia: "",
    idEstadoCivil: "",
    direccion: "",
    idCiudad: "",
    idCargo: "",
    fechaIngreso: "",
    celularPersonal: "",
    celularEmpresa: "",
    numeroHijos: 0,
    familiares: [],
    contactosEmergencia: [],
    acumulaDecimos: 0,
    datosBancarios: [],
    titulos: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        fotoFile: file,
        fotoPreview: URL.createObjectURL(file),
      }));
    }
  };

  // --- Handlers Paso 3 ---
  const agregarFamiliar = () =>
    setFormData((prev) => ({
      ...prev,
      familiares: [...prev.familiares, { nombreHijo: "", fechaNacimiento: "" }],
    }));

  const eliminarFamiliar = (index) =>
    setFormData((prev) => ({
      ...prev,
      familiares: prev.familiares.filter((_, i) => i !== index),
    }));

  const handleFamiliarChange = (index, e) => {
    const { name, value } = e.target;
    const nuevos = [...formData.familiares];
    nuevos[index][name] = value;
    setFormData({ ...formData, familiares: nuevos });
  };

  const agregarContacto = () =>
    setFormData((prev) => ({
      ...prev,
      contactosEmergencia: [
        ...prev.contactosEmergencia,
        { nombre: "", numeroCelular: "", parentesco: "" },
      ],
    }));

  const eliminarContacto = (index) =>
    setFormData((prev) => ({
      ...prev,
      contactosEmergencia: prev.contactosEmergencia.filter(
        (_, i) => i !== index,
      ),
    }));

  const handleContactoChange = (index, e) => {
    const { name, value } = e.target;
    const nuevos = [...formData.contactosEmergencia];
    nuevos[index][name] = value;
    setFormData({ ...formData, contactosEmergencia: nuevos });
  };

  // --- Handlers Paso 4 ---
  const agregarCuentaBancaria = () =>
    setFormData((prev) => ({
      ...prev,
      datosBancarios: [
        ...prev.datosBancarios,
        { idBanco: "", numeroCuenta: "", tipoCuenta: "AHORROS" },
      ],
    }));

  const eliminarCuentaBancaria = (index) =>
    setFormData((prev) => ({
      ...prev,
      datosBancarios: prev.datosBancarios.filter((_, i) => i !== index),
    }));

  const handleBancoChange = (index, e) => {
    const { name, value } = e.target;
    const nuevas = [...formData.datosBancarios];
    nuevas[index][name] = value;
    setFormData({ ...formData, datosBancarios: nuevas });
  };

  // --- Handlers Paso 5 ---
  const agregarTitulo = () =>
    setFormData((prev) => ({
      ...prev,
      titulos: [
        ...prev.titulos,
        { titulo: "", institucionEducativaSuperior: "" },
      ],
    }));

  const eliminarTitulo = (index) =>
    setFormData((prev) => ({
      ...prev,
      titulos: prev.titulos.filter((_, i) => i !== index),
    }));

  const handleTituloChange = (index, e) => {
    const { name, value } = e.target;
    const nuevos = [...formData.titulos];
    nuevos[index][name] = value;
    setFormData({ ...formData, titulos: nuevos });
  };

  const siguientePaso = (e) => {
    e.preventDefault();
    setPasoActual((prev) => Math.min(prev + 1, 5));
  };

  const anteriorPaso = () => setPasoActual((prev) => Math.max(prev - 1, 1));

  const handleSubmitFinal = async (e) => {
    e.preventDefault();
    setCargando(true);

    const payload = {
      ...formData,
      idGenero: formData.idGenero ? Number(formData.idGenero) : null,
      idEtnia: formData.idEtnia ? Number(formData.idEtnia) : null,
      idEstadoCivil: formData.idEstadoCivil
        ? Number(formData.idEstadoCivil)
        : null,
      idCiudad: formData.idCiudad ? Number(formData.idCiudad) : null,
      idCargo: formData.idCargo ? Number(formData.idCargo) : null,
      numeroHijos: Number(formData.numeroHijos || 0),
      acumulaDecimos: Number(formData.acumulaDecimos || 0),
      datosBancarios: formData.datosBancarios.map((b) => ({
        ...b,
        idBanco: Number(b.idBanco),
      })),
    };

    delete payload.fotoPreview;
    delete payload.fotoFile;

    try {
      let dataToSend = payload;

      // Si hay archivo de imagen presente, preparamos FormData
      if (formData.fotoFile) {
        const data = new FormData();
        data.append("foto", formData.fotoFile);
        data.append("usuario", JSON.stringify(payload));
        dataToSend = data;
      }

      await crearUsuario(dataToSend);

      Swal.fire({
        icon: "success",
        title: "Usuario registrado",
        text: "El registro ha finalizado correctamente.",
        confirmButtonText: "Aceptar",
      }).then(() => {
        if (onGuardarExitoso) onGuardarExitoso();
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text:
          error.message ||
          "Ocurrió un problema al enviar la información al servidor.",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <WizardProgressBar pasoActual={pasoActual} />

        <form onSubmit={pasoActual === 5 ? handleSubmitFinal : siguientePaso}>
          {pasoActual === 1 && (
            <Paso1Personal
              formData={formData}
              handleChange={handleChange}
              handleImagenChange={handleImagenChange}
            />
          )}

          {pasoActual === 2 && (
            <Paso2Laboral formData={formData} handleChange={handleChange} />
          )}

          {pasoActual === 3 && (
            <Paso3Familia
              formData={formData}
              handleChange={handleChange}
              agregarFamiliar={agregarFamiliar}
              eliminarFamiliar={eliminarFamiliar}
              handleFamiliarChange={handleFamiliarChange}
              agregarContacto={agregarContacto}
              eliminarContacto={eliminarContacto}
              handleContactoChange={handleContactoChange}
            />
          )}

          {pasoActual === 4 && (
            <Paso4Bancarios
              formData={formData}
              handleChange={handleChange}
              agregarCuentaBancaria={agregarCuentaBancaria}
              eliminarCuentaBancaria={eliminarCuentaBancaria}
              handleBancoChange={handleBancoChange}
            />
          )}

          {pasoActual === 5 && (
            <Paso5Titulos
              formData={formData}
              agregarTitulo={agregarTitulo}
              eliminarTitulo={eliminarTitulo}
              handleTituloChange={handleTituloChange}
            />
          )}

          <div className="d-flex justify-content-between mt-4 pt-3 border-top">
            {pasoActual > 1 ? (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={anteriorPaso}
                disabled={cargando}
              >
                Anterior
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={onCancelar}
                disabled={cargando}
              >
                Cancelar
              </button>
            )}

            {pasoActual < 5 ? (
              <button type="submit" className="btn btn-primary">
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
                disabled={cargando}
              >
                {cargando ? "Guardando..." : "Guardar Usuario Completo"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CrearUsuarioWizard;
