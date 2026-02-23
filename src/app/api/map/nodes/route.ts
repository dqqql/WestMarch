import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { label, type, x, y, description } = await request.json()

    if (!label || !type || x === undefined || y === undefined) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const node = await prisma.mapNode.create({
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
    console.error('Create node error:', error)
    return NextResponse.json({ error: '创建节点失败' }, { status: 500 })
  }
}
