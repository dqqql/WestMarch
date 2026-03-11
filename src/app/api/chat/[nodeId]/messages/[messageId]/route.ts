import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string; messageId: string }> }
) {
  const params = await context.params;
  try {
    const { authorId } = await request.json()

    if (!authorId) {
      return NextResponse.json({ error: '缺少作者ID' }, { status: 400 })
    }

    await repositories.chat.deleteMessage(params.messageId, authorId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete message error:', error)
    return NextResponse.json({ error: error.message || '删除消息失败' }, { status: 500 })
  }
}
