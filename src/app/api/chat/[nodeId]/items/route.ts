import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string }> }
) {
  const params = await context.params;
  try {
    const items = await repositories.chat.findItemCardsByNode(params.nodeId)
    return NextResponse.json(items)
  } catch (error) {
    console.error('Get items error:', error)
    return NextResponse.json({ error: '获取物品列表失败' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string }> }
) {
  const params = await context.params;
  try {
    const { name, description, price, authorId, characterId } = await request.json()

    if (!name || !description || price === undefined || !authorId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const item = await repositories.chat.createItemCard({
      nodeId: params.nodeId,
      name,
      description,
      price: parseFloat(price),
      authorId,
      characterId
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Create item error:', error)
    return NextResponse.json({ error: '创建物品卡片失败' }, { status: 500 })
  }
}
