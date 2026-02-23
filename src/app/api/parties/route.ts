import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const parties = await prisma.party.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: { id: true, name: true, race: true, class: true, img: true }
        },
        members: {
          include: {
            character: {
              select: { id: true, name: true, race: true, class: true, img: true }
            }
          }
        }
      }
    })
    return NextResponse.json(parties)
  } catch (error) {
    console.error('Get parties error:', error)
    return NextResponse.json({ error: '获取组队信息失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, authorId, characterId, maxCount, nextSessionTime } = await request.json()

    if (!title || !content || !authorId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: authorId }
    })
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 })
    }

    const party = await prisma.party.create({
      data: {
        title,
        content,
        authorId,
        characterId,
        maxCount: maxCount || 4,
        nextSessionTime: nextSessionTime ? new Date(nextSessionTime) : null
      },
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: { id: true, name: true, race: true, class: true, img: true }
        },
        members: {
          include: {
            character: {
              select: { id: true, name: true, race: true, class: true, img: true }
            }
          }
        }
      }
    })

    if (characterId) {
      await prisma.partyMember.create({
        data: {
          partyId: party.id,
          characterId
        }
      })
    }

    const updatedParty = await prisma.party.findUnique({
      where: { id: party.id },
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: { id: true, name: true, race: true, class: true, img: true }
        },
        members: {
          include: {
            character: {
              select: { id: true, name: true, race: true, class: true, img: true }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedParty)
  } catch (error) {
    console.error('Create party error:', error)
    return NextResponse.json({ error: '创建组队失败' }, { status: 500 })
  }
}
