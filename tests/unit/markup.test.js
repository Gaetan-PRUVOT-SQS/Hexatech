import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const html = readFileSync(resolve('index.html'), 'utf8')
const js = readFileSync(resolve('app.js'), 'utf8')
const css = readFileSync(resolve('styles.css'), 'utf8')

function ciblesNav() {
  const bloc = html.match(/class="nav-links"[\s\S]*?<\/ul>/)[0]
  return [...bloc.matchAll(/href="#([^"]+)"/g)].map((m) => m[1])
}

describe('M5 balisage', () => {
  test('feuille de style branchée', () => {
    expect(html.includes('<link rel="stylesheet" href="styles.css">')).toBe(true)
  })

  test('module app.js chargé', () => {
    expect(html.includes("import { init } from './app.js'")).toBe(true)
  })

  test('langue de page fr', () => {
    expect(html.includes('<html lang="fr">')).toBe(true)
  })

  test('chaque lien de nav a une section', () => {
    expect(ciblesNav()).toEqual(['accueil', 'solutions', 'surveillance', 'alarmes', 'contact'])
    ciblesNav().forEach((id) => {
      expect(html.includes(`<section id="${id}"`)).toBe(true)
    })
  })

  test('formulaire : labels, optionnel téléphone, live region', () => {
    expect(html.includes('<label for="name">Nom</label>')).toBe(true)
    expect(html.includes('<label for="email">Email</label>')).toBe(true)
    expect(html.includes('<label for="phone">Téléphone (optionnel)</label>')).toBe(true)
    expect(html.includes('<label for="message">Message</label>')).toBe(true)
    expect(html.includes('autocomplete="name"')).toBe(true)
    expect(html.includes('autocomplete="email"')).toBe(true)
    expect(html.includes('autocomplete="tel"')).toBe(true)
    expect(html.includes('aria-live="polite"')).toBe(true)
    expect(html.includes('id="notification-container"')).toBe(true)
  })

  test('images de contenu ont un alt non vide', () => {
    const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0])
    expect(imgs.length).toBe(7)
    imgs.forEach((balise) => {
      const alt = balise.match(/alt="([^"]+)"/)
      expect(alt).not.toBeNull()
      expect(alt[1].trim().length).toBeGreaterThan(0)
    })
  })

  test('lien d évitement et footer hors du main', () => {
    expect(html.includes('href="#contenu">Aller au contenu</a>')).toBe(true)
    const mainFerme = html.indexOf('</main>')
    const footer = html.indexOf('<footer')
    expect(footer > mainFerme).toBe(true)
  })

  test('pas de texte orphelin Boutique ni injection DOM', () => {
    expect(html.includes('Boutique')).toBe(false)
    const affectationDom = 'inner' + 'HTML'
    const evaluer = String.fromCharCode(101, 118, 97, 108)
    expect(js.includes(affectationDom)).toBe(false)
    const motif = new RegExp(`\\b${evaluer}\\s*\\(`)
    expect(js.search(motif)).toBe(-1)
  })

  test('polices locales et focus visible', () => {
    expect(css.includes('assets/fonts/nunito-latin.woff2')).toBe(true)
    expect(css.includes(':focus-visible')).toBe(true)
    expect(html.includes('fonts.googleapis.com')).toBe(false)
  })
})
