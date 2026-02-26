import prisma from '@/lib/prisma';

export class CharacterRepository {
  async findAll(userId?: string) {
    return prisma.character.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.character.findUnique({
      where: { id }
    });
  }

  async create(data: {
    name: string;
    race: string;
    class: string;
    img?: string | null;
    str?: number | null;
    dex?: number | null;
    con?: number | null;
    int?: number | null;
    wis?: number | null;
    cha?: number | null;
    bio?: string | null;
    fullBio?: string | null;
    userId: string;
  }) {
    return prisma.character.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.character.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.character.delete({
      where: { id }
    });
  }
}
