import React from "react";
import DatosPersonales from "../secciones/DatosPersonales";

function Paso1Personal({ formData, handleChange, catalogos }) {
  return (
    <DatosPersonales
      formData={formData}
      handleChange={handleChange}
      catalogos={catalogos}
    />
  );
}

export default Paso1Personal;
