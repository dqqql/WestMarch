import { NextRequest, NextResponse } from 'next/server'
import { repositories } from '@/repositories'
import type { WeatherType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const history = searchParams.get('history')
    
    if (date) {
      const weather = await repositories.weather.getByDate(date)
      return NextResponse.json(weather)
    }
    
    if (history === 'true') {
      const weatherHistory = await repositories.weather.getHistory(30)
      return NextResponse.json(weatherHistory)
    }
    
    const allWeather = await repositories.weather.getAll()
    return NextResponse.json(allWeather)
  } catch (error) {
    console.error('Get weather error:', error)
    return NextResponse.json({ error: '获取天气数据失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { date, weatherType, description } = await request.json()
    
    if (!date || !weatherType) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }
    
    const weather = await repositories.weather.createOrUpdate(
      date,
      weatherType as WeatherType,
      description
    )
    return NextResponse.json(weather)
  } catch (error) {
    console.error('Set weather error:', error)
    return NextResponse.json({ error: '保存天气数据失败' }, { status: 500 })
  }
}
