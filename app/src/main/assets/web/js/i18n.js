/**
 * Internationalization (i18n) Module
 * Memory Slideshow & Dynamic TV Frame
 * Auto-detects system language (FR / EN) with manual toggle and localStorage persistence.
 */

const I18N_STORAGE_KEY = 'memory_slideshow_lang';

const translations = {
  fr: {
    app_title: "Memory Slideshow",
    app_subtitle: "Cadre Photo Dynamique & Diaporama d'Hommage pour TV & Tablette",
    tagline_tv: "Optimisé pour Android TV, Fire TV & Tablettes",
    
    // Quick Actions
    btn_start: "Lancer le Diaporama",
    btn_resume: "Reprendre",
    btn_pause: "Pause",
    btn_next: "Suivant",
    btn_prev: "Précédent",
    btn_settings: "Paramètres",
    btn_photos: "Gérer les Photos",
    btn_manage_songs: "Gérer la Musique",
    btn_manage_songs_short: "Musique",
    btn_add_music: "Ajouter Musique",
    btn_fullscreen: "Plein Écran",
    btn_sound_on: "Son d'Ambiance : Activé",
    btn_sound_off: "Son d'Ambiance : Désactivé",
    btn_close: "Fermer",
    btn_save: "Enregistrer",
    btn_reset_defaults: "Réinitialiser",
    btn_add_photos: "Ajouter des Photos",
    btn_clear_custom: "Effacer les photos ajoutées",

    // Music & Songs Management
    songs_modal_title: "Gestion de la Musique & Bande Son",
    music_source_label: "Source Audio :",
    source_ambient: "Sons Ambiants Méditatifs (Intégré)",
    source_local: "Morceaux Locaux / Importés",
    source_stream: "Flux Audio Web & Radio Relaxante",
    source_none: "Aucun son (Silence)",
    music_volume_label: "Volume Sonore :",
    local_music_upload_hint: "Glissez vos fichiers audio ici ou cliquez pour importer (MP3, WAV, AAC, OGG, FLAC)",
    btn_add_audio: "Importer des Fichiers Audio",
    stream_input_label: "URL du flux audio web ou radio en ligne :",
    stream_input_placeholder: "Ex: https://stream.example.com/relax.mp3",
    btn_load_stream: "Écouter le flux",
    stream_status_ready: "Flux audio connecté et prêt",
    stream_status_playing: "Lecture du flux audio en cours...",
    stream_status_error: "Impossible de lire ce flux audio (vérifiez l'URL)",
    stream_presets_label: "Radios d'ambiance suggérées :",
    preset_classical: "Classique & Sérénité (Radio Suisse)",
    preset_zen: "Ambiance Zen & Méditation",
    uploaded_songs_title: "Morceaux enregistrés",
    no_local_songs: "Aucun fichier audio local importé pour le moment.",
    btn_clear_songs: "Effacer les morceaux locaux",
    confirm_clear_songs: "Supprimer tous les fichiers audio locaux enregistrés ?",
    song_track_playing: "En lecture",
    songs_tab_local: "Fichiers Locaux",
    songs_tab_stream: "Flux Audio Web",
    songs_tab_ambient: "Ambiance Méditative",
    
    // Remote Guide
    remote_guide_title: "Télécommande TV & Raccourcis",
    remote_ok: "OK / Entrée / Espace : Lecture / Pause",
    remote_arrows: "Flèches Gauche / Droite : Photo précédente / suivante",
    remote_up: "Flèche Haut : Afficher / Masquer les informations",
    remote_back: "Retour / Échap : Menu des réglages",
    remote_hint_banner: "Appuyez sur OK ou touchez l'écran pour les commandes",

    // Ambiances / Themes
    theme_title: "Ambiance & Thème",
    theme_memorial: "Mémorial & Hommage",
    theme_memorial_desc: "Atmosphère solennelle, lueur de bougie dorée et citations émouvantes.",
    theme_celebration: "Souvenirs de Famille & Fêtes",
    theme_celebration_desc: "Teintes chaudes, transitions vives pour anniversaires et rassemblements.",
    theme_art: "Cadre d'Art & Paysages",
    theme_art_desc: "Effet galerie de musée, bordures douces et paysages relaxants.",
    theme_minimal: "Épuré & Plein Écran",
    theme_minimal_desc: "Photo 100% plein écran sans aucune superposition.",

    // Slide Settings
    settings_title: "Réglages du Diaporama",
    setting_duration: "Vitesse d'affichage",
    setting_duration_5s: "Rapide (5 secondes)",
    setting_duration_8s: "Équilibré (8 secondes)",
    setting_duration_12s: "Cinématographique (12 secondes)",
    setting_duration_20s: "Contemplatif (20 secondes)",
    setting_duration_30s: "Cadre TV Lent (30 secondes)",
    
    setting_effect: "Effet d'Animation",
    setting_effect_kenburns: "Effet Ken Burns (Zoom lent & Panoramique)",
    setting_effect_crossfade: "Fondu Enchaîné Doux",
    setting_effect_zoom: "Zoom Lent Continu",
    setting_effect_static: "Statique (Transition nette)",

    setting_bg: "Style d'Arrière-Plan (Hors 16:9)",
    setting_bg_blur: "Flou d'ambiance étendu (Recommandé TV)",
    setting_bg_black: "Noir cinéma profond",
    setting_bg_white: "Blanc passe-partout galerie",

    setting_show_quotes: "Afficher citations & textes",
    setting_show_clock: "Afficher l'horloge & date",
    setting_shuffle: "Lecture aléatoire",
    setting_ambient_sound: "Musique d'ambiance méditative",
    setting_dim_night: "Mode Nuit atténué (TV salon)",

    // Photo Management
    photos_title: "Gestion des Photos",
    photos_library_title: "Mes Photos Personnalisées",
    photos_drop_hint: "Glissez vos photos ici ou cliquez pour parcourir vos fichiers",
    photos_count: "photos dans la liste de lecture",
    photo_caption_placeholder: "Légende / Date / Citation personnalisée...",
    empty_state_title: "Votre Cadre Photo Personnel",
    empty_state_desc: "Aucune photo pour le moment. Ajoutez vos propres photos de famille, d'hommage ou de vacances pour démarrer votre diaporama personnalisé.",
    no_photos_yet: "Aucune photo personnalisée importée pour le moment.",
    
    // Start.io Ads
    ads_section_title: "Monétisation Publicitaire (Start.io)",
    ads_app_id_label: "Start.io App ID :",
    ads_app_id_placeholder: "Ex: 210307679",
    ads_mode_label: "Mode d'affichage publicitaire :",
    ads_mode_paused_only: "Discret (En pause et menu uniquement)",
    ads_mode_demo: "Bannière Test Démo",
    ads_mode_disabled: "Désactivé (Sans publicité)",
    ads_note: "Conformément aux normes, la publicité ne s'affiche jamais pendant le défilement actif du diaporama d'hommage pour préserver le respect du moment.",
    ads_compliance_badge: "Conforme app-ads.txt & Google Play Policy",

    // Language
    lang_label: "Langue / Language :",
    lang_fr: "Français",
    lang_en: "English",

    // Ambient Quotes
    quotes: [
      { text: "Le souvenir est le parfum de l'âme.", author: "George Sand" },
      { text: "Ceux que nous avons aimés et que nous avons perdus ne sont plus où ils étaient, mais ils sont partout où nous sommes.", author: "Saint Jean Chrysostome" },
      { text: "La mort n'est rien, je suis seulement passé dans la pièce à côté.", author: "Henry Scott Holland" },
      { text: "Il y a quelque chose de plus fort que la mort, c'est la présence des absents dans la mémoire des vivants.", author: "Jean d'Ormesson" },
      { text: "Le temps passe, les souvenirs restent gravés à jamais.", author: "Pensée du cœur" },
      { text: "Vivre dans les cœurs que nous laissons derrière nous, ce n'est pas mourir.", author: "Thomas Campbell" }
    ],

    // Default Demo Photo Captions
    demo_candle_title: "Lueur de Sérénité",
    demo_candle_subtitle: "En hommage affectueux",
    demo_lake_title: "Reflets Paisibles",
    demo_lake_subtitle: "La paix des grands espaces",
    demo_path_title: "Chemin Doré d'Automne",
    demo_path_subtitle: "Chaque pas est un précieux souvenir",
    demo_ocean_title: "Horizon Infini",
    demo_ocean_subtitle: "Au-delà du coucher de soleil"
  },

  en: {
    app_title: "Memory Slideshow",
    app_subtitle: "Dynamic Photo Frame & Memorial Slideshow for TV & Tablet",
    tagline_tv: "Optimized for Android TV, Fire TV & Tablets",

    // Quick Actions
    btn_start: "Start Slideshow",
    btn_resume: "Resume",
    btn_pause: "Pause",
    btn_next: "Next",
    btn_prev: "Previous",
    btn_settings: "Settings",
    btn_photos: "Manage Photos",
    btn_manage_songs: "Manage Songs",
    btn_manage_songs_short: "Music",
    btn_add_music: "Add Music",
    btn_fullscreen: "Fullscreen",
    btn_sound_on: "Ambient Sound: On",
    btn_sound_off: "Ambient Sound: Off",
    btn_close: "Close",
    btn_save: "Save",
    btn_reset_defaults: "Reset Defaults",
    btn_add_photos: "Add Photos",
    btn_clear_custom: "Clear Custom Photos",

    // Music & Songs Management
    songs_modal_title: "Music & Soundtrack Management",
    music_source_label: "Audio Source:",
    source_ambient: "Calming Ambient Synth (Built-in)",
    source_local: "Local / Uploaded Songs",
    source_stream: "Web Audio Stream & Calming Radio",
    source_none: "No Sound (Silence)",
    music_volume_label: "Audio Volume:",
    local_music_upload_hint: "Drag & drop audio files here or click to browse (MP3, WAV, AAC, OGG, FLAC)",
    btn_add_audio: "Import Audio Files",
    stream_input_label: "Web audio stream or online radio URL:",
    stream_input_placeholder: "e.g. https://stream.example.com/relax.mp3",
    btn_load_stream: "Play Stream",
    stream_status_ready: "Audio stream connected and ready",
    stream_status_playing: "Audio stream playing...",
    stream_status_error: "Unable to play audio stream (check URL)",
    stream_presets_label: "Suggested ambient stations:",
    preset_classical: "Classical & Serenity",
    preset_zen: "Zen & Meditation Mood",
    uploaded_songs_title: "Saved Local Tracks",
    no_local_songs: "No local audio files imported yet.",
    btn_clear_songs: "Clear local tracks",
    confirm_clear_songs: "Delete all saved local audio tracks?",
    song_track_playing: "Playing",
    songs_tab_local: "Local Files",
    songs_tab_stream: "Web Audio Stream",
    songs_tab_ambient: "Meditative Ambient",

    // Remote Guide
    remote_guide_title: "TV Remote & Shortcuts",
    remote_ok: "OK / Enter / Spacebar: Play / Pause",
    remote_arrows: "Left / Right Arrows: Previous / Next photo",
    remote_up: "Up Arrow: Show / Hide Info overlay",
    remote_back: "Back / Escape: Settings menu",
    remote_hint_banner: "Press OK or touch screen for controls",

    // Ambiances / Themes
    theme_title: "Mood & Theme",
    theme_memorial: "Memorial & Tribute",
    theme_memorial_desc: "Solemn atmosphere, warm golden candle glow, and touching quotes.",
    theme_celebration: "Family Memories & Celebrations",
    theme_celebration_desc: "Vibrant warm colors and lively transitions for milestones.",
    theme_art: "Art Frame & Landscapes",
    theme_art_desc: "Museum art gallery feel, soft matte borders, and zen scenery.",
    theme_minimal: "Minimal & Pure Fullscreen",
    theme_minimal_desc: "100% full bleed photo with no overlays.",

    // Slide Settings
    settings_title: "Slideshow Settings",
    setting_duration: "Display Duration",
    setting_duration_5s: "Fast (5 seconds)",
    setting_duration_8s: "Balanced (8 seconds)",
    setting_duration_12s: "Cinematic (12 seconds)",
    setting_duration_20s: "Contemplative (20 seconds)",
    setting_duration_30s: "Slow TV Frame (30 seconds)",

    setting_effect: "Motion Effect",
    setting_effect_kenburns: "Ken Burns Effect (Slow Zoom & Pan)",
    setting_effect_crossfade: "Smooth Crossfade",
    setting_effect_zoom: "Continuous Slow Zoom",
    setting_effect_static: "Static (Clean Transition)",

    setting_bg: "Background Style (Non-16:9)",
    setting_bg_blur: "Extended Ambient Blur (TV Recommended)",
    setting_bg_black: "Deep Cinema Black",
    setting_bg_white: "Art Gallery Passe-partout White",

    setting_show_quotes: "Display quotes & captions",
    setting_show_clock: "Display clock & date",
    setting_shuffle: "Shuffle photo order",
    setting_ambient_sound: "Calming ambient soundscapes",
    setting_dim_night: "Night dimming mode",

    // Photo Management
    photos_title: "Photo Management",
    photos_library_title: "My Custom Photos",
    photos_drop_hint: "Drag & drop photos here or click to browse files",
    photos_count: "photos in playlist",
    photo_caption_placeholder: "Custom caption / Date / Tribute note...",
    empty_state_title: "Your Personal Photo Frame",
    empty_state_desc: "No photos added yet. Add your favorite family, memorial, or vacation photos to start your personalized slideshow.",
    no_photos_yet: "No custom photos imported yet.",

    // Start.io Ads
    ads_section_title: "Ad Monetization (Start.io)",
    ads_app_id_label: "Start.io App ID:",
    ads_app_id_placeholder: "e.g. 210307679",
    ads_mode_label: "Ad Display Mode:",
    ads_mode_paused_only: "Discrete (Paused state & menu only)",
    ads_mode_demo: "Demo Test Banner",
    ads_mode_disabled: "Disabled (Ad-free)",
    ads_note: "In accordance with respectful guidelines, ads are never displayed during active memorial playback to maintain the solemnity of the moment.",
    ads_compliance_badge: "app-ads.txt & Google Play Policy Compliant",

    // Language
    lang_label: "Language / Langue:",
    lang_fr: "Français",
    lang_en: "English",

    // Ambient Quotes
    quotes: [
      { text: "Memory is the diary that we all carry about with us.", author: "Oscar Wilde" },
      { text: "Those we love never truly leave us. There are things that death cannot touch.", author: "Jack Thorne" },
      { text: "To live in hearts we leave behind is not to die.", author: "Thomas Campbell" },
      { text: "What we once enjoyed and deeply loved we can never lose.", author: "Helen Keller" },
      { text: "There are special people in our lives who never leave us, even after they are gone.", author: "Heartfelt remembrance" },
      { text: "The song is ended, but the melody lingers on.", author: "Irving Berlin" }
    ],

    // Default Demo Photo Captions
    demo_candle_title: "Glow of Serenity",
    demo_candle_subtitle: "In loving remembrance",
    demo_lake_title: "Peaceful Reflections",
    demo_lake_subtitle: "The stillness of nature",
    demo_path_title: "Golden Autumn Path",
    demo_path_subtitle: "Every step is a cherished memory",
    demo_ocean_title: "Infinite Horizon",
    demo_ocean_subtitle: "Beyond the sunset"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = this.detectLanguage();
  }

  detectLanguage() {
    // 1. Check saved preference
    const saved = localStorage.getItem(I18N_STORAGE_KEY);
    if (saved && (saved === 'fr' || saved === 'en')) {
      return saved;
    }
    // 2. Check browser / device system language
    const sysLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (sysLang.startsWith('fr')) {
      return 'fr';
    }
    // 3. Default to English
    return 'en';
  }

  setLanguage(lang) {
    if (lang !== 'fr' && lang !== 'en') return;
    this.currentLang = lang;
    localStorage.setItem(I18N_STORAGE_KEY, lang);
    this.applyTranslations();
  }

  t(key) {
    const dict = translations[this.currentLang] || translations.en;
    return dict[key] !== undefined ? dict[key] : (translations.en[key] || key);
  }

  getQuotes() {
    const dict = translations[this.currentLang] || translations.en;
    return dict.quotes || translations.en.quotes;
  }

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (text) {
        if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
          el.setAttribute('placeholder', text);
        } else {
          el.textContent = text;
        }
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      if (text) {
        el.setAttribute('placeholder', text);
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const text = this.t(key);
      if (text) {
        el.setAttribute('title', text);
      }
    });

    // Update document title and html lang
    document.documentElement.lang = this.currentLang;
    document.title = `${this.t('app_title')} — ${this.t('app_subtitle')}`;

    // Update select element if present
    const selector = document.getElementById('lang-select');
    if (selector) {
      selector.value = this.currentLang;
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
  }
}

window.i18n = new I18nManager();
