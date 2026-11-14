import { describe, expect, test } from 'vitest'
import {
  SEUIL_BARRE,
  appliquerLienActif,
  barreDefilee,
  idSectionActive,
} from '../../app.js'

const sections = [
  { id: 'accueil', top: 0 },
  { id: 'solutions', top: 400 },
  { id: 'surveillance', top: 800 },
  { id: 'alarmes', top: 1200 },
  { id: 'contact', top: 1600 },
]

describe('M4 section active', () => {
  test('liste vide', () => {
    expect(idSectionActive([], 0)).toBeNull()
    expect(idSectionActive(null, 0)).toBeNull()
  })

  test('en haut : accueil', () => {
    expect(idSectionActive(sections, 0)).toBe('accueil')
  })

  test('après le top de solutions', () => {
    expect(idSectionActive(sections, 400)).toBe('solutions')
  })

  test('dernière section', () => {
    expect(idSectionActive(sections, 2000)).toBe('contact')
  })
})

describe('barre de navigation', () => {
  test('seuil 50 : égal reste plat, 51 défile', () => {
    expect(barreDefilee(SEUIL_BARRE)).toBe(false)
    expect(barreDefilee(SEUIL_BARRE + 1)).toBe(true)
    expect(barreDefilee(0)).toBe(false)
  })
})

describe('lien courant', () => {
  test('active le href qui matche, retire les autres', () => {
    const doc = new DOMParser().parseFromString(
      `<nav>
        <a href="#accueil">A</a>
        <a href="#solutions">S</a>
        <a href="https://exemple.fr">ext</a>
      </nav>`,
      'text/html',
    )
    const liens = [...doc.querySelectorAll('a')]
    appliquerLienActif(liens, 'solutions')
    expect(liens[0].classList.contains('active')).toBe(false)
    expect(liens[0].hasAttribute('aria-current')).toBe(false)
    expect(liens[1].classList.contains('active')).toBe(true)
    expect(liens[1].getAttribute('aria-current')).toBe('location')
    expect(liens[2].classList.contains('active')).toBe(false)
    appliquerLienActif(liens, 'inconnu')
    expect(liens[1].classList.contains('active')).toBe(false)
  })
})
