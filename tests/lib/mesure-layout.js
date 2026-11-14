export async function mesurerLayout(page) {
  return page.evaluate(() => {
    const html = document.documentElement
    const nav = document.querySelector('.navbar')
    const h1 = document.querySelector('h1')
    const form = document.querySelector('#contact-form')
    const notif = document.querySelector('#notification-container')
    const liens = [...document.querySelectorAll('.nav-links a')]
    const champs = [...document.querySelectorAll('input, textarea, button.btn')]
    const cartes = [...document.querySelectorAll('.card')]
    const burger = document.querySelector(
      'button[aria-label*="menu" i], button[aria-label*="Menu"], .hamburger, .menu-toggle',
    )
    const navRect = nav ? nav.getBoundingClientRect() : { height: 0, bottom: 0, width: 0 }
    const h1Rect = h1 ? h1.getBoundingClientRect() : { top: 0, bottom: 0, width: 0 }
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      overflow: html.scrollWidth - window.innerWidth,
      navHeight: navRect.height,
      navBottom: navRect.bottom,
      navVisible: Boolean(nav) && navRect.height > 0 && getComputedStyle(nav).display !== 'none',
      h1Top: h1Rect.top,
      h1Couvert: Boolean(h1) && h1Rect.top < navRect.bottom - 1 && h1Rect.bottom > 0,
      h1Debord: h1 ? h1.scrollWidth - h1.clientWidth : 0,
      liens: liens.map((a) => {
        const r = a.getBoundingClientRect()
        const style = getComputedStyle(a)
        return {
          texte: a.textContent.trim(),
          href: a.getAttribute('href'),
          w: r.width,
          h: r.height,
          visible: r.width > 0 && r.height > 0 && style.display !== 'none' && style.visibility !== 'hidden',
        }
      }),
      cibles: champs.map((el) => {
        const r = el.getBoundingClientRect()
        return {
          id: el.id || el.tagName,
          w: r.width,
          h: r.height,
        }
      }),
      carteMax: cartes.reduce((m, c) => Math.max(m, c.getBoundingClientRect().width), 0),
      formWidth: form ? form.getBoundingClientRect().width : 0,
      notifWidth: notif ? notif.getBoundingClientRect().width : 0,
      notifMax: notif ? getComputedStyle(notif).maxWidth : '',
      hamburger: Boolean(burger),
      scrollPadding: getComputedStyle(html).scrollPaddingTop,
    }
  })
}

export async function mesurerAncre(page, nomLien) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto'
  })
  const nav = page.getByRole('navigation', { name: 'Navigation principale' })
  await nav.getByRole('link', { name: nomLien }).click()
  return page.evaluate(() => {
    const barre = document.querySelector('.navbar')
    const titre = document.querySelector('#solutions h2')
    const navRect = barre.getBoundingClientRect()
    const titreRect = titre.getBoundingClientRect()
    return {
      navBottom: navRect.bottom,
      titreTop: titreRect.top,
      titreBottom: titreRect.bottom,
      sousLaBarre: titreRect.top >= navRect.bottom - 1,
      dansLeViewport: titreRect.bottom > 0 && titreRect.top < window.innerHeight,
    }
  })
}
