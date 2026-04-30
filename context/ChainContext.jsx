import { createContext, useContext, useState } from "react";
import { base } from "viem/chains";

export const ChainContext = createContext({
  currentChain: base,
  setCurrentChain: () => {}
});

export const ChainProvider = ({ children }) => {
  const [currentChain, setCurrentChain] = useState(base);
  return (
    <ChainContext.Provider value={{ currentChain, setCurrentChain }}>
      {children}
    </ChainContext.Provider>
  );
};

export const useChain = () => useContext(ChainContext); 