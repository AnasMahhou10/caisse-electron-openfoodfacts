# Dossier de conception — Logiciel de caisse Electron

Projet final : [Logiciel de caisse (Electron + OpenFoodFacts)](https://ic-etagsolutions.com/cours/electron/projet-final.html)

## 1. Analyse du besoin

Le client est une épicerie de quartier qui veut remplacer son cahier et sa vieille caisse par
une application desktop simple, fiable et installable sur le PC de la boutique.

### Fonctionnalités principales

| Besoin client                    | Fonctionnalité prévue                                              |
| -------------------------------- | ------------------------------------------------------------------ |
| Ajouter des produits simplement  | Ajout manuel et ajout rapide via code-barres OpenFoodFacts         |
| Gérer les produits               | Catalogue local, recherche, modification du prix, suppression      |
| Encaisser un client              | Panier, quantités, total, validation, ajout rapide par code-barres |
| Retrouver les ventes             | Historique des tickets, ventes du jour, détail d'un ticket         |
| Donner des chiffres au comptable | Export CSV et PDF                                                  |
| Avoir une employée anglophone    | Interface FR/EN, choix mémorisé                                    |
| Avoir un affichage confortable   | Thème clair/sombre, choix mémorisé                                 |
| Continuer sans Internet          | Catalogue et ventes stockés localement                             |
| Être tranquille                  | Notifications système et installeur (pas de terminal)              |

### Cas limites

- **Produit trouvé dans OpenFoodFacts** : l'application pré-remplit nom, marque et image. La gérante fixe le prix (OpenFoodFacts ne fournit pas les prix de vente).
- **Produit introuvable** : bascule vers une saisie manuelle complète.
- **Pas de connexion** : l'encaissement reste possible avec le catalogue local.
- **Erreur de saisie** : validation des champs obligatoires et des prix avant enregistrement.

## 2. Modèle de données

```text
Product
  id, barcode?, name, brand?, price, imageUrl?, source(off|manual), createdAt, updatedAt

Sale
  id, total, createdAt

SaleLine
  id, saleId, productId, productName, quantity, unitPrice, lineTotal

Settings
  language(fr|en), theme(light|dark)
```

Le prix est figé dans `SaleLine` au moment de la vente. L'historique reste correct même si
le prix du produit change ensuite dans le catalogue.

## 3. Architecture

- **main** : fenêtre, stockage local, appels OpenFoodFacts, exports, notifications.
- **preload** : API limitée exposée via `contextBridge`.
- **renderer** : interface React (Catalogue, Caisse, Historique).
- **repositories** : lecture/écriture lowdb.
- **services** : logique métier pure et testable (panier, vente, export).
- **shared** : types TypeScript partagés.

Le renderer n'accède jamais directement à Node.js ni au système de fichiers : tout passe par IPC
(`contextIsolation: true`, `nodeIntegration: false`).

## 4. Choix techniques justifiés

| Choix                    | Justification                                                                 |
| ------------------------ | ----------------------------------------------------------------------------- |
| Electron + electron-vite | Application desktop, packaging simple                                         |
| React + TypeScript       | Interface maintenable, typage fort                                            |
| lowdb                    | Persistance locale JSON, sans compilation native, suffisant pour une épicerie |
| OpenFoodFacts API v2     | API publique imposée pour enrichir les produits par code-barres               |
| i18next                  | Bilingue FR/EN avec choix mémorisé                                            |
| jsPDF                    | Export PDF pour le comptable                                                  |
| Vitest                   | Tests unitaires et d'intégration sur la logique métier                        |
| electron-builder         | Installeur Windows demandé au rendu (pas d'installation via terminal)         |

### OpenFoodFacts

- Endpoint : `GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- Appel dans le **main process** (sécurité, gestion réseau, timeout 7 s)
- User-Agent personnalisé (bonne pratique API)
- Deux flux métier distincts : produit connu / produit inconnu

## 5. Découpage du développement

1. Fondations : stockage, IPC, types, tests, écran catalogue.
2. Catalogue : CRUD, recherche, modification du prix.
3. OpenFoodFacts : code-barres, produit trouvé / introuvable.
4. Caisse : panier, total, validation, notification.
5. Historique : ventes du jour, détail ticket, exports CSV/PDF.
6. Finitions : FR/EN, thème, hors-ligne, README, installeur.
