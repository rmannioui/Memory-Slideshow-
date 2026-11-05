# Memory Slideshow & Dynamic TV Frame 🌟🕯️

**Cadre Photo Dynamique & Diaporama d'Hommage pour Android TV, Fire TV & Tablettes**  
*Dynamic Photo Frame & Memorial Slideshow for TV & Tablet with Ken Burns motion, bilingual FR/EN support, and Start.io monetization.*

---

## 📸 Présentation / Overview

**Memory Slideshow & Dynamic TV Frame** transforme n'importe quel téléviseur (Android TV, Fire TV Box, Smart TV) ou tablette en un cadre photo numérique élégant et solennel. Idéal pour :
- **Cérémonies d'hommage et veillées commémoratives** (ambiance feutrée, bougie vacillante, citations émouvantes).
- **Rassemblements et fêtes de famille** (diaporama chaleureux, souvenirs d'anniversaires, mariages).
- **Cadre d'art et paysages contemplatifs** (effets galerie de musée avec flou d'ambiance 16:9).

---

## ✨ Fonctionnalités Clés / Key Features

- **Effet Ken Burns Cinématographique :** Zooms lents et panoramiques aléatoires avec accélération matérielle 60 FPS.
- **Fondu Enchaîné Doux (Crossfade) :** Transition progressive sans saut d'image ni écran noir.
- **Flou d'Ambiance 16:9 :** Remplit automatiquement les écrans de télévision même pour les photos verticales ou au format 4:3.
- **Support Télécommande TV Complet (10-Foot UI) :**
  - **OK / Entrée / Espace :** Lecture / Pause.
  - **Flèches ← / → :** Photo précédente / suivante.
  - **Flèche ↑ Haut :** Afficher / masquer la barre de contrôle.
  - **Retour / Échap :** Menu des réglages.
  - Mise en valeur visuelle dorée sur les boutons actifs (Focus Ring pour télécommande).
  - Commandes évanescentes (auto-hide après 4,5 secondes d'inactivité).
- **Gestion Complète de la Musique & Bande Son (Manage Songs) :**
  - **Flux Radio & Streaming Web (Web Audio Stream) :** Écoutez des radios en ligne classiques ou paisibles (presets Swiss Classic, Lofi Ambient) ou collez n'importe quelle URL de flux audio HTTP/HTTPS (MP3/AAC) en boucle fluide.
  - **Synthétiseur méditatif intégré :** Génération de carillons apaisants avec la Web Audio API (100% hors-ligne).
  - Contrôle du volume général, mise en pause et reprise automatique synchronisée avec le diaporama.
- **Multilingue Automatique (i18n) :** Détection automatique du français (`fr`) ou anglais (`en`), avec sélecteur manuel dans les paramètres.
- **Gestion des Photos :**
  - Galeries de démonstration haute définition pré-intégrées.
  - Ajout de vos propres photos via glisser-déposer ou explorateur de fichiers.
  - Sauvegarde locale automatique (`localStorage`).
- **Monétisation Start.io & Respect des Cérémonies :**
  - Bannière discrète affichée **uniquement en pause ou dans les menus**, afin de préserver l'intimité et la solennité des diaporamas d'hommage.
  - Configuration facile de l'**App ID Start.io** directement dans le code ou l'interface de réglages.
  - Fichier `app-ads.txt` fourni pour la conformité avec Start.io, l'Amazon Appstore et Google Play.

---

## 🚀 Déploiement sur GitHub Pages

1. Créez un dépôt GitHub nommé `memory-slideshow-tv`.
2. Poussez tous les fichiers du projet sur votre branche `main`.
3. Allez dans **Settings > Pages** de votre dépôt GitHub.
4. Dans **Branch**, sélectionnez `main` et le dossier `/ (root)`, puis cliquez sur **Save**.
5. Votre application est immédiatement accessible à l'adresse :
   ```
   https://USERNAME.github.io/REPOSITORY/
   https://USERNAME.github.io/REPOSITORY/index.html
   ```

---

## 💰 Configuration Start.io & `app-ads.txt`

1. **Start.io App ID :**
   - Votre identifiant d'application Start.io est configuré sur : **`210307679`**.
   - Vous pouvez également le modifier directement depuis l'application via le menu **Paramètres > Monétisation Publicitaire**.
2. **Fichier `app-ads.txt` :**
   - Le fichier `app-ads.txt` est situé à la racine du projet et contient vos lignes de validation publicitaire (Start.io ID éditeur : `191708858`) :
     ```text
     start.io, 191708858, DIRECT
     ...
     ```
   - L'URL de validation sera accessible à : `https://USERNAME.github.io/app-ads.txt`.

---

## 📱 Empaquetage APK pour Android TV, Fire TV & Stores Alternatifs

Ce projet est prêt à être empaqueté en APK pour l'Amazon Appstore, Uptodown et le Play Store grâce à son shell Android WebView natif haute performance (`MainActivity.kt`).

- Les fichiers web sont directement intégrés dans `app/src/main/assets/web/`.
- Le projet gère l'orientation paysage TV, l'accélération matérielle, la veille écran désactivée (`keepScreenOn`) et les codes de télécommandes Android TV (`KEYCODE_DPAD_CENTER`, `KEYCODE_DPAD_LEFT`, `KEYCODE_DPAD_RIGHT`, etc.).

---

## 📁 Structure du Projet

```text
├── index.html               # Page d'accueil web & TV principale
├── app-ads.txt              # Fichier de conformité publicitaire Start.io
├── css/
│   └── style.css            # Styles TV, effet Ken Burns & thème sombre
├── js/
│   ├── app.js               # Moteur du diaporama, audio Web & télécommande
│   └── i18n.js              # Dictionnaire multilingue FR / EN
├── assets/
│   ├── icons/               # Icône adaptive de l'application
│   └── images/              # Photos haute résolution (Mémorial, Lac, Forêt, Océan)
├── manifest.json            # Manifeste PWA pour plein écran TV
├── service-worker.js        # Mise en cache hors-ligne
├── app/                     # Module Android Studio natif (APK/AAB)
│   ├── src/main/assets/web/ # Copie intégrée pour APK autonome hors-ligne
│   └── src/main/java/       # MainActivity Android TV
└── README.md
```

---

© 2026 Memory Slideshow & Dynamic TV Frame. Conçu pour honorer vos plus beaux souvenirs.
