import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  DELAI_NOTIFICATION_MS,
  afficherNotification,
  viderNotifications,
} from '../../app.js'

afterEach(() => {
  vi.useRealTimers()
})

describe('M6 notifications', () => {
  test('conteneur absent : pas de throw', () => {
    expect(afficherNotification(null, 'x')).toBeNull()
    expect(() => viderNotifications(null)).not.toThrow()
  })

  test('le message HTML reste du texte', () => {
    const zone = document.createElement('div')
    document.body.appendChild(zone)
    const note = afficherNotification(zone, '<img src=x onerror=alert(1)>', 'erreur')
    expect(note.textContent).toBe('<img src=x onerror=alert(1)>')
    expect(zone.querySelector('img')).toBeNull()
    expect(zone.querySelector('script')).toBeNull()
    expect(note.className).toContain('notification-erreur')
  })

  test('une nouvelle notification remplace la précédente', () => {
    const zone = document.createElement('div')
    afficherNotification(zone, 'un')
    afficherNotification(zone, 'deux')
    expect(zone.querySelectorAll('p')).toHaveLength(1)
    expect(zone.textContent).toBe('deux')
  })

  test('retrait après 3000 ms', () => {
    vi.useFakeTimers()
    const zone = document.createElement('div')
    afficherNotification(zone, 'ping', 'info', globalThis)
    expect(zone.textContent).toBe('ping')
    vi.advanceTimersByTime(DELAI_NOTIFICATION_MS - 1)
    expect(zone.textContent).toBe('ping')
    vi.advanceTimersByTime(1)
    expect(zone.textContent).toBe('')
  })
})
