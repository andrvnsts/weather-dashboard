// ── Private helpers ──────────────────────────────────────────────────────────

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function getFromStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function saveTheme(theme) {
  saveToStorage('weather_theme', theme)
}

export function loadTheme() {
  return getFromStorage('weather_theme')
}

export function saveLastCity(city) {
  saveToStorage('weather_last_city', city)
}

export function loadLastCity() {
  return getFromStorage('weather_last_city')
}

export function saveSearchHistory(history) {
  saveToStorage('weather_history', history)
}

export function loadSearchHistory() {
  return getFromStorage('weather_history') ?? []
}
