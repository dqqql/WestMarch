import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const facility = await repositories.map.updateFacility(id, data)
    return NextResponse.json(facility)
  } catch (error) {
    console.error('Update facility error:', error)
    return NextResponse.json({ error: '更新设施失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await repositories.map.deleteFacility(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete facility error:', error)
    return NextResponse.json({ error: '删除设施失败' }, { status: 500 })
  }
}
