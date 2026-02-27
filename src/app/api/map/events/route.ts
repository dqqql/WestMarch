import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function POST(request: NextRequest) {
  try {
    const { nodeId, title, description, tags, order } = await request.json()

    if (!nodeId || !title) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const event = await repositories.map.createEvent({
      nodeId,
      title,
      description,
      tags: tags || null,
      order: order || 0
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ error: '创建事件失败' }, { status: 500 })
  }
}
