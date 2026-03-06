import prisma from '@/lib/prisma';

const characterSelect = {
  id: true,
  name: true,
  race: true,
  class: true,
  img: true
};

export class PartyRepository {
  async findAll() {
    return prisma.party.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: characterSelect
        },
        members: {
          include: {
            character: {
              select: characterSelect
            }
          }
        }
      }
    });
  }

  async findById(id: string) {
    return prisma.party.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: characterSelect
        },
        members: {
          include: {
            character: {
              select: characterSelect
            }
          }
        }
      }
    });
  }

  async create(data: {
    title: string;
    content: string;
    authorId: string;
    characterId: string | null;
    maxCount: number;
    nextSessionTime: string | null;
  }) {
    return prisma.party.create({
      data,
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: characterSelect
        },
        members: {
          include: {
            character: {
              select: characterSelect
            }
          }
        }
      }
    });
  }

  async update(id: string, data: any) {
    return prisma.party.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: characterSelect
        },
        members: {
          include: {
            character: {
              select: characterSelect
            }
          }
        }
      }
    });
  }

  async delete(id: string) {
    return prisma.party.delete({
      where: { id }
    });
  }

  async addMember(partyId: string, characterId: string) {
    return prisma.partyMember.create({
      data: {
        partyId,
        characterId
      }
    });
  }
}
