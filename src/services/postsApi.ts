import { apiClient } from './api';

export interface Post {
  id: string;
  title: string;
  content: string;
  tag: string;
  authorId: string;
  characterId?: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    nickname?: string | null;
    avatar?: string | null;
  };
  character?: {
    id: string;
    name: string;
  } | null;
}

export interface CreatePostInput {
  title: string;
  content: string;
  tag: string;
  authorId: string;
  characterId?: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  tag?: string;
}

export const postsApi = {
  getAll: () => apiClient.get<Post[]>('/posts'),
  getById: (id: string) => apiClient.get<Post>(`/posts/${id}`),
  create: (data: CreatePostInput) => apiClient.post<Post>('/posts', data),
  update: (id: string, data: UpdatePostInput) => apiClient.put<Post>(`/posts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/posts/${id}`),
};
