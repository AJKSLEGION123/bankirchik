// C:\Bankirchik\js\games\fruit_garden.js
// Игра 6.2 «Фруктовый сад» (аркада ловли урожая корзиной и продажа 3 к 1)

class FruitGardenGame {
  constructor(container, levelNum = 1, onComplete) {
    if (typeof levelNum === 'function') {
      onComplete = levelNum;
      levelNum = 1;
    }
    this.container = container;
    this.levelNum = Number(levelNum) || 1;
    this.onComplete = onComplete || (() => {});
    this.islandData = (window.BANKIR_DATA && window.BANKIR_DATA.islands) ? window.BANKIR_DATA.islands[1] : (window.BankirchikData ? window.BankirchikData.islands[1] : null);
    this.config = (this.islandData && this.islandData.levels) ? (this.islandData.levels[this.levelNum - 1] || this.islandData.levels[0]) : { name: "Яблоки", time: 30, goal: 10, reward: 2 };

    this.timeLeft = this.config.time;
    this.score = 0;
    this.basketX = 180; // Позиция корзины
    this.items = [];
    this.isRunning = true;
    this.animId = null;
    this.spawnTimer = null;
    this.countTimer = null;

    this.init();
  }

  init() {
    this.render();
    this.startLoop();
  }

  destroy() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.spawnTimer) clearInterval(this.spawnTimer);
    if (this.countTimer) clearInterval(this.countTimer);
  }

  render() {
    this.container.innerHTML = `
      <div class="game-view-wrapper">
        <div class="game-header-bar">
          <button class="icon-btn" id="fruit-close-btn">✕</button>
          <div class="game-title-box">
            <div class="game-level-name">Остров 2: Фруктовый сад</div>
            <div class="game-sub-name">Уровень ${this.levelNum}: ${this.config.name}</div>
          </div>
          <div class="coin-pill" id="fruit-timer-badge">⏱️ ${this.timeLeft} с</div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
          <div class="coin-pill" style="font-size: 14px;">
            🍏 Собрано: <span id="fruit-score" style="color: var(--red); margin-left: 4px;">0</span> / ${this.config.goal}
          </div>
          <div style="font-size: 12px; font-weight: 800; color: var(--muted);">
            3 фрукта = 1 Б
          </div>
        </div>

        <!-- Игровой холст сада -->
        <div id="garden-canvas-container" style="position: relative; width: 100%; height: 380px; background: linear-gradient(180deg, #BAE6FD 0%, #BBF7D0 80%, #86EFAC 100%); border: 3px solid var(--shadow); border-radius: 24px; overflow: hidden; box-shadow: 0 6px 0 var(--shadow); touch-action: none;">
          <div style="position: absolute; top: 12px; left: 16px; font-size: 34px; opacity: 0.8;">🌳</div>
          <div style="position: absolute; top: 20px; right: 20px; font-size: 34px; opacity: 0.8;">🍎</div>
          <div style="position: absolute; top: 8px; right: 80px; font-size: 28px; opacity: 0.6;">☀️</div>

          <!-- Слой падающих предметов -->
          <div id="fruit-items-layer" style="position: absolute; inset: 0;"></div>

          <!-- Корзина игрока -->
          <div id="garden-basket" style="position: absolute; bottom: 12px; left: ${this.basketX}px; width: 70px; height: 46px; font-size: 44px; display: flex; align-items: center; justify-content: center; transform: translateX(-50%); pointer-events: none; transition: transform 0.05s ease-out;">
            🧺
          </div>
        </div>

        ${HamsterRenderer.renderWithBubble("Двигай корзину пальцем! Лови спелые яблоки и берегись камней!", window.bankirState.data.child.equippedItem)}
      </div>
    `;

    document.getElementById("fruit-close-btn").onclick = () => {
      this.destroy();
      this.onComplete(false);
    };

    // Управление корзиной пальцем / мышкой
    const canvas = document.getElementById("garden-canvas-container");
    const handleMove = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      this.basketX = Math.max(35, Math.min(rect.width - 35, x));
      const basket = document.getElementById("garden-basket");
      if (basket) basket.style.left = `${this.basketX}px`;
    };

    canvas.addEventListener("pointermove", (e) => handleMove(e.clientX));
    canvas.addEventListener("pointerdown", (e) => handleMove(e.clientX));
  }

  startLoop() {
    const canvas = document.getElementById("garden-canvas-container");
    const layer = document.getElementById("fruit-items-layer");

    // Таймер раунда
    this.countTimer = setInterval(() => {
      this.timeLeft--;
      const t = document.getElementById("fruit-timer-badge");
      if (t) t.textContent = `⏱️ ${this.timeLeft} с`;

      if (this.timeLeft <= 0) {
        clearInterval(this.countTimer);
        clearInterval(this.spawnTimer);
        this.finishGame();
      }
    }, 1000);

    // Спавн фруктов и камней
    this.spawnTimer = setInterval(() => {
      if (!this.isRunning) return;
      const isBad = Math.random() < this.config.badRatio;
      const isGold = !isBad && this.levelNum >= 2 && Math.random() < 0.2;

      let emoji = "🍎";
      let val = 1;
      let type = "good";

      if (isBad) {
        emoji = Math.random() < 0.5 ? "🪨" : "🐛";
        val = -1;
        type = "bad";
      } else if (isGold) {
        emoji = "✨🍏";
        val = 3;
        type = "gold";
      } else {
        const fruits = ["🍎", "🍐", "🍊"];
        emoji = fruits[Math.floor(Math.random() * fruits.length)];
      }

      const rect = canvas.getBoundingClientRect();
      const x = 30 + Math.random() * (rect.width - 60);

      this.items.push({
        x,
        y: -30,
        speed: 2.8 + Math.random() * 2.0,
        emoji,
        val,
        type
      });
    }, this.config.interval);

    // Анимационный цикл
    const step = () => {
      if (!this.isRunning) return;
      const rect = canvas.getBoundingClientRect();

      let html = "";
      const remaining = [];

      for (const it of this.items) {
        it.y += it.speed;

        // Коллизия с корзиной (высота корзины ~340-370px)
        if (it.y >= 320 && it.y <= 360 && Math.abs(it.x - this.basketX) < 40) {
          // Поймал!
          this.score += it.val;
          if (this.score < 0) this.score = 0;

          if (it.val > 0) {
            window.bankirAudio.playCoin();
          } else {
            window.bankirAudio.playError();
          }

          const sc = document.getElementById("fruit-score");
          if (sc) sc.textContent = this.score;
          continue;
        }

        // Если не упало за край
        if (it.y < 390) {
          remaining.push(it);
          html += `<div style="position: absolute; left: ${it.x}px; top: ${it.y}px; font-size: 28px; transform: translate(-50%, -50%);">${it.emoji}</div>`;
        }
      }

      this.items = remaining;
      if (layer) layer.innerHTML = html;

      this.animId = requestAnimationFrame(step);
    };

    this.animId = requestAnimationFrame(step);
  }

  finishGame() {
    this.destroy();
    const isWin = this.score >= this.config.goal;
    // Продажа урожая на рынке: 3 фрукта = 1 Б
    const coinsEarned = Math.max(1, Math.floor(this.score / 3));

    if (isWin) {
      window.bankirAudio.playWin();
      window.bankirState.completeLevel(2, this.levelNum, coinsEarned);
    } else {
      window.bankirAudio.playError();
    }

    const randomFact = this.islandData.facts[Math.floor(Math.random() * this.islandData.facts.length)];

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 54px; margin-bottom: 8px;">${isWin ? "🧺" : "🍂"}</div>
          <h2 style="font-size: 24px; font-weight: 900; color: ${isWin ? "var(--success)" : "var(--red)"};">
            ${isWin ? "Урожай собран!" : "Маловато яблок!"}
          </h2>
          <p style="font-size: 15px; font-weight: 800; color: var(--ink); margin: 6px 0 14px 0;">
            Собрано: <b>${this.score}</b> фруктов (цель: ${this.config.goal})<br/>
            ${isWin ? `На рынке продано за: <b style="color: var(--red);">+${coinsEarned} Б</b>!` : "Не расстраивайся, давай соберём ещё раз!"}
          </p>

          <div class="card" style="background: var(--yellow-light); border-color: var(--yellow); padding: 12px; margin-bottom: 16px; text-align: left;">
            <div style="font-size: 12px; font-weight: 900; color: #B45309;">💡 Знаешь ли ты?</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--ink); margin-top: 4px;">${randomFact}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${isWin && this.levelNum < 3 ? `
              <button class="btn btn-red" id="fruit-next-btn">Уровень ${this.levelNum + 1} ➜</button>
            ` : ""}
            <button class="btn btn-yellow" id="fruit-retry-btn">${isWin ? "Собрать ещё" : "Попробовать снова"}</button>
            <button class="btn btn-white" id="fruit-map-btn">К островам</button>
          </div>
        </div>
      </div>
    `;

    const nextBtn = document.getElementById("fruit-next-btn");
    if (nextBtn) {
      nextBtn.onclick = () => {
        new FruitGardenGame(this.container, this.levelNum + 1, this.onComplete);
      };
    }

    document.getElementById("fruit-retry-btn").onclick = () => {
      new FruitGardenGame(this.container, this.levelNum, this.onComplete);
    };

    document.getElementById("fruit-map-btn").onclick = () => {
      this.onComplete(isWin);
    };
  }
}

if (typeof window !== "undefined") {
  window.FruitGardenGame = FruitGardenGame;
}
