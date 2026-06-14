# Yakout Luxury

Yakout Luxury est une application e-commerce moderne pour une boutique de vetements et accessoires premium.

Le projet est organise avec deux parties separees :

- `frontend` : interface client et dashboard admin
- `backend` : API, authentification, produits, panier, commandes et administration

## Technologies

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js / React Three Fiber

### Backend

- NestJS
- TypeScript
- Prisma
- PostgreSQL avec Supabase
- JWT, bcrypt et OTP email

## Fonctionnalites principales

- Boutique produits responsive
- Filtres et recherche produits
- Details produit avec variantes
- Panier client
- Checkout avec paiement a la livraison
- Authentification client/admin
- Avis produits
- Dashboard admin
- Gestion produits, categories, utilisateurs et commandes
- Upload images produits

## Structure

```text
YakoutApp/
  frontend/
  backend/
  PRESENTATION.md
  README.md
```

## Installation locale

Installer les dependances du backend :

```bash
cd backend
npm install
```

Installer les dependances du frontend :

```bash
cd frontend
npm install
```

## Lancement local

Demarrer le backend :

```bash
cd backend
npm run start:dev
```

Demarrer le frontend :

```bash
cd frontend
npm run dev
```

## Build

Backend :

```bash
cd backend
npm run build
```

Frontend :

```bash
cd frontend
npm run build
```

## Documentation

Une presentation plus complete du projet est disponible dans :

```text
PRESENTATION.md
```

## Note

Les informations sensibles comme les secrets, mots de passe, URLs privees et configurations d'environnement ne doivent jamais etre publiees dans le README.
