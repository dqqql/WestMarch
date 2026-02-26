import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { title, content, category, isPinned } = await request.json()

    const document = await repositories.document.update(id, {
      title,
      content,
      category,
      isPinned
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Update document error:', error)
    return NextResponse.json({ error: '更新文档失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await repositories.document.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json({ error: '删除文档失败' }, { status: 500 })
  }
}
