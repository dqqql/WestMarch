import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string; itemId: string }> }
) {
  const params = await context.params;
  try {
    const { authorId } = await request.json()

    if (!authorId) {
      return NextResponse.json({ error: '缺少作者ID' }, { status: 400 })
    }

    await repositories.chat.markItemAsSold(params.itemId, authorId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Mark item as sold error:', error)
    return NextResponse.json({ error: error.message || '标记物品失败' }, { status: 500 })
  }
}
