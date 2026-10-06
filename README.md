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

## Contrat de prestation

Page publiée à `https://guillaumesax.fr/contrat-prestation/`.
Sources : `src/contract/`, entrée `contrat-prestation/index.html`.
Le formulaire permet de préparer le contrat, dessiner une signature et télécharger un PDF reprenant la mise en page de l'aperçu.
L'envoi direct par e-mail utilise le Worker dans `workers/contract-mail/`, Turnstile et Resend. Le bouton reste désactivé tant que les variables publiques `VITE_CONTRACT_API_URL` et `VITE_TURNSTILE_SITE_KEY` ne sont pas définies dans les variables GitHub Actions du dépôt. Elles sont intégrées au build et ne doivent contenir aucun secret.

Pour activer l'envoi :

1. Se connecter à Cloudflare et créer un widget Turnstile pour `guillaumesax.fr`. Noter sa clé de site publique et conserver la clé secrète dans Cloudflare.
2. Se connecter à Resend, vérifier un domaine d'envoi appartenant à `guillaumesax.fr`, puis créer une clé API d'envoi. Configurer `MAIL_FROM` dans `workers/contract-mail/wrangler.toml` avec une adresse de ce domaine vérifié.
3. Déployer le Worker avec Wrangler depuis `workers/contract-mail/`, puis y enregistrer les secrets `TURNSTILE_SECRET` et `RESEND_API_KEY` avec `wrangler secret put`. Ne jamais enregistrer ces valeurs dans Git, GitHub Actions ou un fichier de projet suivi.
4. Définir les variables GitHub Actions `VITE_CONTRACT_API_URL` (URL HTTPS du Worker) et `VITE_TURNSTILE_SITE_KEY` (clé publique), puis relancer `Deploy to GitHub Pages`.
5. Envoyer un contrat fictif depuis la page publique, vérifier la réception du PDF à `contact@guillaumesax.fr` et de la copie à l'adresse de test, puis vérifier l'absence de données personnelles dans les journaux.

Le Worker accepte uniquement l'origine du site, vérifie le jeton Turnstile côté serveur, limite la taille et le type du PDF, et utilise une clé d'idempotence pour éviter les doublons lors d'une nouvelle tentative. La clé Resend et le secret Turnstile ne sont jamais exposés dans le navigateur.

Vérifications : `npx tsc --noEmit`, `npm run build`.
