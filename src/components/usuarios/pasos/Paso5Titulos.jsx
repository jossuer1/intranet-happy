import React from "react";
import Titulos from "../secciones/Titulos";

function Paso5Titulos({
  formData,
  handleItemChange,
  handleAddItem,
  handleRemoveItem,
}) {
  return (
    <Titulos
      titulos={formData.titulos}
      handleItemChange={handleItemChange}
      handleAddItem={handleAddItem}
      handleRemoveItem={handleRemoveItem}
    />
  );
}

export default Paso5Titulos;
