/**
 * Memory Slideshow & Dynamic TV Frame
 * Main Application Logic & TV Remote Engine
 * Compatible with Android TV, Fire TV, Tablet WebViews and GitHub Pages.
 */

// ============================================================================
// Start.io Configuration (Editable App ID & Publisher Settings)
// ============================================================================
const STARTIO_CONFIG = {
  appId: localStorage.getItem('startio_app_id') || "210307679",
  displayMode: localStorage.getItem('startio_display_mode') || 'paused_only',
  isSdkLoaded: false
};

// ============================================================================
// Default Photo Galleries (Purged - user manages their own photos)
// ============================================================================
const DEFAULT_GALLERIES = {
  custom: []
};

// ============================================================================
// IndexedDB Storage for Uploaded Local Songs
// ============================================================================
class SongStorage {
  constructor() {
    this.dbName = 'MemorySlideshowAudioDB';
    this.storeName = 'songs';
  }

  open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll() {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("IndexedDB error:", e);
      return [];
    }
  }

  async add(file) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const songRecord = {
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        name: file.name.replace(/\.[^/.]+$/, ""),
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: file.type,
        blob: file,
        dateAdded: new Date().toLocaleDateString()
      };
      const req = store.put(songRecord);
      req.onsuccess = () => resolve(songRecord);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clearAll() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

// ============================================================================
// Ambient Sound Synthesizer (Pure Web Audio API - 100% Offline & Calming)
// ============================================================================
class AmbientSoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.volume = 0.7;
    this.scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol / 100));
  }

  playGentleTone(freq, duration = 3.5) {
    if (!this.ctx || this.volume <= 0) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const targetGain = 0.08 * this.volume;
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(targetGain, this.ctx.currentTime + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio node error:", e);
    }
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    const loop = () => {
      if (!this.isPlaying) return;
      const note = this.scale[Math.floor(Math.random() * this.scale.length)];
      this.playGentleTone(note, 4.0);
      if (Math.random() > 0.5) {
        setTimeout(() => {
          if (!this.isPlaying) return;
          const harmony = this.scale[(Math.floor(Math.random() * this.scale.length) + 2) % this.scale.length];
          this.playGentleTone(harmony * 0.5, 5.0);
        }, 300);
      }
      this.intervalId = setTimeout(loop, 3800 + Math.random() * 2500);
    };
    loop();
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }
}

// ============================================================================
// Unified Music Manager (Ambient Synth, Local Audio, Web Audio Stream)
// ============================================================================
class UnifiedMusicManager {
  constructor() {
    this.storage = new SongStorage();
    this.ambientEngine = new AmbientSoundEngine();
    this.audioElement = document.getElementById('slideshow-audio-player');
    this.streamElement = document.getElementById('slideshow-stream-player');
    
    this.source = localStorage.getItem('music_source') || 'ambient'; // 'ambient' | 'local' | 'stream' | 'none'
    this.volume = parseInt(localStorage.getItem('music_volume') || '70', 10);
    this.isMuted = localStorage.getItem('music_muted') === 'true';
    this.streamUrl = localStorage.getItem('music_stream_url') || 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128';

    this.localTracks = [];
    this.currentTrackIndex = 0;
    this.isStreamPlaying = false;

    this.initAudioElements();
    this.loadLocalTracks();
    this.bindUI();
  }

  initAudioElements() {
    if (this.audioElement) {
      this.audioElement.volume = this.volume / 100;
      this.audioElement.addEventListener('ended', () => {
        this.playNextLocalTrack();
      });
      this.audioElement.addEventListener('error', (e) => {
        console.warn("Audio playback error:", e);
      });
    }

    if (this.streamElement) {
      this.streamElement.volume = this.volume / 100;
      this.streamElement.addEventListener('playing', () => {
        this.isStreamPlaying = true;
        this.updateStreamStatusUI('playing', window.i18n.t('stream_status_playing'));
      });
      this.streamElement.addEventListener('pause', () => {
        this.isStreamPlaying = false;
        if (this.source === 'stream') {
          this.updateStreamStatusUI('ready', window.i18n.t('stream_status_ready'));
        }
      });
      this.streamElement.addEventListener('error', () => {
        this.isStreamPlaying = false;
        this.updateStreamStatusUI('error', window.i18n.t('stream_status_error'));
      });
    }
  }

  async loadLocalTracks() {
    this.localTracks = await this.storage.getAll();
    this.renderLocalTracksUI();
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(100, vol));
    localStorage.setItem('music_volume', this.volume);

