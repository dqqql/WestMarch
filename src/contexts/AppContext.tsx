"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type ImageCategory = "characterAvatar";

export interface ResourceImage {
  id: string;
  name: string;
  url: string;
  category: ImageCategory;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  userNickname: string | null;
  userAvatar: string | null;
  sessionHistory: string[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

interface AppContextType {
  resources: ResourceImage[];
  settings: AppSettings;
  isLoading: boolean;
  isClient: boolean;
  addResource: (image: Omit<ResourceImage, "id" | "createdAt" | "updatedAt" | "userId">) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  verifyPassword: (password: string) => boolean;
  loadResources: () => Promise<void>;
  documents: Document[];
  addDocument: (doc: Omit<Document, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateDocument: (id: string, doc: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  loadDocuments: () => Promise<void>;
}

const PASSWORD = "WM2006";

const defaultSettings: AppSettings = {
  userNickname: null,
  userAvatar: null,
  sessionHistory: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [resources, setResources] = useState<ResourceImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadResources = async () => {
    try {
      const response = await fetch("/api/resources");
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Failed to load resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  };

  const loadSettings = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/settings/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSettings({
          userNickname: data.userNickname,
          userAvatar: data.userAvatar,
          sessionHistory: data.sessionHistory || [],
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  useEffect(() => {
    if (isClient) {
      loadResources();
      loadDocuments();
      if (user) {
        loadSettings();
      }
    }
  }, [isClient, user]);

  const addResource = async (image: Omit<ResourceImage, "id" | "createdAt" | "updatedAt" | "userId">) => {
    if (!user) throw new Error("用户未登录");
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...image, userId: user.id }),
      });
      if (response.ok) {
        const newResource = await response.json();
        setResources((prev) => [...prev, newResource]);
      }
    } catch (error) {
      console.error("Failed to add resource:", error);
      throw error;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setResources((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete resource:", error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!user) return;
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await fetch(`/api/settings/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  const addDocument = async (doc: Omit<Document, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      if (response.ok) {
        const newDoc = await response.json();
        setDocuments((prev) => [newDoc, ...prev]);
      }
    } catch (error) {
      console.error("Failed to add document:", error);
      throw error;
    }
  };

  const updateDocument = async (id: string, doc: Partial<Document>) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      if (response.ok) {
        const updatedDoc = await response.json();
        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? updatedDoc : d))
        );
      }
    } catch (error) {
      console.error("Failed to update document:", error);
      throw error;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      throw error;
    }
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
        isClient,
        addResource,
        deleteResource,
        updateSettings,
        verifyPassword,
        loadResources,
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
        loadDocuments,
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
