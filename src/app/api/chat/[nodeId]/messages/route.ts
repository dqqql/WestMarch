import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string }> }
) {
  const params = await context.params;
  try {
    const { searchParams } = new URL(request.url)
    const channelType = searchParams.get('channelType') as any

    if (!channelType) {
      return NextResponse.json({ error: '缺少频道类型参数' }, { status: 400 })
    }

    const messages = await repositories.chat.findMessagesByNodeAndChannel(params.nodeId, channelType)
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: '获取消息失败' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string }> }
) {
  const params = await context.params;
  try {
    const { channelType, content, authorId, characterId, replyToId } = await request.json()

    if (!channelType || !content || !authorId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const message = await repositories.chat.createMessage({
      nodeId: params.nodeId,
      channelType,
      content,
      authorId,
      characterId,
      replyToId
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Create message error:', error)
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 })
  }
}
