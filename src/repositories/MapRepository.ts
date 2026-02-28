import prisma from '@/lib/prisma';
import type { MapNodeType } from '@prisma/client';

export class MapRepository {
  async getFullMap(planeId: string) {
    const [allNodes, allEdges] = await Promise.all([
      prisma.mapNode.findMany({
        include: {
          events: true,
          characters: true,
          facilities: true
        }
      }),
      prisma.mapEdge.findMany()
    ]);
    
    const filteredNodes = allNodes.filter(node => 
      node.planeId === planeId || node.planeId === null || node.planeId === undefined
    );
    const filteredEdges = allEdges.filter(edge => 
      edge.planeId === planeId || edge.planeId === null || edge.planeId === undefined
    );
    
    const migratedNodes = filteredNodes.map(node => ({
      ...node,
      planeId: node.planeId || planeId
    }));
    const migratedEdges = filteredEdges.map(edge => ({
      ...edge,
      planeId: edge.planeId || planeId
    }));
    
    return { nodes: migratedNodes, edges: migratedEdges };
  }

  async findAllNodes() {
    return prisma.mapNode.findMany({
      include: {
        events: true,
        characters: true,
        facilities: true
      }
    });
  }

  async findNodeById(id: string) {
    return prisma.mapNode.findUnique({
      where: { id },
      include: {
        events: true,
        characters: true,
        facilities: true
      }
    });
  }

  async createNode(data: {
    label: string;
    type: MapNodeType;
    hexQ: number;
    hexR: number;
    hexS: number;
    description?: string | null;
    planeId: string;
  }) {
    return prisma.mapNode.create({
      data,
      include: {
        events: true,
        characters: true,
        facilities: true
      }
    });
  }

  async updateNode(id: string, data: any) {
    const { events, characters, facilities, id: _, createdAt, updatedAt, ...cleanData } = data;
    return prisma.mapNode.update({
      where: { id },
      data: cleanData,
      include: {
        events: true,
        characters: true,
        facilities: true
      }
    });
  }

  async deleteNode(id: string) {
    return prisma.mapNode.delete({
      where: { id }
    });
  }

  async findAllEdges() {
    return prisma.mapEdge.findMany();
  }

  async findEdgeById(id: string) {
    return prisma.mapEdge.findUnique({
      where: { id }
    });
  }

  async createEdge(data: {
    sourceId: string;
    targetId: string;
    pathStyle?: string;
    color?: string | null;
    width?: number;
    planeId: string;
  }) {
    return prisma.mapEdge.create({ data });
  }

  async updateEdge(id: string, data: any) {
    return prisma.mapEdge.update({
      where: { id },
      data
    });
  }

  async deleteEdge(id: string) {
    return prisma.mapEdge.delete({
      where: { id }
    });
  }

  async createEvent(data: {
    nodeId: string;
    title: string;
    description?: string | null;
    tags?: string | null;
    order?: number;
  }) {
    return prisma.mapEvent.create({ data });
  }

  async updateEvent(id: string, data: any) {
    return prisma.mapEvent.update({
      where: { id },
      data
    });
  }

  async deleteEvent(id: string) {
    return prisma.mapEvent.delete({
      where: { id }
    });
  }

  async createCharacter(data: {
    nodeId: string;
    name: string;
    description?: string | null;
    role?: string | null;
    avatar?: string | null;
    order?: number;
  }) {
    return prisma.mapCharacter.create({ data });
  }

  async updateCharacter(id: string, data: any) {
    return prisma.mapCharacter.update({
      where: { id },
      data
    });
  }

  async deleteCharacter(id: string) {
    return prisma.mapCharacter.delete({
      where: { id }
    });
  }

  async createFacility(data: {
    nodeId: string;
    name: string;
    description?: string | null;
    type?: string | null;
    order?: number;
  }) {
    return prisma.mapFacility.create({ data });
  }

  async updateFacility(id: string, data: any) {
    return prisma.mapFacility.update({
      where: { id },
      data
    });
  }

  async deleteFacility(id: string) {
    return prisma.mapFacility.delete({
      where: { id }
    });
  }

  async createPlane(data: {
    name: string;
    creatorId: string;
    radius?: number;
  }) {
    return prisma.plane.create({ data });
  }

  async findAllPlanes() {
    return prisma.plane.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findPlaneById(id: string) {
    return prisma.plane.findUnique({
      where: { id }
    });
  }

  async updatePlane(id: string, data: any) {
    return prisma.plane.update({
      where: { id },
      data
    });
  }

  async deletePlane(id: string) {
    return prisma.plane.delete({
      where: { id }
    });
  }

  async getUserPlaneSelection(userId: string) {
    return prisma.userPlaneSelection.findUnique({
      where: { userId }
    });
  }

  async setUserPlaneSelection(userId: string, planeId: string) {
    return prisma.userPlaneSelection.upsert({
      where: { userId },
      update: { planeId },
      create: { userId, planeId }
    });
  }
}
