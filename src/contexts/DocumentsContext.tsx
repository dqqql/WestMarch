"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { documentsApi, Document } from "@/services";

export type { Document } from "@/services/documentsApi";

interface DocumentsContextType {
  documents: Document[];
  addDocument: (doc: Omit<Document, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateDocument: (id: string, doc: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  loadDocuments: () => Promise<void>;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);

  const loadDocuments = async () => {
    try {
      const data = await documentsApi.getAll();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const addDocument = async (doc: Omit<Document, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newDoc = await documentsApi.create(doc);
      setDocuments((prev) => [newDoc, ...prev]);
    } catch (error) {
      console.error("Failed to add document:", error);
      throw error;
    }
  };

  const updateDocument = async (id: string, doc: Partial<Document>) => {
    try {
      const updatedDoc = await documentsApi.update(id, doc);
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? updatedDoc : d))
      );
    } catch (error) {
      console.error("Failed to update document:", error);
      throw error;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await documentsApi.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Failed to delete document:", error);
      throw error;
    }
  };

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
        loadDocuments,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentsProvider");
  }
  return context;
}
