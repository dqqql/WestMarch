import prisma from '@/lib/prisma';
import type { PostTag } from '@prisma/client';

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

  async create(data: { title: string; content: string; tag: PostTag; authorId: string; characterId?: string | null }) {
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

  async update(id: string, data: { title?: string; content?: string; tag?: PostTag; characterId?: string | null }) {
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
