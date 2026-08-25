import React from "react";
import DatosBancarios from "../secciones/DatosBancarios";

function Paso4Bancarios({
  formData,
  handleItemChange,
  handleAddItem,
  handleRemoveItem,
  catalogos,
}) {
  return (
    <DatosBancarios
      cuentas={formData.datosBancarios}
      handleItemChange={handleItemChange}
      handleAddItem={handleAddItem}
      handleRemoveItem={handleRemoveItem}
      catalogos={catalogos}
    />
  );
}

export default Paso4Bancarios;