    const gain = this.isMuted ? 0 : this.volume / 100;
    if (this.audioElement) {
      this.audioElement.volume = gain;
    }
    if (this.streamElement) {
      this.streamElement.volume = gain;
    }
    this.ambientEngine.setVolume(this.isMuted ? 0 : this.volume);

    const slider = document.getElementById('music-volume-slider');
    const label = document.getElementById('music-volume-label');
    if (slider) slider.value = this.volume;
    if (label) label.textContent = `${this.volume}%`;
  }

  setSource(source) {
    this.stopAll();
    this.source = source;
    localStorage.setItem('music_source', source);

    // Update tab pills
    document.querySelectorAll('.song-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === source);
    });
    document.querySelectorAll('.song-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `song-tab-${source}`);
    });

    if (window.app && window.app.isPlaying && !this.isMuted) {
      this.play();
    }
  }

  play() {
    if (this.isMuted || this.source === 'none') return;

    if (this.source === 'ambient') {
      this.ambientEngine.start();
    } else if (this.source === 'local') {
      if (this.localTracks.length > 0) {
        this.playLocalTrack(this.currentTrackIndex);
      }
    } else if (this.source === 'stream') {
      if (this.streamElement && this.streamUrl) {
        if (!this.streamElement.src || this.streamElement.src !== this.streamUrl) {
          this.streamElement.src = this.streamUrl;
        }
        this.streamElement.play().catch(err => {
          console.warn("Stream playback blocked:", err);
          this.updateStreamStatusUI('error', window.i18n.t('stream_status_error'));
        });
      }
    }
  }

  pause() {
    this.ambientEngine.stop();
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.streamElement) {
      this.streamElement.pause();
    }
  }

  stopAll() {
    this.ambientEngine.stop();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (this.streamElement) {
      this.streamElement.pause();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('music_muted', this.isMuted);

    if (this.isMuted) {
      this.pause();
    } else {
      this.play();
    }

    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
      btnSound.classList.toggle('active', !this.isMuted && this.source !== 'none');
      btnSound.setAttribute('title', !this.isMuted ? window.i18n.t('btn_sound_on') : window.i18n.t('btn_sound_off'));
    }
    return !this.isMuted;
  }

  // Local tracks
  playLocalTrack(index) {
    if (!this.localTracks || this.localTracks.length === 0) return;
    if (index >= this.localTracks.length) index = 0;
    if (index < 0) index = this.localTracks.length - 1;
    this.currentTrackIndex = index;

    const track = this.localTracks[index];
    if (this.audioElement && track.blob) {
      try {
        if (this.currentObjectUrl) {
          URL.revokeObjectURL(this.currentObjectUrl);
        }
        this.currentObjectUrl = URL.createObjectURL(track.blob);
        this.audioElement.src = this.currentObjectUrl;
        this.audioElement.volume = this.volume / 100;
        this.audioElement.play().catch(err => {
          console.warn("Autoplay blocked or audio format error:", err);
        });
        this.renderLocalTracksUI();
      } catch (e) {
        console.warn("Error playing track blob:", e);
      }
    }
  }

  playNextLocalTrack() {
    if (this.localTracks.length > 1) {
      this.playLocalTrack(this.currentTrackIndex + 1);
    } else if (this.localTracks.length === 1) {
      if (this.audioElement) {
        this.audioElement.currentTime = 0;
        this.audioElement.play().catch(() => {});
      }
    }
  }

  async addLocalAudioFiles(files) {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|aac|flac|m4a)$/i)) {
        await this.storage.add(file);
      }
    }
    await this.loadLocalTracks();
    this.setSource('local');
    if (window.app) {
      const isFr = (window.i18n && window.i18n.currentLang === 'fr');
      const msg = isFr ? `${files.length} musique(s) ajoutée(s)` : `${files.length} music track(s) added`;
      window.app.showTvHint(msg);
    }
  }

  async deleteLocalTrack(id) {
    await this.storage.delete(id);
    await this.loadLocalTracks();
  }

  async clearAllLocalTracks() {
    if (confirm(window.i18n.t('confirm_clear_songs'))) {
      this.stopAll();
      await this.storage.clearAll();
      await this.loadLocalTracks();
      this.setSource('ambient');
    }
  }

  renderLocalTracksUI() {
    const listEl = document.getElementById('audio-track-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (this.localTracks.length === 0) {
      listEl.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:14px 0;">${window.i18n.t('no_local_songs')}</p>`;
      return;
    }

    this.localTracks.forEach((track, idx) => {
      const isCurrent = this.source === 'local' && this.currentTrackIndex === idx;
      const item = document.createElement('div');
      item.className = `audio-track-item ${isCurrent ? 'playing' : ''}`;
      item.innerHTML = `
        <div class="audio-track-info">
          <div class="audio-track-icon">${isCurrent ? '▶' : '♫'}</div>
          <div>
            <div class="audio-track-name">${track.name}</div>
            <div class="audio-track-meta">${track.size || ''} ${isCurrent ? '• ' + window.i18n.t('song_track_playing') : ''}</div>
          </div>
        </div>
        <div class="audio-track-actions">
          <button class="tv-btn btn-track-play" style="padding:4px 10px;font-size:0.8rem;">${isCurrent ? 'Rejouer' : 'Écouter'}</button>
          <button class="tv-btn btn-track-delete" style="padding:4px 8px;font-size:0.8rem;color:#ef4444;">✕</button>
        </div>
      `;

      item.querySelector('.btn-track-play').addEventListener('click', () => {
        this.setSource('local');
        this.playLocalTrack(idx);
      });

      item.querySelector('.btn-track-delete').addEventListener('click', () => {
        this.deleteLocalTrack(track.id);
      });

      listEl.appendChild(item);
    });
  }

  // Web Audio Stream Link
  loadStream(url) {
    if (!url || !url.startsWith('http')) {
      this.updateStreamStatusUI('error', window.i18n.t('stream_status_error'));
      return false;
    }

    this.streamUrl = url.trim();
    localStorage.setItem('music_stream_url', this.streamUrl);

    if (this.streamElement) {
      this.streamElement.src = this.streamUrl;
      this.setSource('stream');
      this.streamElement.play().then(() => {
        this.updateStreamStatusUI('playing', window.i18n.t('stream_status_playing'));
      }).catch(() => {
        this.updateStreamStatusUI('ready', window.i18n.t('stream_status_ready'));
      });
    }

    if (window.app) window.app.showTvHint("Flux audio web connecté");
    return true;
  }

  testStream() {
    if (!this.streamElement) return;

    if (this.isStreamPlaying) {
      this.streamElement.pause();
    } else {
      if (!this.streamElement.src && this.streamUrl) {
        this.streamElement.src = this.streamUrl;
      }
      this.setSource('stream');
      this.streamElement.play().catch(err => {
        this.updateStreamStatusUI('error', window.i18n.t('stream_status_error'));
      });
    }
  }

  updateStreamStatusUI(status, text) {
    const dot = document.getElementById('stream-status-dot');
    const badgeText = document.getElementById('stream-status-text');
    const badge = document.getElementById('stream-status-badge');

    if (badge) {
      badge.className = `stream-status-badge ${status}`;
    }
    if (dot) {
      if (status === 'ready') dot.style.background = '#4ade80';
      else if (status === 'playing') dot.style.background = '#fbbf24';
      else if (status === 'error') dot.style.background = '#f87171';
      else dot.style.background = '#94a3b8';
    }
    if (badgeText) {
      badgeText.textContent = text;
    }
  }

  bindUI() {
    // Tabs switching
    document.querySelectorAll('.song-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setSource(btn.dataset.tab);
      });
    });

    // Volume slider
    const slider = document.getElementById('music-volume-slider');
    if (slider) {
      slider.value = this.volume;
      slider.addEventListener('input', (e) => {
        this.setVolume(parseInt(e.target.value, 10));
      });
    }

    // Local Dropzone & File Input
    const dropzone = document.getElementById('audio-dropzone');
    const fileInput = document.getElementById('audio-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        this.addLocalAudioFiles(e.dataTransfer.files);
      });

      fileInput.addEventListener('change', (e) => {
        this.addLocalAudioFiles(e.target.files);
      });
    }

    const btnClearSongs = document.getElementById('btn-clear-songs');
    if (btnClearSongs) {
      btnClearSongs.addEventListener('click', () => this.clearAllLocalTracks());
    }

    // Web Audio Stream Inputs & Buttons
    const streamInput = document.getElementById('stream-url-input');
    const btnLoadStream = document.getElementById('btn-load-stream');
    const btnTestStream = document.getElementById('btn-test-stream');

    if (streamInput && this.streamUrl) {
      streamInput.value = this.streamUrl;
      this.updateStreamStatusUI('ready', window.i18n.t('stream_status_ready'));
    }

    if (btnLoadStream && streamInput) {
      btnLoadStream.addEventListener('click', () => {
        this.loadStream(streamInput.value);
      });
    }

    if (btnTestStream) {
      btnTestStream.addEventListener('click', () => {
        this.testStream();
      });
    }

    // Suggested stream preset buttons
    document.querySelectorAll('.btn-stream-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (streamInput) streamInput.value = url;
        this.loadStream(url);
      });
    });

    // Ambient activate button
    const btnActivateAmbient = document.getElementById('btn-activate-ambient');
    if (btnActivateAmbient) {
      btnActivateAmbient.addEventListener('click', () => {
        this.setSource('ambient');
        if (window.app) window.app.showTvHint("Ambiance méditative activée");
      });
    }

    // Initialize UI active tab
    this.setSource(this.source);
    this.setVolume(this.volume);
  }
}

