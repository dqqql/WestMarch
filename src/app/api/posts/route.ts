import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: { id: true, name: true }
        }
      }
    })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json({ error: '获取帖子失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, tag, authorId, characterId } = await request.json()

    if (!title || !content || !tag || !authorId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: authorId }
    })
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        tag: tag as any,
        authorId,
        characterId
      },
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: '创建帖子失败' }, { status: 500 })
  }
}
