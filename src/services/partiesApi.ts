import { apiClient } from './api';

export interface PartyMember {
  id: string;
  partyId: string;
  characterId: string;
  createdAt: string;
}

export interface Party {
  id: string;
  title: string;
  description: string;
  authorId: string;
  characterId?: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
  };
  character?: {
    id: string;
    name: string;
  } | null;
  members: PartyMember[];
}

export interface CreatePartyInput {
  title: string;
  description: string;
  authorId: string;
  characterId?: string;
}

export interface UpdatePartyInput {
  title?: string;
  description?: string;
}

export const partiesApi = {
  getAll: () => apiClient.get<Party[]>('/parties'),
  getById: (id: string) => apiClient.get<Party>(`/parties/${id}`),
  create: (data: CreatePartyInput) => apiClient.post<Party>('/parties', data),
  update: (id: string, data: UpdatePartyInput) => apiClient.put<Party>(`/parties/${id}`, data),
  delete: (id: string) => apiClient.delete(`/parties/${id}`),
};
