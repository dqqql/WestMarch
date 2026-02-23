import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, nickname: true }
        },
        character: {
          select: { id: true, name: true }
        }
      }
    })
    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json({ error: '获取帖子失败' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { title, content, tag, characterId } = await request.json()

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        tag: tag as any,
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
    console.error('Update post error:', error)
    return NextResponse.json({ error: '更新帖子失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.post.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json({ error: '删除帖子失败' }, { status: 500 })
  }
}
