import { apiClient } from './api';

export interface MapNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MapEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullMapData {
  nodes: MapNode[];
  edges: MapEdge[];
}

export interface CreateMapNodeInput {
  x: number;
  y: number;
  label: string;
  type: string;
  description?: string;
}

export interface UpdateMapNodeInput {
  x?: number;
  y?: number;
  label?: string;
  type?: string;
  description?: string;
}

export interface CreateMapEdgeInput {
  sourceId: string;
  targetId: string;
  label?: string;
}

export interface UpdateMapEdgeInput {
  label?: string;
}

export const mapApi = {
  getFullMap: () => apiClient.get<FullMapData>('/map'),
  getNodes: () => apiClient.get<MapNode[]>('/map/nodes'),
  getNodeById: (id: string) => apiClient.get<MapNode>(`/map/nodes/${id}`),
  createNode: (data: CreateMapNodeInput) => apiClient.post<MapNode>('/map/nodes', data),
  updateNode: (id: string, data: UpdateMapNodeInput) => apiClient.put<MapNode>(`/map/nodes/${id}`, data),
  deleteNode: (id: string) => apiClient.delete(`/map/nodes/${id}`),
  getEdges: () => apiClient.get<MapEdge[]>('/map/edges'),
  getEdgeById: (id: string) => apiClient.get<MapEdge>(`/map/edges/${id}`),
  createEdge: (data: CreateMapEdgeInput) => apiClient.post<MapEdge>('/map/edges', data),
  updateEdge: (id: string, data: UpdateMapEdgeInput) => apiClient.put<MapEdge>(`/map/edges/${id}`, data),
  deleteEdge: (id: string) => apiClient.delete(`/map/edges/${id}`),
};
