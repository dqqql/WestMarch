import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keys = searchParams.get('keys')?.split(',') || []
    
    if (keys.length > 0) {
      const settings = await repositories.systemSetting.getMany(keys)
      return NextResponse.json(settings)
    }
    
    return NextResponse.json({})
  } catch (error) {
    console.error('Get system settings error:', error)
    return NextResponse.json({ error: '获取系统设置失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { key, value } = await request.json()
    
    if (!key || value === undefined) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }
    
    await repositories.systemSetting.set(key, value)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Set system setting error:', error)
    return NextResponse.json({ error: '保存系统设置失败' }, { status: 500 })
  }
}
