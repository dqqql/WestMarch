import prisma from '@/lib/prisma';

export class PostRepository {
  async findAll() {
    return prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async findById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async create(data: { title: string; content: string; tag: string; authorId: string; characterId?: string }) {
    return prisma.post.create({
      data,
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async update(id: string, data: { title?: string; content?: string; tag?: string; characterId?: string }) {
    return prisma.post.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async delete(id: string) {
    return prisma.post.delete({
      where: { id }
    });
  }
}
