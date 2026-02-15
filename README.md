# 💪 Hypertrophy Protocol - Workout Tracker

Application web pour consulter ton programme d'entraînement scientifique.

## 🚀 Installation et Lancement Local

### 1. Installer les dépendances

```bash
npm install
```

### 2. Lancer en développement

```bash
npm run dev
```

L'app sera disponible sur `http://localhost:5173`

### 3. Build pour production

```bash
npm run build
```

Les fichiers de production seront dans le dossier `dist/`

## 🌐 Déploiement sur Netlify

### Méthode 1 : Via GitHub (Recommandée)

1. **Créer un repo GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TON-USERNAME/workout-tracker.git
   git push -u origin main
   ```

2. **Connecter à Netlify**
   - Va sur [netlify.com](https://netlify.com)
   - Clique "Add new site" → "Import an existing project"
   - Choisis GitHub et sélectionne ton repo
   - Configuration automatique détectée ✅
   - Clique "Deploy site"

### Méthode 2 : Drag & Drop (Plus rapide)

1. **Build le projet**
   ```bash
   npm run build
   ```

2. **Déployer**
   - Va sur [netlify.com](https://netlify.com)
   - Clique "Add new site" → "Deploy manually"
   - Drag & drop le dossier `dist/` 
   - C'est déployé ! 🎉

### Méthode 3 : Netlify CLI (Pour les pros)

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Déployer
netlify deploy --prod
```

## 📱 Features

- ✅ **3 vues** : Séances détaillées, Vue semaine, Statistiques
- ✅ **Design moderne** : Athletic Brutalism avec dégradés néon
- ✅ **Responsive** : Mobile & Desktop
- ✅ **Volume tracking** : Statistiques par muscle
- ✅ **Informations scientifiques** : Techniques, RPE, focus

## 🛠️ Technologies

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

## 📄 Licence

Projet personnel - Tous droits réservés
# Health
