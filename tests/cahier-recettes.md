# Cahier de recettes Hexatech

Campagne de test pour le déploiement du site vitrine de la société Hexatech.
ISTQB CTFL 4.0.1 / ISO/IEC/IEEE 29119. Date : 2026-11-14.

Lancer : `npm test` (Vitest 5.1.0 + couverture v8, Playwright 1.63 Chromium). Page servie sur `http://127.0.0.1:4173`. Preuves visuelles : `build/preuves/`.

Jeux de données figés : nom `Marie Durand`, email `marie.durand@site.fr`, message `Besoin de caméras sur le parking.`, téléphone vide sauf mention contraire.

## Base de test

- Balisage de `index.html` (sections, champs, libellés).
- Critères d'acceptation ci-dessous.
- WCAG 2.2 AA sur la page unique.
- Baseline sécu : pas d'`innerHTML`, pas d'`eval`.
- Succès : `Merci de votre intérêt. Votre demande a été reçue.`
- Erreur formulaire : `Le formulaire contient des erreurs.`
- Erreur téléphone : `Indiquez un numéro de téléphone valide, ou laissez le champ vide.`
- Titre : `Hexatech - Alarmes et vidéosurveillance`
- H1 : `Hexatech, expert en sous-traitance sécurité`

## Critères d'acceptation

