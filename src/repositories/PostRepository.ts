import prisma from '@/lib/prisma';
import type { PostTag } from '@prisma/client';

function processPostWithAuthor(post: any) {
  const author = post.author;
  const userSetting = author.settings?.[0];
  return {
    ...post,
    author: {
      id: author.id,
      username: author.username,
      nickname: userSetting?.userNickname ?? author.nickname,
      avatar: userSetting?.userAvatar ?? author.avatar
    }
  };
}

export class PostRepository {
  async findAll() {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          include: {
            settings: true
          }
        },
        character: {
          select: { id: true, name: true }
        }
      }
    });
    return posts.map(processPostWithAuthor);
  }

  async findById(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          include: {
            settings: true
          }
        },
        character: {
          select: { id: true, name: true }
        }
      }
    });
    return post ? processPostWithAuthor(post) : null;
  }

  async create(data: { title: string; content: string; tag: PostTag; authorId: string; characterId?: string | null; honor?: number; gold?: number; reputation?: number }) {
    const post = await prisma.post.create({
      data,
      include: {
        author: {
          include: {
            settings: true
          }
        },
        character: {
          select: { id: true, name: true }
        }
      }
    });
    return processPostWithAuthor(post);
  }

  async update(id: string, data: { title?: string; content?: string; tag?: PostTag; characterId?: string | null; honor?: number; gold?: number; reputation?: number }) {
    const post = await prisma.post.update({
      where: { id },
      data,
      include: {
        author: {
          include: {
            settings: true
          }
        },
        character: {
          select: { id: true, name: true }
        }
      }
    });
    return processPostWithAuthor(post);
  }

  async delete(id: string) {
    return prisma.post.delete({
      where: { id }
    });
  }
}
