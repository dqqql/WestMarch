import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(request: NextRequest) {
  try {
    const posts = await repositories.post.findAll()
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

    const user = await repositories.user.findById(authorId)
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 })
    }

    const post = await repositories.post.create({
      title,
      content,
      tag,
      authorId,
      characterId
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: '创建帖子失败' }, { status: 500 })
  }
}
