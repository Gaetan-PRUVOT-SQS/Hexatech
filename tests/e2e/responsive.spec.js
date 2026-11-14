import { expect, test } from '@playwright/test'
import { capturerPreuve } from '../lib/preuve.js'
import { mesurerAncre, mesurerLayout } from '../lib/mesure-layout.js'

const SUCCES = 'Merci de votre intérêt. Votre demande a été reçue.'
const LIENS_NAV = ['Accueil', 'Solutions', 'Vidéosurveillance', 'Alarmes', 'Contact']
const LARGEURS = [
  { width: 320, height: 640, preuve: 'build/preuves/reflow-320.png' },
  { width: 375, height: 667, preuve: 'build/preuves/reflow-375.png' },
  { width: 414, height: 896, preuve: 'build/preuves/reflow-414.png' },
  { width: 768, height: 1024, preuve: 'build/preuves/reflow-768.png' },
  { width: 667, height: 375, preuve: 'build/preuves/reflow-667-paysage.png' },
]

for (const vp of LARGEURS) {
  test(`AC-R1 reflow et nav ${vp.width}x${vp.height}`, {
    annotation: { type: 'expect', description: 'overflow < 2' },
  }, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.goto('/')
    const m = await mesurerLayout(page)
    expect(m.overflow).toBeLessThan(2)
    expect(m.overflow).toBeGreaterThan(-1)
    expect(m.formWidth).toBeLessThanOrEqual(vp.width)
    expect(m.carteMax).toBeLessThanOrEqual(vp.width)
    expect(m.navVisible).toBe(true)
    expect(m.hamburger).toBe(false)
    expect(m.liens.map((l) => l.texte)).toEqual(LIENS_NAV)
    m.liens.forEach((l) => {
      expect(l.visible).toBe(true)
      expect(l.h).toBeGreaterThanOrEqual(24)
      expect(l.w).toBeGreaterThanOrEqual(24)
    })
    m.cibles.forEach((c) => {
      expect(c.h).toBeGreaterThanOrEqual(24)
      expect(c.w).toBeLessThanOrEqual(vp.width)
    })
    await capturerPreuve(page, vp.preuve)
  })
}

test('AC-R3 h1 et ancre sous la barre à 320 px', {
  annotation: { type: 'expect', description: 'titre sous la nav' },
}, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/')
  const accueil = await mesurerLayout(page)
  expect(accueil.h1Couvert).toBe(false)
  expect(accueil.h1Top).toBeGreaterThanOrEqual(accueil.navBottom - 1)
  const ancre = await mesurerAncre(page, 'Solutions')
  expect(ancre.dansLeViewport).toBe(true)
  expect(ancre.sousLaBarre).toBe(true)
  await capturerPreuve(page, 'build/preuves/ancre-solutions-320.png')
})

test('AC-R4 zoom 200 % (640 CSS px)', {
  annotation: { type: 'expect', description: 'overflow < 2' },
}, async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 512 })
  await page.goto('/')
  const m = await mesurerLayout(page)
  expect(m.overflow).toBeLessThan(2)
  expect(m.overflow).toBeGreaterThan(-1)
  expect(m.h1Couvert).toBe(false)
  expect(m.navVisible).toBe(true)
  await capturerPreuve(page, 'build/preuves/reflow-640-zoom200.png')
})

test('AC-R5 notification tient à 320 px', {
  annotation: { type: 'expect', description: SUCCES },
}, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/')
  await page.getByLabel('Nom').fill('Marie Durand')
  await page.getByLabel('Email').fill('marie.durand@site.fr')
  await page.getByLabel('Message').fill('Besoin de caméras sur le parking.')
  await page.getByRole('button', { name: 'Demander un devis' }).click()
  expect(await page.getByRole('status').innerText()).toBe(SUCCES)
  const m = await mesurerLayout(page)
  expect(m.notifWidth).toBeGreaterThan(0)
  expect(m.notifWidth).toBeLessThanOrEqual(320)
  expect(m.overflow).toBeLessThan(2)
  expect(m.overflow).toBeGreaterThan(-1)
  await capturerPreuve(page, 'build/preuves/notif-320.png')
})
