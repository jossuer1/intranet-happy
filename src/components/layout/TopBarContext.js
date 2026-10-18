import { createContext } from "react";

// Guarda el contenedor (zona izquierda de la fila superior) donde cada página
// "inyecta" su título mediante un portal (ver SectionHeader).
//   undefined -> no hay AppLayout alrededor
//   null      -> AppLayout todavía está montando la fila superior
//   elemento  -> contenedor listo
export const TopBarContext = createContext(undefined);
