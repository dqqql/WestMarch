import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 })
    }

    let user = await repositories.user.findByUsername(username)

    if (!user) {
      user = await repositories.user.create({
        username,
        password
      })
    } else if (user.password !== password) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        isDM: user.isDM,
        nickname: user.nickname,
        avatar: user.avatar
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}
