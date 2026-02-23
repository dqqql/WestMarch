import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { label, type, x, y, description } = await request.json()

    const node = await prisma.mapNode.update({
      where: { id },
      data: {
        label,
        type: type as any,
        x,
        y,
        description
      }
    })

    return NextResponse.json(node)
  } catch (error) {
    console.error('Update node error:', error)
    return NextResponse.json({ error: '更新节点失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.mapNode.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete node error:', error)
    return NextResponse.json({ error: '删除节点失败' }, { status: 500 })
  }
}
