import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({
        userNickname: null,
        userAvatar: null,
        sessionHistory: []
      })
    }

    let settings = await prisma.userSetting.findUnique({
      where: { userId }
    })

    if (!settings) {
      settings = await prisma.userSetting.create({
        data: {
          userId,
          userNickname: null,
          userAvatar: null,
          sessionHistory: [] as any
        }
      })
    }

    return NextResponse.json({
      userNickname: settings.userNickname,
      userAvatar: settings.userAvatar,
      sessionHistory: settings.sessionHistory || []
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({
      userNickname: null,
      userAvatar: null,
      sessionHistory: []
    })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { userNickname, userAvatar, sessionHistory } = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({
        userNickname: null,
        userAvatar: null,
        sessionHistory: []
      })
    }

    const settings = await prisma.userSetting.upsert({
      where: { userId },
      update: {
        userNickname,
        userAvatar,
        sessionHistory: sessionHistory as any
      },
      create: {
        userId,
        userNickname,
        userAvatar,
        sessionHistory: sessionHistory as any
      }
    })

    return NextResponse.json({
      userNickname: settings.userNickname,
      userAvatar: settings.userAvatar,
      sessionHistory: settings.sessionHistory || []
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({
      userNickname: null,
      userAvatar: null,
      sessionHistory: []
    })
  }
}
