import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'
import { defaultDocuments } from '@/config'

export async function GET() {
  try {
    let documents = await repositories.document.findAll()

    if (documents.length === 0) {
      for (const doc of defaultDocuments) {
        await repositories.document.create(doc)
      }
      documents = await repositories.document.findAll()
    }

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json({ error: '获取文档失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, category, author, isPinned } = await request.json()

    if (!title || !content || !category || !author) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const document = await repositories.document.create({
      title,
      content,
      category,
      author,
      isPinned: isPinned || false
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Add document error:', error)
    return NextResponse.json({ error: '添加文档失败' }, { status: 500 })
  }
}
