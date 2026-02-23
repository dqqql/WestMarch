import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const party = await prisma.party.findUnique({
      where: { id },
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
    if (!party) {
      return NextResponse.json({ error: '组队不存在' }, { status: 404 })
    }
    return NextResponse.json(party)
  } catch (error) {
    console.error('Get party error:', error)
    return NextResponse.json({ error: '获取组队失败' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { title, content, characterId, maxCount, nextSessionTime } = await request.json()

    const party = await prisma.party.update({
      where: { id },
      data: {
        title,
        content,
        characterId,
        maxCount,
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

    return NextResponse.json(party)
  } catch (error) {
    console.error('Update party error:', error)
    return NextResponse.json({ error: '更新组队失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.party.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete party error:', error)
    return NextResponse.json({ error: '删除组队失败' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { action, characterId } = await request.json()

    if (!action || !characterId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    if (action === 'join') {
      await prisma.partyMember.create({
        data: {
          partyId: id,
          characterId
        }
      })
    } else if (action === 'leave') {
      await prisma.partyMember.deleteMany({
        where: {
          partyId: id,
          characterId
        }
      })
    } else {
      return NextResponse.json({ error: '无效操作' }, { status: 400 })
    }

    const party = await prisma.party.findUnique({
      where: { id },
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

    return NextResponse.json(party)
  } catch (error) {
    console.error('Party action error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
