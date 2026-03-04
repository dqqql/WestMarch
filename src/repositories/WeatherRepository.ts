import prisma from '@/lib/prisma';
import type { WeatherType, WeatherRecord } from '@prisma/client';

export class WeatherRepository {
  async getByDate(date: string): Promise<WeatherRecord | null> {
    return await prisma.weatherRecord.findUnique({
      where: { date }
    });
  }

  async createOrUpdate(date: string, weatherType: WeatherType, description?: string): Promise<WeatherRecord> {
    return await prisma.weatherRecord.upsert({
      where: { date },
      update: { weatherType, description },
      create: { date, weatherType, description }
    });
  }

  async getHistory(limit: number = 30): Promise<WeatherRecord[]> {
    return await prisma.weatherRecord.findMany({
      orderBy: { date: 'desc' },
      take: limit
    });
  }

  async getAll(): Promise<WeatherRecord[]> {
    return await prisma.weatherRecord.findMany({
      orderBy: { date: 'asc' }
    });
  }
}
