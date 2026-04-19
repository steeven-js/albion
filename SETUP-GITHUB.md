# 🚀 Guide setup GitHub

Comment créer le repo privé et uploader ce guide.

---

## Option A — Via le site GitHub (le plus simple)

### 1. Créer le repo
1. Aller sur [github.com](https://github.com) (ou créer un compte si pas fait)
2. Cliquer sur le **+** en haut à droite → **New repository**
3. **Repository name** : `albion-solo-guide`
4. **Description** (optionnelle) : `Mon journal personnel Albion Online`
5. **Sélectionner "Private"** ⚠️ (important pour que personne ne voie)
6. **NE PAS cocher** "Add a README" (on a déjà le nôtre)
7. Cliquer sur **Create repository**

### 2. Upload les fichiers
1. Sur la page du repo vide → cliquer **uploading an existing file**
2. **Glisser-déposer** tout le dossier `albion-solo-guide` (avec ses sous-dossiers)
3. Message de commit : `Initial commit - guide complet`
4. Cliquer **Commit changes**

### 3. Modifier un fichier
1. Ouvrir n'importe quel fichier `.md` dans le repo
2. Cliquer sur l'icône **crayon** (✏️) en haut à droite
3. Modifier directement dans le navigateur
4. Scroller en bas → écrire un message de commit → **Commit changes**

---

## Option B — Via Git en ligne de commande (recommandé si tu es à l'aise avec git)

### Prérequis
- Git installé sur ton PC
- Un compte GitHub

### Commandes

```bash
# Se placer dans le dossier du guide
cd /chemin/vers/albion-solo-guide

# Initialiser git
git init
git branch -M main

# Premier commit
git add .
git commit -m "Initial commit - guide complet"

# Lier au repo GitHub (remplacer USERNAME)
git remote add origin https://github.com/USERNAME/albion-solo-guide.git

# Push
git push -u origin main
```

### Pour mettre à jour ensuite

```bash
# Après avoir modifié des fichiers
git add .
git commit -m "Mise à jour section X"
git push
```

---

## Option C — Via GitHub Desktop (interface graphique)

1. Télécharger [GitHub Desktop](https://desktop.github.com/)
2. Se connecter avec ton compte
3. **File → Add local repository** → sélectionner le dossier
4. **Publish repository** → **cocher "Keep this code private"**
5. Éditer les fichiers localement, puis commit + push via l'interface

---

## 📱 Éditer depuis ton téléphone

L'app **GitHub** (iOS/Android) permet de modifier les fichiers Markdown en mobilité.
Parfait pour noter rapidement après une session de jeu.

---

## 🎨 Bonus : prévisualiser le Markdown

GitHub affiche automatiquement les `.md` formatés. Pour prévisualiser en local :
- **VS Code** : touche `Ctrl + Shift + V` sur un fichier `.md`
- **Typora** : éditeur Markdown natif payant mais très beau
- **Obsidian** : gratuit, excellent pour les wikis personnels — alternative à GitHub si tu préfères tout en local

---

## 🔒 Note sur la confidentialité

- Repo **Private** = seul toi (et ceux que tu invites) peut le voir
- Tu peux toujours le passer en Public plus tard si tu veux partager
- Pour **inviter quelqu'un** (un pote qui voudrait voir) : Settings → Collaborators → Add people

---

## ✅ Checklist post-setup

- [ ] Repo GitHub créé en mode Privé
- [ ] Tous les fichiers uploadés
- [ ] Premier commit fait
- [ ] Test d'édition d'un fichier
- [ ] App GitHub installée sur mobile (optionnel)
- [ ] Sections remplies avec tes premières observations
