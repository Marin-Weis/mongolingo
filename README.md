# 🦉 Mongolingo - Quiz interactif MongoDB

> 📚 Projet R4.03 - Qualité au-delà du relationnel  
> 👤 Auteur : **Marin Weis**  
> 👥 Groupe : **C1**

🎥 **Vidéo de démonstration** : https://youtu.be/CKsS4sp4e6w

---

## 📌 Présentation

**Mongolingo** est une application web interactive inspirée de **Duolingo**, dédiée à l’apprentissage des requêtes **MongoDB**.

L’application propose **30 questions de niveaux progressifs**, allant du niveau débutant au niveau très complexe. Chaque requête est exécutée en temps réel sur une base **MongoDB locale**, puis une explication est fournie à l’utilisateur afin de comprendre la solution attendue.

L’objectif du projet est de rendre l’apprentissage du NoSQL plus accessible, plus progressif et plus interactif.

---

## 🗂️ Structure du projet

```txt
server/
  index.js                Serveur Express + API MongoDB
  questions-meta.json     Les 30 questions du quiz avec métadonnées et explications

src/
  pages/                  Composants React : Accueil, Quiz, Collections, Import/Export, Sauvegardes
  api/client.js           Fonctions de communication avec l’API

schemas/
  users.schema.json       Schéma JSON Schema de la collection users
  orders.schema.json      Schéma JSON Schema de la collection orders
  lessons.schema.json     Schéma JSON Schema de la collection lessons

demo-data/
  users.json              30 utilisateurs de démonstration
  orders.json             50 commandes de démonstration
  lessons.json            30 leçons de démonstration

backups/
  Sauvegardes créées via l’interface, au format JSON et BSON base64

dist/
  Frontend React compilé, généré par npm run build
```

---

## 🐧 Installation sur Ubuntu 22.04 ou plus récent

### 1. Installer Node.js 18+

```bash
node --version
```

Si Node.js est absent ou si la version est inférieure à 18 :

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

---

### 2. Installer MongoDB

```bash
sudo apt install -y mongodb
sudo systemctl start mongodb
```

Vérifier que MongoDB fonctionne :

```bash
sudo systemctl status mongodb
```

---

### 3. Installer et lancer Mongolingo

```bash
# Extraire l’archive
unzip mongolingo.zip
cd mongolingo

# Installer les dépendances Node
npm install

# Compiler le frontend React
npm run build

# Lancer le serveur
node server/index.js
```

Ouvrir ensuite l’application dans le navigateur :

```txt
http://localhost:3001
```

> 💡 Les données de démonstration sont chargées automatiquement au premier démarrage si les collections MongoDB sont vides.

---

## 🪟 Installation sur Windows 10 / 11

### 1. Installer Node.js 18+

Télécharger l’installeur LTS depuis :

```txt
https://nodejs.org
```

Puis vérifier l’installation dans PowerShell ou CMD :

```powershell
node --version
npm --version
```

---

### 2. Installer MongoDB Community Edition

1. Télécharger l’installeur `.msi` depuis : https://www.mongodb.com/try/download/community
2. Choisir **Windows**, version **7.0** ou plus récente, package **MSI**
3. Lancer l’installeur
4. Cocher **Install MongoDB as a Service**

Vérifier que le service fonctionne :

```powershell
Get-Service -Name MongoDB
```

Si le service n’est pas démarré :

```powershell
net start MongoDB
```

---

### 3. Installer et lancer Mongolingo

Dans PowerShell ou CMD :

```powershell
# Extraire l’archive
Expand-Archive mongolingo.zip -DestinationPath mongolingo
cd mongolingo

# Installer les dépendances Node
npm install

# Compiler le frontend React
npm run build

# Lancer le serveur
node server/index.js
```

Ouvrir ensuite l’application dans le navigateur :

```txt
http://localhost:3001
```

> ⚠️ Si Windows Defender demande d’autoriser l’accès réseau pour Node.js, il faut accepter.

---

## 🔌 Ports utilisés

| Port | Usage |
|---|---|
| **3001** | Serveur Express, API et frontend |
| **27017** | MongoDB, port par défaut |

---

## 🔄 Réinitialiser les données de démonstration

Si les collections ont été modifiées via l’import et que vous souhaitez revenir aux données initiales, il est possible de réinitialiser la base.

### Depuis l’interface

Page **Accueil** → bouton **Reset demo-data**

### Depuis le terminal sur Ubuntu

```bash
curl -X POST http://localhost:3001/api/reset
```

### Depuis PowerShell sur Windows

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:3001/api/reset
```

---

## ✨ Fonctionnalités

### 🧠 Quiz

- 30 questions MongoDB de niveaux progressifs
- Exécution des requêtes en temps réel sur la base de données
- Comparaison avec le résultat attendu
- Explication détaillée de chaque solution

### 🗃️ Collections

- Visualisation des collections `users`, `orders` et `lessons`
- Affichage des données de démonstration
- Consultation des schémas associés

### 📥 Import / Export

- Import de données au format JSON ou BSON
- Export des collections
- Manipulation des données directement depuis l’interface

### 💾 Sauvegardes

- Création de sauvegardes nommées
- Sauvegarde au format JSON et BSON base64
- Restauration depuis l’interface

---

## 🛠️ Technologies utilisées

- ⚛️ **React**
- ⚡ **Vite**
- 🟩 **Node.js**
- 🚀 **Express**
- 🍃 **MongoDB**
- 📄 **JSON / BSON**
- 🎨 **CSS**
- 🔧 **Git / GitHub**

---

## 🎯 Objectifs pédagogiques

Ce projet m’a permis de travailler plusieurs aspects du développement web et des bases de données NoSQL :

- concevoir une application web complète ;
- manipuler une base MongoDB locale ;
- écrire des requêtes MongoDB de difficulté progressive ;
- créer une interface pédagogique ;
- importer, exporter et sauvegarder des données ;
- documenter un projet pour qu’il soit installable et testable ;
- produire une démonstration claire du fonctionnement de l’application.

---

## 📸 Captures d’écran

Ajouter ici les captures du projet :

```md
![Accueil](docs/screenshots/accueil.png)
![Quiz](docs/screenshots/quiz.png)
![Collections](docs/screenshots/collections.png)
![Import Export](docs/screenshots/import-export.png)
```

---

## 🎥 Démonstration

La vidéo de démonstration présente :

- le principe général de Mongolingo ;
- le lancement de l’application ;
- le fonctionnement du quiz ;
- l’exécution des requêtes MongoDB ;
- l’affichage des corrections ;
- la gestion des collections ;
- les fonctionnalités d’import, export et sauvegarde.

🔗 **Lien vidéo** : https://youtu.be/CKsS4sp4e6w

---

## 🏷️ Contexte académique

Ce projet a été réalisé dans le cadre de la ressource **R4.03 - Qualité au-delà du relationnel** du BUT Informatique.

Il constitue une preuve de ma capacité à développer une application web complète autour d’une base de données NoSQL, avec une interface utilisateur, une API, des données de démonstration, une documentation et une vidéo de présentation.

---

## 👤 Auteur

**Marin Weis**

- GitHub : [Marin-Weis](https://github.com/Marin-Weis)
- Projet : **Mongolingo**

---

## 📄 Licence

Ce projet a été réalisé dans un cadre académique.
