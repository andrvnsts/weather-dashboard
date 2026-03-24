import { useState, useEffect } from 'react'

import { getWeatherByCity, getForecastByCity, getWeatherByCoords } from './services/weatherApi'
import { loadLastCity, saveLastCity, loadTheme, saveTheme, loadSearchHistory, saveSearchHistory } from './utils/storage'
import { formatTemperature, formatWindSpeed, formatTime, formatDate } from './utils/formatters'

import currentLocationIcon from './assets/icons/currentLocation.svg'
import searchIcon from './assets/icons/search.svg'
import clearMainIcon from './assets/icons/clear 1.svg'
import sunriseIcon from './assets/icons/sunrise-white 1.svg'
import sunsetIcon from './assets/icons/sunset-white 1.svg'
import humidityIcon from './assets/icons/humidity 1.svg'
import windIcon from './assets/icons/wind 1.svg'
import pressureIcon from './assets/icons/pressure-white 1.svg'
import uvIcon from './assets/icons/uv-white 1.svg'
import cloudsIcon from './assets/icons/clouds 1.svg'
import clearSmallIcon from './assets/icons/clear 2.svg'
import drizzleIcon from './assets/icons/drizzle 1.svg'
import mistIcon from './assets/icons/mist 1.svg'
import rainIcon from './assets/icons/rain 1.svg'
import navigationIcon from './assets/icons/navigation 1.svg'
import humidityDarkIcon from './assets/icons/humidityDark 1.svg'
import windDarkIcon from './assets/icons/windDark1.svg'
import pressureDarkIcon from './assets/icons/pressure-whiteDark 1.svg'
import uvDarkIcon from './assets/icons/uv-whiteDark 1.svg'
import sunriseDarkIcon from './assets/icons/sunrise-whiteDark 1.svg'
import sunsetDarkIcon from './assets/icons/sunset-whiteDark 1.svg'

const DEFAULT_CITY = 'Athens'


