import prisma from '@/lib/prisma';
import type { ChatChannelType } from '@prisma/client';

const partyCardSelect = {
  id: true,
  nodeId: true,
  postId: true,
  title: true,
  description: true,
  maxCount: true,
  authorId: true,
  author: {
    select: { id: true, username: true, nickname: true }
  },
  characterId: true,
  character: {
    select: { id: true, name: true, race: true, class: true }
  },
  members: {
    select: {
      id: true,
      characterId: true,
      character: {
        select: { id: true, name: true, race: true, class: true }
      }
    }
  },
  isFull: true,
  isClosed: true,
  createdAt: true,
  updatedAt: true
} as const;

export class ChatRepository {
  async findStrongholdNodes() {
    return prisma.mapNode.findMany({
      where: {
        type: '据点'
      },
      orderBy: {
        label: 'asc'
      }
    });
  }

  async findMessagesByNodeAndChannel(nodeId: string, channelType: ChatChannelType, limit: number = 100) {
    return prisma.chatMessage.findMany({
      where: {
        nodeId,
        channelType,
        isDeleted: false
      },
      include: {
        author: {
          select: { id: true, username: true, nickname: true, avatar: true }
        },
        character: {
          select: { id: true, name: true, race: true, class: true }
        },
        replyTo: {
          include: {
            author: {
              select: { id: true, username: true, nickname: true }
            },
            character: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  }

  async createMessage(data: {
    nodeId: string;
    channelType: ChatChannelType;
    content: string;
    authorId: string;
    characterId?: string;
    replyToId?: string;
  }) {
    return prisma.chatMessage.create({
      data,
      include: {
        author: true,
        character: true,
        replyTo: {
          include: {
            author: true,
            character: true
          }
        }
      }
    });
  }

  async deleteMessage(id: string, authorId: string) {
    const message = await prisma.chatMessage.findUnique({
      where: { id }
    });

    if (!message || message.authorId !== authorId) {
      throw new Error('无权删除此消息');
    }

    const now = new Date();

    return prisma.chatMessage.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: now
      }
    });
  }

  async findItemCardsByNode(nodeId: string) {
    return prisma.itemCard.findMany({
      where: {
        nodeId,
        isSold: false
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        authorId: true,
        author: {
          select: { id: true, username: true, nickname: true }
        },
        characterId: true,
        character: {
          select: { id: true, name: true, race: true, class: true, img: true }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async createItemCard(data: {
    nodeId: string;
    name: string;
    description: string;
    price: number;
    authorId: string;
    characterId?: string;
  }) {
    return prisma.itemCard.create({
      data,
      include: {
        author: true,
        character: true
      }
    });
  }

  async markItemAsSold(id: string, authorId: string) {
    const item = await prisma.itemCard.findUnique({
      where: { id }
    });

    if (!item || item.authorId !== authorId) {
      throw new Error('无权标记此物品');
    }

    return prisma.itemCard.update({
      where: { id },
      data: {
        isSold: true,
        soldAt: new Date()
      }
    });
  }

  async findPartyCardsByNode(nodeId: string) {
    return prisma.partyCard.findMany({
      where: {
        nodeId,
        isClosed: false
      },
      select: partyCardSelect,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
  }

  async createPartyCard(data: {
    nodeId: string;
    postId: string;
    title: string;
    description: string;
    maxCount: number;
    authorId: string;
    characterId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({
        where: { id: data.postId },
        select: { id: true, tag: true }
      });

      if (!post || post.tag !== 'DM悬赏') {
        throw new Error('所选悬赏不存在');
      }

      const partyCard = await tx.partyCard.create({
        data,
        select: partyCardSelect
      });

      await tx.post.update({
        where: { id: data.postId },
        data: { status: '组队中' }
      });

      return partyCard;
    });
  }

  async joinPartyCard(partyCardId: string, characterId: string) {
    const partyCard = await prisma.partyCard.findUnique({
      where: { id: partyCardId },
      select: {
        id: true,
        isClosed: true,
        isFull: true,
        maxCount: true,
        members: {
          select: {
            id: true,
            characterId: true
          }
        }
      }
    });

    if (!partyCard) {
      throw new Error('组队卡片不存在');
    }

    if (partyCard.isClosed || partyCard.isFull) {
      throw new Error('组队已关闭或已满');
    }

    const alreadyJoined = partyCard.members.some(m => m.characterId === characterId);
    if (alreadyJoined) {
      throw new Error('该角色已加入此组队');
    }

    if (partyCard.members.length >= partyCard.maxCount - 1) {
      return prisma.partyCard.update({
        where: { id: partyCardId },
        data: {
          members: {
            create: {
              characterId
            }
          },
          isFull: true
        },
        select: partyCardSelect
      });
    }

    return prisma.partyCard.update({
      where: { id: partyCardId },
      data: {
        members: {
          create: {
            characterId
          }
        }
      },
      select: partyCardSelect
    });
  }

  async closePartyCard(id: string, authorId: string) {
    const partyCard = await prisma.partyCard.findUnique({
      where: { id }
    });

    if (!partyCard || partyCard.authorId !== authorId) {
      throw new Error('无权关闭此组队');
    }

    return prisma.partyCard.update({
      where: { id },
      data: {
        isClosed: true,
        closedAt: new Date()
      },
      select: {
        id: true,
        isClosed: true,
        closedAt: true
      }
    });
  }
}

