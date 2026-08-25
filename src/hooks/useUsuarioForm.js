import { useState } from "react";

export const useUsuarioForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    // Datos Personales
    nombre: "",
    apellido: "",
    cedula: "",
    correoPersonal: "",
    celularPersonal: "",
    direccion: "",
    fechaNacimiento: "",
    idGenero: "",
    idEstadoCivil: "",
    idEtnia: "",
    foto: "", // Base64 (solo para <img> de vista previa) o URL ya existente en edición
    fotoArchivo: null, // File real que se sube a Cloudinary al guardar

    // Datos Laborales
    idArea: "",
    idCargo: "",
    idCiudad: "",
    correoEmpresa: "",
    celularEmpresa: "",
    fechaIngreso: "",
    tieneVacaciones: true,
    diasVacacionesAsignados: 15,

    // Sublistas
    titulos: [],
    familiares: [],
    contactosEmergencia: [],
    datosBancarios: [],

    // Listas de IDs a eliminar (solo para edición)
    titulosAEliminar: [],
    familiaresAEliminar: [],
    contactosEmergenciaAEliminar: [],
    datosBancariosAEliminar: [],
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Guarda el File real (fotoArchivo, para subir a Cloudinary al guardar) y
  // además genera un Base64 solo para la vista previa inmediata (<img src>).
  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, fotoArchivo: file }));

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, foto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleItemChange = (listName, index, fieldOrEvent, value) => {
    setFormData((prev) => {
      const updatedList = [...(prev[listName] || [])];
      let field, val;
      if (typeof fieldOrEvent === "object" && fieldOrEvent.target) {
        // Se pasó el evento
        const { name, value: v, type, checked } = fieldOrEvent.target;
        field = name;
        val = type === "checkbox" ? checked : v;
      } else {
        field = fieldOrEvent;
        val = value;
      }
      updatedList[index] = {
        ...updatedList[index],
        [field]: val,
      };
      return { ...prev, [listName]: updatedList };
    });
  };

  const handleAddItem = (listName, newItem = {}) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: [...(prev[listName] || []), newItem],
    }));
  };

  const handleRemoveItem = (listName, index, idKey = null) => {
    setFormData((prev) => {
      const currentList = prev[listName] || [];
      const itemToRemove = currentList[index];
      const deleteListName = `${listName}AEliminar`;
      let updatedEliminarList = prev[deleteListName] || [];

      if (idKey && itemToRemove && itemToRemove[idKey]) {
        // Si el ítem tiene ID, se agrega a la lista de eliminación
        const id = itemToRemove[idKey];
        if (!updatedEliminarList.includes(id)) {
          updatedEliminarList = [...updatedEliminarList, id];
        }
      }

      return {
        ...prev,
        [listName]: currentList.filter((_, i) => i !== index),
        [deleteListName]: updatedEliminarList,
      };
    });
  };

  // Función para resetear el formulario a un estado dado (útil para cargar datos de edición)
  const resetForm = (newData) => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleFotoChange,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    resetForm,
  };
};
