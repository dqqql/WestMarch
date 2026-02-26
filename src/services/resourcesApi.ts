import { apiClient } from './api';

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

export interface CreateResourceInput {
  name: string;
  url: string;
  category: ImageCategory;
  userId: string;
}

export const resourcesApi = {
  getAll: () => apiClient.get<ResourceImage[]>('/resources'),
  getById: (id: string) => apiClient.get<ResourceImage>(`/resources/${id}`),
  create: (data: CreateResourceInput) => apiClient.post<ResourceImage>('/resources', data),
  delete: (id: string) => apiClient.delete(`/resources/${id}`),
};
