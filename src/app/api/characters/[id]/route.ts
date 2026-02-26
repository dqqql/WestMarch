import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, race, class: charClass, img, str, dex, con, int, wis, cha, bio, fullBio } = await request.json()

    const character = await repositories.character.update(id, {
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
      fullBio
    })

    return NextResponse.json(character)
  } catch (error) {
    console.error('Update character error:', error)
    return NextResponse.json({ error: '更新角色失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await repositories.character.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete character error:', error)
    return NextResponse.json({ error: '删除角色失败' }, { status: 500 })
  }
}
