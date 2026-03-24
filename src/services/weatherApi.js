const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

function getWeatherDescription(code) {
  const codeMap = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  }

  return codeMap[code] ?? 'Unknown'
}

function getWeatherIcon(code) {
  if (code === 0) return '01d'
  if ([1, 2].includes(code)) return '02d'
  if (code === 3) return '03d'
  if ([45, 48].includes(code)) return '50d'
  if ([51, 53, 55, 56, 57].includes(code)) return '09d'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '10d'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '13d'
  if ([95, 96, 99].includes(code)) return '11d'
  return '01d'
}

async function getCityCoordinates(city) {
  const response = await fetch(
    `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  )

  if (!response.ok) {
    throw new Error('Weather service unavailable')
  }

  const data = await response.json()

  if (!data.results || data.results.length === 0) {
    throw new Error('City not found')
  }

  const result = data.results[0]

  return {
    name: result.name,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
  }
}

async function getForecastDataByCoords(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'surface_pressure',
      'weather_code',
    ].join(','),
    hourly: ['temperature_2m', 'weather_code', 'wind_speed_10m'].join(','),
    daily: 'weather_code,temperature_2m_max,sunrise,sunset,uv_index_max',
    timezone: 'auto',
    forecast_days: '5',
  })

  const response = await fetch(`${FORECAST_URL}?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Weather service unavailable')
  }

  return response.json()
}

export async function getWeatherByCity(city) {
  const place = await getCityCoordinates(city)
  const data = await getForecastDataByCoords(place.latitude, place.longitude)

  return {
    cityName: place.name,
    country: place.country,
    temp: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    pressure: Math.round(data.current.surface_pressure),
    uvIndex: Math.round(data.daily.uv_index_max[0] ?? 0),
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0],
    description: getWeatherDescription(data.current.weather_code),
    icon: getWeatherIcon(data.current.weather_code),
    hourly: data.hourly.time.map((time, index) => ({
      time,
      temp: Math.round(data.hourly.temperature_2m[index]),
      windSpeed: Math.round(data.hourly.wind_speed_10m[index]),
      description: getWeatherDescription(data.hourly.weather_code[index]),
      icon: getWeatherIcon(data.hourly.weather_code[index]),
    })),
  }
}

export async function getForecastByCity(city) {
  const place = await getCityCoordinates(city)
  const data = await getForecastDataByCoords(place.latitude, place.longitude)

  return data.daily.time.map((date, index) => ({
    date,
    temp: Math.round(data.daily.temperature_2m_max[index]),
    description: getWeatherDescription(data.daily.weather_code[index]),
    icon: getWeatherIcon(data.daily.weather_code[index]),
  }))
}

export async function getWeatherByCoords(latitude, longitude) {
  const reverseResponse = await fetch(
    `${GEOCODING_URL}?latitude=${latitude}&longitude=${longitude}&language=en&format=json`
  )

  const weatherData = await getForecastDataByCoords(latitude, longitude)

  let cityName = 'Current location'
  let country = ''

  if (reverseResponse.ok) {
    const reverseData = await reverseResponse.json()
    if (reverseData.results && reverseData.results.length > 0) {
      cityName = reverseData.results[0].name ?? cityName
      country = reverseData.results[0].country ?? ''
    }
  }

  return {
    weather: {
      cityName,
      country,
      temp: Math.round(weatherData.current.temperature_2m),
      feelsLike: Math.round(weatherData.current.apparent_temperature),
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: Math.round(weatherData.current.wind_speed_10m),
      pressure: Math.round(weatherData.current.surface_pressure),
      uvIndex: Math.round(weatherData.daily.uv_index_max[0] ?? 0),
      sunrise: weatherData.daily.sunrise[0],
      sunset: weatherData.daily.sunset[0],
      description: getWeatherDescription(weatherData.current.weather_code),
      icon: getWeatherIcon(weatherData.current.weather_code),
      hourly: weatherData.hourly.time.map((time, index) => ({
        time,
        temp: Math.round(weatherData.hourly.temperature_2m[index]),
        windSpeed: Math.round(weatherData.hourly.wind_speed_10m[index]),
        description: getWeatherDescription(weatherData.hourly.weather_code[index]),
        icon: getWeatherIcon(weatherData.hourly.weather_code[index]),
      })),
    },
    forecast: weatherData.daily.time.map((date, index) => ({
      date,
      temp: Math.round(weatherData.daily.temperature_2m_max[index]),
      description: getWeatherDescription(weatherData.daily.weather_code[index]),
      icon: getWeatherIcon(weatherData.daily.weather_code[index]),
    })),
  }
}