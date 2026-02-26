import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const characters = await repositories.character.findAll(userId || undefined)
    return NextResponse.json(characters)
  } catch (error) {
    console.error('Get characters error:', error)
    return NextResponse.json({ error: '获取角色失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, race, class: charClass, img, str, dex, con, int, wis, cha, bio, fullBio, userId } = await request.json()

    if (!name || !race || !charClass || !userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const user = await repositories.user.findById(userId)
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 })
    }

    const character = await repositories.character.create({
      name,
      race,
      class: charClass,
      img,
      str,
      dex,
      con,
      int,
      wis,
      cha,
      bio,
      fullBio,
      userId
    })

    return NextResponse.json(character)
  } catch (error) {
    console.error('Add character error:', error)
    return NextResponse.json({ error: '添加角色失败' }, { status: 500 })
  }
}
