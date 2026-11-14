# DESIGN.md

Nom : Hexatech. Public : entreprises qui cherchent un sous-traitant alarmes et vidéo. Travail de l'écran : présenter l'offre et envoyer une demande de devis.

Direction : page unique, cartes photo, bleu de confiance, texte français direct. Interdit : Google Fonts, fond crème générique, cacher la nav au mobile.

## Palette

| Rôle | Hex |
|------|-----|
| Fond | `#f9fafb` |
| Surface | `#ffffff` |
| Texte | `#1f2937` |
| Texte secondaire | `#4b5563` |
| Accent / primaire | `#1d4ed8` |
| Primaire foncé | `#1e40af` |
| Bordure | `#e5e7eb` |
| Erreur fond | `#fee2e2` |
| Erreur texte | `#7f1d1d` |
| Succès | `#065f46` |

## Polices

- Body et UI : Nunito locale (`assets/fonts/nunito-latin.woff2`, `nunito-latin-ext.woff2`).
- Pas de Bricolage sur cette page.

## Espacement

Unité 0,5 rem. Rayon des cartes 12 px. Navbar fixe, z-index 20, seuil d'ombre 50 px.

## Composants

- Cartes solution : image 200 px, titre, texte.
- Formulaire dans le bandeau CTA, champs blancs, erreurs sous le champ.
- Lien d'évitement visible au focus.

## Voix

Français, phrase courte. « Demander un devis », pas de slogan creux.

## Verrouillé

Photos dans `assets/`. Disposition hero puis solutions, vidéosurveillance, alarmes, contact.
