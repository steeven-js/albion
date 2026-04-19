# 🧮 Albion Calculateur

App React + TypeScript + Vite + Tailwind. 4 onglets :

- **Récolte** — silver/h selon tier, enchant, Premium, focus, zone, risque
- **Revente** — flipping entre 2 villes, taxes setup + broker, ROI
- **Craft** — coût mats, return rate, fame/h, silver/point de fame
- **EV zone rouge** — espérance ajustée à la proba de mort

Prix auto-fetchés via [AlbionOnline Data Project](https://www.albion-online-data.com/).

## Lancer en local

```bash
cd tools/calculateur
npm install
npm run dev
```

Ouvre l'URL affichée (par défaut http://localhost:5173).

## Build production

```bash
npm run build
npm run preview   # pour tester le build
```

Sortie dans `dist/`.

## Déployer sur GitHub Pages

1. `npm run build`
2. Pousse `dist/` sur la branche `gh-pages` (ou utilise une action GitHub)
3. Active Pages dans *Settings* → *Pages*

## Stack

- Vite 5 + React 18 + TypeScript 5 strict
- Tailwind 3
- Aucune lib UI externe
