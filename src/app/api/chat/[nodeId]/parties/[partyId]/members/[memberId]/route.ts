import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

// DELETE: 队长踢出成员
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string; partyId: string; memberId: string }> }
) {
  const params = await context.params;
  try {
    const { requesterId } = await request.json()

    if (!requesterId) {
      return NextResponse.json({ error: '缺少操作者ID' }, { status: 400 })
    }

    const updatedParty = await repositories.chat.removePartyMember(
      params.partyId,
      params.memberId,
      requesterId
    )

    return NextResponse.json(updatedParty)
  } catch (error: any) {
    console.error('Remove party member error:', error)
    return NextResponse.json({ error: error.message || '移除成员失败' }, { status: 500 })
  }
}
