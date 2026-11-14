import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { capturerPreuve } from './lib/preuve.js'
import { mesurerAncre, mesurerLayout } from './lib/mesure-layout.js'

const LIVE = 'https://gaetan-pruvot-sqs.github.io/Hexatech/'
const LARGEURS = [
  { width: 320, height: 640, nom: '320-portrait' },
  { width: 360, height: 740, nom: '360-android' },
  { width: 375, height: 667, nom: '375-iphone' },
  { width: 390, height: 844, nom: '390-iphone12' },
  { width: 414, height: 896, nom: '414-plus' },
  { width: 768, height: 1024, nom: '768-tablette' },
  { width: 667, height: 375, nom: '667-paysage' },
  { width: 640, height: 512, nom: '640-zoom200' },
]

const url = process.argv[2] || LIVE

const navigateur = await chromium.launch()
const page = await navigateur.newPage()
mkdirSync('build/preuves', { recursive: true })

const rapport = { url, date: new Date().toISOString(), mesures: [] }

for (const vp of LARGEURS) {
  await page.setViewportSize({ width: vp.width, height: vp.height })
  await page.goto(url, { waitUntil: 'load' })
  const layout = await mesurerLayout(page)
  let ancre = null
  if (vp.width <= 414) {
    ancre = await mesurerAncre(page, 'Solutions')
  }
  rapport.mesures.push({ nom: vp.nom, ...vp, layout, ancre })
  await capturerPreuve(page, `build/preuves/sondage-${vp.nom}.png`)
}

writeFileSync('build/preuves/sondage-layout.json', JSON.stringify(rapport, null, 2))
await navigateur.close()
console.log(JSON.stringify(rapport, null, 2))
