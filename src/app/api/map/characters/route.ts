import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function POST(request: NextRequest) {
  try {
    const { nodeId, name, description, role, avatar, order } = await request.json()

    if (!nodeId || !name) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const character = await repositories.map.createCharacter({
      nodeId,
      name,
      description,
      role,
      avatar,
      order: order || 0
    })

    return NextResponse.json(character)
  } catch (error) {
    console.error('Create character error:', error)
    return NextResponse.json({ error: '创建人物失败' }, { status: 500 })
  }
}
