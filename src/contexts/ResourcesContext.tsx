"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { resourcesApi, ResourceImage } from "@/services";

export type { ResourceImage, ImageCategory } from "@/services/resourcesApi";

interface ResourcesContextType {
  resources: ResourceImage[];
  isLoading: boolean;
  addResource: (image: Omit<ResourceImage, "id" | "createdAt" | "updatedAt" | "userId">) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  loadResources: () => Promise<void>;
}

const ResourcesContext = createContext<ResourcesContextType | undefined>(undefined);

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [resources, setResources] = useState<ResourceImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadResources = async () => {
    try {
      const data = await resourcesApi.getAll();
      setResources(data);
    } catch (error) {
      console.error("Failed to load resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const addResource = async (image: Omit<ResourceImage, "id" | "createdAt" | "updatedAt" | "userId">) => {
    if (!user) throw new Error("用户未登录");
    try {
      const newResource = await resourcesApi.create({ ...image, userId: user.id });
      setResources((prev) => [...prev, newResource]);
    } catch (error) {
      console.error("Failed to add resource:", error);
      throw error;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      await resourcesApi.delete(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Failed to delete resource:", error);
      throw error;
    }
  };

  return (
    <ResourcesContext.Provider
      value={{
        resources,
        isLoading,
        addResource,
        deleteResource,
        loadResources,
      }}
    >
      {children}
    </ResourcesContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourcesContext);
  if (context === undefined) {
    throw new Error("useResources must be used within a ResourcesProvider");
  }
  return context;
}