// ============================================================================
// Slideshow Engine
// ============================================================================
class SlideshowApp {
  constructor() {
    this.musicManager = new UnifiedMusicManager();
    
    // Preferences & State
    this.settings = {
      duration: parseInt(localStorage.getItem('slide_duration') || '12000', 10),
      effect: localStorage.getItem('slide_effect') || 'kenburns',
      bgStyle: localStorage.getItem('slide_bg') || 'blur',
      theme: localStorage.getItem('slide_theme') || 'memorial',
      showQuotes: localStorage.getItem('slide_show_quotes') !== 'false',
      showClock: localStorage.getItem('slide_show_clock') !== 'false',
      shuffle: localStorage.getItem('slide_shuffle') === 'true'
    };

    this.currentIndex = 0;
    this.activeLayer = 'a';
    this.isPlaying = true;
    this.timer = null;
    this.uiTimeout = null;
    this.customPhotos = this.loadCustomPhotos();
    this.activeGalleryKey = 'custom';

    this.kenBurnsAnimations = [
      'kenburns-zoom-in',
      'kenburns-zoom-out',
      'kenburns-pan-left',
      'kenburns-pan-right',
      'kenburns-pan-up'
    ];

    this.initDOMElements();
    this.bindEvents();
    this.initClock();
    this.applySettingsToUI();
    this.updatePlaylist();

    this.showSlide(0, false);
    this.startAutoPlay();
    this.resetUITimeout();

    this.initStartIo();
  }

