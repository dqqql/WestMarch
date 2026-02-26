import prisma from '@/lib/prisma';

export class ResourceRepository {
  async findAll() {
    return prisma.resourceImage.findMany();
  }

  async findById(id: string) {
    return prisma.resourceImage.findUnique({
      where: { id }
    });
  }

  async findByUserId(userId: string) {
    return prisma.resourceImage.findMany({
      where: { userId }
    });
  }

  async create(data: {
    name: string;
    url: string;
    category: string;
    userId: string;
  }) {
    return prisma.resourceImage.create({ data });
  }

  async update(id: string, data: Partial<{
    name: string;
    url: string;
    category: string;
  }>) {
    return prisma.resourceImage.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.resourceImage.delete({
      where: { id }
    });
  }
}
