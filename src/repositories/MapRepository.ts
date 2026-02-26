import prisma from '@/lib/prisma';

export class MapRepository {
  async getFullMap() {
    const [nodes, edges] = await Promise.all([
      prisma.mapNode.findMany(),
      prisma.mapEdge.findMany()
    ]);
    return { nodes, edges };
  }

  async findAllNodes() {
    return prisma.mapNode.findMany();
  }

  async findNodeById(id: string) {
    return prisma.mapNode.findUnique({
      where: { id }
    });
  }

  async createNode(data: {
    label: string;
    type: string;
    x: number;
    y: number;
    description?: string | null;
  }) {
    return prisma.mapNode.create({ data });
  }

  async updateNode(id: string, data: any) {
    return prisma.mapNode.update({
      where: { id },
      data
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
}
