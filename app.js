export const LIMITE_NOM = 100
export const LIMITE_MESSAGE = 2000
export const DELAI_NOTIFICATION_MS = 3000
export const SEUIL_BARRE = 50
export const DECALAGE_SECTION = 96
export const TEL_CHIFFRES_MIN = 8
export const TEL_CHIFFRES_MAX = 15
export const EMAIL_MAX = 254
export const LOCAL_MAX = 64

const CHAMPS = [
    { cle: 'nom', id: 'name' },
    { cle: 'email', id: 'email' },
    { cle: 'telephone', id: 'phone' },
    { cle: 'message', id: 'message' },
]

export function normaliser(valeur) {
    return String(valeur ?? '').trim()
}

export function compterChiffres(valeur) {
    const chiffres = String(valeur).match(/\d/g)
    return chiffres ? chiffres.length : 0
}

export function emailValide(valeur) {
    const v = normaliser(valeur)
    if (v.length === 0 || v.length > EMAIL_MAX) {
        return false
    }
    const arobase = v.indexOf('@')
    if (arobase <= 0 || arobase !== v.lastIndexOf('@')) {
        return false
    }
    const local = v.slice(0, arobase)
    const domaine = v.slice(arobase + 1)
    if (local.length > LOCAL_MAX || domaine.length === 0) {
        return false
    }
    if (
        !domaine.includes('.')
        || domaine.startsWith('.')
        || domaine.endsWith('.')
        || domaine.includes('..')
    ) {
        return false
    }
    if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) {
        return false
    }
    return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(
        domaine,
    )
}

export function telephoneValide(valeur) {
    const v = normaliser(valeur)
    if (v.length === 0) {
        return true
    }
    if (!/^\+?[\d .()-]+$/.test(v)) {
        return false
    }
    const n = compterChiffres(v)
    return n >= TEL_CHIFFRES_MIN && n <= TEL_CHIFFRES_MAX
}

export function validerContact(champs) {
    const nom = normaliser(champs.nom)
    const email = normaliser(champs.email)
    const telephone = normaliser(champs.telephone)
    const message = normaliser(champs.message)
    const erreurs = {}
    if (nom.length === 0) {
        erreurs.nom = 'Indiquez votre nom.'
    } else if (nom.length > LIMITE_NOM) {
        erreurs.nom = 'Le nom est trop long (100 caractères au plus).'
    }
    if (!emailValide(email)) {
        erreurs.email = 'Indiquez une adresse email valide.'
    }
    if (!telephoneValide(telephone)) {
        erreurs.telephone = 'Indiquez un numéro de téléphone valide, ou laissez le champ vide.'
    }
    if (message.length === 0) {
        erreurs.message = 'Décrivez votre projet.'
    } else if (message.length > LIMITE_MESSAGE) {
        erreurs.message = 'Le message est trop long (2000 caractères au plus).'
    }
    return {
        ok: Object.keys(erreurs).length === 0,
        erreurs,
        valeurs: { nom, email, telephone, message },
    }
}

export function extraireContact(formulaire) {
    const lire = (id) => {
        const champ = formulaire.elements.namedItem(id)
        return champ ? champ.value : ''
    }
    return {
        nom: lire('name'),
        email: lire('email'),
        telephone: lire('phone'),
        message: lire('message'),
    }
}

export function afficherErreurs(formulaire, erreurs, doc = document) {
    CHAMPS.forEach((champ) => {
        const input = formulaire.elements.namedItem(champ.id)
        const slot = doc.getElementById(`erreur-${champ.id}`)
        const texte = erreurs[champ.cle] ?? ''
        if (input) {
            if (texte) {
                input.setAttribute('aria-invalid', 'true')
                input.setAttribute('aria-describedby', `erreur-${champ.id}`)
            } else {
                input.removeAttribute('aria-invalid')
                input.removeAttribute('aria-describedby')
            }
        }
        if (slot) {
            slot.textContent = texte
            slot.hidden = texte.length === 0
        }
    })
}

export function idSectionActive(sections, scrollY, decalage = DECALAGE_SECTION) {
    if (!sections || sections.length === 0) {
        return null
    }
    const y = scrollY + decalage
    let actif = sections[0].id
    sections.forEach((section) => {
        if (section.top <= y) {
            actif = section.id
        }
    })
    return actif
}

