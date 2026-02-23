import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    let settings = await prisma.userSetting.findUnique({
      where: { userId }
    })

    if (!settings) {
      settings = await prisma.userSetting.create({
        data: {
          userId,
          userNickname: null,
          userAvatar: null,
          sessionHistory: []
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: '获取设置失败' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { userNickname, userAvatar, sessionHistory } = await request.json()

    const settings = await prisma.userSetting.upsert({
      where: { userId },
      update: {
        userNickname,
        userAvatar,
        sessionHistory
      },
      create: {
        userId,
        userNickname,
        userAvatar,
        sessionHistory
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: '更新设置失败' }, { status: 500 })
  }
}
