import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await repositories.map.deleteEdge(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete edge error:', error)
    return NextResponse.json({ error: '删除边失败' }, { status: 500 })
  }
}