  initDOMElements() {
    this.layerA = document.getElementById('slide-layer-a');
    this.layerB = document.getElementById('slide-layer-b');
    this.ambientBg = document.getElementById('ambient-blur-layer');
    this.slideshowContainer = document.getElementById('slideshow-container');
    
    this.captionTitle = document.getElementById('caption-title');
    this.captionSubtitle = document.getElementById('caption-subtitle');
    this.memorialQuoteBox = document.getElementById('memorial-quote-box');
    this.quoteText = document.getElementById('quote-text');
    this.quoteAuthor = document.getElementById('quote-author');
    this.memorialCandle = document.getElementById('memorial-candle');
    this.clockWidget = document.getElementById('clock-widget');

    this.progressBar = document.getElementById('slideshow-progress-bar');
    this.tvHintToast = document.getElementById('tv-hint-toast');

    // Evanescent UI Elements
    this.controlsBar = document.getElementById('ui-controls-bar');
    this.topBar = document.getElementById('ui-top-bar');
    this.bottomDock = document.getElementById('ui-bottom-dock');

    // Buttons
    this.btnPlayPause = document.getElementById('btn-play-pause');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.btnSettings = document.getElementById('btn-settings');
    this.btnPhotos = document.getElementById('btn-photos');
    this.btnManageSongs = document.getElementById('btn-manage-songs');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.btnSound = document.getElementById('btn-sound');
    this.btnGuide = document.getElementById('btn-guide');

    // Modals
    this.settingsModal = document.getElementById('settings-modal');
    this.photosModal = document.getElementById('photos-modal');
    this.songsModal = document.getElementById('songs-modal');
    this.guideModal = document.getElementById('guide-modal');

    // Ads
    this.startIoBanner = document.getElementById('startio-banner');
    
    // Empty state container & button
    this.emptyState = document.getElementById('slideshow-empty-state');
    this.btnEmptyAddPhotos = document.getElementById('btn-empty-add-photos');
    this.btnAddMusic = document.getElementById('btn-add-music');
    this.btnEmptyAddMusic = document.getElementById('btn-empty-add-music');
  }

