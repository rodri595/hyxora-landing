"use client";

import { createContext, useContext, useState } from "react";

// Split state/setter contexts: consumers of the setter only (e.g. the
// recharts tree) don't re-render when the hovered month changes.
const HoverMonthContext = createContext(null);
const HoverSetterContext = createContext(() => {});

export const SimulationHoverProvider = ({ children }) => {
  const [hoveredMonth, setHoveredMonth] = useState(null);
  return (
    <HoverSetterContext.Provider value={setHoveredMonth}>
      <HoverMonthContext.Provider value={hoveredMonth}>{children}</HoverMonthContext.Provider>
    </HoverSetterContext.Provider>
  );
};

export const useSimulationHoverMonth = () => useContext(HoverMonthContext);
export const useSimulationHoverSetter = () => useContext(HoverSetterContext);

export const useSimulationHover = () => ({
  hoveredMonth: useSimulationHoverMonth(),
  setHoveredMonth: useSimulationHoverSetter(),
});
