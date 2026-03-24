import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getWeatherByCity, getForecastByCity } from './weatherApi'

const mockGeocodingResponse = {
  results: [
    {
      name: 'Athens',
      country: 'Greece',
      latitude: 37.98,
      longitude: 23.72,
    },
  ],
}

const mockForecastResponse = {
  current: {
    temperature_2m: 23.7,
    apparent_temperature: 22.1,
    relative_humidity_2m: 41,
    wind_speed_10m: 3.2,
    surface_pressure: 1012.4,
    weather_code: 0,
  },
  hourly: {
    time: [
      '2026-03-24T09:00',
      '2026-03-24T12:00',
      '2026-03-24T15:00',
      '2026-03-24T18:00',
      '2026-03-24T21:00',
    ],
    temperature_2m: [20.1, 22.4, 24.2, 21.8, 19.6],
    weather_code: [0, 1, 2, 3, 61],
    wind_speed_10m: [2.1, 2.5, 3.0, 3.6, 4.2],
  },
  daily: {
    time: [
      '2026-03-24',
      '2026-03-25',
      '2026-03-26',
      '2026-03-27',
      '2026-03-28',
    ],
    weather_code: [0, 1, 2, 61, 45],
    temperature_2m_max: [24.4, 25.1, 21.6, 19.2, 17.8],
    sunrise: [
      '2026-03-24T06:37',
      '2026-03-25T06:35',
      '2026-03-26T06:33',
      '2026-03-27T06:31',
      '2026-03-28T06:29',
    ],
    sunset: [
      '2026-03-24T18:45',
      '2026-03-25T18:46',
      '2026-03-26T18:47',
      '2026-03-27T18:48',
      '2026-03-28T18:49',
    ],
    uv_index_max: [5.4, 6.1, 4.8, 3.2, 2.9],
  },
}

function mockFetchSequence(responses) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() => {
      const next = responses.shift()

      if (!next) {
        throw new Error('No mock response left for fetch')
      }

      return Promise.resolve({
        ok: next.status >= 200 && next.status < 300,
        status: next.status,
        json: () => Promise.resolve(next.body),
      })
    }),
  )
}

describe('getWeatherByCity', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a normalised weather object on success', async () => {
    mockFetchSequence([
      { status: 200, body: mockGeocodingResponse },
      { status: 200, body: mockForecastResponse },
    ])

    const result = await getWeatherByCity('Athens')

    expect(result).toEqual({
      cityName: 'Athens',
      country: 'Greece',
      temp: 24,
      feelsLike: 22,
      humidity: 41,
      windSpeed: 3,
      pressure: 1012,
      uvIndex: 5,
      sunrise: '2026-03-24T06:37',
      sunset: '2026-03-24T18:45',
      description: 'Clear sky',
      icon: '01d',
      hourly: [
        {
          time: '2026-03-24T09:00',
          temp: 20,
          windSpeed: 2,
          description: 'Clear sky',
          icon: '01d',
        },
        {
          time: '2026-03-24T12:00',
          temp: 22,
          windSpeed: 3,
          description: 'Mainly clear',
          icon: '02d',
        },
        {
          time: '2026-03-24T15:00',
          temp: 24,
          windSpeed: 3,
          description: 'Partly cloudy',
          icon: '02d',
        },
        {
          time: '2026-03-24T18:00',
          temp: 22,
          windSpeed: 4,
          description: 'Overcast',
          icon: '03d',
        },
        {
          time: '2026-03-24T21:00',
          temp: 20,
          windSpeed: 4,
          description: 'Slight rain',
          icon: '10d',
        },
      ],
    })
  })

  it('throws "City not found" when geocoding returns no results', async () => {
    mockFetchSequence([
      { status: 200, body: { results: [] } },
    ])

    await expect(getWeatherByCity('Nowhere')).rejects.toThrow('City not found')
  })

  it('throws "Weather service unavailable" when geocoding request fails', async () => {
    mockFetchSequence([
      { status: 500, body: {} },
    ])

    await expect(getWeatherByCity('Athens')).rejects.toThrow('Weather service unavailable')
  })

  it('throws "Weather service unavailable" when forecast request fails', async () => {
    mockFetchSequence([
      { status: 200, body: mockGeocodingResponse },
      { status: 503, body: {} },
    ])

    await expect(getWeatherByCity('Athens')).rejects.toThrow('Weather service unavailable')
  })
})

describe('getForecastByCity', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns an array of 5 items', async () => {
    mockFetchSequence([
      { status: 200, body: mockGeocodingResponse },
      { status: 200, body: mockForecastResponse },
    ])

    const result = await getForecastByCity('Athens')

    expect(result).toHaveLength(5)
  })

  it('each item has date, temp, description, icon', async () => {
    mockFetchSequence([
      { status: 200, body: mockGeocodingResponse },
      { status: 200, body: mockForecastResponse },
    ])

    const result = await getForecastByCity('Athens')

    expect(result[0]).toEqual({
      date: '2026-03-24',
      temp: 24,
      description: 'Clear sky',
      icon: '01d',
    })
  })

  it('maps all forecast days correctly', async () => {
    mockFetchSequence([
      { status: 200, body: mockGeocodingResponse },
      { status: 200, body: mockForecastResponse },
    ])

    const result = await getForecastByCity('Athens')

    expect(result[4]).toEqual({
      date: '2026-03-28',
      temp: 18,
      description: 'Fog',
      icon: '50d',
    })
  })

  it('throws "City not found" when geocoding returns no results', async () => {
    mockFetchSequence([
      { status: 200, body: { results: [] } },
    ])

    await expect(getForecastByCity('Nowhere')).rejects.toThrow('City not found')
  })

  it('throws "Weather service unavailable" when geocoding request fails', async () => {
    mockFetchSequence([
      { status: 503, body: {} },
    ])

    await expect(getForecastByCity('Athens')).rejects.toThrow('Weather service unavailable')
  })

  it('throws "Weather service unavailable" when forecast request fails', async () => {
    mockFetchSequence([
      { status: 200, body: mockGeocodingResponse },
      { status: 500, body: {} },
    ])

    await expect(getForecastByCity('Athens')).rejects.toThrow('Weather service unavailable')
  })
})