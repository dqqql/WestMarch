import type { WeatherType } from '@prisma/client'

export interface WeatherConfig {
  name: string
  icon: string
  color: string
  gradient: string
  isSpecial: boolean
}

export const WEATHER_CONFIGS: Record<WeatherType, WeatherConfig> = {
  SUNNY: {
    name: '晴天',
    icon: '☀️',
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-yellow-500/10',
    isSpecial: false
  },
  PARTLY_CLOUDY: {
    name: '多云',
    icon: '⛅',
    color: 'text-blue-300',
    gradient: 'from-blue-400/20 to-slate-500/10',
    isSpecial: false
  },
  CLOUDY: {
    name: '阴天',
    icon: '☁️',
    color: 'text-slate-400',
    gradient: 'from-slate-500/20 to-zinc-600/10',
    isSpecial: false
  },
  RAINY: {
    name: '雨天',
    icon: '🌧️',
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-indigo-600/10',
    isSpecial: false
  },
  SNOWSTORM: {
    name: '暴风雪',
    icon: '❄️',
    color: 'text-cyan-300',
    gradient: 'from-cyan-400/20 to-blue-600/10',
    isSpecial: true
  },
  ACID_RAIN: {
    name: '酸雨',
    icon: '☢️',
    color: 'text-green-400',
    gradient: 'from-green-500/20 to-lime-600/10',
    isSpecial: true
  },
  FOG: {
    name: '浓雾',
    icon: '🌫️',
    color: 'text-gray-300',
    gradient: 'from-gray-400/20 to-zinc-500/10',
    isSpecial: true
  },
  SANDSTORM: {
    name: '沙尘暴',
    icon: '🌪️',
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-amber-600/10',
    isSpecial: true
  },
  THUNDERSTORM: {
    name: '雷暴',
    icon: '⚡',
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-violet-600/10',
    isSpecial: true
  }
}

const BASIC_WEATHERS: WeatherType[] = ['SUNNY', 'PARTLY_CLOUDY', 'CLOUDY', 'RAINY']
const SPECIAL_WEATHERS: WeatherType[] = ['SNOWSTORM', 'ACID_RAIN', 'FOG', 'SANDSTORM', 'THUNDERSTORM']

const BASIC_WEATHER_WEIGHTS: Record<WeatherType, number> = {
  SUNNY: 40,
  PARTLY_CLOUDY: 30,
  CLOUDY: 20,
  RAINY: 10,
  SNOWSTORM: 0,
  ACID_RAIN: 0,
  FOG: 0,
  SANDSTORM: 0,
  THUNDERSTORM: 0
}

const WEATHER_TRANSITIONS: Record<WeatherType, WeatherType[]> = {
  SUNNY: ['SUNNY', 'SUNNY', 'PARTLY_CLOUDY', 'CLOUDY'],
  PARTLY_CLOUDY: ['SUNNY', 'SUNNY', 'CLOUDY', 'RAINY'],
  CLOUDY: ['SUNNY', 'PARTLY_CLOUDY', 'RAINY', 'FOG'],
  RAINY: ['CLOUDY', 'PARTLY_CLOUDY', 'SUNNY', 'THUNDERSTORM'],
  SNOWSTORM: ['CLOUDY', 'FOG'],
  ACID_RAIN: ['RAINY', 'CLOUDY'],
  FOG: ['CLOUDY', 'PARTLY_CLOUDY', 'SUNNY'],
  SANDSTORM: ['CLOUDY', 'PARTLY_CLOUDY'],
  THUNDERSTORM: ['RAINY', 'CLOUDY', 'PARTLY_CLOUDY']
}

export function generateNextWeather(currentWeather?: WeatherType): WeatherType {
  const specialChance = 0.08
  const random = Math.random()
  
  if (!currentWeather) {
    const totalWeight = BASIC_WEATHERS.reduce((sum, w) => sum + BASIC_WEATHER_WEIGHTS[w], 0)
    let randomValue = Math.random() * totalWeight
    
    for (const weather of BASIC_WEATHERS) {
      randomValue -= BASIC_WEATHER_WEIGHTS[weather]
      if (randomValue <= 0) {
        return weather
      }
    }
    return 'SUNNY'
  }
  
  if (random < specialChance && !WEATHER_CONFIGS[currentWeather].isSpecial) {
    return SPECIAL_WEATHERS[Math.floor(Math.random() * SPECIAL_WEATHERS.length)]
  }
  
  const possibleTransitions = WEATHER_TRANSITIONS[currentWeather]
  return possibleTransitions[Math.floor(Math.random() * possibleTransitions.length)]
}

export function generateWeatherDuration(): number {
  const minDays = 1
  const maxDays = 4
  return Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays
}

export function getWeatherDescription(weather: WeatherType): string {
  const descriptions: Record<WeatherType, string[]> = {
    SUNNY: ['阳光明媚，适合外出冒险', '晴空万里，是个好天气', '温暖的阳光照耀大地'],
    PARTLY_CLOUDY: ['白云朵朵，微风拂面', '时有云彩遮挡阳光', '多云转晴的好兆头'],
    CLOUDY: ['天空阴沉沉的', '厚厚的云层遮蔽了阳光', '可能要下雨了'],
    RAINY: ['淅淅沥沥的小雨', '大雨倾盆，注意保暖', '雨水冲刷着大地'],
    SNOWSTORM: ['暴风雪来袭，寸步难行', '寒风刺骨，大雪纷飞', '冰雪覆盖了一切'],
    ACID_RAIN: ['诡异的绿色雨水从天而降', '酸雨腐蚀着一切', '这是魔法污染的迹象'],
    FOG: ['浓雾弥漫，能见度极低', '迷雾中似乎隐藏着什么', '伸手不见五指的大雾'],
    SANDSTORM: ['沙尘暴席卷而来', '黄沙漫天，睁不开眼', '狂风呼啸，沙石飞扬'],
    THUNDERSTORM: ['雷电交加，暴雨倾盆', '雷声轰鸣，闪电划破天空', '暴风雨来临了']
  }
  
  const options = descriptions[weather]
  return options[Math.floor(Math.random() * options.length)]
}
