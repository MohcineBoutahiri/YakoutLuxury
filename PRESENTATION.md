# Presentation du projet Yakout Luxury

## Introduction du projet

Yakout Luxury est une application e-commerce professionnelle dediee a la vente de produits de mode haut de gamme.

Le projet propose une boutique en ligne moderne, elegante et responsive, avec une interface client, un espace administrateur, un systeme d'authentification securise, une gestion des produits, du panier, des commandes, des avis, des coupons et des bannieres.

L'objectif est de creer une plateforme complete, proche d'un vrai produit commercial, tout en respectant une architecture claire et maintenable.

## Problematique

De nombreuses petites marques de mode ou de luxe ont besoin d'une boutique en ligne simple, rapide et professionnelle.

Elles doivent pouvoir presenter leurs produits avec une image premium, gerer les commandes, suivre les stocks, administrer les categories et securiser les comptes utilisateurs.

La problematique principale est donc la suivante :

Comment concevoir une application e-commerce moderne, securisee, responsive et facile a maintenir, tout en offrant une experience utilisateur elegante et professionnelle ?

## Objectifs

Les objectifs du projet Yakout Luxury sont :

- Creer une boutique e-commerce moderne et responsive.
- Proposer une experience visuelle premium avec un design noir, dore et blanc casse.
- Permettre aux clients de creer un compte, se connecter et passer commande.
- Securiser l'authentification avec JWT, bcrypt et OTP par email.
- Gerer les produits, categories, commandes, coupons et bannieres depuis un dashboard admin.
- Utiliser une base de donnees PostgreSQL hebergee sur Supabase.
- Utiliser Prisma comme ORM pour toutes les operations en base de donnees.
- Preparer le projet pour un deploiement reel sur Vercel, Render ou Railway.

## Technologies utilisees

Le projet utilise une stack moderne separee en deux parties.

Pour le frontend :

- Next.js avec TypeScript.
- App Router de Next.js.
- Tailwind CSS pour le design system.
- Framer Motion pour les animations.
- Three.js, React Three Fiber et Drei pour la section 3D.
- Axios pour les appels API.
- Context API et providers React pour la gestion de l'etat.

Pour le backend :

- NestJS avec TypeScript.
- Prisma comme ORM.
- Supabase PostgreSQL comme base de donnees.
- JWT pour l'authentification.
- bcrypt pour le hashage des mots de passe.
- class-validator pour la validation des DTO.
- Helmet, CORS et rate limiting pour renforcer la securite.
- Cloudinary pour la gestion des images produits.

## Architecture globale

Yakout Luxury repose sur une architecture separee :

- Un dossier `frontend` pour l'application Next.js.
- Un dossier `backend` pour l'API NestJS.

Cette separation permet de deployer independamment le frontend et le backend.

Le frontend communique avec le backend via des routes API prefixees par `/api`.

La base de donnees est hebergee sur Supabase PostgreSQL, et toutes les requetes sont effectuees via Prisma.

## Architecture frontend

Le frontend est organise de maniere modulaire.

Les pages sont placees dans `src/app`, selon le fonctionnement de l'App Router de Next.js.

Les composants sont regroupes par responsabilite :

- `components/ui` pour les composants reutilisables comme Button, Input, Card, Badge, Modal et Loader.
- `components/layout` pour la Navbar, le Footer et les layouts.
- `components/product` pour l'affichage des produits.
- `components/admin` pour les composants du dashboard.
- `components/three` pour la partie 3D.

Les autres dossiers importants sont :

- `providers` pour les providers globaux comme AuthProvider et CartProvider.
- `services` pour les appels API.
- `hooks` pour les hooks personnalises.
- `types` pour les types TypeScript.
- `lib` pour les fonctions utilitaires.

Cette organisation facilite la maintenance et evite de tout mettre dans un seul fichier.

## Architecture backend

Le backend NestJS est organise autour de modules.

Chaque domaine fonctionnel possede son propre module :

- `auth` pour l'authentification.
- `users` pour les utilisateurs.
- `otp` pour la verification par code.
- `products` pour les produits.
- `categories` pour les categories.
- `cart` pour le panier.
- `orders` pour les commandes.
- `admin` pour le dashboard administrateur.
- `upload` pour l'upload d'images.
- `prisma` pour la connexion a la base de donnees.
- `common` pour les services, guards, decorators et filtres partages.

Cette architecture respecte les bonnes pratiques de NestJS : chaque module contient ses controllers, services et DTO lorsque c'est necessaire.

## Base de donnees Supabase PostgreSQL

La base de donnees utilisee est Supabase PostgreSQL.

Elle permet de stocker les utilisateurs, produits, variantes, images, paniers, commandes, coupons, avis et bannieres.

Les donnees principales du projet sont structurees autour de plusieurs models :

- User
- Otp
- Category
- Product
- ProductImage
- ProductVariant
- Cart
- CartItem
- Order
- OrderItem
- Coupon
- Review
- Banner

Supabase fournit une base PostgreSQL fiable, adaptee aux projets web modernes.

## ORM Prisma

Prisma est utilise comme ORM pour communiquer avec Supabase PostgreSQL.

Le fichier `schema.prisma` definit les models, les relations, les enums et les index utiles.

Prisma permet :

- De generer un client TypeScript type.
- D'executer les migrations de base de donnees.
- D'eviter les requetes SQL manuelles dans le code.
- De centraliser la structure de la base dans un schema clair.

Toutes les futures requetes vers la base passent par PrismaService.

## Authentification JWT + OTP

L'authentification est basee sur JWT, bcrypt et OTP email.

Lors de l'inscription :

