<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1N8YXs9_-ZIIQaCmb_Qw03VgCc-LiES_v

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Répertoire de préparation des mariages

Page indépendante publiée à `https://guillaumesax.fr/musiques`.
Sources : `src/repertoire/`, entrée `musiques/index.html`.
Le catalogue se met à jour depuis Google Sheets à chaque ouverture ;
`snapshot.json` fournit la copie de secours. Les tendances sont définies dans
`trends.ts`. Les choix souhaités / blacklist restent locaux au navigateur.

Vérifications : `npx tsc --noEmit`, `npm run build`.
Avec Node 22.12+ : `npm run repertoire:sync` pour rafraîchir la copie de secours,
`node --experimental-strip-types --test tests/repertoire.test.mjs` pour les tests.
