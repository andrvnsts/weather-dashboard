import { describe, it, expect } from 'vitest'
import {
  formatTemperature,
  formatTime,
  formatDate,
  formatWindSpeed,
} from './formatters'

describe('formatTemperature', () => {
  it('rounds and appends °C for positive values', () => {
    expect(formatTemperature(23.4)).toBe('23°C')
  })

  it('rounds negative values correctly', () => {
    expect(formatTemperature(-5.7)).toBe('-6°C')
  })

  it('handles exact integers', () => {
    expect(formatTemperature(0)).toBe('0°C')
  })
})

describe('formatTime', () => {
  it('returns HH:MM with leading zeros', () => {
    const date = new Date(2026, 2, 19, 9, 3) // 09:03
    expect(formatTime(date)).toBe('09:03')
  })

  it('works for two-digit hours and minutes', () => {
    const date = new Date(2026, 2, 19, 14, 30)
    expect(formatTime(date)).toBe('14:30')
  })
})

describe('formatDate', () => {
  it('returns string in "Thu, 19 Mar" format', () => {
    // 2026-03-19 is a Thursday
    const date = new Date(2026, 2, 19)
    expect(formatDate(date)).toBe('Thu, 19 Mar')
  })
})

describe('formatWindSpeed', () => {
  it('appends m/s', () => {
    expect(formatWindSpeed(5)).toBe('5 m/s')
  })

  it('works with decimal speeds', () => {
    expect(formatWindSpeed(3.2)).toBe('3.2 m/s')
  })
})
