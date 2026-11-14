import { describe, expect, test } from 'vitest'
import {
  LIMITE_MESSAGE,
  LIMITE_NOM,
  compterChiffres,
  emailValide,
  normaliser,
  telephoneValide,
  validerContact,
} from '../../app.js'

const base = {
  nom: 'Marie Durand',
  email: 'marie.durand@site.fr',
  telephone: '',
  message: 'Besoin de caméras sur le parking.',
}

describe('M1 partitions contact', () => {
  test('jeu valide nominal', () => {
    const r = validerContact(base)
    expect(r.ok).toBe(true)
    expect(r.erreurs).toEqual({})
  })

  test.each([
    ['simple', 'a@b.fr', true],
    ['sous-domaine', 'user@mail.entreprise.gouv.fr', true],
    ['vide', '', false],
    ['sans arobase', 'marie.site.fr', false],
    ['deux arobase', 'a@b@c.fr', false],
    ['sans domaine', 'marie@', false],
    ['sans local', '@site.fr', false],
    ['sans point', 'marie@localhost', false],
    ['point initial', 'marie@.site.fr', false],
    ['point final', 'marie@site.fr.', false],
    ['points doubles', 'marie@site..fr', false],
    ['espace interne', 'marie durand@site.fr', false],
  ])('email %s', (_nom, valeur, ok) => {
    expect(emailValide(valeur)).toBe(ok)
  })

  test.each([
    ['vide', '', true],
    ['espaces', '   ', true],
    ['mobile FR', '06 12 34 56 78', true],
    ['international', '+33 6 12 34 56 78', true],
    ['lettres', 'abc', false],
    ['mélange', '06ab1256', false],
  ])('telephone %s', (_nom, valeur, ok) => {
    expect(telephoneValide(valeur)).toBe(ok)
  })
})

describe('M2 limites', () => {
  test('nom 100 accepte, 101 refuse', () => {
    expect(validerContact({ ...base, nom: 'a'.repeat(LIMITE_NOM) }).ok).toBe(true)
    const r = validerContact({ ...base, nom: 'a'.repeat(LIMITE_NOM + 1) })
    expect(r.ok).toBe(false)
    expect(r.erreurs.nom).toMatch(/100/)
  })

  test('message 2000 accepte, 2001 refuse', () => {
    expect(validerContact({ ...base, message: 'b'.repeat(LIMITE_MESSAGE) }).ok).toBe(true)
    const r = validerContact({ ...base, message: 'b'.repeat(LIMITE_MESSAGE + 1) })
    expect(r.ok).toBe(false)
    expect(r.erreurs.message).toMatch(/2000/)
  })

  test('telephone 7 refuse, 8 et 15 acceptent, 16 refuse', () => {
    expect(telephoneValide('1234567')).toBe(false)
    expect(telephoneValide('12345678')).toBe(true)
    expect(telephoneValide('123456789012345')).toBe(true)
    expect(telephoneValide('1234567890123456')).toBe(false)
  })

  test('email plus long que 254 refuse', () => {
    const local = 'a'.repeat(64)
    const trop = `${local}@${'b'.repeat(200)}.fr`
    expect(trop.length).toBeGreaterThan(254)
    expect(emailValide(trop)).toBe(false)
  })

  test('local plus long que 64 refuse', () => {
    expect(emailValide(`${'a'.repeat(65)}@site.fr`)).toBe(false)
    expect(emailValide(`${'a'.repeat(64)}@site.fr`)).toBe(true)
  })
})

describe('M3 MC/DC envoi', () => {
  test.each([
    ['tous vrais', base, true],
    ['nom faux', { ...base, nom: '  ' }, false],
    ['email faux', { ...base, email: 'pas-un-email' }, false],
    ['tel faux', { ...base, telephone: '12' }, false],
    ['message faux', { ...base, message: '' }, false],
  ])('%s', (_nom, champs, ok) => {
    expect(validerContact(champs).ok).toBe(ok)
  })
})

describe('normalisation', () => {
  test('trim et valeurs vides', () => {
    expect(normaliser(undefined)).toBe('')
    expect(normaliser(null)).toBe('')
    expect(normaliser('  Jean  ')).toBe('Jean')
    expect(compterChiffres('')).toBe(0)
    expect(compterChiffres('+33 (0)6')).toBe(4)
  })

  test('espaces autour d un email valide', () => {
    expect(emailValide('  marie.durand@site.fr  ')).toBe(true)
    const r = validerContact({ ...base, nom: '  Marie  ', message: '  un vrai message  ' })
    expect(r.ok).toBe(true)
    expect(r.valeurs.nom).toBe('Marie')
    expect(r.valeurs.message).toBe('un vrai message')
  })
})
