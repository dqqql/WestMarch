import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string; partyId: string }> }
) {
  const params = await context.params;

  try {
    const { authorId, scheduledAt } = await request.json()

    if (!authorId) {
      return NextResponse.json({ error: 'Missing authorId' }, { status: 400 })
    }

    let parsedScheduledAt: Date | null = null
    if (scheduledAt) {
      parsedScheduledAt = new Date(scheduledAt)
      if (Number.isNaN(parsedScheduledAt.getTime())) {
        return NextResponse.json({ error: 'Invalid schedule time' }, { status: 400 })
      }
    }

    const updatedParty = await repositories.chat.updatePartyCardSchedule(
      params.partyId,
      authorId,
      parsedScheduledAt
    )

    return NextResponse.json(updatedParty)
  } catch (error: any) {
    console.error('Update party schedule error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update party schedule' }, { status: 500 })
  }
}
