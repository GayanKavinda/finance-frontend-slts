"use client";

import { createContext, useContext, useState } from "react";

const ScrollContext = createContext();

export function ScrollProvider({ children }) {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = (scrollTop) => {
    setScrollY(scrollTop);
  };

  return (
    <ScrollContext.Provider value={{ scrollY, handleScroll }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
}