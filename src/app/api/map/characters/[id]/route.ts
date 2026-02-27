import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const character = await repositories.map.updateCharacter(id, data)
    return NextResponse.json(character)
  } catch (error) {
    console.error('Update character error:', error)
    return NextResponse.json({ error: '更新人物失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await repositories.map.deleteCharacter(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete character error:', error)
    return NextResponse.json({ error: '删除人物失败' }, { status: 500 })
  }
}
