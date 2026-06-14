# Yakout Luxury

Yakout Luxury est un projet e-commerce professionnel avec architecture separee.

- `frontend` : Next.js, TypeScript, Tailwind CSS, Three.js, React Three Fiber, Framer Motion
- `backend` : NestJS, TypeScript, Prisma, Supabase PostgreSQL, JWT, bcrypt, OTP email
- Paiement initial : paiement a la livraison
- Images produits : Cloudinary

## Prerequis

- Node.js 20 ou plus
- npm
- Un projet Supabase PostgreSQL
- Un compte Cloudinary si l'upload image est utilise
- Un SMTP pour l'envoi OTP email

## Installation

Depuis la racine :

```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

## Variables d'environnement

Copier les fichiers exemples :

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

### Backend `backend/.env`

```env
PORT=4000
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000

SMTP_HOST=smtp.example.com
SMTP_PORT=587
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password
SMTP_FROM="Yakout Luxury <no-reply@yakout-luxury.com>"

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

`DATABASE_URL` doit pointer vers le pooler Supabase. `DIRECT_URL` doit pointer vers la connexion directe Supabase, utilisee par Prisma pour les migrations.

### Frontend `frontend/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

En production Vercel, cette valeur doit etre l'URL publique du backend, par exemple :

```env
NEXT_PUBLIC_API_URL=https://yakout-luxury-api.onrender.com/api
```

## Prisma

Depuis `backend` :

```bash
npm run prisma:generate
```

Developpement local :

```bash
npm run prisma:migrate
```

Production / Supabase :

```bash
npm run prisma:deploy
```

Seed admin optionnel :

```bash
npm run prisma:seed
```

Le seed cree :

- admin : `admin@yakoutluxury.com`
- mot de passe : `Admin123456`
- categories, produits, images temporaires et variantes de test

## Lancement local

Terminal backend :

```bash
cd backend
npm run start:dev
```

Terminal frontend :

```bash
cd frontend
npm run dev
```

URLs locales :

- Frontend : `http://localhost:3000`
- Backend : `http://localhost:4000/api`
- Health check : `http://localhost:4000/api/health`

## Build

Backend :

```bash
cd backend
npm run build
npm run start:prod
```

Frontend :

```bash
cd frontend
npm run build
npm run start
```

## Deploiement frontend sur Vercel

1. Creer un nouveau projet Vercel.
2. Selectionner le dossier racine `frontend`.
3. Framework preset : Next.js.
4. Build command : `npm run build`.
5. Output : automatique Next.js.
6. Ajouter la variable :

```env
NEXT_PUBLIC_API_URL=https://VOTRE_BACKEND/api
```

7. Deployer.

Apres deploiement frontend, ajouter l'URL Vercel dans `FRONTEND_URL` cote backend pour CORS.

## Deploiement backend sur Render

Configuration recommandee :

- Root directory : `backend`
- Build command : `npm install && npm run build`
- Start command : `npm run start:prod`
- Health check path : `/api/health`

Variables a configurer sur Render :

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=...
DIRECT_URL=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://votre-frontend.vercel.app
SMTP_HOST=...
SMTP_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
SMTP_FROM="Yakout Luxury <no-reply@yakout-luxury.com>"
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Appliquer les migrations Supabase depuis Render Shell ou localement :

```bash
cd backend
npm run prisma:deploy
```

Seed admin optionnel :

```bash
npm run prisma:seed
```

## Deploiement backend sur Railway

Configuration recommandee :

- Root directory : `backend`
- Build command : `npm run build`
- Start command : `npm run start:prod`

Variables Railway : les memes que pour Render.

Appliquer les migrations :

```bash
npm run prisma:deploy
```

Seed admin optionnel :

```bash
npm run prisma:seed
```

## Notes securite

- Ne jamais committer `backend/.env` ou `frontend/.env`.
- `JWT_SECRET` doit etre long, aleatoire et different par environnement.
- `FRONTEND_URL` peut accepter plusieurs origines separees par virgule.
- Les commandes et totaux sont recalcules cote backend.
- Les routes admin sont protegees par JWT + role `ADMIN`.
