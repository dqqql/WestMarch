import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(request: NextRequest) {
  try {
    const strongholds = await repositories.chat.findStrongholdNodes()
    return NextResponse.json(strongholds)
  } catch (error) {
    console.error('Get strongholds error:', error)
    return NextResponse.json({ error: '获取据点列表失败' }, { status: 500 })
  }
}
