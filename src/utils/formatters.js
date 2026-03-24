/**
 * Format temperature value.
 * @param {number} temp
 * @returns {string} e.g. "23°C"
 */
export function formatTemperature(temp) {
  return `${Math.round(temp)}°C`
}

/**
 * Format a Date object to "HH:MM" (24-hour).
 * @param {Date} date
 * @returns {string} e.g. "09:03"
 */
export function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Format a Date object to "Thu, 19 Mar".
 * Built manually to avoid locale-dependent output from toLocaleDateString.
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const weekday = WEEKDAYS[date.getDay()]
  const day = date.getDate()
  const month = MONTHS[date.getMonth()]
  return `${weekday}, ${day} ${month}`
}

/**
 * Format wind speed.
 * @param {number} speed
 * @returns {string} e.g. "5 m/s"
 */
export function formatWindSpeed(speed) {
  return `${speed} m/s`
}
