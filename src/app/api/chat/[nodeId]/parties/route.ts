import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string }> }
) {
  const params = await context.params;
  try {
    const parties = await repositories.chat.findPartyCardsByNode(params.nodeId)
    return NextResponse.json(parties)
  } catch (error) {
    console.error('Get parties error:', error)
    return NextResponse.json({ error: '获取组队列表失败' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string }> }
) {
  const params = await context.params;
  try {
    const { title, description, maxCount, authorId, characterId, postId } = await request.json()

    if (!title || !description || !maxCount || !authorId || !postId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const party = await repositories.chat.createPartyCard({
      nodeId: params.nodeId,
      title,
      description,
      maxCount: parseInt(maxCount),
      authorId,
      characterId,
      postId
    })

    return NextResponse.json(party)
  } catch (error) {
    console.error('Create party error:', error)
    return NextResponse.json({ error: '创建组队卡片失败' }, { status: 500 })
  }
}
