"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { settingsApi, AppSettings } from "@/services";
import { authConfig } from "@/config";

export type { AppSettings } from "@/services/settingsApi";

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  verifyPassword: (password: string) => boolean;
}

const defaultSettings: AppSettings = {
  userNickname: null,
  userAvatar: null,
  sessionHistory: [],
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const loadSettings = async () => {
    if (!user) return;
    try {
      const data = await settingsApi.getByUserId(user.id);
      setSettings({
        userNickname: data.userNickname,
        userAvatar: data.userAvatar,
        sessionHistory: data.sessionHistory || [],
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!user) return;
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await settingsApi.update(user.id, updatedSettings);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  const verifyPassword = (password: string) => {
    return password === authConfig.adminPassword;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        verifyPassword,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
