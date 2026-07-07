# Radia Glam Beauty & Co. — Plateforme

Squelette Phase 1 (site public, compte unique, reservation salon) de l'architecture
fonctionnelle Radia Glam. Next.js 16 (App Router) + PostgreSQL (Prisma 7) + sessions
chiffrees maison (JWT en cookie httpOnly).

## Développement local

Prérequis : Node.js 22+, une base PostgreSQL accessible.

```bash
npm install
cp .env.example .env   # puis renseignez DATABASE_URL et SESSION_SECRET
npx prisma migrate dev
npm run dev
```

Générer un `SESSION_SECRET` :

```bash
openssl rand -base64 32
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Déploiement sur votre propre serveur (VPS), avec HTTPS

Ce repo inclut tout le nécessaire pour un déploiement Docker sur un VPS
(OVH, DigitalOcean, Hostinger...), avec **HTTPS automatique** via Caddy — c'est
ce qui garantit qu'un lien vers votre site est bien sécurisé (`https://`), même
sans nom de domaine acheté pour l'instant.

### 1. Prérequis sur le serveur

- Un VPS avec Docker et Docker Compose installés
- Les ports **80** et **443** ouverts dans le pare-feu (nécessaires pour que
  Caddy obtienne un certificat HTTPS automatiquement via Let's Encrypt)

### 2. Récupérer le code sur le serveur

```bash
git clone <url-du-repo> radia-glam
cd radia-glam
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine (utilisé par `docker-compose.yml`) :

```bash
POSTGRES_PASSWORD=choisissez-un-mot-de-passe-fort
SESSION_SECRET=<sortie de: openssl rand -base64 32>
DOMAIN=votre-domaine.com
```

**Vous n'avez pas encore de nom de domaine ?** Vous pouvez obtenir un lien HTTPS
valide dès aujourd'hui, sans rien acheter, grâce à un domaine "magique" qui
pointe vers l'IP de votre serveur :

```bash
DOMAIN=<IP-DE-VOTRE-SERVEUR>.sslip.io
# exemple : DOMAIN=203.0.113.42.sslip.io
```

Caddy obtiendra automatiquement un vrai certificat Let's Encrypt pour ce lien.
Vos utilisatrices pourront accéder au site via `https://203.0.113.42.sslip.io`
en toute sécurité. Le jour où vous achetez un nom de domaine, il suffira de
changer `DOMAIN` dans le `.env` et de relancer `docker compose up -d`.

### 4. Lancer la plateforme

```bash
docker compose up -d --build
```

Cela démarre 3 services :

- `app` — l'application Next.js (les migrations de base de données sont
  appliquées automatiquement au démarrage)
- `db` — PostgreSQL avec les données persistées dans un volume Docker
- `caddy` — reverse proxy qui gère le HTTPS automatique et sert le site sur les
  ports 80/443

Vérifiez que tout tourne :

```bash
docker compose ps
docker compose logs -f app
```

Le site est maintenant accessible via `https://<DOMAIN>`.

### 5. Mettre à jour après un nouveau déploiement

```bash
git pull
docker compose up -d --build
```

### 6. Sauvegardes de la base de données

```bash
docker compose exec db pg_dump -U radia radia_glam > backup_$(date +%F).sql
```

## Modules couverts par ce squelette

- Site public (accueil, à propos, galerie, contact)
- Compte unique (inscription / connexion / déconnexion), rôles
  cliente / staff / admin, sessions signées et chiffrées
- Catalogue Academy (lecture) — inscriptions en ligne + paiement à venir
- Réservation salon (choix prestation, maquilleuse optionnelle, créneau) —
  crée la demande de rendez-vous ; confirmée manuellement par le salon
- **Espace élève (LMS)** : formations de l'élève avec barre de progression,
  leçons (vidéo/PDF), quiz noté (70% requis pour valider), génération
  automatique d'un **certificat PDF réel** téléchargeable dès que toutes les
  leçons d'une formation sont terminées
- **Boutique** : catalogue produits avec gestion du stock et rupture
  automatique, panier, commande (retrait au salon ou livraison à Dakar avec
  frais fixes), décrément de stock en transaction, suivi de commande côté
  cliente (`espace/commandes`)
- **Tableau de bord admin** : agenda (staff/admin), et gestion complète
  (créer/modifier/supprimer, avec **upload de photo**) des **formations &
  sessions**, **prestations** et **produits & stocks** — accessible
  uniquement au rôle `ADMIN` (`/admin/formations`, `/admin/prestations`,
  `/admin/produits`)
- **Horaires d'ouverture & jours fériés/congés** (`/admin/horaires`) : jours
  travaillés et heures par jour de semaine, plus des fermetures
  exceptionnelles (Tabaski, Korité...)
- **Réservation avec créneaux réels** : la page `/reservation` calcule les
  créneaux réellement disponibles à partir des horaires d'ouverture, des
  jours fériés et des rendez-vous déjà pris (par maquilleuse si choisie,
  sinon par capacité globale du staff) — plus de champ date/heure libre
- **Coordonnées & réseaux** (`/admin/coordonnees`) : téléphone, WhatsApp,
  email, adresse, lien Google Maps, Instagram/TikTok/Facebook — affichés
  dynamiquement sur `/contact` et dans le pied de page du site
- Menu mobile (hamburger) et bouton "Administration" visible directement
  dans l'en-tête pour les comptes admin
- **Contenu & photos du site** (`/admin/contenu`) : photo et textes du hero
  d'accueil, portrait/texte/citation de la page "À propos", et galerie
  photo (upload + légende) — tout est éditable sans toucher au code

Ce qui reste volontairement hors-ligne pour l'instant (documenté dans le code
et l'UI) : le règlement de la boutique et des inscriptions se fait en espèces
au salon/à la livraison, en attendant le compte marchand PayDunya/PayTech.
Il n'y a pas encore d'inscription en libre-service à une formation (l'ajout
d'un élève à une session se fait aujourd'hui côté base de données/admin), ni
de codes promo, ni de gestion des élèves/clientes depuis le tableau de bord.

### Photos uploadées

Les photos de formations/prestations/produits sont stockées sur le disque du
serveur (`public/uploads`), pas dans un service cloud. En Docker, ce dossier
est monté sur un volume nommé (`uploads_data`) pour survivre aux
redéploiements (`docker compose up -d --build`) — assurez-vous de ne jamais
faire `docker compose down -v` (le `-v` supprime aussi les volumes, donc les
photos et la base de données).

### Devenir administrateur

Il n'y a pas d'auto-promotion possible (sécurité) : créez un compte via
`/inscription`, puis en base de données :

```sql
UPDATE "User" SET role='ADMIN' WHERE email='votre-email@exemple.com';
```

Déconnectez-vous et reconnectez-vous ensuite (le rôle est lu depuis la
session au moment de la connexion).

## Prochaines étapes (hors scope de ce squelette)

- Paiement en ligne Wave / Orange Money / CB : nécessite un compte marchand
  PayDunya, PayTech ou CinetPay pour brancher l'API (boutique + academy +
  réservation)
- Notifications WhatsApp Business + email (confirmations, rappels 24h)
- Inscription en ligne à une formation (choix de session + paiement/acompte)
- Hébergement vidéo sécurisé (Mux/Vimeo Pro) pour les leçons
- Codes promo boutique
- Gestion des élèves/clientes et statistiques depuis le tableau de bord admin
- Édition des textes libres du site (accueil, à propos) depuis l'admin
