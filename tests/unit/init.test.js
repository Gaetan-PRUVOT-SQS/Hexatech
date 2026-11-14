import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  allerA,
  extraireContact,
  init,
  lireSections,
  soumettreContact,
  surveillerDefilement,
} from '../../app.js'

const html = readFileSync(resolve('index.html'), 'utf8')

function page() {
  const sansRessources = html
    .replace(/<link rel="stylesheet"[^>]*>/, '')
    .replace(/<script type="module">[\s\S]*?<\/script>/, '')
  return new DOMParser().parseFromString(sansRessources, 'text/html')
}

function remplir(doc, valeurs) {
  Object.entries(valeurs).forEach(([id, valeur]) => {
    doc.getElementById(id).value = valeur
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('M7 init', () => {
  test('lireSections prend les sections du main', () => {
    const doc = page()
    const ids = lireSections(doc).map((s) => s.id)
    expect(ids).toEqual(['accueil', 'solutions', 'surveillance', 'alarmes', 'contact'])
  })

  test('envoi valide : succès, reset, pas d élément HTML injecté', () => {
    const doc = page()
    remplir(doc, {
      name: '<b>Marie</b>',
      email: 'marie@site.fr',
      phone: '',
      message: 'Installation caméras parking.',
    })
    const formulaire = doc.getElementById('contact-form')
    const e = new Event('submit', { bubbles: true, cancelable: true })
    Object.defineProperty(e, 'currentTarget', { value: formulaire })
    const ok = soumettreContact(e, doc)
    expect(ok).toBe(true)
    expect(e.defaultPrevented).toBe(true)
    expect(doc.getElementById('name').value).toBe('')
    const zone = doc.getElementById('notification-container')
    expect(zone.textContent).toBe('Merci de votre intérêt. Votre demande a été reçue.')
    expect(zone.querySelector('b')).toBeNull()
    expect(zone.querySelector('script')).toBeNull()
  })

  test('envoi invalide : erreurs, focus, champs conservés', () => {
    const doc = page()
    remplir(doc, {
      name: '',
      email: 'pas-email',
      phone: 'abc',
      message: '',
    })
    const formulaire = doc.getElementById('contact-form')
    const name = doc.getElementById('name')
    name.focus = vi.fn()
    const e = new Event('submit', { bubbles: true, cancelable: true })
    Object.defineProperty(e, 'currentTarget', { value: formulaire })
    expect(soumettreContact(e, doc)).toBe(false)
    expect(doc.getElementById('erreur-name').hidden).toBe(false)
    expect(doc.getElementById('erreur-email').hidden).toBe(false)
    expect(doc.getElementById('erreur-phone').hidden).toBe(false)
    expect(doc.getElementById('phone').value).toBe('abc')
    expect(name.focus).toHaveBeenCalled()
    expect(doc.getElementById('notification-container').textContent).toBe(
      'Le formulaire contient des erreurs.',
    )
  })

  test('extraireContact lit les ids du formulaire', () => {
    const doc = page()
    remplir(doc, { name: 'A', email: 'a@b.fr', phone: '0612345678', message: 'hello world' })
    expect(extraireContact(doc.getElementById('contact-form'))).toEqual({
      nom: 'A',
      email: 'a@b.fr',
      telephone: '0612345678',
      message: 'hello world',
    })
    const vide = new DOMParser().parseFromString('<form></form>', 'text/html')
    expect(extraireContact(vide.querySelector('form'))).toEqual({
      nom: '',
      email: '',
      telephone: '',
      message: '',
    })
  })

  test('init branche submit et les hashes', () => {
    const doc = page()
    const ecouteurs = {}
    const win = {
      scrollY: 80,
      addEventListener: (type, fn) => {
        ecouteurs[type] = fn
      },
    }
    const cible = doc.getElementById('solutions')
    cible.scrollIntoView = vi.fn()
    init(doc, win)
    expect(typeof ecouteurs.scroll).toBe('function')
    ecouteurs.scroll()
    expect(doc.querySelector('.navbar').classList.contains('defilee')).toBe(true)

    remplir(doc, {
      name: 'Marie Durand',
      email: 'marie@site.fr',
      phone: '',
      message: 'Besoin de caméras sur le parking.',
    })
    const formulaire = doc.getElementById('contact-form')
    const submit = new Event('submit', { bubbles: true, cancelable: true })
    formulaire.dispatchEvent(submit)
    expect(submit.defaultPrevented).toBe(true)
    expect(doc.getElementById('notification-container').textContent).toMatch(/reçue/)

    const lien = doc.querySelector('a[href="#solutions"]')
    const clic = new Event('click', { bubbles: true, cancelable: true })
    lien.dispatchEvent(clic)
    expect(clic.defaultPrevented).toBe(true)
    expect(cible.scrollIntoView).toHaveBeenCalled()
  })

  test('allerA défile et donne le focus', () => {
    const doc = page()
    const contenu = doc.getElementById('contenu')
    contenu.scrollIntoView = vi.fn()
    contenu.focus = vi.fn()
    expect(allerA(doc, 'contenu')).toBe(true)
    expect(contenu.scrollIntoView).toHaveBeenCalled()
    expect(contenu.focus).toHaveBeenCalledWith({ preventScroll: true })
    expect(allerA(doc, '')).toBe(false)
    const mute = doc.getElementById('solutions')
    mute.scrollIntoView = undefined
    expect(allerA(doc, 'solutions')).toBe(false)
  })

  test('hash vide ou cible absente : pas de preventDefault', () => {
    const doc = new DOMParser().parseFromString(
      `<body>
        <a href="#">vide</a>
        <a href="#manque">manque</a>
      </body>`,
      'text/html',
    )
    const win = { scrollY: 0, addEventListener: vi.fn() }
    init(doc, win)
    const vide = new Event('click', { bubbles: true, cancelable: true })
    doc.querySelector('a[href="#"]').dispatchEvent(vide)
    expect(vide.defaultPrevented).toBe(false)
    const mort = new Event('click', { bubbles: true, cancelable: true })
    doc.querySelector('a[href="#manque"]').dispatchEvent(mort)
    expect(mort.defaultPrevented).toBe(false)
  })

  test('surveillerDefilement pose defilee et le lien actif', () => {
    const doc = page()
    const barre = doc.querySelector('.navbar')
    surveillerDefilement(doc, { scrollY: 0 })
    expect(barre.classList.contains('defilee')).toBe(false)
    surveillerDefilement(doc, { scrollY: 80 })
    expect(barre.classList.contains('defilee')).toBe(true)
  })

  test('init sans formulaire ne jette pas', () => {
    const doc = new DOMParser().parseFromString('<body></body>', 'text/html')
    const win = { scrollY: 0, addEventListener: vi.fn() }
    expect(() => init(doc, win)).not.toThrow()
  })
})
