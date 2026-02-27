import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const node = await repositories.map.findNodeById(id)
    if (!node) {
      return NextResponse.json({ error: '节点不存在' }, { status: 404 })
    }
    return NextResponse.json(node)
  } catch (error) {
    console.error('Get node error:', error)
    return NextResponse.json({ error: '获取节点失败' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { label, type, hexQ, hexR, hexS, description } = await request.json()

    const node = await repositories.map.updateNode(id, {
      label,
      type,
      hexQ,
      hexR,
      hexS,
      description
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
    await repositories.map.deleteNode(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete node error:', error)
    return NextResponse.json({ error: '删除节点失败' }, { status: 500 })
  }
}
