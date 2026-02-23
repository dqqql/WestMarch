import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { sourceId, targetId } = await request.json()

    if (!sourceId || !targetId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const edge = await prisma.mapEdge.create({
      data: {
        sourceId,
        targetId
      }
    })

    return NextResponse.json(edge)
  } catch (error) {
    console.error('Create edge error:', error)
    return NextResponse.json({ error: '创建边失败' }, { status: 500 })
  }
}
