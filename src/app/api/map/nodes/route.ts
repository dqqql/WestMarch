import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function POST(request: NextRequest) {
  try {
    const { label, type, x, y, description } = await request.json()

    if (!label || !type || x === undefined || y === undefined) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const node = await repositories.map.createNode({
      label,
      type,
      x,
      y,
      description
    })

    return NextResponse.json(node)
  } catch (error) {
    console.error('Create node error:', error)
    return NextResponse.json({ error: '创建节点失败' }, { status: 500 })
  }
}
