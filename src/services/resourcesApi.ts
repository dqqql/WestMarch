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

export interface UploadResourceInput {
  file: File;
  name: string;
  category: ImageCategory;
  userId: string;
}

export const resourcesApi = {
  getAll: () => apiClient.get<ResourceImage[]>('/resources'),
  getById: (id: string) => apiClient.get<ResourceImage>(`/resources/${id}`),
  create: (data: CreateResourceInput) => apiClient.post<ResourceImage>('/resources', data),
  upload: ({ file, name, category, userId }: UploadResourceInput) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('category', category);
    formData.append('userId', userId);

    return apiClient.postForm<ResourceImage>('/resources/upload', formData);
  },
  delete: (id: string) => apiClient.delete(`/resources/${id}`),
};
