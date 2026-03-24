import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveTheme,
  loadTheme,
  saveLastCity,
  loadLastCity,
  saveSearchHistory,
  loadSearchHistory,
} from './storage'

// jsdom provides localStorage in the test environment

beforeEach(() => {
  localStorage.clear()
})

describe('saveTheme / loadTheme', () => {
  it('saves and reads the theme', () => {
    saveTheme('dark')
    expect(loadTheme()).toBe('dark')
  })

  it('returns null when nothing is saved', () => {
    expect(loadTheme()).toBeNull()
  })
})

describe('saveLastCity / loadLastCity', () => {
  it('saves and reads the last city', () => {
    saveLastCity('Athens')
    expect(loadLastCity()).toBe('Athens')
  })

  it('returns null when nothing is saved', () => {
    expect(loadLastCity()).toBeNull()
  })
})

describe('saveSearchHistory / loadSearchHistory', () => {
  it('saves and reads search history', () => {
    const history = ['Athens', 'London', 'Paris']
    saveSearchHistory(history)
    expect(loadSearchHistory()).toEqual(history)
  })

  it('returns [] when nothing is saved', () => {
    expect(loadSearchHistory()).toEqual([])
  })
})
