# StoryHub - Application de Création et Lecture d'Histoires

## 📖 Description

StoryHub est une application web et mobile complète pour créer, lire et gérer vos histoires. Avec une interface élégante et intuitive, écrivez vos chef-d'œuvres et partagez-les facilement.

## ✨ Fonctionnalités

### 1. Bibliothèque 📚
- Affichage de toutes vos histoires avec titre, extrait, genre, date et temps de lecture estimé
- Deux histoires d'exemple préchargées pour tester
- Design responsive avec grille adaptative

### 2. Éditeur d'Histoires ✍️
- Champs pour titre, genre et contenu
- Zone d'écriture en plein écran avec police élégante
- Compteur de mots, caractères et temps de lecture en temps réel
- Bouton de sauvegarde avec confirmation visuelle
- Nouveau document avec un clic

### 3. Lecteur de Texte 📖
- Mise en page typographique soignée avec police Georgia
- Barre de progression de lecture défilante
- 3 niveaux de tailles de police ajustables (50% - 200%)
- Interface minimaliste pour une meilleure concentration
- Temps de lecture estimé

### 4. Persistance des Données 💾
- Sauvegarde locale complète (localStorage)
- Les histoires persistent entre les sessions
- Récupération automatique des données

### 5. Recherche et Filtres 🔍
- Recherche par titre, extrait et étiquettes
- Filtrage par genre (Fantasy, Science-Fiction, Mystère, Romance, Aventure, Drame, Horreur, Historique)
- Tri par date, longueur ou titre
- Mise à jour en temps réel

### 6. Genres et Étiquettes 🎨
- Palette de 8 genres prédéfinis avec couleurs distinctes
- Système d'étiquettes personnalisables
- Codes couleur visuels pour chaque genre

### 7. Statistiques d'Écriture 📊
- Objectif de mots personnalisé
- Barre de progression vers l'objectif
- Graphique de progression hebdomadaire (Chart.js)
- Total des histoires, mots et temps de lecture
- Données sauvegardées pour suivi continu

### 8. Mode Sombre 🌙
- Basculement facile entre thème clair et sombre
- Palette de couleurs adaptée pour chaque mode
- Préférence sauvegardée
- Support complet dans toute l'application

### 9. Export d'Histoires 💾
- Export en TXT (texte brut)
- Export en HTML (page web)
- Export en PDF (mise en page optimisée)
- Export en DOCX (Word) - Intégration future
- Export en EPUB (e-book) - Intégration future
- Copier le texte dans le presse-papiers
- Modal d'export élégant avec options multiples

## 🏗️ Caractéristiques Techniques

- **Responsive Design**: Fonctionne sur tous les appareils (desktop, tablette, mobile)
- **Framework-less**: Pur JavaScript vanilla, HTML5 et CSS3
- **Persistent Storage**: localStorage pour la sauvegarde sans serveur
- **Visualisations**: Chart.js pour les graphiques
- **Icons**: Font Awesome pour les icônes élégantes
- **Animations**: CSS3 transitions et animations fluides
- **PWA-ready**: Peut être converti en Progressive Web App

## 🚀 Démarrage Rapide

### Option 1: Fichiers Locaux
1. Téléchargez ou clonez les fichiers
2. Ouvrez `index.html` dans votre navigateur
3. C'est prêt! L'application fonctionne hors ligne

### Option 2: Serveur Local
```bash
# Python 3
python -m http.server 8000

# ou Node.js
npx http-server
```

Accédez ensuite à `http://localhost:8000`

## 📁 Structure des Fichiers

```
story-app/
├── index.html       # Structure HTML principale
├── styles.css       # Styles et thèmes
├── app.js           # Logique JavaScript
├── package.json     # Métadonnées du projet
└── README.md        # Cette documentation
```

## 🎮 Guide d'Utilisation

### Créer une Histoire
1. Cliquez sur l'onglet "Écrire"
2. Entrez le titre et sélectionnez le genre
3. Écrivez votre contenu dans la zone de texte
4. Observez les statistiques en temps réel
5. Cliquez sur "Sauvegarder"

### Lire une Histoire
1. Dans la bibliothèque, cliquez sur le bouton "Lire" d'une histoire
2. Utilisez les boutons +/- pour ajuster la taille de police
3. La barre de progression suit votre lecture
4. Cliquez sur la flèche pour retourner à la bibliothèque

### Exporter une Histoire
1. Ouvrez une histoire en édition
2. Cliquez sur "Exporter"
3. Choisissez le format (TXT, HTML, PDF)
4. Le fichier est téléchargé automatiquement

### Gérer les Statistiques
1. Allez à l'onglet "Statistiques"
2. Définissez votre objectif de mots
3. Visualisez votre progression
4. Consultez le graphique hebdomadaire

## 🎨 Personnalisation

### Couleurs
Modifiez les variables CSS au début de `styles.css`:
```css
:root {
  --primary: #6366f1;
  --secondary: #ec4899;
  /* ... */
}
```

### Genres
Ajoutez de nouveaux genres dans `index.html` et `app.js`

### Stockage
Les données sont sauvegardées dans `localStorage` sous les clés:
- `stories`: Liste de toutes les histoires
- `wordGoal`: Objectif de mots
- `fontSize`: Taille de police du lecteur
- `darkMode`: Préférence du thème

## 📱 Responsive

- **Desktop**: Grille complète, disposition en colonnes
- **Tablette**: Grille adaptée, interface tactile
- **Mobile**: Vue simple et empilée, touches larges

## 🔐 Sécurité et Confidentialité

- Aucun serveur, pas de connexion internet requise
- Toutes les données restent sur votre appareil
- Pas de suivi ou de collecte de données
- Sauvegarde locale sécurisée

## 🚀 Développement Futur

- [ ] Synchronisation cloud
- [ ] Collaboration en temps réel
- [ ] Commentaires et annotations
- [ ] Support du markdown avancé
- [ ] Thèmes personnalisés
- [ ] API d'export DOCX et EPUB natif
- [ ] Partage de histoires
- [ ] Système de notation et critiques
- [ ] Notifications
- [ ] Support hors ligne PWA

## 📄 Licence

MIT License - Libre d'utilisation et de modification

## 🤝 Support

Pour toute question ou suggestion, n'hésitez pas à nous contacter!

---

**Bonne écriture! ✍️**
