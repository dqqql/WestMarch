import prisma from '@/lib/prisma';
import type { ChatChannelType } from '@prisma/client';

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

  async findMessagesByNodeAndChannel(nodeId: string, channelType: ChatChannelType) {
    return prisma.chatMessage.findMany({
      where: {
        nodeId,
        channelType,
        isDeleted: false
      },
      include: {
        author: true,
        character: true,
        replyTo: {
          include: {
            author: true,
            character: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
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
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (message.createdAt < fiveMinutesAgo) {
      throw new Error('消息已超过可撤回时间（5分钟）');
    }

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
      include: {
        author: true,
        character: true
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
      include: {
        author: true,
        character: true,
        members: {
          include: {
            character: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async createPartyCard(data: {
    nodeId: string;
    title: string;
    description: string;
    maxCount: number;
    authorId: string;
    characterId?: string;
  }) {
    return prisma.partyCard.create({
      data,
      include: {
        author: true,
        character: true,
        members: {
          include: {
            character: true
          }
        }
      }
    });
  }

  async joinPartyCard(partyCardId: string, characterId: string) {
    const partyCard = await prisma.partyCard.findUnique({
      where: { id: partyCardId },
      include: {
        members: true
      }
    });

    if (!partyCard) {
      throw new Error('组队卡片不存在');
    }

    if (partyCard.isClosed || partyCard.isFull) {
      throw new Error('组队已关闭或已满');
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
        include: {
          author: true,
          character: true,
          members: {
            include: {
              character: true
            }
          }
        }
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
      include: {
        author: true,
        character: true,
        members: {
          include: {
            character: true
          }
        }
      }
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
      }
    });
  }
}
