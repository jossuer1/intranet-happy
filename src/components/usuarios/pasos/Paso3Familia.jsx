import React from "react";
import Familiares from "../secciones/Familiares";
import ContactosEmergencia from "../secciones/ContactosEmergencia";

function Paso3Familia({
  formData,
  handleItemChange,
  handleAddItem,
  handleRemoveItem,
}) {
  return (
    <div>
      <h5 className="mb-4 text-secondary">
        Familiares y Contactos de Emergencia
      </h5>
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
    </div>
  );
}

export default Paso3Familia;
