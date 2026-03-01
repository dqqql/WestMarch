import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '5')

    const result = await repositories.comment.findByPostId(id, page, pageSize)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { content, authorId } = await request.json()

    if (!content || !authorId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 })
    }

    const post = await repositories.post.findById(id)
    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 })
    }

    const user = await repositories.user.findById(authorId)
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 })
    }

    const comment = await repositories.comment.create({
      content: content.trim(),
      postId: id,
      authorId
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: '发布评论失败' }, { status: 500 })
  }
}
