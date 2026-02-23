import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const [nodes, edges] = await Promise.all([
      prisma.mapNode.findMany(),
      prisma.mapEdge.findMany()
    ])
    return NextResponse.json({ nodes, edges })
  } catch (error) {
    console.error('Get map error:', error)
    return NextResponse.json({ error: '获取地图失败' }, { status: 500 })
  }
}
