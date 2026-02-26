import { apiClient } from './api';

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

export interface CreateDocumentInput {
  title: string;
  content: string;
  category: string;
  author: string;
  isPinned?: boolean;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
  category?: string;
  isPinned?: boolean;
}

export const documentsApi = {
  getAll: () => apiClient.get<Document[]>('/documents'),
  getById: (id: string) => apiClient.get<Document>(`/documents/${id}`),
  create: (data: CreateDocumentInput) => apiClient.post<Document>('/documents', data),
  update: (id: string, data: UpdateDocumentInput) => apiClient.put<Document>(`/documents/${id}`, data),
  delete: (id: string) => apiClient.delete(`/documents/${id}`),
};
