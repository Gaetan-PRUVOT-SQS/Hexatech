import { describe, expect, test } from 'vitest'
import { capturerPreuve } from '../lib/preuve.js'

function pageMock(screenshot) {
  return {
    evaluate: async () => {},
    screenshot,
  }
}

describe('M8 preuve screenshot', () => {
  test('premier essai réussi', async () => {
    const appels = []
    await capturerPreuve(pageMock(async (opts) => {
      appels.push(opts)
    }), 'build/preuves/accueil-1280.png')
    expect(appels).toEqual([
      { path: 'build/preuves/accueil-1280.png', animations: 'disabled', caret: 'hide' },
    ])
  })

  test('relance une fois après erreur de capture', async () => {
    let n = 0
    await capturerPreuve(pageMock(async () => {
      n += 1
      if (n === 1) {
        throw new Error('Protocol error (Page.captureScreenshot): Unable to capture screenshot')
      }
    }), 'build/preuves/accueil-320.png')
    expect(n).toBe(2)
  })

  test('autre erreur non relancée', async () => {
    let n = 0
    await expect(capturerPreuve(pageMock(async () => {
      n += 1
      throw new Error('page closed')
    }), 'build/preuves/x.png')).rejects.toThrow('page closed')
    expect(n).toBe(1)
  })

  test('deux échecs de capture : la seconde erreur sort', async () => {
    await expect(capturerPreuve(pageMock(async () => {
      throw new Error('Unable to capture screenshot')
    }), 'build/preuves/x.png')).rejects.toThrow('Unable to capture screenshot')
  })
})
