import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  try {
    const schedule = await prisma.userSchedule.findUnique({
      where: { userId },
    })
    const slots: boolean[] = schedule
      ? JSON.parse(schedule.slots || '[]')
      : []
    // Ensure we always return 21 slots
    const normalized = Array.from({ length: 21 }, (_, i) => !!slots[i])
    return NextResponse.json({ slots: normalized })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params

  try {
    const { slots } = await req.json()
    if (!Array.isArray(slots) || slots.length !== 21) {
      return NextResponse.json({ error: 'Invalid slots data' }, { status: 400 })
    }
    const schedule = await prisma.userSchedule.upsert({
      where: { userId },
      update: { slots: JSON.stringify(slots) },
      create: { userId, slots: JSON.stringify(slots) },
    })
    return NextResponse.json({ slots: JSON.parse(schedule.slots) })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}
