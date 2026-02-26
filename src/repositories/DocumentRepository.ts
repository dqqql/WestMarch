import prisma from '@/lib/prisma';

export class DocumentRepository {
  async findAll() {
    return prisma.document.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async findById(id: string) {
    return prisma.document.findUnique({
      where: { id }
    });
  }

  async create(data: {
    title: string;
    content: string;
    category: string;
    author: string;
    isPinned?: boolean;
  }) {
    return prisma.document.create({ data });
  }

  async update(id: string, data: Partial<{
    title: string;
    content: string;
    category: string;
    isPinned?: boolean;
  }>) {
    return prisma.document.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.document.delete({
      where: { id }
    });
  }
}
