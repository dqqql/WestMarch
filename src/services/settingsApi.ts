import { apiClient } from './api';

export interface AppSettings {
  userNickname: string | null;
  userAvatar: string | null;
  sessionHistory: string[];
}

export interface UpdateSettingsInput {
  userNickname?: string | null;
  userAvatar?: string | null;
  sessionHistory?: string[];
}

export const settingsApi = {
  getByUserId: (userId: string) => apiClient.get<AppSettings>(`/settings/${userId}`),
  update: (userId: string, data: UpdateSettingsInput) => apiClient.put<AppSettings>(`/settings/${userId}`, data),
};
