// C:\Bankirchik\js\hamster.js
// Векторный маскот Хомяк-Банкир с красным шарфиком и гардеробом

class HamsterRenderer {
  // Генерация чистого SVG хомяка с надетым аксессуаром
  static renderSVG(equippedItem = null, size = 52, emotion = "happy") {
    // Аксессуары
    let hatSvg = "";
    let glassesSvg = "";
    let bowSvg = "";
    let crownSvg = "";

    if (equippedItem === "hat_banker") {
      hatSvg = `
        <!-- Цилиндр банкира -->
        <g id="hat_banker" transform="translate(0, -15)">
          <ellipse cx="60" cy="32" rx="26" ry="6" fill="#1E1E24" />
          <path d="M42 32 L44 10 L76 10 L78 32 Z" fill="#2B2D42" />
          <ellipse cx="60" cy="10" rx="16" ry="4" fill="#3D405B" />
          <rect x="43" y="24" width="34" height="6" fill="#E63946" />
          <rect x="56" y="23" width="8" height="8" rx="2" fill="#FFC21A" />
        </g>
      `;
    } else if (equippedItem === "gold_crown") {
      crownSvg = `
        <!-- Золотая корона -->
        <g id="gold_crown" transform="translate(0, -12)">
          <path d="M42 30 L40 14 L50 22 L60 10 L70 22 L80 14 L78 30 Z" fill="#FFC21A" stroke="#C29000" stroke-width="1.5" />
          <circle cx="40" cy="14" r="2.5" fill="#E63946" />
          <circle cx="60" cy="10" r="3" fill="#E63946" />
          <circle cx="80" cy="14" r="2.5" fill="#E63946" />
          <circle cx="60" cy="24" r="2" fill="#3FAE5A" />
        </g>
      `;
    }

    if (equippedItem === "smart_glasses") {
      glassesSvg = `
        <!-- Умные очки -->
        <g id="smart_glasses">
          <circle cx="48" cy="48" r="8" fill="none" stroke="#2B2D42" stroke-width="2.5" />
          <circle cx="72" cy="48" r="8" fill="none" stroke="#2B2D42" stroke-width="2.5" />
          <line x1="56" y1="48" x2="64" y2="48" stroke="#2B2D42" stroke-width="2.5" />
          <circle cx="48" cy="48" r="7" fill="#E0F2FE" opacity="0.5" />
          <circle cx="72" cy="48" r="7" fill="#E0F2FE" opacity="0.5" />
          <line x1="40" y1="46" x2="33" y2="43" stroke="#2B2D42" stroke-width="2" />
          <line x1="80" y1="46" x2="87" y2="43" stroke="#2B2D42" stroke-width="2" />
        </g>
      `;
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.12));">
        <!-- Ушки -->
        <ellipse cx="40" cy="30" rx="14" ry="16" fill="#F4A261" />
        <ellipse cx="40" cy="30" rx="9" ry="11" fill="#FFA6B5" />
        <ellipse cx="80" cy="30" rx="14" ry="16" fill="#F4A261" />
        <ellipse cx="80" cy="30" rx="9" ry="11" fill="#FFA6B5" />

        <!-- Пухлое тело -->
        <ellipse cx="60" cy="72" rx="42" ry="36" fill="#E76F51" />

        <!-- Голова -->
        <ellipse cx="60" cy="54" rx="38" ry="30" fill="#F4A261" />

        <!-- Белая мордочка / щёчки -->
        <ellipse cx="46" cy="62" rx="15" ry="11" fill="#FFF1E6" />
        <ellipse cx="74" cy="62" rx="15" ry="11" fill="#FFF1E6" />
        <ellipse cx="60" cy="66" rx="12" ry="10" fill="#FFF1E6" />

        <!-- Румянец на щёчках -->
        <circle cx="42" cy="62" r="5" fill="#FFA6B5" opacity="0.6" />
        <circle cx="78" cy="62" r="5" fill="#FFA6B5" opacity="0.6" />

