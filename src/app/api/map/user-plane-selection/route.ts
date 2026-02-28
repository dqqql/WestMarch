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
    const user = await getOrCreateDefaultUser()
    const selection = await repositories.map.getUserPlaneSelection(user.id)
    return NextResponse.json(selection)
  } catch (error) {
    console.error('Get user plane selection error:', error)
    return NextResponse.json({ error: '获取用户位面选择失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const user = await getOrCreateDefaultUser()
    const selection = await repositories.map.setUserPlaneSelection(user.id, body.planeId)
    return NextResponse.json(selection)
  } catch (error) {
    console.error('Set user plane selection error:', error)
    return NextResponse.json({ error: '设置用户位面选择失败' }, { status: 500 })
  }
}