function App() {
  const [isDark, setIsDark] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [hourlyForecast, setHourlyForecast] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function updateHistory(cityName) {
    setSearchHistory(prev => {
      const updatedHistory = [cityName, ...prev.filter(city => city !== cityName)].slice(0, 5)
      saveSearchHistory(updatedHistory)
      return updatedHistory
    })
  }

  function getUpcomingHourlyItems(hourlyItems) {
    const nowMs = Date.now()
    const upcoming = hourlyItems.filter(item => new Date(item.time).getTime() >= nowMs)
    return (upcoming.length > 0 ? upcoming : hourlyItems).slice(0, 5)
  }

  async function fetchWeather(city) {
    setLoading(true)
    setError(null)
    try {
      const [weatherData, forecastData] = await Promise.all([
        getWeatherByCity(city),
        getForecastByCity(city),
      ])
      setWeather(weatherData)
      setForecast(forecastData)
      setHourlyForecast(getUpcomingHourlyItems(weatherData.hourly ?? []))
      saveLastCity(weatherData.cityName)
      updateHistory(weatherData.cityName)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchWeatherByCoords(latitude, longitude) {
    setLoading(true)
    setError(null)
  
    try {
      const data = await getWeatherByCoords(latitude, longitude)
      setWeather(data.weather)
      setForecast(data.forecast)
      setHourlyForecast(getUpcomingHourlyItems(data.weather.hourly ?? []))
      saveLastCity(data.weather.cityName)
      updateHistory(data.weather.cityName)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const city = loadLastCity() ?? DEFAULT_CITY
    fetchWeather(city)
  }, [])

  useEffect(() => {
    const savedTheme = loadTheme()
    if (savedTheme === 'dark') {
      setIsDark(true)
    }
  }, [])

  useEffect(() => {
    const history = loadSearchHistory()
    setSearchHistory(history)
  }, [])

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter' && inputValue.trim()) {
      fetchWeather(inputValue.trim())
      setInputValue('')
    }
  }

  function handleThemeToggle() {
    setIsDark(prev => {
      const nextIsDark = !prev
      saveTheme(nextIsDark ? 'dark' : 'light')
      return nextIsDark
    })
  }

  function handleCurrentLocationClick() {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        fetchWeatherByCoords(latitude, longitude)
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError('Location permission denied')
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setError('Location unavailable')
        } else if (geoError.code === geoError.TIMEOUT) {
          setError('Location request timed out')
        } else {
          setError('Unable to get current location')
        }
      
        fetchWeather('Minsk')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  function formatSunTime(value) {
    if (!value) return '—'
    return formatTime(new Date(value))
  }

  function getWeatherVisualIcon(iconCode, variant = 'main') {
    const isMain = variant === 'main'

    if (!iconCode) return isMain ? clearMainIcon : clearSmallIcon
    if (iconCode.startsWith('01')) return isMain ? clearMainIcon : clearSmallIcon
    if (iconCode.startsWith('02') || iconCode.startsWith('03') || iconCode.startsWith('04')) return cloudsIcon
    if (iconCode.startsWith('09') || iconCode.startsWith('10')) return rainIcon
    if (iconCode.startsWith('11')) return drizzleIcon
    if (iconCode.startsWith('50')) return mistIcon
    return isMain ? clearMainIcon : clearSmallIcon
  }

  const now = new Date()

  return (
    <div className={`app ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <div className="weather-layout">
        <header className="header">
          <div className="theme-switcher">
            <button
              className="theme-toggle"
              type="button"
              onClick={handleThemeToggle}
            >
              <span className="theme-toggle__circle"></span>
            </button>
            <span className="theme-label">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>

          <div
            style={{ position: 'relative', flex: 1, minWidth: 0 }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 100)}
          >
            <div className="search-bar">
              <img
                src={searchIcon}
                alt="search"
                className="search-icon"
              />
              <input
                className="search-input"
                type="text"
                placeholder="Search for your preferred city..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>

            {isSearchFocused && searchHistory.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '6px',
                  padding: '8px',
                  borderRadius: '10px',
                  background: isDark ? '#1d1f27' : '#ffffff',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                  zIndex: 20,
                }}
              >
                {searchHistory.slice(0, 5).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      fetchWeather(city)
                      setInputValue('')
                      setIsSearchFocused(false)
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      background: 'transparent',
                      padding: '6px 4px',
                      cursor: 'pointer',
                      color: 'inherit',
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="location-button" type="button" onClick={handleCurrentLocationClick}>
            <img
              src={currentLocationIcon}
              alt="current location"
              className="location-button__icon"
            />
            <span className="location-button__text">Current Location</span>
          </button>
        </header>

        {loading && (
          <p style={{ textAlign: 'center', padding: '8px 0' }}>Loading weather…</p>
        )}
        {!loading && error && (
          <div
            style={{
              textAlign: 'center',
              padding: '10px',
              margin: '10px auto',
              borderRadius: '8px',
              maxWidth: '400px',
              background: isDark ? '#3a1f1f' : '#ffe5e5',
              color: isDark ? '#ffb3b3' : '#b00020',
              border: `1px solid ${isDark ? '#ff4d4f' : '#ffb3b3'}`,
            }}
          >
            {error}
          </div>
        )}

        <main className="dashboard">
          <section className="card city-card">
            <h2 className="city-card__title">
              {weather ? weather.cityName : DEFAULT_CITY}
            </h2>

            <div className="city-card__time">{formatTime(now)}</div>

            <p className="city-card__date">{formatDate(now)}</p>
          </section>

          <section className="card weather-card">
            <div className="weather-card__left">
              <div className="weather-card__temp">
                {weather ? formatTemperature(weather.temp) : '—'}
              </div>

              <div className="weather-card__feels">
                Feels like: <span>{weather ? formatTemperature(weather.feelsLike) : '—'}</span>
              </div>

              <div className="weather-card__sun-times">
                <div className="sun-time">
                  <img
                    src={isDark ? sunriseDarkIcon : sunriseIcon}
                    alt="sunrise"
                    className="sun-time__icon"
                  />
                  <div className="sun-time__info">
                    <div className="sun-time__label">Sunrise</div>
                    <div className="sun-time__value">{formatSunTime(weather?.sunrise)}</div>
                  </div>
                </div>

                <div className="sun-time">
                  <img
                    src={isDark ? sunsetDarkIcon : sunsetIcon}
                    alt="sunset"
                    className="sun-time__icon"
                  />
                  <div className="sun-time__info">
                    <div className="sun-time__label">Sunset</div>
                    <div className="sun-time__value">{formatSunTime(weather?.sunset)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="weather-card__center">
              <img
                src={getWeatherVisualIcon(weather?.icon, 'main')}
                alt={weather?.description ?? 'weather'}
                className="weather-card__main-icon"
              />
              <div className="weather-card__condition">
                {weather ? weather.description : 'Sunny'}
              </div>
            </div>

            <div className="weather-card__right">
              <div className="weather-metric">
                <img
                  src={isDark ? humidityDarkIcon : humidityIcon}
                  alt="humidity"
                  className="weather-metric__icon"
                />
                <div className="weather-metric__value">
                  {weather ? `${weather.humidity}%` : '—'}
                </div>
                <div className="weather-metric__label">Humidity</div>
              </div>

              <div className="weather-metric">
                <img
                  src={isDark ? windDarkIcon : windIcon}
                  alt="wind speed"
                  className="weather-metric__icon"
                />
                <div className="weather-metric__value">
                  {weather ? formatWindSpeed(weather.windSpeed) : '—'}
                </div>
                <div className="weather-metric__label">Wind Speed</div>
              </div>

              <div className="weather-metric">
                <img
                  src={isDark ? pressureDarkIcon : pressureIcon}
                  alt="pressure"
                  className="weather-metric__icon"
                />
                <div className="weather-metric__value">
                {weather?.pressure != null ? `${weather.pressure}hPa` : '—'}
                </div>
                <div className="weather-metric__label">Pressure</div>
              </div>

              <div className="weather-metric">
                <img
                  src={isDark ? uvDarkIcon : uvIcon}
                  alt="uv index"
                  className="weather-metric__icon"
                />
                <div className="weather-metric__value">
                  {weather?.uvIndex ?? '—'}
                </div>
                <div className="weather-metric__label">UV</div>
              </div>
            </div>
          </section>

          <section className="card forecast-card">
            <h3 className="forecast-title">5 Days Forecast:</h3>

            <div className="forecast-list">
              {forecast.slice(0, 5).map((item) => (
                <div className="forecast-item" key={item.date}>
                  <img src={getWeatherVisualIcon(item.icon, 'small')} alt={item.description} />
                  <span className="forecast-temp">{formatTemperature(item.temp)}</span>
                  <span className="forecast-day">{formatDate(new Date(item.date + 'T12:00:00'))}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card hourly-card">
            <h3 className="hourly-title">Hourly Forecast:</h3>

            <div className="hourly-list">
              {hourlyForecast.map((item) => {
                const hour = new Date(item.time).getHours()
                const isDay = hour >= 6 && hour < 18

                return (
                  <div className={`hourly-item ${isDay ? 'warm' : 'cold'}`} key={item.time}>
                    <span className="hourly-time">{formatTime(new Date(item.time))}</span>
                    <img
                      src={getWeatherVisualIcon(item.icon, 'small')}
                      alt={item.description}
                      className="hourly-weather"
                    />
                    <span className="hourly-temp">{formatTemperature(item.temp)}</span>
                    <img
                      src={navigationIcon}
                      alt="wind direction"
                      className={`hourly-wind dir-${(hour % 5) + 1}`}
                    />
                    <span className="hourly-speed">{formatWindSpeed(item.windSpeed)}</span>
                  </div>
                )
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App