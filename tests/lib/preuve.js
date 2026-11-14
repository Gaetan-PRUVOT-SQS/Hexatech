const ERREUR_CAPTURE = /Unable to capture screenshot|Protocol error/

export async function capturerPreuve(page, chemin) {
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }
    const cadre = globalThis.requestAnimationFrame
    await new Promise((ok) => {
      cadre(() => cadre(ok))
    })
  })
  const options = { path: chemin, animations: 'disabled', caret: 'hide' }
  try {
    await page.screenshot(options)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (!ERREUR_CAPTURE.test(msg)) {
      throw err
    }
    await page.evaluate(() => new Promise((ok) => {
      globalThis.requestAnimationFrame(ok)
    }))
    await page.screenshot(options)
  }
}
