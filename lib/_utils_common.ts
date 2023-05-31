import { Forecast, Resolution } from '@prisma/client'
import { QuestionWithForecasts } from '../prisma/additional'


export function getMostRecentForecastPerUser(forecasts: Forecast[], date: Date): [number, Forecast][] {
  const forecastsPerUser = new Map<number, Forecast>()
  for (const forecast of forecasts) {
    const authorId = forecast.userId
    if (forecastsPerUser.has(authorId) && forecast.createdAt < date) {
      const existingForecast = forecastsPerUser.get(authorId)
      if (existingForecast!.createdAt < forecast.createdAt) {
        forecastsPerUser.set(authorId, forecast)
      }
    } else if (forecast.createdAt < date) {
      forecastsPerUser.set(authorId, forecast)
    }
  }
  return Array.from(forecastsPerUser, ([id, value]) => [id, value])
}

export function getGeometricCommunityForecast(question: QuestionWithForecasts, date: Date): number {
  // get all forecasts for this question
  const uptoDateForecasts: number[] = getMostRecentForecastPerUser(question.forecasts, date).map(([, forecast]) => forecast.forecast.toNumber())
  // sum each forecast
  const productOfForecasts: number = uptoDateForecasts.reduce(
    (acc, forecast) => acc * forecast,
    1
  )
  // divide by number of forecasts
  return Math.pow(productOfForecasts, 1 / (uptoDateForecasts.length))
}

export function getCommunityForecast(question: QuestionWithForecasts, date: Date): number {
  return getGeometricCommunityForecast(question, date)
}

export function getArithmeticCommunityForecast(question: QuestionWithForecasts, date: Date): number {
  // get all forecasts for this question
  const uptoDateForecasts: number[] = getMostRecentForecastPerUser(question.forecasts, date).map(([, forecast]) => forecast.forecast.toNumber())
  // sum each forecast
  const summedForecasts: number = uptoDateForecasts.reduce(
    (acc, forecast) => acc + forecast,
    0
  )
  // divide by number of forecasts
  return summedForecasts / uptoDateForecasts.length
}


export function conciseDateTime(date: Date, includeTime = true) {
  let timeStr = ''
  if (includeTime)
    timeStr = `${zeroPad(date.getHours())}:${zeroPad(date.getMinutes())} on `
  return `${timeStr}${getDateYYYYMMDD(date)}`
}

export function displayForecast(forecast: Forecast, decimalPlaces: number): string {
  return `${formatDecimalNicely(forecast.forecast.times(100).toNumber(), decimalPlaces)}%`
}

export function formatScoreNicely(num: number, maxDigits: number, significantDigits: number): string {
  const rounded = +num.toPrecision(significantDigits)
  return formatDecimalNicely(rounded, maxDigits)
}

export function formatDecimalNicely(num: number, decimalPlaces: number): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
  })
}

export function getDateYYYYMMDD(date: Date) {
  return `${date.getFullYear()}-${zeroPad(date.getMonth() + 1)}-${zeroPad(date.getDate())}`
}
export function unixTimestamp(date: Date) {
  return Math.floor(date.getTime() / 1000)
}

export function zeroPad(num: number) {
  return num.toString().padStart(2, '0')
}

export function round(number: number, places = 2) {
  // @ts-ignore
  return +(Math.round(number + "e+" + places) + "e-" + places)
}

export function resolutionToString(resolution: Resolution) {
  return resolution.toString().charAt(0).toUpperCase() + resolution.toString().slice(1).toLowerCase()
}

export function getResolutionEmoji(resolution: Resolution | null) {
  switch (resolution) {
    case Resolution.YES:
      return '✅'
    case Resolution.NO:
      return '❎'
    case Resolution.AMBIGUOUS:
      return '❔'
    default:
      return ''
  }
}

export function floatEquality(a: number, b: number, tolerance: number = 0.0001) {
  return Math.abs(a - b) < tolerance
}

export function averageScores(scores: (number | undefined)[]) {
  const existentScores = scores.filter((s: number | undefined) => s != undefined) as number[]
  if (existentScores.length == 0) {
    return undefined
  } else {
    return existentScores.reduce((a, b) => a + b, 0) / scores.length
  }
}

export function toSentenceCase(str: string) {
  if (str.length === 0) {
    return ''
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function tomorrrowDate() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}