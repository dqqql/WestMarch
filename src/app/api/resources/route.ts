import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET() {
  try {
    const resources = await repositories.resource.findAll()
    return NextResponse.json(resources)
  } catch (error) {
    console.error('Get resources error:', error)
    return NextResponse.json({ error: '获取资源失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, url, category, userId } = await request.json()

    if (!name || !url || !category || !userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const user = await repositories.user.findById(userId)
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 })
    }

    const resource = await repositories.resource.create({
      name,
      url,
      category,
      userId
    })

    return NextResponse.json(resource)
  } catch (error) {
    console.error('Add resource error:', error)
    return NextResponse.json({ error: '添加资源失败' }, { status: 500 })
  }
}
