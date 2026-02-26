import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await repositories.post.findById(id)
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

    const post = await repositories.post.update(id, {
      title,
      content,
      tag,
      characterId
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
    await repositories.post.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json({ error: '删除帖子失败' }, { status: 500 })
  }
}
