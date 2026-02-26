import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const user = await repositories.user.findById(userId)
    if (!user) {
      return NextResponse.json({
        userNickname: null,
        userAvatar: null,
        sessionHistory: []
      })
    }

    const settings = await repositories.settings.findByUserId(userId)

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

    const user = await repositories.user.findById(userId)
    if (!user) {
      return NextResponse.json({
        userNickname: null,
        userAvatar: null,
        sessionHistory: []
      })
    }

    const settings = await repositories.settings.update(userId, {
      userNickname,
      userAvatar,
      sessionHistory
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
