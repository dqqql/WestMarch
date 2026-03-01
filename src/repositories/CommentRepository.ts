import prisma from '@/lib/prisma';

export class CommentRepository {
  async findByPostId(postId: string, page: number = 1, pageSize: number = 5) {
    const skip = (page - 1) * pageSize;
    
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          author: {
            include: {
              settings: true
            }
          }
        }
      }),
      prisma.comment.count({
        where: { postId }
      })
    ]);

    const processedComments = comments.map(comment => {
      const author = comment.author;
      const userSetting = author.settings?.[0];
      return {
        ...comment,
        author: {
          id: author.id,
          username: author.username,
          nickname: userSetting?.userNickname ?? author.nickname,
          avatar: userSetting?.userAvatar ?? author.avatar
        }
      };
    });

    return {
      comments: processedComments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async create(data: { content: string; postId: string; authorId: string }) {
    const comment = await prisma.comment.create({
      data,
      include: {
        author: {
          include: {
            settings: true
          }
        }
      }
    });

    const author = comment.author;
    const userSetting = author.settings?.[0];
    return {
      ...comment,
      author: {
        id: author.id,
        username: author.username,
        nickname: userSetting?.userNickname ?? author.nickname,
        avatar: userSetting?.userAvatar ?? author.avatar
      }
    };
  }

  async delete(id: string) {
    return prisma.comment.delete({
      where: { id }
    });
  }
}
