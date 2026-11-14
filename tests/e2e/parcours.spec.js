import { expect, test } from '@playwright/test'
import { capturerPreuve } from '../lib/preuve.js'

const TITRE = 'Hexatech - Alarmes et vidéosurveillance'
const H1 = 'Hexatech, expert en sous-traitance sécurité'
const SUCCES = 'Merci de votre intérêt. Votre demande a été reçue.'
const ERREUR_FORM = 'Le formulaire contient des erreurs.'
const ERREUR_TEL = 'Indiquez un numéro de téléphone valide, ou laissez le champ vide.'

test('AC-P1 page chargée avec styles et titre', { annotation: { type: 'expect', description: TITRE } }, async ({ page }) => {
  await page.goto('/')
  expect(await page.title()).toBe(TITRE)
  expect(await page.getByRole('heading', { level: 1 }).innerText()).toBe(H1)
  const position = await page.locator('.navbar').evaluate((el) => getComputedStyle(el).position)
  expect(position).toBe('fixed')
  await capturerPreuve(page, 'build/preuves/accueil-1280.png')
})

test('AC-N1 navigation interne vers chaque section', { annotation: { type: 'expect', description: 'Nos solutions' } }, async ({ page }) => {
  await page.goto('/')
  const cibles = [
    ['Solutions', 'solutions', 'Nos solutions'],
    ['Vidéosurveillance', 'surveillance', 'Vidéosurveillance'],
    ['Alarmes', 'alarmes', 'Alarmes'],
    ['Contact', 'contact', 'Demander une étude'],
    ['Accueil', 'accueil', H1],
  ]
  for (const [nom, id, titre] of cibles) {
    const lien = page.getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('link', { name: nom })
    await lien.click()
    const heading = page.locator(`#${id}`).getByRole('heading').first()
    expect(await heading.innerText()).toBe(titre)
    await expect.poll(async () => heading.evaluate((el) => {
      const r = el.getBoundingClientRect()
      return r.top < window.innerHeight && r.bottom > 0
    })).toBe(true)
    await expect.poll(async () => lien.getAttribute('aria-current')).toBe('location')
  }
})

test('AC-F1 envoi valide vide le formulaire', { annotation: { type: 'expect', description: SUCCES } }, async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Nom').fill('Marie Durand')
  await page.getByLabel('Email').fill('marie.durand@site.fr')
  await page.getByLabel('Message').fill('Besoin de caméras sur le parking.')
  await page.getByRole('button', { name: 'Demander un devis' }).click()
  expect(await page.getByRole('status').innerText()).toBe(SUCCES)
  expect(await page.getByLabel('Nom').inputValue()).toBe('')
  expect(await page.getByLabel('Email').inputValue()).toBe('')
  expect(await page.getByLabel('Message').inputValue()).toBe('')
})

test('AC-F3 téléphone invalide bloque l envoi', { annotation: { type: 'expect', description: ERREUR_TEL } }, async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Nom').fill('Marie Durand')
  await page.getByLabel('Email').fill('marie.durand@site.fr')
  await page.getByLabel('Téléphone (optionnel)').fill('abc')
  await page.getByLabel('Message').fill('Besoin de caméras sur le parking.')
  await page.getByRole('button', { name: 'Demander un devis' }).click()
  expect(await page.getByRole('status').innerText()).toBe(ERREUR_FORM)
  expect(await page.locator('#erreur-phone').innerText()).toBe(ERREUR_TEL)
  expect(await page.getByLabel('Nom').inputValue()).toBe('Marie Durand')
  expect(await page.getByLabel('Téléphone (optionnel)').inputValue()).toBe('abc')
})

test('AC-F4 payload HTML reste du texte', { annotation: { type: 'expect', description: SUCCES } }, async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Nom').fill('<img src=x onerror=alert(1)>')
  await page.getByLabel('Email').fill('marie.durand@site.fr')
  await page.getByLabel('Message').fill('<script>alert(1)</script> besoin réel.')
  await page.getByRole('button', { name: 'Demander un devis' }).click()
  const zone = page.getByRole('status')
  expect(await zone.innerText()).toBe(SUCCES)
  expect(await zone.locator('img').count()).toBe(0)
  expect(await zone.locator('script').count()).toBe(0)
})
