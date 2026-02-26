import { apiClient } from './api';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    username: string;
    isDM: boolean;
    nickname?: string | null;
    avatar?: string | null;
  };
}

export const authApi = {
  login: (data: LoginRequest) => apiClient.post<LoginResponse>('/auth/login', data),
};
