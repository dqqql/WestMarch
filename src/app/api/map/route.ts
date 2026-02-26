import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(request: NextRequest) {
  try {
    const mapData = await repositories.map.getFullMap()
    return NextResponse.json(mapData)
  } catch (error) {
    console.error('Get map error:', error)
    return NextResponse.json({ error: '获取地图失败' }, { status: 500 })
  }
}
