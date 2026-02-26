import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { defaultDocuments } from '@/config'

export async function GET() {
  try {
    let documents = await prisma.document.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    if (documents.length === 0) {
      for (const doc of defaultDocuments) {
        await prisma.document.create({ data: doc })
      }
      documents = await prisma.document.findMany({
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ]
      })
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

    const document = await prisma.document.create({
      data: {
        title,
        content,
        category,
        author,
        isPinned: isPinned || false
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Add document error:', error)
    return NextResponse.json({ error: '添加文档失败' }, { status: 500 })
  }
}
