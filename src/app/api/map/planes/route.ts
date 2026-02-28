import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

async function getOrCreateDefaultUser() {
  let user = await repositories.user.findByUsername('default')
  if (!user) {
    user = await repositories.user.create({
      username: 'default',
      password: 'default'
    })
  }
  return user
}

export async function GET() {
  try {
    const planes = await repositories.map.findAllPlanes()
    return NextResponse.json(planes)
  } catch (error) {
    console.error('Get planes error:', error)
    return NextResponse.json({ error: '获取位面列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const user = await getOrCreateDefaultUser()

    const plane = await repositories.map.createPlane({
      name: body.name,
      creatorId: user.id,
      radius: body.radius || 10
    })
    return NextResponse.json(plane)
  } catch (error) {
    console.error('Create plane error:', error)
    return NextResponse.json({ error: '创建位面失败' }, { status: 500 })
  }
}
