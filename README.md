# Wuendjo (React + Vite) – déployable sur Vercel

Structure : `src/` (React), `api/travora.js` (proxy du serveur MCP Travora), `index.html`.

## En local
    npm install
    npm run dev          # interface seule
    npx vercel dev       # interface + /api/travora (Visa)

## Déployer sur Vercel
1. Poussez ce dossier (sans node_modules) à la racine d'un dépôt GitHub.
2. Vercel, Add New, Project, importez le dépôt. Framework détecté : Vite
   (Build : `npm run build`, Output : `dist`). Cliquez sur Deploy.
