import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function POST(request: NextRequest) {
  try {
    const { sourceId, targetId, pathStyle, color, width, planeId } = await request.json()

    if (!sourceId || !targetId || !planeId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const edge = await repositories.map.createEdge({
      sourceId,
      targetId,
      pathStyle,
      color,
      width,
      planeId
    })

    return NextResponse.json(edge)
  } catch (error) {
    console.error('Create edge error:', error)
    return NextResponse.json({ error: '创建边失败' }, { status: 500 })
  }
}
