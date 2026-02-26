"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AppContextType {
  isClient: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <AppContext.Provider value={{ isClient }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export { useResources } from "./ResourcesContext";
export { useDocuments } from "./DocumentsContext";
export { useSettings } from "./SettingsContext";

export type { ResourceImage, ImageCategory } from "./ResourcesContext";
export type { Document } from "./DocumentsContext";
export type { AppSettings } from "./SettingsContext";
