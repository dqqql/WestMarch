import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function GET(request: NextRequest) {
  try {
    const parties = await repositories.party.findAll()
    return NextResponse.json(parties)
  } catch (error) {
    console.error('Get parties error:', error)
    return NextResponse.json({ error: '获取组队信息失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, authorId, characterId, maxCount, nextSessionTime } = await request.json()

    if (!title || !content || !authorId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const user = await repositories.user.findById(authorId)
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 })
    }

    const party = await repositories.party.create({
      title,
      content,
      authorId,
      characterId: characterId || null,
      maxCount: maxCount || 4,
      nextSessionTime: nextSessionTime ? new Date(nextSessionTime).toISOString() : null
    })

    if (characterId) {
      await repositories.party.addMember(party.id, characterId)
    }

    const updatedParty = await repositories.party.findById(party.id)
    return NextResponse.json(updatedParty)
  } catch (error) {
    console.error('Create party error:', error)
    return NextResponse.json({ error: '创建组队失败' }, { status: 500 })
  }
}