- Les donnees sont validees avec des DTO.
- Les champs sont nettoyes avec SanitizationService.
- L'email est transforme en minuscule.
- Le mot de passe est hashe avec bcrypt.
- Un OTP de 6 chiffres est genere.
- Le compte reste non verifie tant que l'OTP n'est pas valide.

Lors de la connexion :

- Le backend verifie l'email et le mot de passe.
- Le compte doit etre verifie.
- Le compte doit etre actif.
- Un accessToken JWT est retourne.
- Le mot de passe n'est jamais retourne au frontend.

Les routes privees utilisent JwtAuthGuard.

Les routes administrateur utilisent aussi RolesGuard avec le role ADMIN.

## Gestion localStorage token

Cote frontend, le token JWT est stocke dans le localStorage avec la cle `yakout_token`.

Les informations utilisateur sont stockees avec la cle `yakout_user`.

Le service Axios ajoute automatiquement le token dans le header :

`Authorization: Bearer token`

Si le token est invalide ou expire, le frontend declenche automatiquement un logout et nettoie le localStorage.

Cette gestion permet de garder l'utilisateur connecte entre deux rechargements de page.

## Providers frontend

Le frontend utilise des providers React pour centraliser certains etats globaux.

Les principaux providers sont :

- AuthProvider pour l'authentification.
- CartProvider pour la gestion du panier.
- AppProviders pour regrouper les providers globaux.

Ces providers permettent aux composants d'acceder facilement aux informations de connexion, au panier et aux actions principales sans repeter la logique dans chaque page.

## Services et providers NestJS

Cote backend, NestJS utilise des services pour isoler la logique metier.

Par exemple :

- AuthService gere l'inscription, la connexion et la verification OTP.
- OtpService gere la generation et la validation des codes.
- MailService gere l'envoi des emails.
- ProductsService gere les produits.
- CartService gere le panier.
- OrdersService gere les commandes.
- UploadService gere l'envoi des images vers Cloudinary.

Le dossier `common` contient aussi des services reutilisables :

- SanitizationService pour nettoyer les donnees.
- PaginationService pour gerer les listes paginees.
- SlugService pour generer des slugs propres.

Cela evite la repetition et rend le backend plus lisible.

## Dashboard admin

Le dashboard administrateur permet de piloter la boutique.

Il affiche notamment :

- Le nombre total d'utilisateurs.
- Le nombre total de produits.
- Le nombre total de commandes.
- Le chiffre d'affaires.
- Les commandes recentes.
- Les produits avec stock faible.
- Les commandes regroupees par statut.
- Le revenu mensuel.

Toutes les pages admin sont protegees par AdminRoute cote frontend et par RolesGuard cote backend.

## CRUD

Le projet contient plusieurs operations CRUD.

L'administrateur peut gerer :

- Les produits.
- Les categories.
- Les commandes.
- Les coupons.
- Les bannieres.
- Les utilisateurs selon les besoins du dashboard.

Les produits peuvent contenir plusieurs images et plusieurs variantes, avec taille, couleur, stock et SKU.

Les operations sensibles sont accessibles uniquement aux administrateurs.

## Partie 3D

La page d'accueil contient une section 3D premium.

Elle utilise :

- Three.js.
- React Three Fiber.
- Drei.
- Suspense.
- Un loader 3D.

La scene 3D reste legere afin de ne pas bloquer le chargement de la page.

Sur mobile, l'experience peut etre allegee pour garder de bonnes performances.

Cette partie donne une identite visuelle plus moderne et plus luxueuse au projet.

## Securite

Plusieurs mesures de securite sont mises en place :

- Les mots de passe sont hashes avec bcrypt.
- Les mots de passe ne sont jamais retournes dans les reponses API.
- Les routes privees utilisent JWT.
- Les routes admin exigent le role ADMIN.
- Les DTO valident les donnees avant insertion.
- Les prix et totaux sont calcules cote backend.
- Le stock est verifie cote backend.
- Le checkout utilise une transaction Prisma.
- Le login, la verification OTP et le renvoi OTP sont limites par rate limiting.
- CORS est configure proprement.
- Helmet renforce les headers HTTP.
- Les fichiers uploades sont limites par type et par taille.
- Les variables sensibles sont placees dans des fichiers `.env` non commites.

Ces choix reduisent les risques classiques dans une application e-commerce.

## Deploiement

Le projet est prepare pour etre deploye separement.

Le frontend peut etre deploye sur Vercel.

Il faut configurer la variable :

`NEXT_PUBLIC_API_URL=https://url-du-backend/api`

Le backend peut etre deploye sur Render ou Railway.

Les variables importantes cote backend sont :

- DATABASE_URL
- DIRECT_URL
- JWT_SECRET
- EMAIL_USER
- EMAIL_PASS
- FRONTEND_URL
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Les migrations Prisma peuvent etre executees avec :

`npm run prisma:deploy`

Le seed admin peut etre lance si necessaire avec :

`npm run prisma:seed`

Le backend expose aussi une route de verification :

`GET /api/health`

Elle permet de verifier que l'API fonctionne apres deploiement.

## Conclusion

Yakout Luxury est une application e-commerce complete, moderne et securisee.

Le projet montre comment construire une architecture professionnelle avec un frontend Next.js, un backend NestJS, une base Supabase PostgreSQL et Prisma.

Il integre les fonctionnalites principales attendues dans une boutique en ligne : authentification, produits, panier, commandes, dashboard admin, upload d'images, coupons, avis et banniere d'accueil.

Grace a son architecture separee, son design premium et sa preparation au deploiement, Yakout Luxury constitue une base solide pour un vrai projet e-commerce evolutif.