  loadCustomPhotos() {
    try {
      const saved = localStorage.getItem('memory_custom_photos');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveCustomPhotos() {
    try {
      localStorage.setItem('memory_custom_photos', JSON.stringify(this.customPhotos));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }

  updatePlaylist() {
    this.playlist = [...this.customPhotos];

    if (this.settings.shuffle && this.playlist.length > 1) {
      this.playlist = this.playlist.sort(() => Math.random() - 0.5);
    }

    const countEl = document.getElementById('photos-count-label');
    if (countEl) {
      countEl.textContent = `${this.playlist.length} ${window.i18n.t('photos_count')}`;
    }

    // Toggle empty state overlay if user hasn't added photos
    if (this.emptyState) {
      if (this.playlist.length === 0) {
        this.emptyState.style.display = 'flex';
        if (this.ambientBg) this.ambientBg.style.backgroundImage = 'none';
        if (this.layerA) {
          const imgA = this.layerA.querySelector('img');
          if (imgA) imgA.src = '';
          this.layerA.classList.remove('active');
        }
        if (this.layerB) {
          const imgB = this.layerB.querySelector('img');
          if (imgB) imgB.src = '';
          this.layerB.classList.remove('active');
        }
      } else {
        this.emptyState.style.display = 'none';
      }
    }
  }

  showSlide(index, animate = true) {
    if (!this.playlist || this.playlist.length === 0) {
      if (this.emptyState) this.emptyState.style.display = 'flex';
      return;
    }
    if (this.emptyState) this.emptyState.style.display = 'none';

    if (index >= this.playlist.length) index = 0;
    if (index < 0) index = this.playlist.length - 1;
    this.currentIndex = index;

    const slide = this.playlist[this.currentIndex];
    const incomingLayer = this.activeLayer === 'a' ? this.layerB : this.layerA;
    const outgoingLayer = this.activeLayer === 'a' ? this.layerA : this.layerB;

    const img = incomingLayer.querySelector('img');

    this.kenBurnsAnimations.forEach(cls => incomingLayer.classList.remove(cls));

    if (this.settings.effect === 'kenburns') {
      const randomAnimation = this.kenBurnsAnimations[Math.floor(Math.random() * this.kenBurnsAnimations.length)];
      incomingLayer.classList.add(randomAnimation);
    } else if (this.settings.effect === 'zoom') {
      incomingLayer.classList.add('kenburns-zoom-in');
    }

    incomingLayer.style.setProperty('--slide-duration', `${this.settings.duration}ms`);

    img.onload = () => {
      if (this.ambientBg && this.settings.bgStyle === 'blur') {
        this.ambientBg.style.backgroundImage = `url("${slide.url}")`;
      }

      incomingLayer.classList.add('active');
      outgoingLayer.classList.remove('active');
      this.activeLayer = this.activeLayer === 'a' ? 'b' : 'a';

      this.updateSlideText(slide);
    };

    img.src = slide.url;
    this.restartProgressBar();
  }

  updateSlideText(slide) {
    if (!this.settings.showQuotes && !this.settings.showClock) {
      this.captionTitle.style.display = 'none';
      this.captionSubtitle.style.display = 'none';
      this.memorialQuoteBox.style.display = 'none';
      return;
    }

    let title = slide.title || (slide.titleKey ? window.i18n.t(slide.titleKey) : '');
    let subtitle = slide.subtitle || (slide.subtitleKey ? window.i18n.t(slide.subtitleKey) : slide.date || '');

    if (this.settings.theme === 'minimal') {
      this.captionTitle.style.display = 'none';
      this.captionSubtitle.style.display = 'none';
      this.memorialQuoteBox.style.display = 'none';
      return;
    }

    this.captionTitle.style.display = title ? 'block' : 'none';
    this.captionTitle.textContent = title;

    this.captionSubtitle.style.display = subtitle ? 'block' : 'none';
    this.captionSubtitle.textContent = subtitle;

    if (this.settings.theme === 'memorial' && this.settings.showQuotes) {
      this.memorialQuoteBox.style.display = 'flex';
      const quotes = window.i18n.getQuotes();
      const quote = quotes[this.currentIndex % quotes.length];
      this.quoteText.textContent = `« ${quote.text} »`;
      this.quoteAuthor.textContent = quote.author;
    } else {
      this.memorialQuoteBox.style.display = 'none';
    }
  }

  restartProgressBar() {
    if (!this.progressBar) return;
    this.progressBar.style.transition = 'none';
    this.progressBar.style.width = '0%';
    setTimeout(() => {
      if (this.isPlaying) {
        this.progressBar.style.transition = `width ${this.settings.duration}ms linear`;
        this.progressBar.style.width = '100%';
      }
    }, 50);
  }

  nextSlide() {
    this.showSlide(this.currentIndex + 1);
    this.resetAutoPlay();
  }

  prevSlide() {
    this.showSlide(this.currentIndex - 1);
    this.resetAutoPlay();
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.progressBar) {
      const computedWidth = window.getComputedStyle(this.progressBar).width;
      this.progressBar.style.transition = 'none';
      this.progressBar.style.width = computedWidth;
    }
    this.updatePlayPauseIcon(true);
    this.showUI();
    this.showTvHint(window.i18n.t('btn_pause'));
    this.showStartIoBanner(true);
    this.musicManager.pause();
  }

  resume() {
    this.isPlaying = true;
    this.updatePlayPauseIcon(false);
    this.startAutoPlay();
    this.restartProgressBar();
    this.resetUITimeout();
    this.showTvHint(window.i18n.t('btn_resume'));
    this.showStartIoBanner(false);
    this.musicManager.play();
  }

  updatePlayPauseIcon(isPaused) {
    if (!this.btnPlayPause) return;
    const path = this.btnPlayPause.querySelector('path');
    if (!path) return;
    if (isPaused) {
      path.setAttribute('d', 'M8 5v14l11-7z');
    } else {
      path.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
    }
  }

  startAutoPlay() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.isPlaying) {
        this.nextSlide();
      }
    }, this.settings.duration);
  }

  resetAutoPlay() {
    if (this.isPlaying) {
      this.startAutoPlay();
    }
  }

  showUI() {
    if (this.controlsBar) this.controlsBar.classList.add('visible');
    if (this.topBar) this.topBar.classList.add('visible');
    if (this.bottomDock) this.bottomDock.classList.add('visible');
    document.body.style.cursor = 'default';
  }

  hideUI() {
    if (!this.isPlaying) return;
    if (document.querySelector('.modal-backdrop.open')) return;

    if (this.controlsBar) this.controlsBar.classList.remove('visible');
    if (this.topBar) this.topBar.classList.remove('visible');
    if (this.bottomDock) this.bottomDock.classList.remove('visible');
    document.body.style.cursor = 'none';
  }

  resetUITimeout() {
    this.showUI();
    if (this.uiTimeout) clearTimeout(this.uiTimeout);
    this.uiTimeout = setTimeout(() => {
      this.hideUI();
    }, 4500);
  }

  showTvHint(msg) {
    if (!this.tvHintToast) return;
    this.tvHintToast.textContent = msg;
    this.tvHintToast.classList.add('visible');
    setTimeout(() => {
      this.tvHintToast.classList.remove('visible');
    }, 2400);
  }

  initClock() {
    const update = () => {
      const now = new Date();
      const timeEl = document.getElementById('clock-time');
      const dateEl = document.getElementById('clock-date');

      if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString(window.i18n.currentLang, {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
      }
    };
    update();
    setInterval(update, 1000);
  }

  initStartIo() {
    const appId = STARTIO_CONFIG.appId;
    console.log(`[Start.io] Initialized with App ID: ${appId}, Mode: ${STARTIO_CONFIG.displayMode}`);

    const idInput = document.getElementById('startio-app-id-input');
    if (idInput) idInput.value = appId;

    const modeSelect = document.getElementById('startio-mode-select');
    if (modeSelect) modeSelect.value = STARTIO_CONFIG.displayMode;
  }

  showStartIoBanner(show) {
    if (!this.startIoBanner) return;
    if (STARTIO_CONFIG.displayMode === 'disabled') {
      this.startIoBanner.classList.remove('active');
      return;
    }

    if (show && (STARTIO_CONFIG.displayMode === 'paused_only' || STARTIO_CONFIG.displayMode === 'demo')) {
      this.startIoBanner.classList.add('active');
    } else {
      this.startIoBanner.classList.remove('active');
    }
  }

  bindEvents() {
    ['mousemove', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
      window.addEventListener(evt, () => this.resetUITimeout(), { passive: true });
    });

    if (this.slideshowContainer) {
      this.slideshowContainer.addEventListener('click', (e) => {
        if (e.target === this.slideshowContainer || e.target.tagName === 'IMG' || e.target.classList.contains('ambient-blur-layer')) {
          this.togglePlayPause();
        }
      });
    }

    if (this.btnPlayPause) this.btnPlayPause.addEventListener('click', () => this.togglePlayPause());
    if (this.btnPrev) this.btnPrev.addEventListener('click', () => this.prevSlide());
    if (this.btnNext) this.btnNext.addEventListener('click', () => this.nextSlide());
    
    if (this.btnFullscreen) {
      this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    }

    if (this.btnSound) {
      this.btnSound.addEventListener('click', () => {
        const active = this.musicManager.toggleMute();
        this.showTvHint(active ? window.i18n.t('btn_sound_on') : window.i18n.t('btn_sound_off'));
      });
    }

    if (this.btnSettings) this.btnSettings.addEventListener('click', () => this.openModal(this.settingsModal));
    if (this.btnPhotos) this.btnPhotos.addEventListener('click', () => this.openPhotosModal());
    if (this.btnEmptyAddPhotos) this.btnEmptyAddPhotos.addEventListener('click', () => this.openPhotosModal());
    
    const triggerAddMusic = () => {
      const audioInput = document.getElementById('audio-file-input');
      if (audioInput) {
        audioInput.click();
      }
    };
    if (this.btnAddMusic) this.btnAddMusic.addEventListener('click', triggerAddMusic);
    if (this.btnEmptyAddMusic) this.btnEmptyAddMusic.addEventListener('click', triggerAddMusic);

    if (this.btnManageSongs) this.btnManageSongs.addEventListener('click', () => this.openModal(this.songsModal));
    if (this.btnGuide) this.btnGuide.addEventListener('click', () => this.openModal(this.guideModal));

    document.querySelectorAll('.btn-modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeAllModals();
      });
    });

    window.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
    this.bindSettingsForm();
    this.bindPhotoUpload();

    window.addEventListener('languageChanged', () => {
      this.showSlide(this.currentIndex, false);
      this.initClock();
    });
  }

  handleKeyNavigation(e) {
    const isModalOpen = !!document.querySelector('.modal-backdrop.open');

    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'MediaPlayPause':
        if (!isModalOpen && !['BUTTON', 'SELECT', 'INPUT'].includes(e.target.tagName)) {
          e.preventDefault();
          this.togglePlayPause();
        }
        break;

      case 'ArrowLeft':
      case 'MediaTrackPrevious':
        if (!isModalOpen) {
          e.preventDefault();
          this.prevSlide();
        }
        break;

      case 'ArrowRight':
      case 'MediaTrackNext':
        if (!isModalOpen) {
          e.preventDefault();
          this.nextSlide();
        }
        break;

      case 'ArrowUp':
        if (!isModalOpen) {
          e.preventDefault();
          this.showUI();
        }
        break;

      case 'Escape':
      case 'Back':
      case 'BrowserBack':
        if (isModalOpen) {
          e.preventDefault();
          this.closeAllModals();
        } else {
          e.preventDefault();
          this.openModal(this.settingsModal);
        }
        break;
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  openModal(modal) {
    if (!modal) return;
    this.closeAllModals();
    modal.classList.add('open');
    this.pause();
    setTimeout(() => {
      const firstFocusable = modal.querySelector('button, select, input');
      if (firstFocusable) firstFocusable.focus();
    }, 150);
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
    this.resume();
  }

  applySettingsToUI() {
    const durSelect = document.getElementById('setting-duration-select');
    if (durSelect) durSelect.value = this.settings.duration;

    const effSelect = document.getElementById('setting-effect-select');
    if (effSelect) effSelect.value = this.settings.effect;

    const bgSelect = document.getElementById('setting-bg-select');
    if (bgSelect) bgSelect.value = this.settings.bgStyle;
    this.applyBgStyle(this.settings.bgStyle);

    const quoteToggle = document.getElementById('toggle-quotes');
    if (quoteToggle) quoteToggle.checked = this.settings.showQuotes;

    const clockToggle = document.getElementById('toggle-clock');
    if (clockToggle) {
      clockToggle.checked = this.settings.showClock;
      this.clockWidget.style.display = this.settings.showClock ? 'flex' : 'none';
    }

    const shuffleToggle = document.getElementById('toggle-shuffle');
    if (shuffleToggle) shuffleToggle.checked = this.settings.shuffle;

    this.applyTheme(this.settings.theme);

    if (this.btnSound) {
      this.btnSound.classList.toggle('active', !this.musicManager.isMuted);
    }
  }

  applyBgStyle(style) {
    this.slideshowContainer.classList.remove('bg-mode-black', 'bg-mode-white');
    if (style === 'black') {
      this.slideshowContainer.classList.add('bg-mode-black');
    } else if (style === 'white') {
      this.slideshowContainer.classList.add('bg-mode-white');
    }
  }

  applyTheme(theme) {
    this.settings.theme = theme;
    localStorage.setItem('slide_theme', theme);

    document.querySelectorAll('.theme-tile').forEach(tile => {
      tile.classList.toggle('selected', tile.dataset.theme === theme);
    });

    if (this.memorialCandle) {
      this.memorialCandle.style.display = theme === 'memorial' ? 'flex' : 'none';
    }

    if (this.playlist && this.playlist[this.currentIndex]) {
      this.updateSlideText(this.playlist[this.currentIndex]);
    }
  }

  bindSettingsForm() {
    const durSelect = document.getElementById('setting-duration-select');
    if (durSelect) {
      durSelect.addEventListener('change', (e) => {
        this.settings.duration = parseInt(e.target.value, 10);
        localStorage.setItem('slide_duration', this.settings.duration);
        this.restartProgressBar();
      });
    }

    const effSelect = document.getElementById('setting-effect-select');
    if (effSelect) {
      effSelect.addEventListener('change', (e) => {
        this.settings.effect = e.target.value;
        localStorage.setItem('slide_effect', this.settings.effect);
        this.showSlide(this.currentIndex, false);
      });
    }

    const bgSelect = document.getElementById('setting-bg-select');
    if (bgSelect) {
      bgSelect.addEventListener('change', (e) => {
        this.settings.bgStyle = e.target.value;
        localStorage.setItem('slide_bg', this.settings.bgStyle);
        this.applyBgStyle(this.settings.bgStyle);
      });
    }

    const quoteToggle = document.getElementById('toggle-quotes');
    if (quoteToggle) {
      quoteToggle.addEventListener('change', (e) => {
        this.settings.showQuotes = e.target.checked;
        localStorage.setItem('slide_show_quotes', this.settings.showQuotes);
        this.updateSlideText(this.playlist[this.currentIndex]);
      });
    }

    const clockToggle = document.getElementById('toggle-clock');
    if (clockToggle) {
      clockToggle.addEventListener('change', (e) => {
        this.settings.showClock = e.target.checked;
        localStorage.setItem('slide_show_clock', this.settings.showClock);
        this.clockWidget.style.display = this.settings.showClock ? 'flex' : 'none';
      });
    }

    const shuffleToggle = document.getElementById('toggle-shuffle');
    if (shuffleToggle) {
      shuffleToggle.addEventListener('change', (e) => {
        this.settings.shuffle = e.target.checked;
        localStorage.setItem('slide_shuffle', this.settings.shuffle);
        this.updatePlaylist();
      });
    }

    document.querySelectorAll('.theme-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        this.applyTheme(tile.dataset.theme);
      });
    });

    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        window.i18n.setLanguage(e.target.value);
      });
    }

    const idInput = document.getElementById('startio-app-id-input');
    if (idInput) {
      idInput.addEventListener('change', (e) => {
        STARTIO_CONFIG.appId = e.target.value.trim() || '210307679';
        localStorage.setItem('startio_app_id', STARTIO_CONFIG.appId);
        this.showTvHint("Start.io App ID enregistré");
      });
    }

    const modeSelect = document.getElementById('startio-mode-select');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        STARTIO_CONFIG.displayMode = e.target.value;
        localStorage.setItem('startio_display_mode', STARTIO_CONFIG.displayMode);
        this.showTvHint(`Mode publicitaire: ${STARTIO_CONFIG.displayMode}`);
      });
    }
  }

  openPhotosModal() {
    this.renderCustomPhotosGrid();
    this.openModal(this.photosModal);
  }

  renderCustomPhotosGrid() {
    const grid = document.getElementById('custom-photos-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (this.customPhotos.length === 0) {
      grid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 16px 0;">${window.i18n.t('no_photos_yet')}</p>`;
      return;
    }

    this.customPhotos.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'photo-card';
      card.innerHTML = `
        <img src="${item.url}" alt="User Photo" />
        <button class="photo-card-delete" title="Supprimer">×</button>
      `;
      card.querySelector('.photo-card-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this.customPhotos.splice(idx, 1);
        this.saveCustomPhotos();
        this.renderCustomPhotosGrid();
        this.updatePlaylist();
        this.showSlide(0, false);
      });
      grid.appendChild(card);
    });
  }

  bindPhotoUpload() {
    const dropzone = document.getElementById('photo-dropzone');
    const fileInput = document.getElementById('photo-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        this.handleImageFiles(files);
      });

      fileInput.addEventListener('change', (e) => {
        this.handleImageFiles(e.target.files);
      });
    }

    const btnClear = document.getElementById('btn-clear-photos');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm("Effacer toutes vos photos personnalisées ?")) {
          this.customPhotos = [];
          this.saveCustomPhotos();
          this.renderCustomPhotosGrid();
          this.updatePlaylist();
          this.showSlide(0, false);
        }
      });
    }
  }

  handleImageFiles(files) {
    if (!files || files.length === 0) return;

    let loadedCount = 0;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.customPhotos.push({
          url: e.target.result,
          title: file.name.replace(/\.[^/.]+$/, ""),
          subtitle: new Date().toLocaleDateString()
        });
        loadedCount++;
        if (loadedCount === files.length) {
          this.saveCustomPhotos();
          this.activeGalleryKey = 'custom';
          localStorage.setItem('active_gallery', 'custom');
          this.renderCustomPhotosGrid();
          this.updatePlaylist();
          this.showSlide(this.playlist.length - 1, false);
          this.showTvHint(`${loadedCount} photos ajoutées`);
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.i18n.applyTranslations();
  window.app = new SlideshowApp();
});
