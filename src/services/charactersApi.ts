import { apiClient } from './api';

export interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  backstory: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCharacterInput {
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  backstory: string;
  userId: string;
}

export interface UpdateCharacterInput {
  name?: string;
  race?: string;
  class?: string;
  level?: number;
  background?: string;
  backstory?: string;
}

export const charactersApi = {
  getAll: () => apiClient.get<Character[]>('/characters'),
  getById: (id: string) => apiClient.get<Character>(`/characters/${id}`),
  create: (data: CreateCharacterInput) => apiClient.post<Character>('/characters', data),
  update: (id: string, data: UpdateCharacterInput) => apiClient.put<Character>(`/characters/${id}`, data),
  delete: (id: string) => apiClient.delete(`/characters/${id}`),
};
