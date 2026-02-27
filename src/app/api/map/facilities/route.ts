import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function POST(request: NextRequest) {
  try {
    const { nodeId, name, description, type, order } = await request.json()

    if (!nodeId || !name) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const facility = await repositories.map.createFacility({
      nodeId,
      name,
      description,
      type,
      order: order || 0
    })

    return NextResponse.json(facility)
  } catch (error) {
    console.error('Create facility error:', error)
    return NextResponse.json({ error: '创建设施失败' }, { status: 500 })
  }
}
