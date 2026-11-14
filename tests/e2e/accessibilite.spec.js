import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { capturerPreuve } from '../lib/preuve.js'

test('AC-A1 clavier : skip link et champs du formulaire', { annotation: { type: 'expect', description: 'contenu' } }, async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => document.activeElement.textContent)).toBe('Aller au contenu')
  await page.keyboard.press('Enter')
  expect(await page.evaluate(() => document.activeElement.id)).toBe('contenu')
  await page.getByLabel('Nom').focus()
  expect(await page.evaluate(() => document.activeElement.id)).toBe('name')
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => document.activeElement.id)).toBe('email')
})

test('AC-A1 axe WCAG 2.2 A et AA', { annotation: { type: 'expect', description: '0 violation' } }, async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()
  expect(results.violations).toEqual([])
})

test('AC-A2 reflow 320 px, nav visible', { annotation: { type: 'expect', description: '#contact' } }, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/')
  const depassement = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(depassement).toBeLessThan(2)
  expect(depassement).toBeGreaterThan(-1)
  const lien = page.getByRole('navigation', { name: 'Navigation principale' })
    .getByRole('link', { name: 'Contact' })
  expect(await lien.innerText()).toBe('Contact')
  expect(await lien.getAttribute('href')).toBe('#contact')
  await capturerPreuve(page, 'build/preuves/accueil-320.png')
})
