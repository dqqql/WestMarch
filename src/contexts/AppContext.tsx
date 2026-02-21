"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { initDB, getAllResources, addResource as addResourceDB, deleteResource as deleteResourceDB } from "@/lib/indexedDB";

export type ImageCategory = "homeBg" | "mapBg" | "characterAvatar" | "general";

export interface ResourceImage {
  id: string;
  name: string;
  url: string;
  category: ImageCategory;
  createdAt: number;
}

export interface AppSettings {
  homeBg: string | null;
  mapBg: string | null;
}

interface AppContextType {
  resources: ResourceImage[];
  settings: AppSettings;
  isLoading: boolean;
  addResource: (image: Omit<ResourceImage, "id" | "createdAt">) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  verifyPassword: (password: string) => boolean;
  loadResources: () => Promise<void>;
}

const PASSWORD = "WM2006";

const defaultSettings: AppSettings = {
  homeBg: null,
  mapBg: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<ResourceImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("wm-settings");
        return saved ? JSON.parse(saved) : defaultSettings;
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const loadResources = async () => {
    try {
      await initDB();
      const loadedResources = await getAllResources();
      setResources(loadedResources as ResourceImage[]);
    } catch (error) {
      console.error("Failed to load resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    try {
      const settingsStr = JSON.stringify(settings);
      localStorage.setItem("wm-settings", settingsStr);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [settings]);

  const addResource = async (image: Omit<ResourceImage, "id" | "createdAt">) => {
    const newImage: ResourceImage = {
      ...image,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    await addResourceDB(newImage);
    setResources((prev) => [...prev, newImage]);
  };

  const deleteResource = async (id: string) => {
    await deleteResourceDB(id);
    setResources((prev) => prev.filter((img) => img.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const verifyPassword = (password: string) => {
    return password === PASSWORD;
  };

  return (
    <AppContext.Provider
      value={{
        resources,
        settings,
        isLoading,
        addResource,
        deleteResource,
        updateSettings,
        verifyPassword,
        loadResources,
      }}
    >
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