        <!-- Глаза -->
        <circle cx="48" cy="49" r="4.5" fill="#1E1E24" />
        <circle cx="50" cy="47" r="1.5" fill="#FFFFFF" />
        <circle cx="72" cy="49" r="4.5" fill="#1E1E24" />
        <circle cx="74" cy="47" r="1.5" fill="#FFFFFF" />

        <!-- Носик треугольником -->
        <polygon points="60,59 56,55 64,55" fill="#E63946" />

        <!-- Ротик-улыбка -->
        <path d="M56 61 Q60 66 64 61" stroke="#3B1F0E" stroke-width="2" fill="none" stroke-linecap="round" />

        <!-- Лапки -->
        <ellipse cx="44" cy="88" rx="8" ry="5" fill="#F4A261" />
        <ellipse cx="76" cy="88" rx="8" ry="5" fill="#F4A261" />

        <!-- Красный фирменный шарфик хомяка-банкира -->
        <g id="red_scarf">
          <path d="M30 68 C35 76, 85 76, 90 68 C92 73, 85 80, 60 80 C35 80, 28 73, 30 68 Z" fill="#E63946" stroke="#A61B25" stroke-width="1.5" />
          <path d="M66 76 L72 100 L84 98 L76 75 Z" fill="#E63946" stroke="#A61B25" stroke-width="1.5" />
          <line x1="68" y1="84" x2="78" y2="82" stroke="#FFC21A" stroke-width="2" />
          <line x1="70" y1="92" x2="81" y2="90" stroke="#FFC21A" stroke-width="2" />
        </g>

        <!-- Слой аксессуаров -->
        ${hatSvg}
        ${crownSvg}
        ${glassesSvg}
      </svg>
    `;
  }

  // Рендер хомяка с облачком реплики для всех мини-игр
  static renderWithBubble(text, equippedItem = null, size = 48) {
    const svg = HamsterRenderer.renderSVG(equippedItem, size);
    const safeText = String(text || "").replace(/'/g, "\\'");
    return `
      <div class="hamster-helper-strip" style="margin-top: 14px;" onclick="if(window.bankirAudio && window.bankirAudio.speakHamster) window.bankirAudio.speakHamster('${safeText}')">
        <div class="hamster-avatar-box">
          ${svg}
        </div>
        <div class="hamster-speech-bubble">
          <div class="hamster-bubble-text">${text}</div>
          <div class="hamster-bubble-hint">🔊 Нажми, чтобы послушать</div>
        </div>
      </div>
    `;
  }
}

class HamsterMascot {
  constructor(container) {
    this.container = container;
    this.currentText = "Остров 1 светится! Жми на него, погнали!";
  }

  render() {
    if (!this.container) return;
    const state = window.StateManager ? window.StateManager.get() : {};
    const acc = state.equippedAccessory || null;
    const name = state.hamsterName || "Буся";
    const svg = HamsterRenderer.renderSVG(acc, 50);

    this.container.innerHTML = `
      <div class="hamster-helper-strip">
        <div class="hamster-avatar-box">
          ${svg}
          <div style="font-size: 10px; font-weight: 900; color: var(--ink); line-height: 1; margin-top: -1px;">${name}</div>
        </div>
        <div class="hamster-speech-bubble">
          <div class="hamster-bubble-text" id="hamster-bubble-text">
            ${this.currentText}
          </div>
          <div class="hamster-bubble-hint">🔊 Нажми на меня, чтобы послушать</div>
        </div>
      </div>
    `;

    const wrap = this.container.querySelector('.hamster-helper-strip');
    if (wrap) {
      wrap.addEventListener('click', () => {
        if (window.AudioController) {
          window.AudioController.speak(this.currentText);
        }
      });
    }
  }

  say(text) {
    this.currentText = text;
    const bubble = this.container ? this.container.querySelector('#hamster-bubble-text') : null;
    if (bubble) {
      bubble.textContent = text;
    }
    if (window.AudioController) {
      window.AudioController.speak(text);
    }
  }
}

if (typeof window !== "undefined") {
  window.HamsterRenderer = HamsterRenderer;
  window.HamsterMascot = HamsterMascot;
}
