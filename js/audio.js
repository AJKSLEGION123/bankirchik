// C:\Bankirchik\js\audio.js
// Синтез звуков (Web Audio API) и озвучка реплик хомяка (Web Speech API)

class BankirAudio {
  constructor() {
    this.ctx = null;
    this.speechSynth = typeof window !== "undefined" && window.speechSynthesis ? window.speechSynthesis : null;
    this.currentUtterance = null;
  }

  initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  isSoundEnabled() {
    if (typeof window !== "undefined" && window.bankirState) {
      return window.bankirState.data.child.soundEnabled;
    }
    return true;
  }

  // Звук получения монеты (звонкий чистый перелив)
  playCoin() {
    if (!this.isSoundEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Звук победы / прохождения уровня (мажорный аккорд)
  playWin() {
    if (!this.isSoundEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + i * 0.1;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.45);
    });
  }

  // Звук ошибки / покачивания (мягкий низкий дабл-тон)
  playError() {
    if (!this.isSoundEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Щелчок кнопки (тактильный «поп»)
  playClick() {
    if (!this.isSoundEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Озвучивание реплик хомяка через Web Speech API (ru-RU)
  speak(text) {
    if (!this.isSoundEnabled()) return;
    if (!this.speechSynth) return;

    try {
      this.speechSynth.cancel(); // Сброс предыдущей фразы
      const cleanText = text.replace(/[§★☆💡❤✅❌🪙]/g, "").trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "ru-RU";
      utterance.rate = 1.05; // Детский задорный темп
      utterance.pitch = 1.25; // Высокий милый голос хомяка

      // Подбор подходящего русского голоса
      const voices = this.speechSynth.getVoices();
      const ruVoice = voices.find(v => v.lang.startsWith("ru") && (v.name.includes("Milena") || v.name.includes("Google") || v.name.includes("Yuri")));
      if (ruVoice) {
        utterance.voice = ruVoice;
      }

      this.currentUtterance = utterance;
      this.speechSynth.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  }

  playSuccess() {
    this.playWin();
  }

  speakHamster(text) {
    this.speak(text);
  }

  click() {
    this.playClick();
  }

  error() {
    this.playError();
  }

  success() {
    this.playWin();
  }

  stopSpeech() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
  }
}

if (typeof window !== "undefined") {
  const audioInstance = new BankirAudio();
  window.bankirAudio = audioInstance;
  window.AudioController = audioInstance;
}
