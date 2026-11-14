import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const readme = readFileSync(resolve('README.md'), 'utf8')
const cahier = readFileSync(resolve('tests/cahier-recettes.md'), 'utf8')

describe('M9 présentation du dépôt', () => {
  test('README présente la campagne de déploiement Hexatech', () => {
    expect(readme.startsWith('# Hexatech\n')).toBe(true)
    expect(readme.includes(
      'Campagne de test pour le déploiement du site vitrine de la société Hexatech',
    )).toBe(true)
    expect(readme.includes('https://gaetan-pruvot-sqs.github.io/Hexatech/')).toBe(true)
  })

  test('cahier de recettes porte la même campagne', () => {
    expect(cahier.includes(
      'Campagne de test pour le déploiement du site vitrine de la société Hexatech.',
    )).toBe(true)
  })
})
