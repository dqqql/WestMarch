import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const planeId = searchParams.get('planeId')
    
    if (!planeId) {
      return NextResponse.json({ error: '缺少planeId参数' }, { status: 400 })
    }
    
    const mapData = await repositories.map.getFullMap(planeId)
    return NextResponse.json(mapData)
  } catch (error) {
    console.error('Get map error:', error)
    return NextResponse.json({ error: '获取地图失败' }, { status: 500 })
  }
}