| Id | Critère |
|----|---------|
| AC-P1 | Au chargement, `styles.css` et `app.js` sont chargés, le titre décrit Hexatech. |
| AC-N1 | Chaque lien de nav pointe vers une section présente ; un clic y amène et le lien devient courant. |
| AC-F1 | Nom, email et message valides, téléphone vide : succès, champs vidés. |
| AC-F2 | Champ requis vide ou email mal formé : erreurs par champ, pas de succès, champs conservés. |
| AC-F3 | Téléphone optionnel ; s'il est rempli, 8 à 15 chiffres, sinon erreur sur ce champ. |
| AC-F4 | Une saisie HTML n'exécute rien et n'ajoute pas d'élément dans la zone de statut. |
| AC-A1 | Parcours au clavier, focus visible, lien d'évitement. |
| AC-A2 | Viewport 320 px sans défilement horizontal, liens de nav visibles. |
| AC-R1 | Aux largeurs 320, 375, 414, 768 et 667 paysage : pas de défilement horizontal, nav visible sans hamburger, cibles ≥ 24 px. |
| AC-R3 | À 320 px, le H1 n'est pas masqué par la barre ; un clic Solutions pose le titre sous la nav. |
| AC-R4 | Largeur 640 CSS px (zoom 200 % d'un 1280) : pas de défilement horizontal, H1 lisible, nav visible. |
| AC-R5 | Après un envoi valide à 320 px, la notification tient dans la largeur. |
| AC-D1 | Le dépôt se présente comme une campagne de test pour le déploiement de la vitrine Hexatech. |

## Traçabilité AC → recettes

| AC | Recettes |
|----|----------|
| AC-P1 | R-P1, R-M5-css, R-M5-js |
| AC-N1 | R-N1, R-M4-*, R-M5-nav, R-M7-sections |
| AC-F1 | R-F1, R-M1-nominal, R-M3-tous-vrais, R-M7-ok |
| AC-F2 | R-M1-email, R-M3-nom, R-M3-email, R-M3-message, R-M7-ko |
| AC-F3 | R-F3, R-M1-tel, R-M2-tel, R-M3-tel |
| AC-F4 | R-F4, R-M6-html, R-M7-ok |
| AC-A1 | R-A1-clavier, R-A1-axe, R-M5-skip, R-M7-focus |
| AC-A2 | R-A2, R-M5-focus |
| AC-R1 | R-R1-320, R-R1-375, R-R1-414, R-R1-768, R-R1-667, R-M13-css |
| AC-R3 | R-R3, R-M13-css, R-M4-decalage |
| AC-R4 | R-R4 |
| AC-R5 | R-R5 |
| AC-D1 | R-M9-readme, R-M9-cahier |

## Recettes composant (Vitest)

### M1 partitions contact (`tests/unit/validation.test.js`)

| Id | Nom | Entrée | Attendu |
|----|-----|--------|---------|
| R-M1-nominal | jeu valide nominal | jeu figé | `ok === true`, `erreurs === {}` |
| R-M1-email | email %s | simple `a@b.fr` vrai ; sous-domaine vrai ; vide, sans @, deux @, sans domaine, sans local, sans point, point initial/final, `..`, espace : faux | `emailValide(valeur) === ok` |
| R-M1-tel | telephone %s | vide et espaces vrais ; `06 12 34 56 78` et `+33 6 12 34 56 78` vrais ; `abc` et `06ab1256` faux | `telephoneValide(valeur) === ok` |

### M2 limites (`tests/unit/validation.test.js`)

| Id | Nom | Entrée | Attendu |
|----|-----|--------|---------|
| R-M2-nom | nom 100 accepte, 101 refuse | 100 `a` / 101 `a` | ok vrai / faux, message contient `100` |
| R-M2-msg | message 2000 accepte, 2001 refuse | 2000 `b` / 2001 `b` | ok vrai / faux, message contient `2000` |
| R-M2-tel | telephone 7 refuse, 8 et 15 acceptent, 16 refuse | 7, 8, 15, 16 chiffres | faux, vrai, vrai, faux |
| R-M2-email | email plus long que 254 refuse | local 64 + domaine trop long | `emailValide === false` |
| R-M2-local | local plus long que 64 refuse | 65 / 64 avant `@site.fr` | faux / vrai |

### M3 MC/DC envoi (`tests/unit/validation.test.js`)

Une condition fausse à la fois, plus le nominal.

| Id | Nom | Entrée | Attendu |
|----|-----|--------|---------|
| R-M3-tous-vrais | tous vrais | jeu figé | `ok === true` |
| R-M3-nom | nom faux | nom `  ` | `ok === false` |
| R-M3-email | email faux | `pas-un-email` | `ok === false` |
| R-M3-tel | tel faux | `12` | `ok === false` |
| R-M3-message | message faux | message `''` | `ok === false` |

Normalisation : `undefined`/`null` → `''` ; trim ; `+33 (0)6` → 4 chiffres.

### M4 section active (`tests/unit/navigation.test.js`)

| Id | Nom | Entrée | Attendu |
|----|-----|--------|---------|
| R-M4-vide | liste vide | `[]` ou `null` | `null` |
| R-M4-haut | en haut : accueil | scroll 0 | `accueil` |
| R-M4-sol | après le top de solutions | scroll 400 | `solutions` |
| R-M4-fin | dernière section | scroll 2000 | `contact` |
| R-M4-barre | seuil 50 : égal reste plat, 51 défile | 50 / 51 / 0 | faux / vrai / faux |
| R-M4-lien | active le href qui matche, retire les autres | id `solutions` puis `inconnu` | `aria-current="location"` sur Solutions, puis retiré |
| R-M4-decalage | hauteur de barre ou repli 96 | barre nulle / 0 / 188 | 96, 96, 188 |

### M5 balisage (`tests/unit/markup.test.js`)

| Id | Nom | Attendu |
|----|-----|---------|
| R-M5-css | feuille de style branchée | `<link rel="stylesheet" href="styles.css">` |
| R-M5-js | module app.js chargé | `import { init } from './app.js'` |
| R-M5-lang | langue de page fr | `<html lang="fr">` |
| R-M5-nav | chaque lien de nav a une section | ids `accueil`, `solutions`, `surveillance`, `alarmes`, `contact` |
| R-M5-form | formulaire : labels, optionnel téléphone, live region | labels Nom/Email/Téléphone (optionnel)/Message, autocomplete, `aria-live="polite"` |
| R-M5-alt | images de contenu ont un alt non vide | 7 `<img>`, alt non vide |
| R-M5-skip | lien d évitement et footer hors du main | `Aller au contenu`, footer après `</main>` |
| R-M5-xss | pas de texte orphelin Boutique ni injection DOM | pas de Boutique, pas d'`innerHTML`, pas d'`eval(` |
| R-M5-focus | polices locales et focus visible | Nunito locale, `:focus-visible`, pas Google Fonts |
| R-M13-css | reflow mobile : nav visible, grille fluide, ancre sous la barre | pas de hamburger, `scroll-padding-top`, `minmax(min(280px, 100%), 1fr)`, nav pas en `display: none` |

### M6 notifications (`tests/unit/notifications.test.js`)

| Id | Nom | Attendu |
|----|-----|---------|
| R-M6-null | conteneur absent : pas de throw | `null`, pas d'exception |
| R-M6-html | le message HTML reste du texte | `textContent` égal au payload, 0 `img`, 0 `script` |
| R-M6-remplace | une nouvelle notification remplace la précédente | un seul `p`, texte `deux` |
| R-M6-timer | retrait après 3000 ms | encore là à 2999 ms, vide à 3000 ms |

### M7 init (`tests/unit/init.test.js`)

| Id | Nom | Attendu |
|----|-----|---------|
| R-M7-sections | lireSections prend les sections du main | cinq ids dans l'ordre |
| R-M7-ok | envoi valide : succès, reset, pas d élément HTML injecté | `ok === true`, champs vides, message succès, pas de `<b>` |
| R-M7-ko | envoi invalide : erreurs, focus, champs conservés | `ok === false`, erreurs nom/email/tel visibles, `abc` conservé, message erreur |
| R-M7-lire | extraireContact lit les ids du formulaire | `{ nom, email, telephone, message }` ; formulaire vide → chaînes vides |
| R-M7-init | init branche submit et les hashes | scroll `defilee`, submit empêché, clic `#solutions` empêche le défaut |
| R-M7-focus | allerA défile et donne le focus | `focus({ preventScroll: true })` sur `#contenu` ; id vide ou sans `scrollIntoView` → faux |
| R-M7-hash | hash vide ou cible absente : pas de preventDefault | `defaultPrevented === false` |
| R-M7-barre | surveillerDefilement pose defilee et le lien actif | classe absente à 0, présente à 80 |
| R-M7-sans | init sans formulaire ne jette pas | pas d'exception |

### M8 preuve screenshot (`tests/unit/preuve.test.js`)

| Id | Nom | Entrée | Attendu |
|----|-----|--------|---------|
| R-M8-ok | premier essai réussi | screenshot tient | 1 appel, `animations: 'disabled'` |
| R-M8-retry | relance une fois après erreur de capture | Protocol error puis succès | 2 appels |
| R-M8-autre | autre erreur non relancée | `page closed` | 1 appel, throw |
| R-M8-deux | deux échecs de capture | Unable to capture screenshot | throw la seconde |

### M9 présentation du dépôt (`tests/unit/readme.test.js`)

| Id | Nom | Attendu |
|----|-----|---------|
| R-M9-readme | README présente la campagne de déploiement Hexatech | titre `# Hexatech`, phrase « Campagne de test pour le déploiement du site vitrine de la société Hexatech », URL Pages |
| R-M9-cahier | cahier de recettes porte la même campagne | même phrase dans `tests/cahier-recettes.md` |

## Recettes système (Playwright Chromium)

Précondition : serveur `python3 -m http.server 4173 --bind 127.0.0.1` (lancé par la config).

| Id | Nom | Fichier | Étapes | Attendu |
|----|-----|---------|--------|---------|
| R-P1 | AC-P1 page chargée avec styles et titre | `tests/e2e/parcours.spec.js` | ouvrir `/` | titre exact, H1 exact, navbar `position: fixed` |
| R-N1 | AC-N1 navigation interne vers chaque section | `tests/e2e/parcours.spec.js` | clic Solutions, Vidéosurveillance, Alarmes, Contact, Accueil | titre de section exact, heading dans le viewport, `aria-current="location"` |
| R-F1 | AC-F1 envoi valide vide le formulaire | `tests/e2e/parcours.spec.js` | remplir nom/email/message, cliquer Demander un devis | statut = succès, trois champs `''` |
| R-F3 | AC-F3 téléphone invalide bloque l envoi | `tests/e2e/parcours.spec.js` | jeu figé + téléphone `abc` | statut = erreur formulaire, `#erreur-phone` = erreur tél, nom et tél conservés |
| R-F4 | AC-F4 payload HTML reste du texte | `tests/e2e/parcours.spec.js` | nom `<img ...>`, message `<script>...` | statut = succès, 0 `img`, 0 `script` dans le statut |
| R-A1-clavier | AC-A1 clavier : skip link et champs du formulaire | `tests/e2e/accessibilite.spec.js` | Tab, Entrée, focus Nom, Tab | `Aller au contenu`, puis ids `contenu`, `name`, `email` |
| R-A1-axe | AC-A1 axe WCAG 2.2 A et AA | `tests/e2e/accessibilite.spec.js` | analyser wcag2a, wcag2aa, wcag22aa | `violations === []` |
| R-A2 | AC-A2 reflow 320 px, nav visible | `tests/e2e/accessibilite.spec.js` | viewport 320×640 | dépassement `< 2`, lien Contact texte `Contact` href `#contact` |
| R-R1-320 | AC-R1 reflow et nav 320×640 | `tests/e2e/responsive.spec.js` | viewport 320×640 | overflow dans ]-1, 2[, 5 liens visibles ≥ 24 px, pas de hamburger |
| R-R1-375 | AC-R1 reflow et nav 375×667 | `tests/e2e/responsive.spec.js` | viewport 375×667 | idem |
| R-R1-414 | AC-R1 reflow et nav 414×896 | `tests/e2e/responsive.spec.js` | viewport 414×896 | idem |
| R-R1-768 | AC-R1 reflow et nav 768×1024 | `tests/e2e/responsive.spec.js` | viewport 768×1024 | idem |
| R-R1-667 | AC-R1 reflow et nav 667×375 | `tests/e2e/responsive.spec.js` | viewport 667×375 paysage | idem |
| R-R3 | AC-R3 h1 et ancre sous la barre à 320 px | `tests/e2e/responsive.spec.js` | 320×640, clic Solutions | H1 sous la nav, titre Solutions sous la nav |
| R-R4 | AC-R4 zoom 200 % (640 CSS px) | `tests/e2e/responsive.spec.js` | 640×512 | overflow dans ]-1, 2[, H1 pas couvert, nav visible |
| R-R5 | AC-R5 notification tient à 320 px | `tests/e2e/responsive.spec.js` | envoi jeu figé à 320×640 | statut = succès, largeur notif ≤ 320, overflow dans ]-1, 2[ |

Sondage Pages (SUT déployé) : `node tests/sondage-pages.js https://gaetan-pruvot-sqs.github.io/Hexatech/`. Sortie : `build/preuves/sondage-layout.json`.

AC-F2 n'a pas de parcours E2E dédié : R-M7-ko et R-M3-* le couvrent au composant.

## Incidents (régression)

Tous corrigés. Les recettes ci-dessus restent.

| Id | Gravité | Recette | Statut |
|----|---------|---------|--------|
| INC-01 | élevée | R-M5-css | corrigé |
| INC-02 | élevée | R-M5-js | corrigé |
| INC-03 | élevée | R-M5-js | corrigé |
| INC-04 | élevée | (code mort retiré) | corrigé |
| INC-05 | élevée | R-M7-init, R-F1 | corrigé |
| INC-06 | moyenne | R-M5-nav, R-N1 | corrigé |
| INC-07 | élevée | R-M5-xss, R-F4 | corrigé |
| INC-08 | moyenne | R-A2 | corrigé |
| INC-09 | moyenne | R-A1-axe | corrigé |
| INC-10 | faible | R-M5-xss | corrigé |
| INC-11 | moyenne | R-A1-clavier, R-M7-focus | corrigé |
| INC-12 | moyenne | R-P1, R-A2, R-M8-retry | corrigé |
| INC-13 | élevée | R-R3 | corrigé : H1 masqué par la nav à 320–414 px sur Pages |

## Dernier passage

2026-11-14, `npm test` : 68 unitaires / 68, 16 E2E / 16, 0 sauté. `app.js` : instructions 100 %, lignes 100 %, fonctions 100 %, branches 94,87 % (111/117). `npx eslint app.js tests` exit 0. Scan sécu exit 0.

Risques résiduels : envoi de devis local (pas de réseau) ; validation client seulement ; gardes DOM non prises (lignes 116, 125, 176, 228, 245, 270) ; axe limité à Chromium ; sondage Pages dépend du réseau et du délai de rebuild GitHub.
