# Hexatech

Page vitrine pour l'installation d'alarmes et de vidéosurveillance.

Servir le dossier :

```
python3 -m http.server 4173 --bind 127.0.0.1
```

Puis ouvrir `http://127.0.0.1:4173`.

Tests : `npm install` puis `npm test` (Vitest + couverture, Playwright Chromium). Cahier de recettes : `tests/cahier-recettes.md`.

## Publier

Le site est servi par GitHub Pages, branche `main`, dossier `/` :

https://gaetan-pruvot-sqs.github.io/Hexatech/
