"use client";

import { createContext, useContext, useState } from "react";

const SalonSliderContext = createContext();

export function SalonSliderProvider({ children }) {
  const [showImageSlider, setShowImageSlider] = useState(true);

  return (
    <SalonSliderContext.Provider value={{ showImageSlider, setShowImageSlider }}>
      {children}
    </SalonSliderContext.Provider>
  );
}

export function useSalonSlider() {
  const context = useContext(SalonSliderContext);
  if (!context) {
    throw new Error("useSalonSlider must be used within SalonSliderProvider");
  }
  return context;
}
