import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const party = await repositories.party.findById(id)
    if (!party) {
      return NextResponse.json({ error: '组队不存在' }, { status: 404 })
    }
    return NextResponse.json(party)
  } catch (error) {
    console.error('Get party error:', error)
    return NextResponse.json({ error: '获取组队失败' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { title, content, characterId, maxCount, nextSessionTime } = await request.json()

    const party = await repositories.party.update(id, {
      title,
      content,
      characterId,
      maxCount,
      nextSessionTime: nextSessionTime ? new Date(nextSessionTime).toISOString() : null
    })

    return NextResponse.json(party)
  } catch (error) {
    console.error('Update party error:', error)
    return NextResponse.json({ error: '更新组队失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await repositories.party.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete party error:', error)
    return NextResponse.json({ error: '删除组队失败' }, { status: 500 })
  }
}
