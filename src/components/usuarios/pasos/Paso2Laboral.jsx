import React from "react";
import DatosLaborales from "../secciones/DatosLaborales";

function Paso2Laboral({ formData, handleChange, catalogos }) {
  return (
    <DatosLaborales
      formData={formData}
      handleChange={handleChange}
      catalogos={catalogos}
    />
  );
}

export default Paso2Laboral;
