# Hexatech

English · [Français](README.fr.md)

Test campaign for the deployment of the Hexatech showcase site (alarm
and video surveillance subcontracting).

The page at the root is the deliverable under test. The campaign follows
ISTQB CTFL 4.0.1 and ISO/IEC/IEEE 29119. The test charter is
`tests/cahier-recettes.md`.

## Site under test

Serve the folder:

```
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173`.

## Run the campaign

```
npm install
npx playwright install chromium
npm test
```

Vitest (v8 coverage, 90% threshold), Playwright Chromium, axe WCAG 2.2.

## Deployment

GitHub Pages, `main` branch, `/` folder:

https://gaetan-pruvot-sqs.github.io/Hexatech/
