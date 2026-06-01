# Mongolingo — Quiz interactif MongoDB

> Projet R4.03 - Qualité au-delà du relationnel  
> Auteur : **Marin Weis**  
> Groupe : **C1**

**Vidéo de démonstration** : https://youtu.be/CKsS4sp4e6w

---

## Présentation

Mongolingo est une application web interactive inspirée de Duolingo, dédiée à l'apprentissage des requêtes MongoDB. Elle propose 30 questions de niveaux progressifs (débutant → très complexe), exécute chaque requête en temps réel sur une base MongoDB locale, et explique la solution à l'utilisateur.

---

## Structure du projet

```
server/
  index.js                Serveur Express + API MongoDB
  questions-meta.json     Les 30 questions du quiz (métadonnées + explications)

src/
  pages/                  Composants React (Accueil, Quiz, Collections, Import/Export, Sauvegardes)
  api/client.js           Fonctions de communication avec l'API

schemas/
  users.schema.json       Schéma JSON Schema de la collection users
  orders.schema.json      Schéma JSON Schema de la collection orders
  lessons.schema.json     Schéma JSON Schema de la collection lessons

demo-data/
  users.json              30 utilisateurs de démonstration
  orders.json             50 commandes de démonstration
  lessons.json            30 leçons de démonstration

backups/
  (sauvegardes créées via l'interface, au format JSON et BSON base64)

dist/
  (frontend React compilé — généré par npm run build)
```

---

## Installation sur Ubuntu (22.04 ou plus récent)

### 1. Installer Node.js 18+

```bash
node --version   # vérifier si déjà installé
```

Si absent ou version < 18 :

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Installer MongoDB

```bash
sudo apt install -y mongodb
sudo systemctl start mongodb
```

Vérifier que MongoDB tourne :

```bash
sudo systemctl status mongodb
```

### 3. Installer et lancer Mongolingo

```bash
# Extraire l'archive
unzip mongolingo.zip
cd mongolingo

# Installer les dépendances Node
npm install

# Compiler le frontend React
npm run build

# Lancer le serveur
node server/index.js
```

Ouvrir dans le navigateur : [http://localhost:3001](http://localhost:3001)

> Les données de démonstration sont chargées automatiquement au premier démarrage si les collections MongoDB sont vides.

---

## Installation sur Windows 10 / 11

### 1. Installer Node.js 18+

Télécharger l'installeur LTS sur [https://nodejs.org](https://nodejs.org) et l'exécuter.

Vérifier l'installation dans un terminal (PowerShell ou CMD) :

```powershell
node --version
npm --version
```

### 2. Installer MongoDB Community Edition

1. Télécharger l'installeur `.msi` depuis : https://www.mongodb.com/try/download/community  
   (choisir **Windows**, version **7.0** ou plus récente, package **MSI**)
2. Lancer l'installeur — cocher **"Install MongoDB as a Service"** pour qu'il démarre automatiquement.
3. Vérifier que le service tourne :

```powershell
Get-Service -Name MongoDB
```

Si le service n'est pas démarré :

```powershell
net start MongoDB
```

### 3. Installer et lancer Mongolingo

Dans PowerShell ou CMD :

```powershell
# Extraire l'archive (via l'explorateur ou la commande suivante)
Expand-Archive mongolingo.zip -DestinationPath mongolingo
cd mongolingo

# Installer les dépendances Node
npm install

# Compiler le frontend React
npm run build

# Lancer le serveur
node server/index.js
```

Ouvrir dans le navigateur : [http://localhost:3001](http://localhost:3001)

> Si Windows Defender vous demande d'autoriser l'accès réseau pour Node.js, acceptez.

---

## Ports utilisés

| Port  | Usage                            |
|-------|----------------------------------|
| 3001  | Serveur Express (API + frontend) |
| 27017 | MongoDB (port par défaut)        |

---

## Réinitialiser les données de démonstration

Si les collections ont été modifiées via l'import et que vous souhaitez revenir aux données initiales :

**Via l'interface :** page Accueil → bouton *Reset demo-data*

**Via le terminal (Ubuntu) :**
```bash
curl -X POST http://localhost:3001/api/reset
```

**Via PowerShell (Windows) :**
```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:3001/api/reset
```

---

## Fonctionnalités

- **Quiz** — 30 questions MongoDB de niveaux progressifs, exécutées en temps réel sur la base de données. Chaque réponse est comparée au résultat attendu et une explication détaillée est fournie.
- **Collections** — Visualisation des collections `users`, `orders` et `lessons` et de leur schéma.
- **Import / Export** — Chargement et téléchargement de données au format JSON ou BSON pour chaque collection.
- **Sauvegardes** — Création de sauvegardes nommées (JSON + BSON) et restauration depuis l'interface.
