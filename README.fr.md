# Hexatech

[English](README.md) · Français

Campagne de test pour le déploiement du site vitrine de la société Hexatech
(sous-traitance alarmes et vidéosurveillance).

La page à la racine est le livrable sous test. La campagne suit ISTQB CTFL 4.0.1
et ISO/IEC/IEEE 29119. Le cahier de recettes est `tests/cahier-recettes.md`.

## Site sous test

Servir le dossier :

```
python3 -m http.server 4173 --bind 127.0.0.1
```

Puis ouvrir `http://127.0.0.1:4173`.

## Lancer la campagne

```
npm install
npx playwright install chromium
npm test
```

Vitest (couverture v8, seuil 90 %), Playwright Chromium, axe WCAG 2.2.

## Déploiement

GitHub Pages, branche `main`, dossier `/` :

https://gaetan-pruvot-sqs.github.io/Hexatech/
