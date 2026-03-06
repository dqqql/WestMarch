import prisma from '@/lib/prisma';

export class UserRepository {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        isDM: true,
        nickname: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        isDM: true,
        nickname: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        characters: {
          select: {
            id: true,
            name: true,
            race: true,
            class: true,
            img: true
          }
        },
        settings: true
      }
    });
  }

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username }
    });
  }

  async create(data: { username: string; password: string; isDM?: boolean; nickname?: string; avatar?: string }) {
    return prisma.user.create({ data });
  }

  async update(id: string, data: { username?: string; password?: string; isDM?: boolean; nickname?: string; avatar?: string }) {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id }
    });
  }
}
