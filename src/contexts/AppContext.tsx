"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { initDB, getAllResources, addResource as addResourceDB, deleteResource as deleteResourceDB } from "@/lib/indexedDB";

export type ImageCategory = "homeBg" | "mapBg" | "docsBg" | "boardBg" | "partyBg" | "characterAvatar" | "general";

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
  docsBg: string | null;
  boardBg: string | null;
  partyBg: string | null;
  userNickname: string | null;
  userAvatar: string | null;
  sessionHistory: string[];
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
  docsBg: null,
  boardBg: null,
  partyBg: null,
  userNickname: null,
  userAvatar: null,
  sessionHistory: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<ResourceImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wm-settings");
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch {
          localStorage.removeItem("wm-settings");
        }
      }
    } catch {
    }
  }, []);

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

  const saveSettings = (settingsToSave: AppSettings) => {
    try {
      const settingsStr = JSON.stringify(settingsToSave);
      localStorage.setItem("wm-settings", settingsStr);
    } catch {
      const minimalSettings: AppSettings = {
        homeBg: null,
        mapBg: null,
        docsBg: null,
        boardBg: null,
        partyBg: null,
        userNickname: settingsToSave.userNickname,
        userAvatar: null,
        sessionHistory: settingsToSave.sessionHistory || [],
      };
      try {
        localStorage.setItem("wm-settings", JSON.stringify(minimalSettings));
      } catch {
        const tinySettings: Partial<AppSettings> = {
          userNickname: settingsToSave.userNickname,
          sessionHistory: settingsToSave.sessionHistory || [],
        };
        localStorage.setItem("wm-settings", JSON.stringify(tinySettings));
      }
    }
  };

  useEffect(() => {
    saveSettings(settings);
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
