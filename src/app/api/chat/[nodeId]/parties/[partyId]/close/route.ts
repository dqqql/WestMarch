import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string; partyId: string }> }
) {
  const params = await context.params;
  try {
    const { authorId } = await request.json()

    if (!authorId) {
      return NextResponse.json({ error: '缺少作者ID' }, { status: 400 })
    }

    await repositories.chat.closePartyCard(params.partyId, authorId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Close party error:', error)
    return NextResponse.json({ error: error.message || '关闭组队失败' }, { status: 500 })
  }
}
