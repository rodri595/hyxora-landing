"use client";

import Placeholder from "./Placeholder";

const ResumenModule = () => (
  <Placeholder
    title="Resumen"
    description="KPIs de cabecera: usuarios totales y registrados, operaciones totales, altas de los últimos 30 días, TVL mediana, vault y activo top. Incluye el embudo de activación y la serie diaria de registros."
    hooks={["useGetOverview", "useGetUserStats"]}
  />
);

export default ResumenModule;
