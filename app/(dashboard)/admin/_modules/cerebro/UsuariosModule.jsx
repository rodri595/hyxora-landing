"use client";

import Placeholder from "./Placeholder";

const UsuariosModule = () => (
  <Placeholder
    title="Usuarios"
    description="Tabla de usuarios de la app con TVL, coste, fees, neto y plan. Ojo: este endpoint pagina, ordena y busca en servidor (máx. 200 por página), así que no sirve el DataTable client-side que usa el tab Usuarios del landing. El detalle por usuario abre portfolio, posiciones, transacciones y órdenes de rampa."
    hooks={["useGetUsers", "useGetUserStats", "useGetUserDetail", "useGetUserTransactions"]}
  />
);

export default UsuariosModule;
