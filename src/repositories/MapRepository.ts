import prisma from '@/lib/prisma';
import type { MapNodeType } from '@prisma/client';

export class MapRepository {
  async getFullMap() {
    const [nodes, edges] = await Promise.all([
      prisma.mapNode.findMany({
        include: {
          events: true,
          characters: true,
          facilities: true
        }
      }),
      prisma.mapEdge.findMany()
    ]);
    return { nodes, edges };
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
}
