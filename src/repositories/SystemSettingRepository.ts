import prisma from '@/lib/prisma';

export class SystemSettingRepository {
  async get(key: string): Promise<string | null> {
    const setting = await prisma.systemSetting.findUnique({
      where: { key }
    });
    return setting?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  async getMany(keys: string[]): Promise<Record<string, string>> {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: keys } }
    });
    return settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
  }
}
