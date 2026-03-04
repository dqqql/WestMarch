import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string; partyId: string }> }
) {
  const params = await context.params;
  try {
    const { characterId } = await request.json()

    if (!characterId) {
      return NextResponse.json({ error: '缺少角色ID' }, { status: 400 })
    }

    const party = await repositories.chat.joinPartyCard(params.partyId, characterId)
    return NextResponse.json(party)
  } catch (error: any) {
    console.error('Join party error:', error)
    return NextResponse.json({ error: error.message || '加入组队失败' }, { status: 500 })
  }
}
