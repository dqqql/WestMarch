import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const characters = await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        race: true,
        class: true,
        bio: true,
        user: {
          select: {
            id: true,
            username: true,
            nickname: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(characters)
  } catch (error) {
    console.error('Failed to fetch characters and users:', error)
    return NextResponse.json({ error: 'Failed to fetch mapped data' }, { status: 500 })
  }
}
