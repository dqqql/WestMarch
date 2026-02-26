import prisma from '@/lib/prisma';

export class SettingsRepository {
  async findByUserId(userId: string) {
    let settings = await prisma.userSetting.findUnique({
      where: { userId }
    });

    if (!settings) {
      settings = await prisma.userSetting.create({
        data: {
          userId,
          userNickname: null,
          userAvatar: null,
          sessionHistory: []
        }
      });
    }

    return settings;
  }

  async update(userId: string, data: Partial<{
    userNickname: string | null;
    userAvatar: string | null;
    sessionHistory: any;
  }>) {
    return prisma.userSetting.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        userNickname: data.userNickname || null,
        userAvatar: data.userAvatar || null,
        sessionHistory: data.sessionHistory || []
      }
    });
  }
}