export function barreDefilee(scrollY, seuil = SEUIL_BARRE) {
    return scrollY > seuil
}

export function viderNotifications(conteneur) {
    if (!conteneur) {
        return
    }
    while (conteneur.firstChild) {
        conteneur.removeChild(conteneur.firstChild)
    }
}

export function afficherNotification(conteneur, message, type = 'info', horloge = globalThis) {
    if (!conteneur) {
        return null
    }
    viderNotifications(conteneur)
    const note = conteneur.ownerDocument.createElement('p')
    note.className = `notification notification-${type}`
    note.textContent = message
    conteneur.appendChild(note)
    horloge.setTimeout(() => {
        note.remove()
    }, DELAI_NOTIFICATION_MS)
    return note
}

export function appliquerLienActif(liens, idActif) {
    liens.forEach((lien) => {
        const href = lien.getAttribute('href') || ''
        const cible = href.startsWith('#') ? href.slice(1) : ''
        if (cible && cible === idActif) {
            lien.classList.add('active')
            lien.setAttribute('aria-current', 'location')
        } else {
            lien.classList.remove('active')
            lien.removeAttribute('aria-current')
        }
    })
}

export function lireSections(doc) {
    return Array.from(doc.querySelectorAll('main section[id]')).map((el) => ({
        id: el.id,
        top: el.offsetTop,
    }))
}

export function decalageBarre(barre, repli = DECALAGE_SECTION) {
    const hauteur = barre && barre.offsetHeight > 0 ? barre.offsetHeight : 0
    let padding = 0
    const doc = barre && barre.ownerDocument
    if (doc && doc.documentElement && typeof getComputedStyle === 'function') {
        const n = Number.parseFloat(getComputedStyle(doc.documentElement).scrollPaddingTop)
        if (Number.isFinite(n) && n > 0) {
            padding = n
        }
    }
    const candidat = Math.max(hauteur, padding)
    return candidat > 0 ? candidat : repli
}

export function surveillerDefilement(doc, win) {
    const barre = doc.querySelector('.navbar')
    if (barre) {
        barre.classList.toggle('defilee', barreDefilee(win.scrollY))
    }
    const liens = doc.querySelectorAll('.nav-links a[href^="#"]')
    const id = idSectionActive(lireSections(doc), win.scrollY, decalageBarre(barre))
    appliquerLienActif(liens, id)
}

export function allerA(doc, id) {
    if (!id) {
        return false
    }
    const cible = doc.getElementById(id)
    if (!cible || typeof cible.scrollIntoView !== 'function') {
        return false
    }
    cible.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (typeof cible.focus === 'function') {
        cible.focus({ preventScroll: true })
    }
    const liens = doc.querySelectorAll('.nav-links a[href^="#"]')
    appliquerLienActif(liens, id)
    return true
}

export function soumettreContact(evenement, doc) {
    evenement.preventDefault()
    const formulaire = evenement.currentTarget
    const resultat = validerContact(extraireContact(formulaire))
    afficherErreurs(formulaire, resultat.erreurs, doc)
    const zone = doc.getElementById('notification-container')
    if (!resultat.ok) {
        afficherNotification(zone, 'Le formulaire contient des erreurs.', 'erreur')
        const premier = formulaire.querySelector('[aria-invalid="true"]')
        if (premier && typeof premier.focus === 'function') {
            premier.focus()
        }
        return false
    }
    formulaire.reset()
    afficherErreurs(formulaire, {}, doc)
    afficherNotification(
        zone,
        'Merci de votre intérêt. Votre demande a été reçue.',
        'succes',
    )
    return true
}

export function init(doc = document, win = window) {
    const formulaire = doc.getElementById('contact-form')
    if (formulaire) {
        formulaire.addEventListener('submit', (e) => {
            soumettreContact(e, doc)
        })
    }
    const liens = doc.querySelectorAll('a[href^="#"]')
    liens.forEach((lien) => {
        lien.addEventListener('click', (e) => {
            const href = lien.getAttribute('href') || ''
            const id = href.slice(1)
            if (allerA(doc, id)) {
                e.preventDefault()
            }
        })
    })
    win.addEventListener('scroll', () => {
        surveillerDefilement(doc, win)
    }, { passive: true })
    surveillerDefilement(doc, win)
}
